---
title: "统一代码规范与格式化: Prettier, EditorConfig的平台化管控"
date: 2025-09-06
categories: [QA]
tags: [qa]
published: true
---
在软件开发团队中，代码风格的不一致性是一个常见但严重影响代码质量和团队协作的问题。通过统一的代码规范和自动化格式化工具，可以显著提升代码的可读性、可维护性，并减少团队成员之间的摩擦。本章将深入探讨如何通过Prettier、EditorConfig等工具实现代码规范的统一管理，以及如何在工程效能平台中进行平台化管控。

## 代码规范的重要性

### 为什么需要统一代码规范？

代码规范不仅仅是关于美观，更是关于团队协作效率和代码质量的重要保障。

#### 1. 提升代码可读性

```javascript
// 不规范的代码示例
function calculateTotal(items,discountRate,taxRate){
let total=0;
for(let i=0;i<items.length;i++){
total+=items[i].price*items[i].quantity;
}
total=total*(1-discountRate);
total=total*(1+taxRate);
return total;
}

// 规范的代码示例
function calculateTotal(items, discountRate, taxRate) {
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    
    total = total * (1 - discountRate);
    total = total * (1 + taxRate);
    
    return total;
}
```

#### 2. 降低维护成本

```java
// 不一致的命名规范示例
public class UserService {
    private UserRepository userRepo;
    private EmailService email_service;
    private NotificationSender notificationSender;
    
    public User findUserById(Long userId) {
        // ...
    }
    
    public User getUserById(long id) {
        // ...
    }
    
    public void saveUser(User user_data) {
        // ...
    }
}

// 统一的命名规范示例
public class UserService {
    private UserRepository userRepository;
    private EmailService emailService;
    private NotificationSender notificationSender;
    
    public User findUserById(Long userId) {
        // ...
    }
    
    public User getUserById(Long userId) {
        // ...
    }
    
    public void saveUser(User user) {
        // ...
    }
}
```

### 代码规范的核心要素

#### 1. 命名规范

```python
# Python命名规范示例
class UserAccountManager:
    """用户账户管理器"""
    
    def __init__(self):
        self._active_users = []  # 私有属性使用下划线前缀
        self.max_login_attempts = 3  # 常量使用大写
    
    def authenticate_user(self, username, password):
        """验证用户身份"""
        # 方法名使用下划线分隔
        pass
    
    def _validate_credentials(self, credentials):
        """验证凭据（内部方法）"""
        # 内部方法使用下划线前缀
        pass

# 常量定义
MAX_LOGIN_ATTEMPTS = 3
DEFAULT_SESSION_TIMEOUT = 3600
```

#### 2. 代码结构规范

```typescript
// TypeScript代码结构规范示例
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';

/**
 * 用户服务
 * 提供用户相关的业务逻辑处理
 */
@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    /**
     * 创建新用户
     * @param createUserDto 创建用户数据传输对象
     * @returns 创建的用户信息
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            // 业务逻辑处理
            const user = await this.userRepository.create(createUserDto);
            return user;
        } catch (error) {
            // 错误处理
            throw new Error(`创建用户失败: ${error.message}`);
        }
    }

    /**
     * 根据ID查找用户
     * @param id 用户ID
     * @returns 用户信息或null
     */
    async findOne(id: number): Promise<User | null> {
        return await this.userRepository.findOne(id);
    }

    /**
     * 更新用户信息
     * @param id 用户ID
     * @param updateUserDto 更新用户数据传输对象
     * @returns 更新后的用户信息
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.update(id, updateUserDto);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user;
    }
}
```

## Prettier的配置与使用

### Prettier核心配置项

Prettier提供了丰富的配置选项，可以根据团队需求进行定制。

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "rangeStart": 0,
  "rangeEnd": null,
  "parser": null,
  "filepath": null,
  "requirePragma": false,
  "insertPragma": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### 多语言支持配置

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": {
        "parser": "babel",
        "singleQuote": true
      }
    },
    {
      "files": "*.ts",
      "options": {
        "parser": "typescript",
        "singleQuote": true
      }
    },
    {
      "files": "*.json",
      "options": {
        "parser": "json",
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "parser": "markdown",
        "proseWrap": "always"
      }
    },
    {
      "files": "*.html",
      "options": {
        "parser": "html",
        "printWidth": 120
      }
    },
    {
      "files": "*.css",
      "options": {
        "parser": "css",
        "singleQuote": false
      }
    },
    {
      "files": "*.scss",
      "options": {
        "parser": "scss",
        "singleQuote": false
      }
    },
    {
      "files": "*.yaml",
      "options": {
        "parser": "yaml",
        "singleQuote": false
      }
    }
  ]
}
```

### 与编辑器集成

```javascript
// VS Code settings.json配置示例
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false
}
```

## EditorConfig的配置与管理

### EditorConfig基础配置

EditorConfig通过.editorconfig文件统一管理不同编辑器的基本配置。

```ini
# .editorconfig文件示例
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[*.{js,jsx,ts,tsx,json}]
indent_size = 2

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab

[*.{bat,cmd}]
end_of_line = crlf
```

### 多项目配置管理

```ini
# 企业级EditorConfig示例
# 顶层配置
root = true

# 默认配置
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

# 文档文件
[*.md]
trim_trailing_whitespace = false
max_line_length = off

# 前端文件
[*.{js,jsx,ts,tsx,json,html,css,scss}]
indent_size = 2

# 配置文件
[*.{yml,yaml,json}]
indent_size = 2

# Python文件
[*.py]
indent_size = 4
# 遵循PEP 8规范
known_third_party = django,requests

# Java文件
[*.java]
indent_size = 4
# 遵循Google Java Style Guide

# C/C++文件
[*.{c,cpp,h,hpp}]
indent_size = 4
# 遵循Google C++ Style Guide

# Shell脚本
[*.sh]
indent_size = 2

# Windows批处理文件
[*.{bat,cmd}]
end_of_line = crlf

# 二进制文件
[*.{png,jpg,jpeg,gif,ico}]
charset = unset
end_of_line = unset
insert_final_newline = unset
trim_trailing_whitespace = unset
indent_style = unset
indent_size = unset
```

## 代码规范检查工具集成

### ESLint配置示例

```javascript
// .eslintrc.js配置示例
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // 必须放在最后，禁用与Prettier冲突的规则
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // 基础规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // 使用@typescript-eslint/no-unused-vars
    'prefer-const': 'error',
    
    // TypeScript规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    
    // 导入规则
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // 复杂度规则
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 500],
    'max-params': ['warn', 5],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
```

### Stylelint配置示例

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ],
  "plugins": [
    "stylelint-scss",
    "stylelint-order"
  ],
  "rules": {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    "order/order": [
      "custom-properties",
      "dollar-variables",
      "declarations",
      "at-rules",
      "rules"
    ],
    "order/properties-alphabetical-order": true,
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "font-family-name-quotes": "always-where-recommended",
    "function-url-quotes": "always",
    "length-zero-no-unit": true,
    "selector-attribute-quotes": "always",
    "string-quotes": "single",
    "value-keyword-case": "lower",
    "unit-case": "lower",
    "property-case": "lower",
    "selector-pseudo-class-case": "lower",
    "selector-pseudo-element-case": "lower",
    "selector-type-case": "lower",
    "media-feature-name-case": "lower"
  }
}
```

## 平台化管控实现

### 统一配置管理

通过工程效能平台实现代码规范配置的统一管理和分发。

```java
// 代码规范配置管理服务示例
@Service
public class CodeStyleManagementService {
    
    @Autowired
    private CodeStyleRepository codeStyleRepository;
    
    @Autowired
    private ConfigurationTemplateService templateService;
    
    public CodeStyleConfig createCodeStyle(CodeStyleCreateRequest request) {
        // 验证配置数据
        validateCodeStyleConfig(request);
        
        // 创建配置实体
        CodeStyleConfig config = new CodeStyleConfig();
        config.setName(request.getName());
        config.setDescription(request.getDescription());
        config.setLanguage(request.getLanguage());
        config.setTeamId(request.getTeamId());
        config.setProjectId(request.getProjectId());
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        config.setStatus(ConfigStatus.ACTIVE);
        
        // 保存配置
        CodeStyleConfig savedConfig = codeStyleRepository.save(config);
        
        // 生成配置文件
        generateConfigurationFiles(savedConfig, request.getSettings());
        
        return savedConfig;
    }
    
    public void applyCodeStyleToProject(String projectId, String configId) {
        CodeStyleConfig config = codeStyleRepository.findById(configId)
            .orElseThrow(() -> new ConfigNotFoundException(configId));
        
        // 获取项目信息
        Project project = projectService.getProject(projectId);
        
        // 应用配置到项目
        deployConfigurationToProject(project, config);
        
        // 更新项目配置记录
        project.setCodeStyleConfigId(configId);
        project.setUpdatedAt(LocalDateTime.now());
        projectService.updateProject(project);
        
        // 记录应用历史
        recordConfigurationApplication(projectId, configId);
    }
    
    private void generateConfigurationFiles(CodeStyleConfig config, Map<String, Object> settings) {
        // 根据语言类型生成相应的配置文件
        switch (config.getLanguage()) {
            case "javascript":
                generatePrettierConfig(config, settings);
                generateEslintConfig(config, settings);
                break;
            case "python":
                generatePycodestyleConfig(config, settings);
                generateBlackConfig(config, settings);
                break;
            case "java":
                generateCheckstyleConfig(config, settings);
                generateSpotlessConfig(config, settings);
                break;
            default:
                generateGenericEditorConfig(config, settings);
        }
    }
    
    private void generatePrettierConfig(CodeStyleConfig config, Map<String, Object> settings) {
        // 生成.prettierrc.json文件
        Map<String, Object> prettierConfig = new HashMap<>();
        prettierConfig.put("printWidth", settings.getOrDefault("printWidth", 100));
        prettierConfig.put("tabWidth", settings.getOrDefault("tabWidth", 2));
        prettierConfig.put("useTabs", settings.getOrDefault("useTabs", false));
        prettierConfig.put("semi", settings.getOrDefault("semi", true));
        prettierConfig.put("singleQuote", settings.getOrDefault("singleQuote", true));
        prettierConfig.put("trailingComma", settings.getOrDefault("trailingComma", "es5"));
        
        // 保存配置文件
        configFileService.saveConfigFile(
            config.getId(), 
            ".prettierrc.json", 
            JsonUtils.toJson(prettierConfig)
        );
    }
}
```

### 配置模板管理

```yaml
# 代码规范配置模板示例
codeStyleTemplates:
  frontend:
    javascript:
      name: "前端JavaScript规范"
      version: "1.0.0"
      description: "适用于前端JavaScript项目的代码规范配置"
      language: "javascript"
      settings:
        prettier:
          printWidth: 100
          tabWidth: 2
          useTabs: false
          semi: true
          singleQuote: true
          trailingComma: "es5"
          bracketSpacing: true
          arrowParens: "avoid"
        eslint:
          extends:
            - "eslint:recommended"
            - "@typescript-eslint/recommended"
            - "prettier"
          rules:
            "no-console": "warn"
            "no-debugger": "error"
            "prefer-const": "error"
        editorconfig:
          indent_style: "space"
          indent_size: 2
          end_of_line: "lf"
          charset: "utf-8"
          trim_trailing_whitespace: true
          insert_final_newline: true
    
    typescript:
      name: "前端TypeScript规范"
      version: "1.0.0"
      description: "适用于前端TypeScript项目的代码规范配置"
      language: "typescript"
      settings:
        prettier:
          printWidth: 100
          tabWidth: 2
          useTabs: false
          semi: true
          singleQuote: true
          trailingComma: "es5"
        eslint:
          extends:
            - "eslint:recommended"
            - "@typescript-eslint/recommended"
            - "prettier"
          parser: "@typescript-eslint/parser"
          plugins:
            - "@typescript-eslint"
          rules:
            "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}]
            "@typescript-eslint/explicit-function-return-type": "off"
    
  backend:
    java:
      name: "后端Java规范"
      version: "1.0.0"
      description: "适用于后端Java项目的代码规范配置"
      language: "java"
      settings:
        checkstyle:
          config: "google_checks.xml"
          failOnViolation: true
        spotless:
          java:
            googleJavaFormat:
              version: "1.15.0"
            removeUnusedImports: true
            importOrder:
              - "java"
              - "javax"
              - ""
              - "com.company"
        editorconfig:
          indent_style: "space"
          indent_size: 4
          end_of_line: "lf"
          charset: "utf-8"
    
    python:
      name: "后端Python规范"
      version: "1.0.0"
      description: "适用于后端Python项目的代码规范配置"
      language: "python"
      settings:
        black:
          line-length: 88
          target-version: ["py38"]
        flake8:
          max-line-length: 88
          extend-ignore: ["E203", "W503"]
        isort:
          profile: "black"
          multi_line_output: 3
        editorconfig:
          indent_style: "space"
          indent_size: 4
          end_of_line: "lf"
          charset: "utf-8"
```

## 自动化检查与修复

### Git Hook集成

通过Git Hook实现提交前的自动检查和格式化。

```bash
#!/bin/bash
# pre-commit hook实现

# 获取暂存区的文件
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

# 检查是否有代码规范工具
if ! command -v prettier &> /dev/null; then
    echo "❌ Prettier未安装，请先安装Prettier"
    exit 1
fi

if ! command -v eslint &> /dev/null; then
    echo "❌ ESLint未安装，请先安装ESLint"
    exit 1
fi

# 初始化检查结果
CHECK_FAILED=0

# 检查每个文件
echo "🔍 正在检查代码规范..."
for FILE in $STAGED_FILES; do
    # 检查文件是否存在
    if [ ! -f "$FILE" ]; then
        continue
    fi
    
    # 获取文件扩展名
    EXTENSION="${FILE##*.}"
    
    # 根据文件类型执行相应检查
    case $EXTENSION in
        js|jsx|ts|tsx)
            # 检查JavaScript/TypeScript文件
            if ! eslint "$FILE"; then
                echo "❌ ESLint检查失败: $FILE"
                CHECK_FAILED=1
            fi
            
            # 格式化文件
            prettier --write "$FILE" > /dev/null 2>&1
            ;;
        json)
            # 格式化JSON文件
            prettier --write "$FILE" > /dev/null 2>&1
            ;;
        css|scss)
            # 检查CSS文件
            if ! stylelint "$FILE"; then
                echo "❌ Stylelint检查失败: $FILE"
                CHECK_FAILED=1
            fi
            
            # 格式化文件
            prettier --write "$FILE" > /dev/null 2>&1
            ;;
        html)
            # 格式化HTML文件
            prettier --write "$FILE" > /dev/null 2>&1
            ;;
        md)
            # 格式化Markdown文件
            prettier --write "$FILE" > /dev/null 2>&1
            ;;
        py)
            # 检查Python文件
            if ! flake8 "$FILE"; then
                echo "❌ Flake8检查失败: $FILE"
                CHECK_FAILED=1
            fi
            
            # 格式化文件
            black "$FILE" > /dev/null 2>&1
            isort "$FILE" > /dev/null 2>&1
            ;;
        java)
            # 检查Java文件
            if ! checkstyle -c checkstyle.xml "$FILE"; then
                echo "❌ Checkstyle检查失败: $FILE"
                CHECK_FAILED=1
            fi
            
            # 格式化文件
            java-formatter "$FILE" > /dev/null 2>&1
            ;;
    esac
done

# 如果检查失败，阻止提交
if [ $CHECK_FAILED -ne 0 ]; then
    echo "❌ 代码规范检查失败，请修复问题后重新提交"
    echo "💡 提示: 可以运行 'npm run format' 自动格式化代码"
    exit 1
fi

# 重新添加格式化后的文件到暂存区
echo "🔄 正在更新暂存区..."
for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
        git add "$FILE"
    fi
done

echo "✅ 代码规范检查通过，提交继续"
exit 0
```

### CI/CD集成检查

在CI/CD流程中集成代码规范检查。

```yaml
# GitHub Actions工作流示例
name: Code Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check code formatting
      run: |
        # 检查是否有未格式化的文件
        npx prettier --check .
        if [ $? -ne 0 ]; then
          echo "❌ 代码格式检查失败，请运行 'npm run format' 格式化代码"
          exit 1
        fi
    
    - name: Run ESLint
      run: |
        npx eslint . --ext .js,.jsx,.ts,.tsx
        if [ $? -ne 0 ]; then
          echo "❌ ESLint检查失败"
          exit 1
        fi
    
    - name: Run Stylelint
      run: |
        npx stylelint "**/*.css" "**/*.scss"
        if [ $? -ne 0 ]; then
          echo "❌ Stylelint检查失败"
          exit 1
        fi
    
    - name: Run unit tests
      run: npm test
    
    - name: Run integration tests
      run: npm run test:integration
```

## IDE集成与实时反馈

### VS Code集成配置

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.requireConfig": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": [
    "css",
    "scss"
  ],
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### IntelliJ IDEA集成配置

```xml
<!-- IntelliJ IDEA代码风格配置示例 -->
<code_scheme name="CompanyStandard" version="173">
  <option name="RIGHT_MARGIN" value="100" />
  <option name="SOFT_MARGINS" value="80,100" />
  
  <JSCodeStyleSettings version="0">
    <option name="FORCE_SEMICOLON_STYLE" value="true" />
    <option name="SPACE_BEFORE_FUNCTION_LEFT_PARENTH" value="false" />
    <option name="USE_DOUBLE_QUOTES" value="false" />
    <option name="FORCE_QUOTE_STYlE" value="true" />
    <option name="ENFORCE_TRAILING_COMMA" value="WhenMultiline" />
  </JSCodeStyleSettings>
  
  <TypeScriptCodeStyleSettings version="0">
    <option name="FORCE_SEMICOLON_STYLE" value="true" />
    <option name="SPACE_BEFORE_FUNCTION_LEFT_PARENTH" value="false" />
    <option name="USE_DOUBLE_QUOTES" value="false" />
    <option name="FORCE_QUOTE_STYlE" value="true" />
    <option name="ENFORCE_TRAILING_COMMA" value="WhenMultiline" />
  </TypeScriptCodeStyleSettings>
  
  <codeStyleSettings language="JavaScript">
    <option name="RIGHT_MARGIN" value="100" />
    <option name="KEEP_BLANK_LINES_IN_CODE" value="1" />
    <option name="ALIGN_MULTILINE_PARAMETERS" value="false" />
    <option name="ALIGN_MULTILINE_FOR" value="false" />
    <option name="SPACE_BEFORE_METHOD_PARENTHESES" value="true" />
    <option name="IF_BRACE_FORCE" value="3" />
    <option name="DOWHILE_BRACE_FORCE" value="3" />
    <option name="WHILE_BRACE_FORCE" value="3" />
    <option name="FOR_BRACE_FORCE" value="3" />
  </codeStyleSettings>
  
  <codeStyleSettings language="TypeScript">
    <option name="RIGHT_MARGIN" value="100" />
    <option name="KEEP_BLANK_LINES_IN_CODE" value="1" />
    <option name="ALIGN_MULTILINE_PARAMETERS" value="false" />
    <option name="ALIGN_MULTILINE_FOR" value="false" />
    <option name="SPACE_BEFORE_METHOD_PARENTHESES" value="true" />
    <option name="IF_BRACE_FORCE" value="3" />
    <option name="DOWHILE_BRACE_FORCE" value="3" />
    <option name="WHILE_BRACE_FORCE" value="3" />
    <option name="FOR_BRACE_FORCE" value="3" />
  </codeStyleSettings>
</code_scheme>
```

## 团队协作与培训

### 代码规范文档

```markdown
# 团队代码规范指南

## 1. 基础规范

### 1.1 命名规范

#### 变量命名
- 使用驼峰命名法：`userName`, `totalCount`
- 布尔值变量使用is/has前缀：`isValid`, `hasPermission`
- 常量使用大写字母和下划线：`MAX_RETRY_COUNT`, `API_BASE_URL`

#### 函数命名
- 使用动词开头：`getUserInfo()`, `calculateTotal()`
- 布尔函数使用is/has/can：`isValid()`, `canAccess()`

#### 类命名
- 使用帕斯卡命名法：`UserService`, `DataProcessor`
- 接口名不加I前缀，直接使用名词：`UserRepository`, `PaymentService`

### 1.2 注释规范

#### 类注释
```java
/**
 * 用户服务类
 * 提供用户相关的业务逻辑处理
 * 
 * @author Zhang San
 * @version 1.0.0
 * @since 2023-01-01
 */
public class UserService {
    // ...
}
```

#### 方法注释
```java
/**
 * 根据用户ID获取用户信息
 * 
 * @param userId 用户ID
 * @return 用户信息，如果不存在返回null
 * @throws IllegalArgumentException 当userId为空时抛出
 */
public User getUserById(Long userId) {
    // ...
}
```

### 1.3 代码结构

#### 文件长度
- 单个文件不超过500行
- 单个方法不超过50行

#### 方法参数
- 方法参数不超过5个
- 优先使用对象封装多个参数

## 2. 语言特定规范

### 2.1 JavaScript/TypeScript

#### 导入顺序
1. Node.js内置模块
2. 外部依赖
3. 内部模块
4. 父级目录模块
5. 同级目录模块

```javascript
// 正确的导入顺序
import fs from 'fs';
import path from 'path';

import express from 'express';
import lodash from 'lodash';

import { UserService } from '@services/user.service';
import { Logger } from '@utils/logger';

import { Config } from '../config';
import { Helper } from './helper';
```

#### 异步处理
- 优先使用async/await而非回调
- 合理使用Promise.all并行处理

```javascript
// 推荐写法
async function processUsers(userIds) {
    try {
        const users = await Promise.all(
            userIds.map(id => userService.getUserById(id))
        );
        return users.filter(user => user.isActive);
    } catch (error) {
        logger.error('处理用户失败', error);
        throw error;
    }
}

// 避免的写法
function processUsers(userIds, callback) {
    // 复杂的回调嵌套
}
```

### 2.2 Java

#### 异常处理
```java
// 正确的异常处理
public User getUserById(Long userId) {
    if (userId == null) {
        throw new IllegalArgumentException("用户ID不能为空");
    }
    
    try {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
    } catch (DataAccessException e) {
        logger.error("查询用户失败，用户ID: {}", userId, e);
        throw new ServiceException("查询用户失败", e);
    }
}
```

#### 资源管理
```java
// 正确的资源管理
public void processFile(String filePath) {
    try (BufferedReader reader = Files.newBufferedReader(Paths.get(filePath))) {
        String line;
        while ((line = reader.readLine()) != null) {
            processLine(line);
        }
    } catch (IOException e) {
        logger.error("处理文件失败: {}", filePath, e);
        throw new FileProcessException("文件处理失败", e);
    }
}
```

## 3. 工具使用指南

### 3.1 Prettier使用

#### 安装
```bash
npm install --save-dev prettier
```

#### 配置
在项目根目录创建`.prettierrc`文件：
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

#### 使用
```bash
# 格式化所有文件
npx prettier --write .

# 检查文件格式
npx prettier --check .

# 格式化特定文件
npx prettier --write src/**/*.js
```

### 3.2 ESLint使用

#### 安装
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### 配置
在项目根目录创建`.eslintrc.js`文件：
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  rules: {
    // 自定义规则
  }
};
```

#### 使用
```bash
# 检查代码
npx eslint src/

# 自动修复可修复的问题
npx eslint src/ --fix
```

## 4. 最佳实践

### 4.1 团队协作

1. **定期代码审查**：每次提交都应经过代码审查
2. **规范培训**：新成员入职时进行规范培训
3. **工具统一**：团队使用相同的开发工具和配置
4. **持续改进**：定期回顾和优化代码规范

### 4.2 自动化集成

1. **Git Hook**：在提交前自动检查和格式化代码
2. **CI/CD集成**：在持续集成流程中强制执行规范
3. **IDE集成**：在开发环境中实时反馈规范问题
4. **代码生成**：使用模板和脚手架确保新代码符合规范

### 4.3 监控与度量

1. **规范遵守率**：统计代码规范的遵守情况
2. **代码质量指标**：跟踪代码复杂度、重复率等指标
3. **团队效率**：评估规范对开发效率的影响
4. **问题反馈**：收集开发者对规范的反馈和建议
```

## 总结

统一代码规范与格式化是提升代码质量和团队协作效率的重要手段。通过合理配置Prettier、EditorConfig等工具，并在工程效能平台中实现平台化管控，可以有效确保代码风格的一致性。

关键要点包括：

1. **规范制定**：建立清晰、可执行的代码规范标准
2. **工具选择**：选择适合团队和项目的代码格式化工具
3. **自动化集成**：通过Git Hook、CI/CD等机制实现自动化检查
4. **IDE集成**：在开发环境中提供实时反馈和自动格式化
5. **平台管控**：通过工程效能平台统一管理和分发配置
6. **团队协作**：建立规范培训和持续改进机制

在实施过程中，需要注意以下几点：

1. **循序渐进**：不要一次性引入过多规范，避免团队抵触
2. **工具友好**：选择易于使用和配置的工具
3. **自动化优先**：尽可能通过自动化减少人工干预
4. **持续优化**：基于团队反馈和实际效果持续优化规范

通过系统性地实施统一代码规范与格式化策略，团队可以显著提升代码质量，降低维护成本，提高开发效率，为构建高质量的软件产品奠定坚实基础。

至此，我们已经完成了第9章的所有内容，包括概述文章和三个子章节文章。这些内容涵盖了Day-0预防与开发者体验的核心方面，从IDE插件开发、代码模板与脚手架到统一代码规范与格式化，形成了完整的质量内建体系。