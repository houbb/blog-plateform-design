#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 检查YAML头部格式是否合法
function isValidYamlHeader(content) {
  // 检查是否以 --- 开头和结尾（必须是三个连字符，不能是其他破折号）
  const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(yamlHeaderRegex);
  
  if (!match) {
    return false;
  }
  
  const yamlContent = match[1];
  
  // 检查YAML头部是否包含多余的破折号
  if (yamlContent.includes('---')) {
    return false;
  }
  
  // 检查必需的字段
  const requiredFields = ['title', 'date', 'categories', 'tags', 'published'];
  for (const field of requiredFields) {
    if (!yamlContent.includes(`${field}:`)) {
      return false;
    }
  }
  
  // 检查title字段格式（确保使用英文冒号）
  const titleLines = yamlContent.split('\n').filter(line => line.trim().startsWith('title:'));
  for (const titleLine of titleLines) {
    // 检查是否包含中文冒号
    if (titleLine.includes('：')) {
      return false;
    }
  }
  
  // 检查date格式
  const dateLine = yamlContent.split('\n').find(line => line.trim().startsWith('date:'));
  if (dateLine && !/date:\s*\d{4}-\d{2}-\d{2}/.test(dateLine)) {
    return false;
  }
  
  // 检查categories和tags是否为数组格式
  const categoriesLine = yamlContent.split('\n').find(line => line.trim().startsWith('categories:'));
  const tagsLine = yamlContent.split('\n').find(line => line.trim().startsWith('tags:'));
  
  if (categoriesLine && !/\[\s*.*\s*\]/.test(categoriesLine)) {
    return false;
  }
  
  if (tagsLine && !/\[\s*.*\s*\]/.test(tagsLine)) {
    return false;
  }
  
  return true;
}

// 修正YAML头部格式
function fixYamlHeader(content) {
  // 提取YAML头部
  const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(yamlHeaderRegex);
  
  if (!match) {
    // 如果没有YAML头部，添加一个默认的
    return `---
title: ""
date: 2025-09-07
categories: ["Alarm"]
tags: ["alarm"]
published: true
---
${content}`;
  }
  
  let yamlContent = match[1];
  const restContent = content.slice(match[0].length);
  
  // 修正title字段
  const lines = yamlContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 处理title字段
    if (line.startsWith('title:')) {
      // 处理中文冒号
      if (line.includes('：')) {
        lines[i] = lines[i].replace(/：/g, ':');
      }
      
      // 提取title值并确保其被正确引号包围（如果需要）
      const titleMatch = lines[i].match(/title:\s*(.*)/);
      if (titleMatch) {
        let titleValue = titleMatch[1].trim();
        
        // 如果title包含特殊字符（如冒号、逗号等），确保被引号包围
        if (/[,:{}[\]&*#?|<>!=]/.test(titleValue)) {
          // 移除可能存在的引号
          if ((titleValue.startsWith('"') && titleValue.endsWith('"')) || 
              (titleValue.startsWith("'") && titleValue.endsWith("'"))) {
            titleValue = titleValue.substring(1, titleValue.length - 1);
          }
          
          // 转义双引号并重新添加引号
          titleValue = titleValue.replace(/"/g, '\\"');
          lines[i] = `title: "${titleValue}"`;
        }
      }
    }
    
    // 处理其他字段
    const fieldMatch = line.match(/(\w+):\s*(.*)/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      let fieldValue = fieldMatch[2].trim();
      
      // 对于categories和tags，确保它们是数组格式
      if (fieldName === 'categories' || fieldName === 'tags') {
        // 如果已经是数组格式，则跳过
        if (fieldValue.startsWith('[') && fieldValue.endsWith(']')) {
          continue;
        }
        
        // 如果值未被引号包围且包含逗号，则拆分为数组
        if (!fieldValue.startsWith('"') && !fieldValue.startsWith("'") && fieldValue.includes(',')) {
          const items = fieldValue.split(',').map(item => {
            const trimmed = item.trim();
            // 移除可能的引号
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              return trimmed.substring(1, trimmed.length - 1);
            }
            return trimmed;
          });
          lines[i] = `${fieldName}: [${items.map(item => `"${item.replace(/"/g, '\\"')}"`).join(', ')}]`;
        } else if (!fieldValue.startsWith('"') && !fieldValue.startsWith("'")) {
          // 简单处理，将单个值包装成数组
          if (fieldValue) {
            // 移除可能的引号
            if ((fieldValue.startsWith('"') && fieldValue.endsWith('"')) || 
                (fieldValue.startsWith("'") && fieldValue.endsWith("'"))) {
              fieldValue = fieldValue.substring(1, fieldValue.length - 1);
            }
            lines[i] = `${fieldName}: ["${fieldValue.replace(/"/g, '\\"')}"]`;
          }
        }
      }
    }
  }
  yamlContent = lines.join('\n');
  
  // 确保必需字段存在
  const requiredFields = ['title', 'date', 'categories', 'tags', 'published'];
  for (const field of requiredFields) {
    if (!yamlContent.includes(`${field}:`)) {
      switch (field) {
        case 'date':
          yamlContent += '\ndate: 2025-09-07';
          break;
        case 'categories':
          yamlContent += '\ncategories: ["Alarm"]';
          break;
        case 'tags':
          yamlContent += '\ntags: ["alarm"]';
          break;
        case 'published':
          yamlContent += '\npublished: true';
          break;
      }
    }
  }
  
  // 重新构建YAML头部
  return `---
${yamlContent}
---
${restContent}`;
}

// 递归遍历目录
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && file.endsWith('.md')) {
      callback(filePath);
    }
  });
}

// 检查所有Markdown文件
function checkAllMarkdownFiles() {
  const postsDir = path.join(__dirname, 'src', 'posts');
  const invalidFiles = [];
  
  console.log('正在检查所有Markdown文件的YAML头部格式...\n');
  
  walkDir(postsDir, (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!isValidYamlHeader(content)) {
        invalidFiles.push(filePath);
        console.log(`❌ 格式不合法: ${filePath}`);
      } else {
        // 可以取消注释下面这行来显示所有合法文件
        // console.log(`✅ 格式合法: ${filePath}`);
      }
    } catch (error) {
      console.error(`读取文件时出错: ${filePath}`, error.message);
    }
  });
  
  console.log(`\n检查完成！共发现 ${invalidFiles.length} 个格式不合法的文件:\n`);
  
  if (invalidFiles.length > 0) {
    invalidFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    // 保存到文件
    fs.writeFileSync(
      path.join(__dirname, 'invalid-format-files.txt'), 
      invalidFiles.join('\n'), 
      'utf8'
    );
    console.log('\n不合法文件列表已保存到: invalid-format-files.txt');
  } else {
    console.log('所有文件格式均合法！');
  }
  
  return invalidFiles;
}

// 修正所有不合法的Markdown文件
function fixAllInvalidMarkdownFiles() {
  const invalidFiles = checkAllMarkdownFiles();
  
  if (invalidFiles.length > 0) {
    console.log('\n开始修正不合法的文件...\n');
    
    let fixedCount = 0;
    invalidFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixedContent = fixYamlHeader(content);
        
        // 只有当内容发生改变时才写入文件
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`✅ 已修正: ${filePath}`);
          fixedCount++;
        } else {
          console.log(`⚠️  无需修正: ${filePath}`);
        }
      } catch (error) {
        console.error(`修正文件时出错: ${filePath}`, error.message);
      }
    });
    
    console.log(`\n修正完成！共修正了 ${fixedCount} 个文件。`);
  }
}

// 根据命令行参数决定执行哪个功能
const args = process.argv.slice(2);
if (args.includes('--fix')) {
  fixAllInvalidMarkdownFiles();
} else {
  checkAllMarkdownFiles();
}