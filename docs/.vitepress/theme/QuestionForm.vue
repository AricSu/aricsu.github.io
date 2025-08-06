<template>
  <div class="ask-wrapper">
    <h1>📢 有问题想提问？</h1>
    <p>点击下方按钮跳转到 GitHub Discussions 提问表单。</p>
    <button @click="goToDiscussionForm" class="ask-button">
      📝 发起提问
    </button>
  </div>
</template>

<script setup lang="ts">
const goToDiscussionForm = () => {
  // 请替换为你的仓库地址和 discussion 分类 slug
  const repoOwner = "AricSu";
  const repoName = "askAricComments";
  const categorySlug = "general"; // 你设置的 Discussion 分类 URL 名

  const url = `https://github.com/${repoOwner}/${repoName}/discussions/categories/${categorySlug}`;
  window.open(url, "_blank");
};
</script>

<style scoped>
.ask-wrapper {
  max-width: 600px;
  margin: 100px auto;
  padding: 2rem;
  border-radius: 12px;
  background-color: #f9f9f9;
  text-align: center;
  font-family: sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.ask-button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #2da44e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.ask-button:hover {
  background-color: #218739;
}
</style>
