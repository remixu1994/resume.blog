---
id: unraid-monitoring-service
slug: unraid-monitoring-service
locale: zh
title: 从一次 Unraid 卡死说起：构建 NAS 服务监控与告警体系
summary: 记录一次 Unraid NAS 卡死后的排查过程，并搭建 Prometheus、Node Exporter、cAdvisor、Grafana 与 Uptime Kuma 监控告警体系。
heroImage: /assets/blog/unraid-layout.svg
updatedAt: 2026-06-04
tags: [Unraid, Self-hosting, Monitoring, Prometheus, Grafana]
published: true
status: published
series: unraid-notes
---

# 从一次 Unraid 卡死说起：构建 NAS 服务监控与告警体系

## 前言

最近我的 Unraid NAS 出现了一次比较严重的问题：

- Web UI 无响应
- Docker 服务变慢
- SSH 登录后命令执行卡顿
- Load Average 飙升到 250+
- 内存几乎耗尽
- 最终只能通过 SSH 强制重启

这次故障让我意识到：

> NAS 不是部署完就结束了，而是需要持续监控。

于是我搭建了一套基于：

```
Prometheus
Node Exporter
cAdvisor
Grafana
Uptime Kuma
```

的监控体系。

本文记录整个排查过程以及最终监控方案。

---

# 故障现象

当时登录 NAS 后执行：

```bash
top
```

发现：

```
load average: 250.36, 243.83, 238.84
```

正常情况下：

```
load average < CPU核心数
```

我的机器：

```
AMD Ryzen 3700X
8核16线程
```

因此：

```
Load > 16
```

就已经异常。

而当时：

```
Load = 250+
```

已经完全失控。

---

# 第一轮排查：CPU

查看 CPU：

```bash
top
```

发现：

```
%Cpu(s):
7.6 us
4.3 sy
0.0 ni
55.8 wa
0.0 hi
0.1 si
0.0 st
```

重点：

```
wa = 55.8%
```

即：

```
IO Wait
```

超过 50%。

说明 CPU 并不是在忙计算，而是在等待磁盘。

---

# 第二轮排查：内存

查看内存：

```bash
free -h
```

结果：

```
Mem: 15.5G
Used: 15.2G
Available: 173M
```

几乎耗尽。

进一步查看：

```bash
docker stats --no-stream
```

发现 Docker 内存占用总共约 3GB，并不高。

---

# 第三轮排查：虚拟机

```bash
virsh list
```

发现运行：

```
Ubuntu-Hermes
Home Assistant
iStoreOS
```

查看内存分配：

- Ubuntu-Hermes: 8GB
- Home Assistant: 2GB
- iStoreOS: 1GB

主机总内存 16GB，剩余 5GB，给 Docker 和缓存太少。

---

# 根因分析

- **内存不足**：剩余可用内存太低
- **BTRFS 被阻塞**：大量 loop 设备操作导致 D 状态进程增多
- **Load 飙升**：Linux load 包含运行与不可中断 sleep，Load 250+ 并非 CPU 占用，而是 IO 阻塞

---

# 重启后恢复

```
Load Average
0.39 0.40 0.70
```

恢复正常。

---

# 监控架构

```
          +-------------+
          | Uptime Kuma |
          +------+------+
                 |
                 v
+---------+   +---------+
| Node    |   | cAdvisor|
| Exporter|   +----+----+
+----+----+        |
     |             |
     +------+------+
            |
            v
     +-------------+
     | Prometheus  |
     +------+------+
            |
            v
       +---------+
       | Grafana |
       +---------+
```

---

# Node Exporter

监控宿主机指标：

```
CPU, 内存, 磁盘, 网络, Load, 文件系统
```

端口默认：9100

---

# cAdvisor

监控 Docker 容器指标：

```
CPU, 内存, 网络, 文件系统 IO
```

端口默认：8081

---

# Prometheus 配置

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets:
          - localhost:9090

  - job_name: unraid-node
    static_configs:
      - targets:
          - 192.168.31.13:9100

  - job_name: cadvisor
    static_configs:
      - targets:
          - 192.168.31.13:8081
```

---

# Grafana Dashboard

监控内容：

- **主机**：CPU %, Load, 内存, Disk IO, Disk Usage, Network
- **Docker**：容器 CPU, 内存, FS Writes, 网络流量

## Dashboard 示例

下面是 Node Exporter Full Dashboard 的监控视图示例，适合作为 Unraid 主机基础监控面板：

![Grafana Node Exporter Full Dashboard 示例](/assets/blog/unraid-monitoring-dashboard.png)

我也把可导入 Grafana 的 Dashboard JSON 放到了项目静态资源中：

[下载 Node Exporter Full Dashboard JSON](/assets/blog/node-exporter-full-dashboard.json)


下面是 Unraid Docker 的监控视图示例：

![Grafana Node Exporter Full Dashboard 示例](/assets/blog/cAdvisorDocker.png)

[下载 Docker_cAdvisor](/assets/blog/unraid-monitoring-dashboard-docker_cAdvisor.json)

导入时在 Grafana 中进入 **Dashboards -> New -> Import**，上传 JSON 或粘贴 JSON 内容，然后选择 Prometheus datasource 即可。

---

# 告警方案

Grafana + Alert + 企业微信 / Telegram / 飞书

重点告警：

- CPU > 90% 持续10分钟
- Load > 核心数 持续5分钟
- Available Memory < 1GB
- 磁盘使用率 > 85%
- 单容器内存 > 2GB
- NAS 服务离线 → Uptime Kuma 触发通知

---

# Uptime Kuma 配置

监控：

```
Unraid Web, Jellyfin, Navidrome, PhotoPrism, MoviePilot, Nginx Proxy Manager
```

检查间隔：60秒  
通知渠道：企业微信、Telegram、邮件

---

# 总结

- 最重要监控：内存、Load、磁盘 IO  
- 最危险情况：内存耗尽 + BTRFS 阻塞 + Load 暴涨  
- 最低监控组合：

```
Node Exporter + cAdvisor + Prometheus + Grafana + Uptime Kuma
```

可以实时掌握 Docker、VM 和主机状态，从事后排查变成提前预警。
