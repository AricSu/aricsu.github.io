<template>
  <div class="question-form-card">
    <div class="card-header">
      <div class="icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
        </svg>
      </div>
      <h3 class="card-title">{{ texts.title }}</h3>
    </div>
    
    <div class="card-content">
      <p class="description">{{ texts.description }}</p>
      
      <!-- 分类选择器 -->
      <div class="category-selector">
        <label class="selector-label">{{ texts.selectCategory }}</label>
        <div class="category-options">
          <div 
            v-for="category in categoryOptions" 
            :key="category.value"
            class="category-option"
            :class="{ active: selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <div class="category-info">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-desc">{{ category.description }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon">💬</span>
          <span>{{ texts.feature1 }}</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🚀</span>
          <span>{{ texts.feature2 }}</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🤝</span>
          <span>{{ texts.feature3 }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-actions">
      <button @click="goToDiscussionForm" class="primary-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
        </svg>
        {{ texts.button }}
      </button>
      
      <div class="help-text">
        <small>{{ texts.help }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vitepress';

const router = useRouter();
const selectedCategory = ref('tidb'); // 默认选择 TiDB

// 检测当前语言
const currentLang = computed(() => {
  const path = router.route.path;
  if (path.includes('/zh/')) return 'zh';
  if (path.includes('/en/')) return 'en';
  return 'zh'; // 默认中文
});

// 分类选项配置
const categoryOptions = computed(() => {
  const options = {
    zh: [
      {
        value: 'tidb',
        name: 'TiDB 问题',
        description: 'TiDB 数据库相关问题',
        icon: '🗃️'
      },
      {
        value: 'tihc',
        name: 'TiHC 问题', 
        description: 'TiHC 工具相关问题',
        icon: '⛏️'
      },
      {
        value: 'other',
        name: '其他问题',
        description: '通用问题或其他主题',
        icon: '💭'
      }
    ],
    en: [
      {
        value: 'tidb',
        name: 'TiDB Issues',
        description: 'TiDB database related questions',
        icon: '🗃️'
      },
      {
        value: 'tihc',
        name: 'TiHC Issues',
        description: 'TiHC tools related questions', 
        icon: '⛏️'
      },
      {
        value: 'other',
        name: 'Other Issues',
        description: 'General questions or other topics',
        icon: '💭'
      }
    ]
  };
  
  return options[currentLang.value];
});

// 多语言文本配置
const texts = computed(() => {
  const textConfig = {
    zh: {
      title: '有问题想提问？',
      description: '选择问题分类，点击下方按钮跳转到 GitHub Discussions 提问表单。',
      selectCategory: '选择问题分类',
      feature1: '技术问题交流',
      feature2: '快速获得回复', 
      feature3: '社区互助支持',
      button: '📝 发起提问',
      help: '将跳转到 GitHub Discussions'
    },
    en: {
      title: 'Have Questions?',
      description: 'Choose a category and click the button below to jump to GitHub Discussions form.',
      selectCategory: 'Select Question Category',
      feature1: 'Technical Q&A',
      feature2: 'Quick Response',
      feature3: 'Community Support',
      button: '📝 Ask Question',
      help: 'Will redirect to GitHub Discussions'
    }
  };
  
  return textConfig[currentLang.value];
});

const goToDiscussionForm = () => {
  const repoOwner = "AricSu";
  const repoName = "aricsu.github.io";
  
  let url: string;
  
  switch (selectedCategory.value) {
    case 'tidb':
      url = `https://github.com/${repoOwner}/${repoName}/discussions/new?category=askaric-tidb`;
      break;
    case 'tihc':
      url = `https://github.com/${repoOwner}/${repoName}/discussions/new?category=askaric-tihc`;
      break;
    case 'other':
      url = `https://github.com/${repoOwner}/${repoName}/discussions/new/choose`;
      break;
    default:
      url = `https://github.com/${repoOwner}/${repoName}/discussions/new?category=askaric-tidb`;
  }
  
  window.open(url, "_blank");
};
</script>

<style scoped>
.question-form-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  position: relative;
  max-width: 400px;
}

.question-form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.card-header {
  padding: 25px 25px 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.icon-wrapper svg {
  color: white;
  width: 28px;
  height: 28px;
}

.card-title {
  margin: 0;
  font-size: 1.4em;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.card-content {
  padding: 0 25px 20px;
  position: relative;
  z-index: 1;
}

.description {
  margin: 0 0 20px;
  opacity: 0.9;
  line-height: 1.6;
  font-size: 0.95em;
  text-align: center;
}

/* 分类选择器 */
.category-selector {
  margin-bottom: 20px;
}

.selector-label {
  display: block;
  font-size: 0.9em;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
}

.category-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.category-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.category-option:hover::before {
  left: 100%;
}

.category-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(3px);
}

.category-option.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.category-option.active::after {
  content: '✓';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #28a745;
  background: rgba(255, 255, 255, 0.9);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.category-icon {
  font-size: 1.4em;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-name {
  font-weight: 600;
  font-size: 0.95em;
  color: rgba(255, 255, 255, 0.95);
}

.category-desc {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.9em;
}

.feature-icon {
  font-size: 1.2em;
  width: 20px;
  text-align: center;
}

.card-actions {
  padding: 20px 25px 30px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.primary-button {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  min-width: 180px;
  position: relative;
  overflow: hidden;
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.primary-button:hover::before {
  left: 100%;
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.primary-button:active {
  transform: translateY(-1px);
}

.primary-button svg {
  width: 18px;
  height: 18px;
}

.help-text {
  margin-top: 15px;
  opacity: 0.8;
}

.help-text small {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-form-card {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .card-header {
    padding: 20px 20px 15px;
  }
  
  .card-content {
    padding: 0 20px 15px;
  }
  
  .card-actions {
    padding: 15px 20px 25px;
  }
  
  .primary-button {
    padding: 12px 24px;
    font-size: 0.95rem;
    min-width: 160px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .question-form-card {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .question-form-card::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  }
}
</style>
