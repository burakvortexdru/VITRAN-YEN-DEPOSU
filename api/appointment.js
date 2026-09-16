import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Yalnızca POST istekleri kabul edilir.' });
  }

  try {
    const { name, phone, email, project, type, date, time, note, sourceUrl, sourceProject } = req.body || {};

    const isTestMail = req.body?.isTestMail === true;

    // Zorunlu alan doğrulamaları (Test maili değilse)
    if (!isTestMail) {
      if (!name || !phone || !email || !project || !type || !date || !time) {
        return res.status(400).json({ success: false, message: 'Lütfen tüm zorunlu alanları eksiksiz doldurun.' });
      }

      // E-posta format doğrulaması
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Geçerli bir e-posta adresi giriniz.' });
      }

      // Telefon doğrulaması (en az 10 hane)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return res.status(400).json({ success: false, message: 'Geçerli bir telefon numarası giriniz.' });
      }
    }

    // Save appointment into database/storage
    if (!isTestMail) {
      try {
        const { saveAppointment } = await import('./db.js');
        saveAppointment({ name, phone, email, project, type, date, time, note, sourceUrl, sourceProject });
      } catch (dbErr) {
        console.error('Failed to persist appointment:', dbErr);
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const receiverEmail = process.env.APPOINTMENT_RECEIVER_EMAIL || 'burakduru1025@gmail.com';

    if (!apiKey || apiKey.includes('placeholder')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Resend API anahtarı henüz tanımlanmamış. Lütfen .env dosyasında veya Vercel/Sunucu ortamında RESEND_API_KEY değerini giriniz.' 
      });
    }

    const emailSubject = isTestMail ? 'VİTREN — Randevu Sistemi Test Maili' : `VİTREN — Yeni Randevu Talebi (${name})`;
    
    const htmlContent = isTestMail 
      ? `<h2>VİTREN Randevu Sistemi</h2><p>Bu bir test e-postasıdır.</p><p>Randevu sistemi üzerinden başarılı şekilde gönderilmiştir.</p>`
      : `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="border-bottom: 2px solid #d3121d; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #0d0e12; margin: 0; font-size: 20px;">VİTREN — Yeni Randevu Talebi</h2>
          <p style="color: #737983; font-size: 13px; margin: 4px 0 0 0;">Web sitesi randevu formu üzerinden yeni bir talep alındı.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4b5563;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 35%; color: #0d0e12;">Ad Soyad:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Telefon:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(phone)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">E-Posta:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${escapeHtml(email)}" style="color: #d3121d; text-decoration: none;">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">İlgilenilen Proje:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #d3121d; font-weight: bold;">${escapeHtml(project)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Görüşme Türü:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(type)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Talep Edilen Tarih:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(date)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Talep Edilen Saat:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(time)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Not:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(note || '-')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #0d0e12;">Kaynak Sayfa:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${escapeHtml(sourceUrl || '-')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #0d0e12;">Kaynak Proje:</td>
            <td style="padding: 10px 0;">${escapeHtml(sourceProject || '-')}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          Bu e-posta VİTREN web sitesi randevu formu üzerinden otomatik olarak oluşturulmuştur.
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [receiverEmail],
      replyTo: email || undefined,
      subject: emailSubject,
      html: htmlContent
    });

    return res.status(200).json({ success: true, message: 'Randevu talebiniz başarıyla iletildi.', data });
  } catch (error) {
    console.error('Resend API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'E-posta gönderimi sırasında bir sunucu hatası oluştu.' });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
