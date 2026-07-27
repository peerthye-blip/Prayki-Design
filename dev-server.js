/* =========================================================================
   PRAYKI · Lokaler Entwicklungs-Server
   -------------------------------------------------------------------------
   Bedient die statische Seite UND die Serverless-Funktion /api/send-email
   – genau wie später auf Vercel. Ohne externe Abhängigkeiten.

   Start:   node dev-server.js
   Optional Key setzen:  RESEND_API_KEY=... node dev-server.js
   (oder eine .env-Datei anlegen – wird automatisch geladen, ist gitignored)
   ========================================================================= */

'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

// .env laden (einfacher Parser), falls vorhanden
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Beliebige /api/<name> -> ./api/<name>.js (Vercel-kompatibel via Mini-Shim)
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice('/api/'.length).replace(/[^a-zA-Z0-9_-]/g, '');
    const modPath = path.join(ROOT, 'api', name + '.js');
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      req.body = Buffer.concat(chunks).toString('utf8');
      const shim = {
        statusCode: 200,
        setHeader: (k, v) => res.setHeader(k, v),
        status(code) { this.statusCode = code; return this; },
        json(obj) {
          res.statusCode = this.statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        },
        end(...a) { res.statusCode = this.statusCode; res.end(...a); },
      };
      let handler;
      try {
        handler = require(modPath);
      } catch (e) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'API-Route/Abhängigkeit nicht gefunden', detail: String(e.message) }));
      }
      try {
        await handler(req, shim);
      } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'dev-server', detail: String(e) }));
      }
    });
    return;
  }

  // Statische Dateien
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback auf index.html (SPA)
      return fs.readFile(path.join(ROOT, 'index.html'), (e2, d2) => {
        if (e2) { res.statusCode = 404; return res.end('Not found'); }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(d2);
      });
    }
    res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  PRAYKI läuft:  http://localhost:${PORT}`);
  console.log(`  API-Route:     /api/send-email`);
  console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'gesetzt ✓' : 'NICHT gesetzt (E-Mail-Versand aus)'}\n`);
});
