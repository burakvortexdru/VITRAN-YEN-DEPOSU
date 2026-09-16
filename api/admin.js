import { 
  verifyAdminToken, 
  generateAdminToken, 
  getAppointments, 
  updateAppointment, 
  getProjects, 
  saveProject, 
  getSettings, 
  saveSettings,
  getAdminUser,
  saveAdminUser,
  verifyPassword
} from './db.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, Accept, X-Requested-With'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  // Check setup status (Public)
  if (action === 'status' && req.method === 'GET') {
    const user = getAdminUser();
    const envPass = process.env.ADMIN_PASSWORD;
    const targetEmail = process.env.ADMIN_EMAIL || 'burakduru1025@gmail.com';
    const isSetupCompleted = Boolean(user || envPass);
    return res.status(200).json({ 
      success: true, 
      isSetupCompleted, 
      email: targetEmail 
    });
  }

  // Initial Account Setup (Public - Only allowed if no admin account/env password exists)
  if (action === 'setup' && req.method === 'POST') {
    const existingUser = getAdminUser();
    const envPass = process.env.ADMIN_PASSWORD;
    if (existingUser || envPass) {
      return res.status(400).json({ success: false, message: 'Admin hesabı zaten oluşturulmuş. Lütfen giriş yapın.' });
    }

    const { email, password } = req.body || {};
    const targetEmail = process.env.ADMIN_EMAIL || 'burakduru1025@gmail.com';

    if (!password || password.length < 1) {
      return res.status(400).json({ success: false, message: 'Lütfen bir şifre giriniz.' });
    }

    saveAdminUser(targetEmail, password);
    const token = generateAdminToken(targetEmail);
    return res.status(200).json({
      success: true,
      message: 'Admin hesabı ve şifreniz başarıyla oluşturuldu.',
      token,
      admin: { email: targetEmail }
    });
  }

  // Login action (Public)
  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body || {};
    const targetEmail = (process.env.ADMIN_EMAIL || 'burakduru1025@gmail.com').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir.' });
    }

    const inputEmail = email.trim().toLowerCase();
    if (inputEmail !== targetEmail) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }

    // 1. Check DB stored salted password
    const dbUser = getAdminUser();
    if (dbUser && dbUser.email === inputEmail) {
      if (verifyPassword(password, dbUser.passwordHash, dbUser.salt)) {
        const token = generateAdminToken(targetEmail);
        return res.status(200).json({ success: true, token, admin: { email: targetEmail } });
      }
    }

    // 2. Check Environment variable password
    const envPass = process.env.ADMIN_PASSWORD;
    if (envPass && password === envPass) {
      const token = generateAdminToken(targetEmail);
      return res.status(200).json({ success: true, token, admin: { email: targetEmail } });
    }

    return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
  }

  // Check auth session endpoint
  if (action === 'verify' && req.method === 'GET') {
    if (verifyAdminToken(req)) {
      return res.status(200).json({ success: true, authenticated: true });
    } else {
      return res.status(401).json({ success: false, authenticated: false });
    }
  }

  // All other actions require admin token
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ success: false, message: 'Yetkisiz erişim. Lütfen giriş yapınız.' });
  }

  // GET /api/admin?action=stats
  if (action === 'stats' && req.method === 'GET') {
    const appointments = getAppointments();
    const projects = getProjects();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Satışta' || p.status === 'Ön Satış' || p.status === 'Son Üniteler').length,
      pendingAppointments: appointments.filter(a => a.status === 'Yeni' || !a.status).length,
      thisMonthAppointments: appointments.filter(a => {
        const d = new Date(a.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length,
      newRequests: appointments.filter(a => a.status === 'Yeni').length
    };

    return res.status(200).json({ success: true, stats });
  }

  // GET or POST /api/admin?action=appointments
  if (action === 'appointments') {
    if (req.method === 'GET') {
      const appointments = getAppointments();
      return res.status(200).json({ success: true, appointments });
    }
    if (req.method === 'POST') {
      const { id, status, adminNotes } = req.body || {};
      if (!id) {
        return res.status(400).json({ success: false, message: 'Randevu ID belirtilmedi.' });
      }
      const updated = updateAppointment(id, { status, adminNotes });
      return res.status(200).json({ success: true, appointment: updated });
    }
  }

  // GET or POST /api/admin?action=projects
  if (action === 'projects') {
    if (req.method === 'GET') {
      const projects = getProjects();
      return res.status(200).json({ success: true, projects });
    }
    if (req.method === 'POST') {
      const projectData = req.body;
      if (!projectData || !projectData.name) {
        return res.status(400).json({ success: false, message: 'Proje adı gereklidir.' });
      }
      const saved = saveProject(projectData);
      return res.status(200).json({ success: true, project: saved });
    }
  }

  // GET or POST /api/admin?action=settings
  if (action === 'settings') {
    if (req.method === 'GET') {
      const settings = getSettings();
      return res.status(200).json({ success: true, settings });
    }
    if (req.method === 'POST') {
      const updated = saveSettings(req.body || {});
      return res.status(200).json({ success: true, settings: updated });
    }
  }

  return res.status(404).json({ success: false, message: 'Bilinmeyen admin eylemi.' });
}
