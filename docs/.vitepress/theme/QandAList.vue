<template>
  <div>
    <h2>Q&A</h2>
    <ul>
      <li v-for="item in qaItems" :key="item.id">
        <a :href="item.html_url" target="_blank">{{ item.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const qaItems = ref([]);
const apiUrl = 'https://api.github.com/repos/AricSu/askAricComments/discussions?category=DIC_kwDONeqM7M4ClSWb';

const getQandA = async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    qaItems.value = data.slice(0, 5); // 获取最近 5 条 Q&A
  } catch (error) {
    console.error('Error fetching GitHub Issues:', error);
  }
};

onMounted(() => {
  getQandA();
});
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
li {
  margin: 10px 0;
}
a {
  text-decoration: none;
  color: #0070f3;
}
a:hover {
  text-decoration: underline;
}
</style>
