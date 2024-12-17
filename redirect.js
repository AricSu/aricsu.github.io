const path = window.location.pathname
const base = '/'

console.log('Current path:', path);

// 判断路径是否包含语言前缀（en 或 zh）
if (!['zh', 'en'].some((lang) => path.startsWith(base + lang + '/'))) {
  const lang = window.navigator.language || '';
  console.log('Browser language:', lang);

  // 使用正则判断语言是否包含 zh
  const targetLang = /zh/.test(lang) ? 'zh' : 'en';
  console.log('Redirecting to:', base + targetLang);

  // 执行跳转
  window.location.href = base + targetLang + path.slice(base.length - 1);
}
