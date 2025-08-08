<template>
  <div class="discourse-style">
    <div class="content-wrapper">
      <!-- 左侧：分类讨论 -->
      <div class="discussion-section">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <p>{{ texts.loading }}</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="getQandA" class="retry-btn">{{ texts.retry }}</button>
        </div>
        
        <!-- 数据展示 -->
        <div v-else>
          <!-- 数据更新时间和统计信息 -->
          <div class="info-bar">
            <div class="stats-info">
              <span class="total-count">{{ texts.total }} {{ totalDiscussions }} {{ texts.discussions }}</span>
              <span v-for="category in categoryStats" :key="category.name" class="category-stat">
                {{ category.name }}: {{ category.count }}
              </span>
            </div>
            <div v-if="lastUpdated" class="update-info">
              <small>{{ texts.dataUpdateTime }}: {{ formatUpdateTime(lastUpdated) }}</small>
            </div>
          </div>
          
          <div v-for="category in limitedDiscussions" :key="category.name" class="category-section">
            <h3 class="category-title">
              <span class="category-badge">{{ category.name }}</span>
              <span class="category-description">{{ category.description || texts.uncategorized }}</span>
              <span class="topic-count">({{ category.topics.length }})</span>
            </h3>

            <div class="discussion-list">
              <div v-for="item in category.topics" :key="item.id" class="discussion-item">
                <div class="discussion-main">
                  <h4 class="discussion-title">
                    <a :href="item.html_url" target="_blank">{{ item.title }}</a>
                  </h4>
                  <div class="discussion-meta">
                    <div class="author-info">
                      <img v-if="item.user.avatar_url" :src="item.user.avatar_url" :alt="item.user.login" class="avatar" />
                      <span class="author-name">{{ item.user.login }}</span>
                    </div>
                    <div class="discussion-stats">
                      <span class="replies-count" v-if="item.comments > 0">{{ item.comments }} {{ texts.replies }}</span>
                      <span class="update-time">{{ formatRelativeTime(item.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 显示更多按钮 -->
            <div v-if="category.hasMore" class="show-more">
              <button @click="expandCategory(category.name)" class="expand-btn">
                {{ currentLang === 'zh' ? 
                  `${texts.showMore} (${texts.remaining} ${category.hiddenCount} ${texts.items})` :
                  `${texts.showMore} (${category.hiddenCount} ${texts.items})`
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：提问窗口 -->
      <div class="question-section">
        <QuestionForm />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vitepress';
import QuestionForm from './QuestionForm.vue';

const router = useRouter();
const groupedDiscussions = ref([]);
const lastUpdated = ref('');
const isLoading = ref(true);
const error = ref(null);
const expandedCategories = ref(new Set());
const maxItemsPerCategory = 5; // 每个分类最多显示的条目数

// 检测当前语言
const currentLang = computed(() => {
  const path = router.route.path;
  if (path.includes('/zh/')) return 'zh';
  if (path.includes('/en/')) return 'en';
  return 'zh'; // 默认中文
});

// 多语言文本配置
const texts = computed(() => {
  const textConfig = {
    zh: {
      loading: '正在加载讨论数据...',
      retry: '重试',
      failed: '加载数据失败',
      total: '共',
      discussions: '个讨论',
      dataUpdateTime: '数据更新时间',
      uncategorized: '未分类讨论',
      replies: '回复',
      showMore: '显示更多',
      remaining: '还有',
      items: '个',
      justNow: '刚刚',
      minutesAgo: '分钟前',
      hoursAgo: '小时前',
      daysAgo: '天前',
      weeksAgo: '周前',
      monthsAgo: '个月前',
      yearsAgo: '年前'
    },
    en: {
      loading: 'Loading discussions...',
      retry: 'Retry',
      failed: 'Failed to load data',
      total: 'Total',
      discussions: 'discussions',
      dataUpdateTime: 'Data updated',
      uncategorized: 'Uncategorized discussions',
      replies: 'replies',
      showMore: 'Show more',
      remaining: '',
      items: 'more items',
      justNow: 'just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      weeksAgo: 'weeks ago',
      monthsAgo: 'months ago',
      yearsAgo: 'years ago'
    }
  };
  
  return textConfig[currentLang.value];
});

// 计算统计信息
const totalDiscussions = computed(() => {
  return groupedDiscussions.value.reduce((total, category) => total + category.topics.length, 0);
});

const categoryStats = computed(() => {
  return groupedDiscussions.value.map(category => ({
    name: category.name,
    count: category.topics.length
  }));
});

// 限制显示的讨论数量
const limitedDiscussions = computed(() => {
  return groupedDiscussions.value.map(category => {
    const isExpanded = expandedCategories.value.has(category.name);
    const topics = isExpanded ? category.topics : category.topics.slice(0, maxItemsPerCategory);
    const hasMore = category.topics.length > maxItemsPerCategory && !isExpanded;
    const hiddenCount = Math.max(0, category.topics.length - maxItemsPerCategory);
    
    return {
      ...category,
      topics,
      hasMore,
      hiddenCount
    };
  });
});

// 展开分类
const expandCategory = (categoryName) => {
  expandedCategories.value.add(categoryName);
};

// 格式化相对时间
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return texts.value.justNow;
  if (diffInMinutes < 60) return `${diffInMinutes}${texts.value.minutesAgo}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}${texts.value.hoursAgo}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}${texts.value.daysAgo}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}${texts.value.weeksAgo}`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}${texts.value.monthsAgo}`;
  
  return `${Math.floor(diffInMonths / 12)}${texts.value.yearsAgo}`;
};

// 格式化更新时间（使用本地时区）
const formatUpdateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

const getQandA = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // 首先尝试读取本地合并后的数据文件
    const response = await fetch('/workflow/discussions-data.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch local discussions data');
    }

    const data = await response.json();
    const discussions = data.discussions || [];

    // Group discussions by category
    const categories = {};
    discussions.forEach((item) => {
      const categoryName = item.category.name;
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          description: item.category.description,
          topics: []
        };
      }
      categories[categoryName].topics.push(item);
    });

    groupedDiscussions.value = Object.values(categories);
    lastUpdated.value = new Date(data.meta.last_updated).toLocaleString();

  } catch (err) {
    console.warn('Failed to fetch local data, falling back to API:', err);
    
    // 如果本地数据获取失败，回退到直接调用 API
    try {
      const apiUrl = `https://api.github.com/repos/AricSu/aricsu.github.io/discussions?per_page=100`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Group discussions by category
      const categories = {};
      data.forEach((item) => {
        const categoryName = item.category.name;
        if (!categories[categoryName]) {
          categories[categoryName] = {
            name: categoryName,
            description: item.category.description,
            topics: []
          };
        }
        categories[categoryName].topics.push(item);
      });

      groupedDiscussions.value = Object.values(categories);
      lastUpdated.value = new Date().toLocaleString();
      
    } catch (apiErr) {
      console.error('Failed to fetch from API:', apiErr);
      error.value = texts.value.failed;
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getQandA();
});
</script>

<style scoped>
.discourse-style {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.discussion-section {
  min-height: 0;
}

.question-section {
  position: sticky;
  top: 20px;
}

/* 信息栏 */
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.total-count {
  font-weight: 600;
  color: #0078d4;
  background: rgba(0, 120, 212, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9em;
}

.category-stat {
  color: #6c757d;
  font-size: 0.85em;
  padding: 2px 8px;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 12px;
}

.update-info {
  color: #6c757d;
  font-size: 0.8em;
}

/* 分类区域 */
.category-section {
  margin-bottom: 35px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.category-title {
  font-size: 1.3em;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.category-description {
  flex: 1;
  font-weight: normal;
  opacity: 0.95;
}

.topic-count {
  font-size: 0.9em;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 15px;
}

/* 讨论列表 */
.discussion-list {
  padding: 0;
}

.discussion-item {
  border-bottom: 1px solid #f1f3f5;
  transition: all 0.2s ease;
}

.discussion-item:hover {
  background: #f8f9fa;
}

.discussion-item:last-child {
  border-bottom: none;
}

.discussion-main {
  padding: 20px;
}

.discussion-title {
  margin: 0 0 12px 0;
  font-size: 1.1em;
  line-height: 1.4;
}

.discussion-title a {
  text-decoration: none;
  color: #212529;
  font-weight: 500;
  transition: color 0.2s ease;
}

.discussion-title a:hover {
  color: #0078d4;
}

.discussion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e9ecef;
}

.author-name {
  color: #495057;
  font-weight: 500;
  font-size: 0.9em;
}

.discussion-stats {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 0.85em;
  color: #6c757d;
}

.replies-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.update-time {
  color: #868e96;
}

/* 展开更多按钮 */
.show-more {
  padding: 15px 20px;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.expand-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}

.expand-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* 加载和错误状态 */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
}

.loading-state p {
  color: #6c757d;
  font-size: 1.1em;
  margin: 0;
}

.error-state {
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 1px solid #feb2b2;
}

.error-state p {
  color: #c53030;
  font-weight: 500;
  margin: 0 0 15px 0;
}

.retry-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}
</style>
