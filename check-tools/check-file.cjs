#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 检查单个文件的YAML格式
function checkFileYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取YAML头部
    const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(yamlHeaderRegex);
    
    if (!match) {
      console.log(`❌ 文件 ${filePath} 没有有效的YAML头部`);
      return false;
    }
    
    const yamlContent = match[1];
    
    // 尝试解析YAML
    const parsed = yaml.load(yamlContent);
    console.log(`✅ 文件 ${filePath} YAML格式正确`);
    return true;
  } catch (error) {
    console.log(`❌ 文件 ${filePath} YAML解析失败: ${error.message}`);
    console.log(`   错误位置: ${error.mark?.line}:${error.mark?.column}`);
    return false;
  }
}

// 递归遍历目录检查所有Markdown文件
function checkAllMarkdownFiles() {
  const postsDir = path.join(__dirname, 'src', 'posts');
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile() && file.endsWith('.md')) {
        checkFileYaml(filePath);
      }
    });
  }
  
  walkDir(postsDir);
}

checkAllMarkdownFiles();