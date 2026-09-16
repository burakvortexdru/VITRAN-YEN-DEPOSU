import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Persistence Paths
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const USERS_FILE = path.join(DATA_DIR, 'admin_users.json');

// Ensure directory exists
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('Failed to create data dir:', e);
    }
  }
}

// Password Hashing Helper (PBKDF2)
export function hashPassword(password, salt = null) {
  salt = salt || 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
}

export function getAdminUser() {
  ensureDir();
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {}
  }
  return null;
}

export function saveAdminUser(email, password) {
  ensureDir();
  const { hash, salt } = hashPassword(password);
  const user = {
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(user, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save admin user:', e);
  }
  return user;
}

// Initial Default Projects
const DEFAULT_PROJECTS = [
  {
    id: 'reserve',
    name: 'VİTREN Reserve',
    slug: 'project-reserve',
    location: 'Beykoz, İstanbul',
    status: 'Satışta',
    size: '450 m² - 750 m²',
    roomType: '5+2 & 6+2 Villa',
    deliveryYear: '2026',
    heroImage: 'assets/images/projects/reserve/hero.jpg',
    gallery: [
      'assets/images/projects/reserve/01.jpg',
      'assets/images/projects/reserve/02.jpg',
      'assets/images/projects/reserve/03.jpg',
      'assets/images/projects/reserve/04.jpg'
    ],
    shortDesc: 'Doğayla bütünleşen, mahremiyet ve çağdaş mimariyi bir araya getiren özel yaşam alanları.',
    fullDesc: 'İstanbul’un en kıymetli doğa örtüsüne sahip Beykoz’da konumlanan VİTREN Reserve, orman manzarasına hakim geniş arazisi ve panoramik cam cepheleriyle doğayı yaşam alanınızın merkezine taşıyor.',
    features: [
      'Özel Yüzme Havuzu',
      'Akıllı Ev Otomasyonu',
      '7/24 VIP Özel Güvenlik',
      'Özel Peyzajlı Bahçe',
      'Müstakil Otopark'
    ],
    seoTitle: 'VİTREN Reserve — Beykoz Müstakil Villa Projesi',
    seoDescription: 'Beykoz’da doğayla bütünleşen lüks müstakil villalar. VİTREN Reserve ile ayrıcalıklı yaşamı keşfedin.',
    ogTitle: 'VİTREN Reserve — Beykoz',
    ogDescription: 'Doğayla bütünleşen, mahremiyet ve çağdaş mimariyi bir araya getiren özel yaşam alanları.',
    ogImage: 'assets/images/projects/reserve/hero.jpg'
  },
  {
    id: 'tower',
    name: 'VİTREN Tower',
    slug: 'project-tower',
    location: 'Levent, İstanbul',
    status: 'Ön Satış',
    size: '120 m² - 380 m²',
    roomType: '2+1, 3+1 & Rezidans',
    deliveryYear: '2027',
    heroImage: 'assets/images/projects/tower/hero.jpg',
    gallery: [
      'assets/images/projects/tower/01.jpg',
      'assets/images/projects/tower/02.jpg',
      'assets/images/projects/tower/03.jpg',
      'assets/images/projects/tower/04.jpg'
    ],
    shortDesc: 'Şehrin kalbinde yükselen, ikonik silüeti ve yüksek yaşam standartlarıyla lüksün yeni simgesi.',
    fullDesc: 'Levent’in iş ve finans merkezinde konumlanan VİTREN Tower, kesintisiz boğaz manzarası, 3.20 metre tavan yüksekliği ve yüksek teknolojiye sahip mimarisiyle modern şehir yaşamının zirvesini sunuyor.',
    features: [
      'Panoramik Boğaz Manzarası',
      'Concierge & Vale Hizmeti',
      'Sky Lounge & Restoran',
      'Kapalı Havuz & Spa Center',
      'Heliped & Toplantı Salonları'
    ],
    seoTitle: 'VİTREN Tower — Levent Lüks Rezidans Projesi',
    seoDescription: 'İstanbul Levent’in merkezinde yükselen ikonik kule. VİTREN Tower ile prestijli rezidans yaşamı.',
    ogTitle: 'VİTREN Tower — Levent',
    ogDescription: 'Şehrin kalbinde yükselen, ikonik silüeti ve yüksek yaşam standartlarıyla lüksün yeni simgesi.',
    ogImage: 'assets/images/projects/tower/hero.jpg'
  },
  {
    id: 'horizon',
    name: 'VİTREN Horizon',
    slug: 'project-horizon',
    location: 'Yalıkavak, Bodrum',
    status: 'Son Üniteler',
    size: '320 m² - 600 m²',
    roomType: '4+1 & 5+1 Malikane',
    deliveryYear: '2025',
    heroImage: 'assets/images/projects/horizon/hero.jpg',
    gallery: [
      'assets/images/projects/horizon/01.jpg',
      'assets/images/projects/horizon/02.jpg',
      'assets/images/projects/horizon/03.jpg',
      'assets/images/projects/horizon/04.jpg'
    ],
    shortDesc: 'Bodrum Yalıkavak’ta kesintisiz Ege manzarası ve marina yaşamıyla buluşan eşsiz malikaneler.',
    fullDesc: 'Yalıkavak Marina’ya komşu yamaçta yer alan VİTREN Horizon, Ege güneşinin her anını içeri alan cam mimarisi, özel iskelesi ve sonsuzluk havuzlarıyla eşsiz bir tatil deneyimini yıl boyu sürdürülebilir kılıyor.',
    features: [
      'Kesintisiz Deniz & Gün Batımı Manzarası',
      'Özel İskele & Plaj Erişimi',
      'Sonsuzluk Havuzu (Infinity Pool)',
      'Akıllı İklimlendirme',
      'Özel Tekne Yanaşma Alanı'
    ],
    seoTitle: 'VİTREN Horizon — Bodrum Yalıkavak Lüks Malikaneler',
    seoDescription: 'Bodrum Yalıkavak’ta denizle bütünleşen lüks villalar. VİTREN Horizon ile Ege’de ayrıcalıklı yaşam.',
    ogTitle: 'VİTREN Horizon — Yalıkavak / Bodrum',
    ogDescription: 'Bodrum Yalıkavak’ta kesintisiz Ege manzarası ve marina yaşamıyla buluşan eşsiz malikaneler.',
    ogImage: 'assets/images/projects/horizon/hero.jpg'
  }
];

const DEFAULT_SETTINGS = {
  whatsappNumber: '905383933557',
  heroTitle: 'Geleceğin Mimarisini Şekillendiriyoruz',
  heroSub: 'Zamansız estetik, seçkin lokasyonlar ve mühendislik harikası lüks konut projeleri.',
  siteEmail: 'burakduru1025@gmail.com'
};

// Data Helpers
export function getAppointments() {
  ensureDir();
  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

export function saveAppointment(appointmentData) {
  ensureDir();
  const appointments = getAppointments();
  const newAppointment = {
    id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
    status: 'Yeni',
    adminNotes: '',
    ...appointmentData
  };
  appointments.unshift(newAppointment); // top of list
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf8');
  } catch (e) {
    console.error('Save appointment file error:', e);
  }
  return newAppointment;
}

export function updateAppointment(id, updateData) {
  ensureDir();
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updateData };
    try {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf8');
      return appointments[index];
    } catch (e) {
      console.error('Update appointment file error:', e);
    }
  }
  return null;
}

export function getProjects() {
  ensureDir();
  if (!fs.existsSync(PROJECTS_FILE)) {
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(DEFAULT_PROJECTS, null, 2), 'utf8');
    } catch (e) {}
    return DEFAULT_PROJECTS;
  }
  try {
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
}

export function saveProject(projectData) {
  ensureDir();
  const projects = getProjects();
  let existingIndex = projects.findIndex(p => p.id === projectData.id);
  if (existingIndex !== -1) {
    projects[existingIndex] = { ...projects[existingIndex], ...projectData };
  } else {
    if (!projectData.id) {
      projectData.id = 'proj_' + Date.now();
    }
    projects.push(projectData);
  }
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf8');
  } catch (e) {
    console.error('Save project file error:', e);
  }
  return projectData;
}

export function getSettings() {
  ensureDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settingsData) {
  ensureDir();
  const current = getSettings();
  const updated = { ...current, ...settingsData };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {}
  return updated;
}

// Authentication Token Utilities
const TOKEN_SECRET = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'vitren_secret_token_key_2026';

export function verifyAdminToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, hash] = parts;
    const expectedHash = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('hex');
    if (hash !== expectedHash) return false;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function generateAdminToken(email) {
  const payload = {
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hash = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('hex');
  return `${payloadB64}.${hash}`;
}
