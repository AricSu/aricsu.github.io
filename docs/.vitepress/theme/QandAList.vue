<template>
  <div class="discourse-style">
    <div class="content-wrapper">
      <!-- 左侧：分类讨论 -->
      <div class="discussion-section">
        <div v-for="category in groupedDiscussions" :key="category.name" class="category-section">
          <h3 class="category-title">
            <span class="category-badge">{{ category.name }}</span>
            {{ category.description }}
          </h3>

          <table class="discussion-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Author</th>
                <th>Replies</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in category.topics" :key="item.id" class="discussion-row">
                <td><a :href="item.html_url" target="_blank">{{ item.title }}</a></td>
                <td>{{ item.user.login }}</td>
                <td>{{ item.comments }}</td>
                <td>{{ new Date(item.updated_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
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
import { ref, onMounted } from 'vue';
import QuestionForm from './QuestionForm.vue';

const groupedDiscussions = ref([]);

const getQandA = async () => {
  try {
    const apiUrl = `https://api.github.com/repos/AricSu/askAricComments/discussions?per_page=100`;
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
  } catch (error) {
    console.error('Error fetching discussions:', error);
  }
};

onMounted(() => {
  getQandA();
});
</script>

<style scoped>
.discourse-style {
  font-family: Arial, sans-serif;
  padding: 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.discussion-section {
  flex: 2;
}

.question-section {
  flex: 1;
}

.category-section {
  margin-bottom: 40px;
  border-left: 4px solid #0078d4;
  padding-left: 20px;
}

.category-title {
  font-size: 1.5em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.category-badge {
  background-color: #0078d4;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 0.9em;
}

.discussion-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.discussion-table th,
.discussion-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.discussion-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.discussion-row:hover {
  background-color: #f9f9f9;
}

.discussion-table td a {
  text-decoration: none;
  color: #0078d4;
}

.discussion-table td a:hover {
  text-decoration: underline;
}
</style>
