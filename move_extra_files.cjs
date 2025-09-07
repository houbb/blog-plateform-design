#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const srcPostsDir = path.join(__dirname, 'src', 'posts');
const extraFilesDir = path.join(__dirname, 'EXTRA-FILES');

// 要移动的文件名
const filesToMove = ['HOW_TO.MD', 'index.md', 'README.md'];

// 检查源目录是否存在
if (!fs.existsSync(srcPostsDir)) {
  console.error('Error: src/posts directory not found');
  process.exit(1);
}

// 创建 EXTRA-FILES 目录（如果不存在）
if (!fs.existsSync(extraFilesDir)) {
  fs.mkdirSync(extraFilesDir);
  console.log('Created EXTRA-FILES directory');
}

// 读取所有专题目录
const categories = fs.readdirSync(srcPostsDir).filter(item => 
  fs.statSync(path.join(srcPostsDir, item)).isDirectory()
);

let movedFilesCount = 0;

console.log('开始移动文件...');
console.log('========================');

// 遍历每个专题目录
categories.forEach(category => {
  const categorySrcPath = path.join(srcPostsDir, category);
  const categoryDestPath = path.join(extraFilesDir, category);
  
  // 创建目标专题目录（如果不存在）
  if (!fs.existsSync(categoryDestPath)) {
    fs.mkdirSync(categoryDestPath, { recursive: true });
    console.log(`Created directory: ${category}`);
  }
  
  // 检查并移动指定文件
  filesToMove.forEach(fileName => {
    const srcFilePath = path.join(categorySrcPath, fileName);
    const destFilePath = path.join(categoryDestPath, fileName);
    
    if (fs.existsSync(srcFilePath)) {
      // 移动文件
      fs.renameSync(srcFilePath, destFilePath);
      console.log(`Moved: ${category}/${fileName}`);
      movedFilesCount++;
    }
  });
});

console.log('========================');
console.log(`总共移动了 ${movedFilesCount} 个文件`);
console.log('完成!');