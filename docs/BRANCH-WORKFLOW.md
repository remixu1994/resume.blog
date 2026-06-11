# resume.blog — Git Branch & PR Workflow

## 核心规则

**所有代码变更必须通过 Pull Request 合并到 main。**

禁止直接 push 到 main 分支。

## 分支命名规范

每个 Kanban 任务对应一个分支，格式：

```
<type>/<task-id>-<short-description>
```

类型：
- `feat/` — 新功能
- `fix/` — Bug 修复
- `refactor/` — 代码重构
- `docs/` — 文档
- `ci/` — CI/CD 变更
- `test/` — 测试
- `perf/` — 性能优化

示例：
```
feat/t_b765cd23-fix-build-and-ci
feat/t_37b3bb30-seo-performance-deploy
docs/t_a9d30b55-baseline-docs
```

## 工作流程

### 1. 领取任务后创建分支

```bash
git checkout main
git pull origin main
git checkout -b feat/t_b765cd23-fix-build-and-ci
```

### 2. 在分支上开发

正常的代码修改、测试、提交。

### 3. 提交代码

```bash
git add -A
git commit -m "feat: description of changes

- Detail 1
- Detail 2"
```

### 4. 推送分支

```bash
git push -u origin HEAD
```

### 5. 创建 Pull Request

使用 `gh` CLI：

```bash
gh pr create \
  --title "feat: description (#task_id)" \
  --body "## Summary
- What was done

## Related
- Kanban task: t_xxxxxxxx

## Test Plan
- [ ] npm test passes
- [ ] npm run build passes" \
  --base main
```

### 6. CI 验证

PR 创建后自动触发 CI（GitHub Actions）：
- Lint 检查
- 单元测试
- 构建验证

### 7. 合并

CI 通过后合并（推荐 squash merge）：

```bash
gh pr merge --squash --delete-branch
```

### 8. 更新 Kanban 任务

合并后在 Kanban 任务中记录 PR 编号和合并 commit。

## PR 模板

### Feature PR

```markdown
## Summary
- [What was built/changed]

## Related
- Kanban task: t_xxxxxxxx

## Changes
- file1.ts: [what changed]
- file2.ts: [what changed]

## Test Plan
- [ ] npm test passes
- [ ] npm run build passes
- [ ] Manual verification: [specific steps]
```

### Bugfix PR

```markdown
## Problem
- [What was broken]

## Root Cause
- [Why it was broken]

## Fix
- [What was changed to fix it]

## Related
- Kanban task: t_xxxxxxxx

## Test Plan
- [ ] Regression test added
- [ ] npm test passes
```

## Definition of Done (DoD)

一个任务只有满足以下所有条件才算完成：

1. ✅ 代码在独立分支上
2. ✅ PR 已创建并链接到 Kanban 任务
3. ✅ CI 全部通过（lint + test + build）
4. ✅ PR 已合并到 main
5. ✅ 远程分支已删除
6. ✅ Kanban 任务已标记完成

## 禁止事项

- ❌ 直接 push 到 main
- ❌ 跳过 CI 合并 PR
- ❌ 不写 PR description
- ❌ 合并后不删除分支
- ❌ 不在 Kanban 任务中记录 PR 信息
