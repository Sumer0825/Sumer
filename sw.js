/* Planet 612 Service Worker
 * 目标：iOS 主屏幕（standalone）模式下，联网时永远加载最新版，断网时可用缓存兜底。
 * 发版时把 CACHE 版本号 +1（与 index.html 的 TOOLS_VER 同步升），activate 自动清旧缓存。 */
const CACHE = 'p612-v122';
const CORE = ['./', './index.html', './time.html', './weight.html', './budget.html', './storage.html', './ledger.html', './analysis.html', './daily.html', './manifest.json',
  './assets/icon-192.png', './assets/icon-512.png', './assets/icon-192-maskable.png', './assets/icon-512-maskable.png', './assets/apple-touch-icon.png',
  './assets/bg-storage.png', './assets/bg-budget.png', './assets/bg-weight.png', './assets/bg-time.png', './assets/bg-ledger.png', './assets/bg-daily.png'];

/* 缓存命名前缀 —— 只清自己这一族的缓存。
 * 原来的写法是 caches.keys().filter(k => k !== CACHE).map(k => caches.delete(k))，
 * 而 CacheStorage 是 **origin 级**命名空间：同域下别的应用（比如用户自己挂在
 * 同一域名下的其它站点）建的缓存会被我们连带删掉，属于越权。
 * 现在只删以 PREFIX 开头、且不是当前版本的缓存。 */
const PREFIX = 'p612-';

/* 第三方库（SheetJS 等）单独一个缓存桶，带版本号。
 * 原来 lib/* 走 cache-first 且缓存 key 就是原 URL，发布新版 lib 时
 * 只要忘了 bump 主 CACHE 号，就会长期命中旧版 SheetJS —— 表现为
 * 「明明更新了却还是老行为」。独立 + 显式版本号可避免。 */
const LIB_CACHE = 'p612-lib-v3';
/* 库里有哪些文件决定它要不要更新：不 bump LIB_VER 就永远拿旧库。 */
const LIB_VER = 3;
const LIB = ['./lib/xlsx.full.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith(PREFIX) && k !== CACHE && k !== LIB_CACHE)
            .map(k => caches.delete(k))
      ))
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
    return;
  }

  // 第三方库：独立的、带版本号的缓存桶
  if (url.pathname.indexOf('/lib/') >= 0) {
    e.respondWith(
      caches.open(LIB_CACHE).then(c => c.match(e.request)).then(m => {
        if (m) return m;
        return fetch(e.request).then(r => {
          const copy = r.clone();
          caches.open(LIB_CACHE).then(c2 => c2.put(e.request, copy));
          return r;
        });
      })
    );
    return;
  }

  // 其余静态资源（字体/图片）：cache-first —— 发版清缓存，不担心旧资源
  e.respondWith(
    caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }))
  );
});
