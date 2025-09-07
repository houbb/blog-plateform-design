# Markdown文件校验和修复工具

这个目录包含了一系列用于校验和修复Markdown文件YAML头部格式的工具。

## 工具列表

### 1. validFormat.cjs
- **功能**: 校验并修复所有Markdown文件的YAML头部格式
- **使用方法**: 
  ```bash
  node validFormat.cjs [--fix]
  ```
- **参数**:
  - 无参数: 仅校验文件格式
  - `--fix`: 校验并自动修复不合法的文件

### 2. check-file.cjs
- **功能**: 使用js-yaml库精确检查每个文件的YAML格式
- **使用方法**: 
  ```bash
  node check-file.cjs
  ```

### 3. debug-gray-matter.cjs
- **功能**: 使用gray-matter库（VuePress使用的库）检查文件解析问题
- **使用方法**: 
  ```bash
  node debug-gray-matter.cjs
  ```

### 4. debug-specific-file.cjs
- **功能**: 详细调试特定文件的解析过程
- **使用方法**: 
  ```bash
  node debug-specific-file.cjs
  ```

### 5. debug-yaml-parse.cjs
- **功能**: 专门调试YAML解析问题
- **使用方法**: 
  ```bash
  node debug-yaml-parse.cjs
  ```

### 6. fix-line-endings.cjs
- **功能**: 修正文件的换行符问题
- **使用方法**: 
  ```bash
  node fix-line-endings.cjs
  ```

### 7. fix-all-line-endings.cjs
- **功能**: 全面修正文件的所有换行符问题
- **使用方法**: 
  ```bash
  node fix-all-line-endings.cjs
  ```

### 8. fix-yaml-title.cjs
- **功能**: 修正YAML头部中的title字段
- **使用方法**: 
  ```bash
  node fix-yaml-title.cjs
  ```

## 使用流程

1. **初步检查**: 运行 `node validFormat.cjs` 检查所有文件格式
2. **详细调试**: 如果发现有问题的文件，使用 `node debug-gray-matter.cjs` 找出具体文件
3. **问题分析**: 使用 `node debug-yaml-parse.cjs` 或 `node debug-specific-file.cjs` 分析具体问题
4. **修复问题**: 根据问题类型使用相应的修复工具
5. **验证修复**: 再次运行检查工具确认问题已解决

## 常见问题及解决方案

### YAML解析错误
- **原因**: title字段中的特殊字符未正确转义
- **解决方案**: 使用 `fix-yaml-title.cjs` 修复

### 换行符问题
- **原因**: Windows和Unix换行符混用
- **解决方案**: 使用 `fix-all-line-endings.cjs` 修复

## 注意事项

- 运行这些工具前请确保已安装所有依赖包
- 修复工具会直接修改原文件，请在运行前备份重要文件
- 如果遇到新的问题，请先使用检查工具定位问题，再选择合适的修复工具