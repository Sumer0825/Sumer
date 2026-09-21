/* Planet 612 Service Worker
 * 目标：iOS 主屏幕（standalone）模式下，联网时永远加载最新版，断网时可用缓存兜底。
 * 发版时把 CACHE 版本号 +1（与 index.html 的 TOOLS_VER 同步升），activate 自动清旧缓存。 */
const CACHE = 'p612-v35';
const CORE = ['./', './index.html', './time.html', './weight.html', './budget.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 只管同源 GET；GitHub API 等跨源请求不拦截
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  const isPage = e.request.mode === 'navigate' || /\.html?$/.test(url.pathname);
  if (isPage) {
    // 页面：network-first —— 联网时永远拿最新，断网回落缓存
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
    );
  } else {
    // 静态资源（字体/lib/图片）：cache-first —— 发版清缓存，不担心旧资源
    e.respondWith(
      caches.match(e.request).then(m => m || fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }))
    );
  }
});
