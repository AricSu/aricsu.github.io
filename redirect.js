const path = window.location.pathname;
let base = '/';  // base 设置为根路径

console.log('Current path:', path);
console.log('Base path:', base);

// 判断路径是否已经包含语言前缀（en 或 zh）
if (!['zh', 'en'].some((lang) => path.startsWith(base + lang + '/'))) {
  const lang = window.navigator.language || '';
  console.log('Browser language:', lang);

  // 使用正则判断语言是否包含 zh
  const targetLang = /zh/.test(lang) ? 'zh' : 'en';
  console.log('Redirecting to:', base + targetLang);

  // 获取当前路径剩余部分（去掉 base 部分），并进行重定向
  const newPath = base + targetLang + path.slice(base.length); // 保留原始路径中的其余部分
  window.location.href = newPath;
}
