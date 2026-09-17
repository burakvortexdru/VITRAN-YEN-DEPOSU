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

    // Randevuyu veritabanına / yerel hafızaya kaydet
    if (!isTestMail) {
      try {
        const { saveAppointment } = await import('./db.js');
        saveAppointment({ name, phone, email, project, type, date, time, note, sourceUrl, sourceProject });
      } catch (dbErr) {
        console.error('Failed to persist appointment:', dbErr);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Randevu talebiniz başarıyla alındı.' 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'E-posta gönderimi sırasında bir sunucu hatası oluştu.' });
  }
}
