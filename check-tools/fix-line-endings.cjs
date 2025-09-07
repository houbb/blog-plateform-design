#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 修正文件的换行符问题
function fixLineEndings(filePath) {
  console.log(`正在检查文件: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件开头
    console.log('文件开头的字符编码:');
    for(let i = 0; i < 10; i++) {
      console.log(`${i}: ${content.charCodeAt(i)} ('${content[i]}')`);
    }
    
    // 检查YAML头部
    const lines = content.split('\n');
    console.log('\n前7行内容:');
    for(let i = 0; i < 7; i++) {
      console.log(`${i}: ${JSON.stringify(lines[i])}`);
    }
    
    // 修正第一行的换行符问题
    if (lines[0] === '---\r') {
      lines[0] = '---';
      console.log('修正了第一行的换行符问题');
    }
    
    // 重新组合内容
    content = lines.join('\n');
    
    // 写入修正后的内容
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('文件已修正');
    
  } catch (error) {
    console.log(`处理文件时出错: ${error.message}`);
  }
}

const targetFile = path.join(__dirname, 'src', 'posts', 'distributed-file', '1-1-4-core-connotation-of-landing-and-lifecycle.md');
fixLineEndings(targetFile);