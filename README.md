# 简介

中间件技术博客

# 在线

[https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/)

# 本地

## node 版本

```
> node -v
v22.18.0
```

## 命令

```
npm install
npm run docs:clean-dev
```

# 系列专题

## 读书笔记（知识输入）

## 知识花园（知识库、沉淀、有效输出）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/digit-garden/)

gitbook: [https://houbb.gitbook.io/digit-garden/](https://houbb.gitbook.io/digit-garden/)

## 学习方法论（学习技巧-深度加工）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/learnmethods/)

## 思维模型（底层模型-深度加工）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/thinkmodel/)

## 刻意练习(力扣算法)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 相关

[个人技术笔记](https://github/houbb/houbb.github.io)

[个人思考(不止技术) blog-plateform-design](https://github/houbb/blog-plateform-design)

## 整体关系

**高效输入（时间管理+阅读）、深度加工（笔记+反思）、有效输出（练习+讲解+实战）、科学记忆（复习+间隔重复）**。

读书--》高质量的输入

方法论---》指导实践

个人思考笔记--》反馈+记录+沉淀

实战--》不要纸上谈兵

PDCA

## 工具支撑

方法论+对应的工具流程支撑（潜移默化）

# 缺失部分

风控

分布式文件

## 格式校验

```js
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const grayMatter = require('gray-matter');

// 检查单个文件的gray-matter解析
function checkFileGrayMatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 使用gray-matter解析
    const matter = grayMatter(content);
    
    // console.log(`✅ 文件 ${filePath} gray-matter解析成功`);
    return true;
  } catch (error) {
    console.log(`❌ 文件 ${filePath} gray-matter解析失败: ${error.message}`);
    // console.log(`   错误堆栈: ${error.stack}`);
    return false;
  }
}

// 递归遍历目录检查所有Markdown文件
function checkAllMarkdownFiles() {
  const postsDir = path.join(__dirname, 'src', 'posts');
  let errorCount = 0;
  const errorFiles = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile() && file.endsWith('.md')) {
        if (!checkFileGrayMatter(filePath)) {
          errorCount++;
          errorFiles.push(filePath);
        }
      }
    });
  }
  
  walkDir(postsDir);
  
  console.log(`\n检查完成，共发现 ${errorCount} 个文件解析失败`);
  if (errorCount > 0) {
    console.log('解析失败的文件:');
    errorFiles.forEach(file => console.log(`  - ${file}`));
  }
}

checkAllMarkdownFiles();
```