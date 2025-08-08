#!/bin/bash

# 本地触发脚本 - 获取 GitHub Discussions 数据
echo "开始获取 GitHub Discussions 数据..."

# 创建 workflow 目录
mkdir -p docs/public/workflow

# 检查是否有 GITHUB_TOKEN 环境变量
if [ -z "$GITHUB_TOKEN" ]; then
    echo "警告: 未设置 GITHUB_TOKEN 环境变量，将使用无认证模式（有频率限制）"
    AUTH_HEADER=""
else
    echo "使用 GitHub Token 进行认证"
    AUTH_HEADER="-H \"Authorization: token $GITHUB_TOKEN\""
fi

# 获取 aricsu.github.io 仓库的讨论
echo "正在获取 aricsu.github.io 的讨论数据..."
if [ -n "$GITHUB_TOKEN" ]; then
    curl -H "Authorization: token $GITHUB_TOKEN" \
         -H "Accept: application/vnd.github.v3+json" \
         "https://api.github.com/repos/AricSu/aricsu.github.io/discussions?per_page=100&state=open" \
         | jq '[.[] | {
           id: .id,
           title: .title,
           category: {
             name: .category.name,
             description: .category.description,
             id: .category.id
           },
           user: {
             login: .user.login,
             avatar_url: .user.avatar_url
           },
           comments: .comments,
           created_at: .created_at,
           updated_at: .updated_at,
           html_url: .html_url,
           body: (.body | if length > 200 then .[:200] + "..." else . end)
         }]' > docs/public/workflow/aricsu-discussions.json
else
    curl -H "Accept: application/vnd.github.v3+json" \
         "https://api.github.com/repos/AricSu/aricsu.github.io/discussions?per_page=100&state=open" \
         | jq '[.[] | {
           id: .id,
           title: .title,
           category: {
             name: .category.name,
             description: .category.description,
             id: .category.id
           },
           user: {
             login: .user.login,
             avatar_url: .user.avatar_url
           },
           comments: .comments,
           created_at: .created_at,
           updated_at: .updated_at,
           html_url: .html_url,
           body: (.body | if length > 200 then .[:200] + "..." else . end)
         }]' > docs/public/workflow/aricsu-discussions.json
fi

# 检查是否成功获取数据
if [ $? -eq 0 ] && [ -s docs/public/workflow/aricsu-discussions.json ]; then
    echo "✅ 成功获取 aricsu.github.io 讨论数据"
    echo "讨论数量: $(jq length docs/public/workflow/aricsu-discussions.json)"
else
    echo "❌ 获取 aricsu.github.io 讨论数据失败"
fi

# 生成统计信息
echo "正在生成统计信息..."
cat > docs/public/workflow/discussions-summary.json << EOF
{
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "repository": {
    "name": "aricsu.github.io",
    "total_discussions": $(jq length docs/public/workflow/aricsu-discussions.json 2>/dev/null || echo 0),
    "categories": $(jq '[group_by(.category.name)[] | {name: .[0].category.name, count: length}]' docs/public/workflow/aricsu-discussions.json 2>/dev/null || echo '[]')
  }
}
EOF

echo "✅ 统计信息已生成"

# 显示结果
echo ""
echo "📊 数据获取完成！"
echo "文件位置:"
echo "  - docs/public/workflow/aricsu-discussions.json"
echo "  - docs/public/workflow/discussions-summary.json"
echo ""

# 显示统计信息
if [ -f docs/public/workflow/discussions-summary.json ]; then
    echo "📈 统计概览:"
    jq -r '"  \(.repository.name): \(.repository.total_discussions) 个讨论"' docs/public/workflow/discussions-summary.json
    echo "  数据更新时间: $(jq -r '.last_updated' docs/public/workflow/discussions-summary.json)"
fi
