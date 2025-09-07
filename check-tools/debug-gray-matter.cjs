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