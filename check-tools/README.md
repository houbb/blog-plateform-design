# 博客平台维护工具

这个目录包含了用于维护和修复博客平台 Markdown 文件的各种工具。

## 工具列表

### 1. categories 和 tags 格式修复工具

**文件**: [fix_categories_tags_format.cjs](file:///D:/github/blog-plateform-design/fix_categories_tags_format.cjs)

**功能**: 修复 Markdown 文件中的 categories 和 tags 格式，确保符合 VuePress 规范。

**使用方法**:
```bash
node fix_categories_tags_format.cjs
```

**处理规则**:
1. `categories` 字段使用目录名的正确格式（首字母大写）
2. `tags` 字段使用文件名（小写，不带引号）
3. 特殊目录名处理：
   - `ci-cd` → `CICD`
   - `user-privilege` → `UserPrivilege`
   - `distributed-schedudle` → `DistributedSchedule`
   - `distributed-flow-control` → `DistributedFlowControl`
   - `distributed-file` → `DistributedFile`
   - `risk-control` → `RiskControl`
   - `itsm` → `ITSM`
   - `goutong` → `GouTong`

**示例**:
```markdown
# 修复前
categories: ["DistributedSchedudle"]
tags: ["1-1-0-the-soul-of-scheduling"]

# 修复后
categories: [DistributedSchedule]
tags: [1-1-0-the-soul-of-scheduling]
```

### 2. 布局设置修复工具

**文件**: [src/README.md](file:///D:/github/blog-plateform-design/src/README.md)

**功能**: 修复 VuePress 主页布局设置，将 `layout: BlogHome` 更新为 `layout: Blog`。

**处理规则**:
- 将 `layout: BlogHome` 替换为 `layout: Blog`
- 保持其他配置不变

## 使用说明

1. 确保在项目根目录下运行工具
2. 运行前建议备份重要文件
3. 工具会直接修改原文件，请谨慎操作

## 验证方法

运行工具后，可以检查任意 Markdown 文件的 frontmatter 部分，确认 categories 和 tags 格式是否正确。

```bash
# 检查示例文件
head -7 src/posts/alarm/1-1-0-alarm-pain-and-paradigm-shift.md
```