const fs = require('fs');
const path = require('path');

// 递归读取所有 .md 文件
function getAllMdFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMdFiles(filePath, filesList);
    } else if (file.endsWith('.md') && file !== 'README.md') {
      filesList.push(filePath);
    }
  });
  
  return filesList;
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 如果已经有 frontmatter，跳过
    if (content.startsWith('---')) {
      console.log(`跳过 ${filePath} (已有 frontmatter)`);
      return;
    }
    
    // 提取第一行作为标题
    const lines = content.split('\n');
    const firstLine = lines[0];
    
    // 检查是否是 markdown 标题
    if (!firstLine.startsWith('# ')) {
      console.log(`跳过 ${filePath} (没有 H1 标题)`);
      return;
    }
    
    // 提取标题文本
    const title = firstLine.replace(/^# /, '').trim();
    
    // 创建 frontmatter
    const frontmatter = `---
title: ${title}
description: ${title}
---

`;
    
    // 写入新内容
    const newContent = frontmatter + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ 处理完成: ${filePath}`);
    console.log(`   标题: ${title}`);
    
  } catch (error) {
    console.error(`❌ 处理失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  const docsDir = path.join(__dirname, 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.error('docs 目录不存在');
    return;
  }
  
  const mdFiles = getAllMdFiles(docsDir);
  console.log(`找到 ${mdFiles.length} 个 markdown 文件`);
  
  mdFiles.forEach(processFile);
  
  console.log('\n处理完成！');
}

main();
