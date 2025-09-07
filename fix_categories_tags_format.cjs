#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 将目录名转换为正确的分类名（首字母大写，连字符转驼峰）
function toCategoryName(dirName) {
  // 特殊处理一些目录名
  const specialCases = {
    'ci-cd': 'CICD',
    'distributed-schedudle': 'DistributedSchedule',
    'distributed-flow-control': 'DistributedFlowControl',
    'distributed-file': 'DistributedFile',
    'user-privilege': 'UserPrivilege',
    'risk-control': 'RiskControl',
    'itsm': 'ITSM',
    'goutong': 'GouTong'
  };
  
  if (specialCases[dirName]) {
    return specialCases[dirName];
  }
  
  // 通用转换：将连字符分隔的名称转换为驼峰命名，首字母大写
  return dirName
    .split('-')
    .map((word, index) => {
      // 首字母大写
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

// 获取标签名（从文件名中提取）
function getTagName(fileName) {
  return path.basename(fileName, '.md').toLowerCase();
}

// 处理单个 Markdown 文件
function processMarkdownFile(filePath, categoryName) {
  // 读取文件内容
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 获取标签名
//   const tagName = getTagName(path.basename(filePath));
  const tagName = categoryName;
  
  // 更新 categories，不带引号
  content = content.replace(
    /categories:\s*\[[^\]]*\]/,
    `categories: [${categoryName}]`
  );
  
  // 更新 tags，不带引号
  content = content.replace(
    /tags:\s*\[[^\]]*\]/,
    `tags: [${tagName}]`
  );
  
  // 写入更新后的内容
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

// 处理目录中的所有 Markdown 文件
function processDirectory(dirPath) {
  // 获取目录名作为 category 名称
  const dirName = path.basename(dirPath);
  const categoryName = toCategoryName(dirName);
  
  // 读取目录中的所有文件
  const files = fs.readdirSync(dirPath);
  
  // 处理所有 .md 文件
  files.forEach(file => {
    if (path.extname(file) === '.md') {
      const filePath = path.join(dirPath, file);
      processMarkdownFile(filePath, categoryName);
    }
  });
}

// 主函数
function main() {
  const postsDir = path.join(__dirname, 'src', 'posts');
  
  // 检查 posts 目录是否存在
  if (!fs.existsSync(postsDir)) {
    console.error('Error: src/posts directory not found');
    process.exit(1);
  }
  
  // 读取所有子目录
  const categories = fs.readdirSync(postsDir).filter(item => 
    fs.statSync(path.join(postsDir, item)).isDirectory()
  );
  
  console.log('Starting to fix categories and tags format...');
  
  // 处理每个目录
  categories.forEach(category => {
    const categoryPath = path.join(postsDir, category);
    console.log(`Processing category: ${category}`);
    processDirectory(categoryPath);
  });
  
  console.log('Finished fixing categories and tags format!');
}

// 执行主函数
main();