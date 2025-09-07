#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');

// 专门调试YAML解析问题
function debugYamlParse(filePath) {
  console.log(`正在调试文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取YAML头部
    const yamlHeaderRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(yamlHeaderRegex);
    
    if (!match) {
      console.log('未找到有效的YAML头部');
      return;
    }
    
    const yamlContent = match[1];
    console.log('YAML头部内容:');
    console.log(JSON.stringify(yamlContent, null, 2));
    
    // 按行分割并显示
    const lines = yamlContent.split('\n');
    console.log('\nYAML头部按行分割:');
    lines.forEach((line, index) => {
      console.log(`${index}: ${JSON.stringify(line)}`);
    });
    
    // 尝试解析YAML
    console.log('\n尝试解析YAML...');
    const parsed = yaml.load(yamlContent);
    console.log('解析成功:');
    console.log(parsed);
    
  } catch (error) {
    console.log(`YAML解析失败: ${error.message}`);
    console.log(`错误位置: ${error.mark?.line}:${error.mark?.column}`);
    console.log('错误堆栈:', error.stack);
  }
}

const targetFile = 'src/posts/distributed-file/1-1-4-core-connotation-of-landing-and-lifecycle.md';
debugYamlParse(targetFile);