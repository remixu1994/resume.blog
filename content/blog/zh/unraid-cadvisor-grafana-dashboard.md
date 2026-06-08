---
id: unraid-cadvisor-grafana-dashboard
slug: unraid-cadvisor-grafana-dashboard
locale: zh
category: unraid-nas
title: 使用 cAdvisor 和 Grafana 在 Unraid 上构建容器监控 Dashboard
summary: 分享如何在 Unraid 环境下使用 cAdvisor 采集 Docker 和虚拟机指标，并通过 Grafana 构建可视化 Dashboard，包括版本选择、Prometheus 查询与最佳实践。
heroImage: /assets/blog/unraid-layout.svg
updatedAt: 2026-06-04
tags: [Unraid, Self-hosting, Monitoring, cAdvisor, Grafana, Prometheus]
published: true
status: published
series: unraid-notes
---

# 使用 cAdvisor 和 Grafana 在 Unraid 上构建容器监控 Dashboard

本文分享了如何在 **Unraid** 环境下使用 **cAdvisor** 采集 Docker 和虚拟机指标，并通过 **Grafana** 构建可视化 Dashboard，包括版本选择、Prometheus 查询与最佳实践。

---

## 1. cAdvisor 版本选择

在 Unraid 上使用 cAdvisor 时，版本选择非常关键：

- **v0.55+（最新版本）**
  - 对 Docker metadata 的支持弱化，部分容器名称和标签可能无法显示。
  - 容器指标只会显示 `id`，`name` 可能为空。
- **v0.49.1（社区推荐版本）**
  - 可以正确显示 Docker 容器名称 (`name`)。
  - 支持 `--enable_container_names` 参数。
  - 在 Unraid 上最稳定，建议生产环境使用。

### 启动示例（v0.49.1）

```bash
docker run   --name=cadvisor   --volume=/:/rootfs:ro   --volume=/var/run:/var/run:ro   --volume=/sys:/sys:ro   --volume=/var/lib/docker/:/var/lib/docker:ro   --volume=/var/run/docker.sock:/var/run/docker.sock:ro   --publish=8080:8080   --detach=true   gcr.io/cadvisor/cadvisor:v0.49.1   --enable_container_names
```

- 挂载 Docker Socket 是获取容器名称的关键。

---

## 2. Prometheus 指标

cAdvisor 采集的关键指标包括：

| 指标 | 含义 |
|------|------|
| container_cpu_usage_seconds_total | CPU 累计使用秒数 |
| container_memory_usage_bytes | 内存使用 |
| container_network_receive_bytes_total | 网络接收 (RX) |
| container_network_transmit_bytes_total | 网络发送 (TX) |
| container_fs_reads_bytes_total | 磁盘读取字节数 |
| container_fs_writes_bytes_total | 磁盘写入字节数 |
| container_last_seen | 最后一次活跃时间 |
| id | 容器 ID 或虚拟机 ID |
| name | 容器名称（仅 v0.49.1+ 且启用 enable_container_names） |

#### Docker CPU 查询示例（使用 name）

```promql
sum by(name)(
  rate(container_cpu_usage_seconds_total{
    job="cadvisor",
    cpu="total",
    id=~"/docker/[a-f0-9]{64}$",
    name!="",
    name!="cadvisor"
  }[5m])
) * 100
```

- `cpu="total"` 避免重复累加各核心。
- 排除 cadvisor 自身，避免统计膨胀。
- 用 `id=~"/docker/[a-f0-9]{64}$"` 严格匹配真实容器。

#### 虚拟机 CPU 查询示例

```promql
sum by(vm)(
  label_replace(
    rate(container_cpu_usage_seconds_total{job="cadvisor", id=~"/machine/qemu-[0-9]+-[^/]+\.libvirt-qemu$"}[5m]),
    "vm",
    "$1",
    "id",
    "/machine/qemu-[0-9]+-([^/]+)\.libvirt-qemu"
  )
) * 100
```

- `label_replace` 提取虚拟机名称作为 `vm` 标签。
- 适合监控 KVM/QEMU 虚拟机。

---

## 3. Grafana Dashboard 构建

### 面板设计建议

1. **Docker 容器面板**
   - CPU、内存、网络 RX/TX、磁盘 I/O。
   - Legend 使用容器名称 (`{{name}}`)。
2. **虚拟机面板**
   - CPU、内存、网络、磁盘 I/O。
   - Legend 使用虚拟机名称 (`{{vm}}`)。
3. **注意事项**
   - 避免重复统计父级 cgroup (`/docker`)。
   - 排除 cAdvisor 自身容器。

### 示例 Panel 配置

- **CPU 面板**：`sum by(name) (rate(container_cpu_usage_seconds_total{cpu="total"}[5m])) * 100`
- **内存面板**：`container_memory_usage_bytes`
- **网络面板**：`sum by(name) (rate(container_network_receive_bytes_total[5m]))` 和 `sum by(name) (rate(container_network_transmit_bytes_total[5m]))`
- **Disk IO 面板**：`sum by(name) (rate(container_fs_reads_bytes_total[5m]))` 和 `sum by(name) (rate(container_fs_writes_bytes_total[5m]))`

### Dashboard JSON 模板

- 可以导入 Grafana，自动生成面板和查询。
- 包含 Docker 和虚拟机监控示例。

---

## 4. 总结

- **版本选择**：Unraid 上使用 cAdvisor v0.49.1 最稳定。
- **容器名称**：必须挂载 `/var/run/docker.sock` 并启用 `enable_container_names`。
- **Grafana 查询**：注意 CPU 需 `cpu="total"` 并排除自身，避免高百分比异常。
- **虚拟机监控**：利用 `/machine/qemu-*` ID 并 `label_replace` 提取 vm 名称。
- 通过这套方案，Unraid 上的 Docker 容器和虚拟机资源都可以实现完整可视化监控。
