/* Planet 612 Service Worker
 * 目标：iOS 主屏幕（standalone）模式下，联网时永远加载最新版，断网时可用缓存兜底。
 * 发版时把 CACHE 版本号 +1（与 index.html 的 TOOLS_VER 同步升），activate 自动清旧缓存。 */
const CACHE = 'p612-v152';
const CORE = ['./', './index.html', './time.html', './weight.html', './budget.html', './storage.html', './ledger.html', './analysis.html', './daily.html', './manifest.json',
  './assets/icon-192.png', './assets/icon-512.png', './assets/icon-192-maskable.png', './assets/icon-512-maskable.png', './assets/apple-touch-icon.png',
  './assets/bg-storage.png', './assets/bg-budget.png', './assets/bg-weight.png', './assets/bg-time.png', './assets/bg-ledger.png', './assets/bg-daily.png', './assets/bg.jpg'];

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
const LIB_CACHE = 'p612-lib-v4';
/* 库里有哪些文件决定它要不要更新：不 bump LIB_VER 就永远拿旧库。
   ⚠️ 清单必须写全：少写一个（曾漏掉 flatpickr.min.js / zh.js），
   断网时那个库就取不到，页面直接抛「xxx is not defined」，
   体重簿的日期选择器会整个失效。 */
const LIB_VER = 4;
const LIB = ['./lib/xlsx.full.min.js', './lib/flatpickr.min.js', './lib/zh.js', './lib/flatpickr.min.css'];

/* 工具 iframe 在「联网失败 + 本机无缓存」时看到的提示页。
   ⚠️ 绝不能回落 ./index.html —— 那会把门户首页塞进工具 iframe，
      六个工具全变成「欢迎使用我的百宝箱」，看起来就是「工具都打不开」。 */
const OFFLINE_PAGE = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>暂时无法加载</title></head>
<body style="margin:0;padding:48px 20px;text-align:center;font:15px/1.8 -apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#1f2733;background:#f4f6fb">
<div style="font-size:34px;margin-bottom:10px">📡</div>
<b style="font-size:17px">暂时无法加载这个工具</b>
<p style="color:#8a94a6;margin-top:8px">网络没连上，本机也还没有这份页面的缓存。<br>联网后回到门户重新点开即可。</p>
</body></html>`;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // 逐个预缓存且单文件失败不影响整体安装（L4）：旧版 addAll 任一资源 404 就令整个 SW 安装失败
      .then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
      // 第三方库一起预缓存：断网首访也能拿到（单个文件失败不影响整体安装）
      .then(() => caches.open(LIB_CACHE))
      .then(c => Promise.all(LIB.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
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

self.addEventListener('message', e => {
  // 页面可以主动要求立刻接管（配合门户的「清除缓存并重载」）
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
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
        // 只缓存成功响应（避免 404/500 被永久缓存）；缓存键剥掉 query，
        // 防止自愈重试的 ?r=时间戳 造成缓存条目无限膨胀（L4）
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.origin + url.pathname, copy)); }
        return r;
      }).catch(() => caches.match(e.request)
        // 门户 iframe 请求带 ?v=NN，install 时 addAll 缓存的却是不带参数的 key。
        // 只按完整 URL 找会落空，必须再忽略 query 找一次，才能命中真实的工具页缓存。
        .then(m => m || caches.match(e.request, { ignoreSearch: true }))
        .then(m => {
          if (m) return m;
          // 断网时的回落规则（极其重要）：
          //   顶层导航到门户首页 → 回落首页是合理的；
          //   只要请求的**不是首页**，就绝不能回落到门户首页 ——
          //   旧版写法是无条件 caches.match('./index.html')，一旦缓存未命中，
          //   门户首页就会被塞进工具 iframe，六个工具全变成「欢迎使用我的百宝箱」，
          //   看起来就是「点工具被弹回门户页面」。
          //   这里不依赖 request.destination 的判定（各浏览器取值不一致），
          //   直接按「请求的是不是首页」来判断，稳。
          const isHome = url.pathname === '/' || /\/index\.html?$/.test(url.pathname);
          if (!isHome || e.request.destination === 'iframe' || /[?&]v=\d+/.test(url.search)) {
            return new Response(OFFLINE_PAGE, {
              status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          return caches.match('./index.html');
        }))
    );
    return;
  }

  // 第三方库：独立的、带版本号的缓存桶
  if (url.pathname.indexOf('/lib/') >= 0) {
    e.respondWith(
      caches.open(LIB_CACHE).then(c => c.match(e.request)).then(m => {
        if (m) return m;
        return fetch(e.request).then(r => {
          if (r.ok) { const copy = r.clone(); caches.open(LIB_CACHE).then(c2 => c2.put(e.request, copy)); }
          return r;
        });
      })
    );
    return;
  }

  // 其余静态资源（字体/图片）：cache-first —— 发版清缓存，不担心旧资源
  e.respondWith(
    // ignoreSearch 让带 ?v=NN 的资源（如门户背景 bg.jpg?v=2）命中预缓存的无 query 副本（L4）
    caches.match(e.request).then(m => m || caches.match(e.request, { ignoreSearch: true })).then(m => m || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }))
  );
});
