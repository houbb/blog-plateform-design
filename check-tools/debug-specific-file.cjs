#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const grayMatter = require('gray-matter');
const yaml = require('js-yaml');

// 检查特定文件的详细解析过程
function debugSpecificFile(filePath) {
  console.log(`正在检查文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('文件读取成功');
    
    // 检查文件开头的内容
    console.log('文件开头内容:');
    console.log(content.substring(0, 200));
    
    // 尝试使用gray-matter解析
    console.log('\n尝试使用gray-matter解析...');
    const matter = grayMatter(content);
    console.log('gray-matter解析成功');
    console.log('YAML头部内容:');
    console.log(matter.data);
    
  } catch (error) {
    console.log(`gray-matter解析失败: ${error.message}`);
    console.log(`错误位置: ${error.mark?.line}:${error.mark?.column}`);
    
    // 尝试手动提取YAML头部
    console.log('\n尝试手动提取YAML头部...');
    const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(yamlHeaderRegex);
    
    if (match) {
      console.log('找到YAML头部:');
      const yamlContent = match[1];
      console.log(yamlContent);
      
      // 尝试解析YAML内容
      try {
        const parsed = yaml.load(yamlContent);
        console.log('YAML解析成功:');
        console.log(parsed);
      } catch (yamlError) {
        console.log(`YAML解析失败: ${yamlError.message}`);
        console.log(`错误位置: ${yamlError.mark?.line}:${yamlError.mark?.column}`);
      }
    } else {
      console.log('未找到有效的YAML头部');
    }
  }
}

const targetFile = path.join(__dirname, 'src', 'posts', 'distributed-file', '1-1-4-core-connotation-of-landing-and-lifecycle.md');
debugSpecificFile(targetFile);