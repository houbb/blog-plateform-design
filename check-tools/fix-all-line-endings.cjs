#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 修正文件的所有换行符问题
function fixAllLineEndings(filePath) {
  console.log(`正在处理文件: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 统一换行符为 \n
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 确保YAML头部格式正确
    const lines = content.split('\n');
    
    // 确保YAML头部开始和结束正确
    if (lines[0] === '---') {
      // 已经正确
    } else if (lines[0].trim() === '---') {
      lines[0] = '---';
    }
    
    // 查找YAML头部结束位置
    let yamlEndIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        yamlEndIndex = i;
        lines[i] = '---';
        break;
      }
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
fixAllLineEndings(targetFile);