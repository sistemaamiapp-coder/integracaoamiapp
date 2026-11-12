const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 8123;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};
const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(root, urlPath));
    if (filePath !== root && !filePath.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.stat(filePath, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) { res.writeHead(400); res.end('Bad request'); }
});
server.listen(PORT, '127.0.0.1', () => console.log('AMI Integração rodando em http://localhost:' + PORT + '/'));