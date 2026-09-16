import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    });
  }
}

loadEnv();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (parsedUrl === '/admin' || parsedUrl === '/admin/') {
    const adminPath = path.join(__dirname, 'admin.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(adminPath).pipe(res);
    return;
  }

  if (parsedUrl === '/api/admin') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        if (body) req.body = JSON.parse(body);
      } catch (e) {}
      
      const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
      req.query = Object.fromEntries(queryParams.entries());

      const mockRes = {
        status: (code) => {
          res.statusCode = code;
          return mockRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        setHeader: (k, v) => res.setHeader(k, v),
        end: () => res.end()
      };

      try {
        const { default: adminHandler } = await import('./api/admin.js');
        await adminHandler(req, mockRes);
      } catch (err) {
        console.error('Admin API error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    });
    return;
  }

  if (parsedUrl === '/api/appointment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const apiKey = process.env.RESEND_API_KEY;
        const receiverEmail = process.env.APPOINTMENT_RECEIVER_EMAIL || 'burakduru1025@gmail.com';

        if (!apiKey || apiKey.includes('placeholder')) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'Resend API anahtarı henüz tanımlanmamış. Lütfen .env dosyasında RESEND_API_KEY değerini kontrol ediniz.' 
          }));
          return;
        }

        const isTestMail = data.isTestMail === true;
        const emailSubject = isTestMail ? 'VİTREN — Randevu Sistemi Test Maili' : `VİTREN — Yeni Randevu Talebi (${data.name || 'Genel'})`;

        const htmlContent = isTestMail 
          ? `<h2>VİTREN Randevu Sistemi</h2><p>Bu bir test e-postasıdır.</p><p>Randevu sistemi üzerinden başarılı şekilde gönderilmiştir.</p>`
          : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #d3121d;">VİTREN — Yeni Randevu Talebi</h2>
            <p><strong>Ad Soyad:</strong> ${escapeHtml(data.name)}</p>
            <p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>
            <p><strong>E-Posta:</strong> ${escapeHtml(data.email)}</p>
            <p><strong>İlgilenilen Proje:</strong> ${escapeHtml(data.project)}</p>
            <p><strong>Görüşme Türü:</strong> ${escapeHtml(data.type)}</p>
            <p><strong>Talep Edilen Tarih:</strong> ${escapeHtml(data.date)}</p>
            <p><strong>Talep Edilen Saat:</strong> ${escapeHtml(data.time)}</p>
            <p><strong>Not:</strong> ${escapeHtml(data.note || '-')}</p>
            <p><strong>Kaynak Sayfa:</strong> ${escapeHtml(data.sourceUrl || '-')}</p>
            <p><strong>Kaynak Proje:</strong> ${escapeHtml(data.sourceProject || '-')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">Bu e-posta VİTREN web sitesi randevu formu üzerinden oluşturulmuştur.</p>
          </div>`;

        const emailPayload = JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [receiverEmail],
          replyTo: data.email || undefined,
          subject: emailSubject,
          html: htmlContent
        });

        const reqOptions = {
          hostname: 'api.resend.com',
          path: '/emails',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(emailPayload)
          }
        };

        const resendReq = https.request(reqOptions, (resendRes) => {
          let resendBody = '';
          resendRes.on('data', chunk => { resendBody += chunk; });
          resendRes.on('end', () => {
            if (resendRes.statusCode >= 200 && resendRes.statusCode < 300) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Randevu talebiniz başarıyla alındı.', data: JSON.parse(resendBody) }));
            } else {
              res.writeHead(resendRes.statusCode, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: `Resend API Error (${resendRes.statusCode}): ${resendBody}` }));
            }
          });
        });

        resendReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Resend API bağlantı hatası: ' + err.message }));
        });

        resendReq.write(emailPayload);
        resendReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek gövdesi.' }));
      }
    });
    return;
  }

  let filePath = path.join(__dirname, parsedUrl === '/' ? 'index.html' : parsedUrl);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  });
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

server.listen(PORT, () => {
  console.log(`VİTREN Server running at http://localhost:${PORT}`);
});
