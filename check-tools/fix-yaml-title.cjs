#!/usr/bin/env node

const fs = require('fs');

// 修正YAML头部中的title字段
function fixYamlTitle(filePath) {
  console.log(`正在处理文件: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 提取YAML头部
    const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(yamlHeaderRegex);
    
    if (!match) {
      console.log('未找到有效的YAML头部');
      return;
    }
    
    let yamlContent = match[1];
    const restContent = content.slice(match[0].length);
    
    console.log('原始YAML头部:');
    console.log(yamlContent);
    
    // 修正title行
    const lines = yamlContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('title:')) {
        // 提取title值
        let titleValue = lines[i].substring(6).trim(); // 去掉"title:"前缀
        console.log(`原始title值: ${titleValue}`);
        
        // 移除可能的引号
        if ((titleValue.startsWith('"') && titleValue.endsWith('"')) || 
            (titleValue.startsWith("'") && titleValue.endsWith("'"))) {
          titleValue = titleValue.substring(1, titleValue.length - 1);
        }
        
        // 转义双引号并重新包装
        titleValue = titleValue.replace(/"/g, '\\"');
        lines[i] = `title: "${titleValue}"`;
        console.log(`修正后的title值: ${lines[i]}`);
      }
    }
    
    yamlContent = lines.join('\n');
    
    // 重新构建内容
    content = `---\n${yamlContent}\n---\n${restContent}`;
    
    // 写入修正后的内容
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('文件已修正');
    
  } catch (error) {
    console.log(`处理文件时出错: ${error.message}`);
  }
}

const targetFile = 'src/posts/distributed-file/1-1-4-core-connotation-of-landing-and-lifecycle.md';
fixYamlTitle(targetFile);