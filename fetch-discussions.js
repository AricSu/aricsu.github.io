const fs = require('fs');
const path = require('path');
const https = require('https');

// 确保目录存在
const workflowDir = 'docs/public/workflow';
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

// 获取数据的函数
async function fetchDiscussions(repo, filename) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${repo}/discussions?per_page=100&state=open`;
    
    console.log(`正在获取 ${repo} 的讨论数据...`);
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Node.js Discussion Fetcher',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const discussions = JSON.parse(data);
          
          if (discussions.message && discussions.message.includes('rate limit')) {
            console.warn(`⚠️  ${repo}: API 频率限制`);
            resolve([]);
            return;
          }
          
          if (!Array.isArray(discussions)) {
            console.warn(`⚠️  ${repo}: 返回数据格式错误`);
            resolve([]);
            return;
          }
          
          // 格式化数据
          const formattedDiscussions = discussions.map(item => ({
            id: item.id,
            title: item.title,
            category: {
              name: item.category.name,
              description: item.category.description,
              id: item.category.id
            },
            user: {
              login: item.user.login,
              avatar_url: item.user.avatar_url
            },
            comments: item.comments,
            created_at: item.created_at,
            updated_at: item.updated_at,
            html_url: item.html_url,
            body: item.body ? (item.body.length > 200 ? item.body.substring(0, 200) + '...' : item.body) : ''
          }));
          
          // 保存到文件
          fs.writeFileSync(
            path.join(workflowDir, filename),
            JSON.stringify(formattedDiscussions, null, 2)
          );
          
          console.log(`✅ 成功获取 ${repo} 讨论数据: ${formattedDiscussions.length} 个讨论`);
          resolve(formattedDiscussions);
          
        } catch (error) {
          console.error(`❌ 解析 ${repo} 数据失败:`, error.message);
          resolve([]);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ 请求 ${repo} 失败:`, error.message);
      resolve([]);
    });
    
    req.setTimeout(10000, () => {
      console.error(`❌ 请求 ${repo} 超时`);
      req.destroy();
      resolve([]);
    });
  });
}

// 生成完整数据文件（包含讨论和统计）
function generateCompleteData(aricsuDiscussions) {
  // 按分类分组
  const groupByCategory = (discussions) => {
    const categories = {};
    discussions.forEach(item => {
      const categoryName = item.category.name;
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      categories[categoryName]++;
    });
    
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count
    }));
  };
  
  const completeData = {
    meta: {
      last_updated: new Date().toISOString(),
      repository: {
        name: 'aricsu.github.io',
        total_discussions: aricsuDiscussions.length,
        categories: groupByCategory(aricsuDiscussions)
      }
    },
    discussions: aricsuDiscussions
  };
  
  fs.writeFileSync(
    path.join(workflowDir, 'discussions-data.json'),
    JSON.stringify(completeData, null, 2)
  );
  
  return completeData;
}

// 主函数
async function main() {
  console.log('🚀 开始获取 GitHub Discussions 数据...\n');
  
  if (!process.env.GITHUB_TOKEN) {
    console.log('⚠️  未设置 GITHUB_TOKEN 环境变量，将使用无认证模式（有频率限制）\n');
  }
  
  try {
    // 获取 aricsu.github.io 仓库的数据
    const aricsuDiscussions = await fetchDiscussions('AricSu/aricsu.github.io', 'temp-discussions.json');
    
    // 生成完整数据文件
    const completeData = generateCompleteData(aricsuDiscussions);
    
    // 删除临时文件
    if (fs.existsSync(path.join(workflowDir, 'temp-discussions.json'))) {
      fs.unlinkSync(path.join(workflowDir, 'temp-discussions.json'));
    }
    
    console.log('\n📊 数据获取完成！');
    console.log('文件位置:');
    console.log('  - docs/public/workflow/discussions-data.json\n');
    
    console.log('📈 统计概览:');
    console.log(`  ${completeData.meta.repository.name}: ${completeData.meta.repository.total_discussions} 个讨论`);
    if (completeData.meta.repository.categories.length > 0) {
      completeData.meta.repository.categories.forEach(cat => {
        console.log(`    - ${cat.name}: ${cat.count} 个`);
      });
    }
    console.log(`  数据更新时间: ${new Date(completeData.meta.last_updated).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ 获取数据失败:', error.message);
    process.exit(1);
  }
}

main();
