# Markdown 文件 Categories 和 Tags 标准化工具

这个工具用于标准化 VuePress 博客中 Markdown 文件的 categories 和 tags。

## 功能说明

该脚本会自动处理 `src/posts/xxx/*.md` 目录下的所有 Markdown 文件，将它们的 frontmatter 中的：

1. `categories` 字段设置为目录名的正确格式（首字母大写，部分特殊目录名有特殊处理）
2. `tags` 字段设置为文件名（小写，不带引号）

## 使用方法

在项目根目录下运行以下命令：

```bash
node fix_categories_tags_format.cjs
```

## 处理规则

1. 目录名转换规则：
   - 一般目录：`ci-cd` → `CICD`
   - 一般目录：`user-privilege` → `UserPrivilege`
   - 一般目录：`distributed-schedudle` → `DistributedSchedule`
   - 其他目录：转换为驼峰命名，首字母大写

2. 文件名转换为标签（小写，不带引号）：
   - `1-1-0-the-soul-of-scheduling.md` → `1-1-0-the-soul-of-scheduling`

## 示例

处理前：
```markdown
---
title: "调度之魂: 无处不在的任务调度"
date: 2025-09-06
categories: ["DistributedSchedudle"]
tags: ["1-1-0-the-soul-of-scheduling"]
published: true
---
```

处理后：
```markdown
---
title: "调度之魂: 无处不在的任务调度"
date: 2025-09-06
categories: [DistributedSchedule]
tags: [1-1-0-the-soul-of-scheduling]
published: true
---
```

## 注意事项

1. 该脚本会直接修改原文件，请在运行前备份重要数据
2. 脚本只会修改 `categories` 和 `tags` 字段，不会影响其他内容
3. 如果需要重新运行，请确保处理逻辑符合预期