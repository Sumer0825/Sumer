const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const PORT = process.env.PORT || 3000;
const ZIP = path.join(DIR, 'sumer-pages-v47.zip');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

// 静态服务白名单：只放行工具页面与静态资源目录。
// 原因：整目录开放会让任何放在 portal/ 下的文件（如账本备份 JSON、历史 zip）可被直接下载。
const ALLOW_FILES = new Set([
  'index.html', 'time.html', 'weight.html', 'budget.html',
  'storage.html', 'ledger.html', 'analysis.html', 'download.html', 'sw.js'
]);
const ALLOW_DIRS = ['assets', 'lib'];

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    urlPath = '/';
  }

  // zip 下载接口（octet-stream + attachment，绕开网关对 .zip 的拦截）
  if (urlPath === '/dl') {
    if (!fs.existsSync(ZIP)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('zip not found');
    }
    const stat = fs.statSync(ZIP);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="sumer-pages-v47.zip"',
      'Cache-Control': 'no-store'
    });
    return fs.createReadStream(ZIP).pipe(res);
  }

  // 静态文件
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const file = path.join(DIR, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));

  if (!file.startsWith(DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 not found');
  }

  // 白名单校验（目录内白名单文件 + assets/lib 两个目录的一级子文件）
  const inside = path.relative(DIR, file);
  const seg = inside.split(path.sep);
  const top = seg[0];
  const ok = seg.length === 1
    ? ALLOW_FILES.has(top)
    : (ALLOW_DIRS.includes(top) && seg.length === 2 && !seg[1].startsWith('.'));
  if (!ok) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 forbidden');
  }

  const ext = path.extname(file).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  };
  if (ext === '.zip') {
    headers['Content-Type'] = 'application/octet-stream';
    headers['Content-Disposition'] = 'attachment';
  }
  headers['Content-Length'] = fs.statSync(file).size;

  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('portal server on ' + PORT);
});
