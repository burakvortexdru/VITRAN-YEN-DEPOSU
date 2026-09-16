/* ==========================================================================
   VİTREN — PREMIUM EXTENSION MODULE (JS)
   1. Quiz Wizard
   2. Project Comparison System
   3. Favorites (LocalStorage)
   4. Rule-based VIP AI Assistant
   ========================================================================== */

const PROJECTS_DATA = [
  {
    id: 'reserve',
    name: 'VİTREN Reserve',
    location: 'Beykoz, İstanbul',
    city: 'İstanbul',
    type: 'Villa',
    area: '650 m²',
    areaValue: 650,
    rooms: '6+2 Villa',
    delivery: '2026',
    status: 'Satışta',
    image: 'assets/images/projects/reserve/reserve-hero.jpg',
    url: 'project-reserve.html',
    desc: 'Orman manzarasında müstakil havuzlu, brüt beton ve doğal ahşap detaylı ultra lüks villa kompleksi.',
    features: ['Akıllı Ev', 'Özel Sonsuzluk Havuzu', 'Orman Manzarası', 'Kapalı Garaj', '7/24 VIP Güvenlik']
  },
  {
    id: 'tower',
    name: 'VİTREN Tower',
    location: 'Levent, İstanbul',
    city: 'İstanbul',
    type: 'Rezidans',
    area: '180 - 450 m²',
    areaValue: 300,
    rooms: '2+1, 3+1 & Penthouse',
    delivery: '2027',
    status: 'Ön Satış',
    image: 'assets/images/projects/tower/tower-hero.jpg',
    url: 'project-tower.html',
    desc: 'Parametrik cephe mimarisi ve 360 derece boğaz panoramasına sahip simge rezidans kulesi.',
    features: ['Sky Lounge', 'Concierge & Vale', '360° Boğaz Manzarası', 'Spa & Fitness', 'Heliped']
  },
  {
    id: 'horizon',
    name: 'VİTREN Horizon',
    location: 'Yalıkavak, Bodrum',
    city: 'Bodrum',
    type: 'Kıyı Malikanesi',
    area: '520 m²',
    areaValue: 520,
    rooms: '5+1 Malikane',
    delivery: '2026',
    status: 'Son 3 Ünite',
    image: 'assets/images/projects/horizon/horizon-hero.jpg',
    url: 'project-horizon.html',
    desc: 'Ege denizine sıfır kayalıklarda konsol mimari teknikleriyle tasarlanmış sonsuzluk havuzlu kıyı malikaneleri.',
    features: ['Denize Sıfır', 'Özel İskele & Plaj', 'Sonsuzluk Havuzu', 'Akıllı İklimlendirme', 'Gün Batımı Manzarası']
  }
];

// STATE MANAGEMENT
let comparedProjectIds = JSON.parse(localStorage.getItem('vitren_compared') || '[]');
let favoriteProjectIds = JSON.parse(localStorage.getItem('vitren_favorites') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  initFavoritesUI();
  initComparisonUI();
  initWizardUI();
  initAIAssistantUI();
});

/* =========================================================
   1. FAVORITES SYSTEM (LOCAL STORAGE)
   ========================================================= */
function initFavoritesUI() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const id = card.getAttribute('data-id');
    if (!id) return;

    // Ensure heart button exists
    if (!card.querySelector('.favorite-btn')) {
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = `favorite-btn ${favoriteProjectIds.includes(id) ? 'active' : ''}`;
      favBtn.setAttribute('aria-label', 'Favorilere ekle');
      favBtn.innerHTML = favoriteProjectIds.includes(id) ? '♥' : '♡';
      
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(id, favBtn);
      });

      const imgWrapper = card.querySelector('.project-img-wrapper') || card;
      imgWrapper.style.position = 'relative';
      imgWrapper.appendChild(favBtn);
    }
  });
}

function toggleFavorite(id, btnElement) {
  if (favoriteProjectIds.includes(id)) {
    favoriteProjectIds = favoriteProjectIds.filter(item => item !== id);
    if (btnElement) {
      btnElement.classList.remove('active');
      btnElement.innerHTML = '♡';
    }
  } else {
    favoriteProjectIds.push(id);
    if (btnElement) {
      btnElement.classList.add('active');
      btnElement.innerHTML = '♥';
    }
  }
  localStorage.setItem('vitren_favorites', JSON.stringify(favoriteProjectIds));
  renderFavoritesModalView();
}

/* =========================================================
   2. COMPARISON SYSTEM
   ========================================================= */
function initComparisonUI() {
  // Append comparison bar to body if not existing
  if (!document.getElementById('comparisonBar')) {
    const bar = document.createElement('div');
    bar.id = 'comparisonBar';
    bar.className = 'comparison-floating-bar';
    bar.innerHTML = `
      <span id="compareCountTxt" style="font-size: 0.85rem; font-weight: 600;">0 Proje Seçildi</span>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" style="padding: 8px 16px; font-size: 0.75rem;" onclick="openCompareModal()">Karşılaştır →</button>
        <button class="btn btn-outline" style="padding: 8px 12px; font-size: 0.75rem; color: #fff; border-color: rgba(255,255,255,0.3);" onclick="clearComparison()">Temizle</button>
      </div>
    `;
    document.body.appendChild(bar);
  }

  // Add compare checkboxes or buttons on project cards
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const id = card.getAttribute('data-id');
    if (!id || card.querySelector('.compare-toggle-btn')) return;

    const actionDiv = document.createElement('div');
    actionDiv.className = 'compare-toggle-wrapper';
    actionDiv.style.marginTop = '10px';
    actionDiv.innerHTML = `
      <label style="font-size: 0.78rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary);" onclick="event.stopPropagation();">
        <input type="checkbox" class="compare-checkbox" data-id="${id}" ${comparedProjectIds.includes(id) ? 'checked' : ''} onchange="toggleCompare('${id}', this.checked)">
        Karşılaştır
      </label>
    `;
    const info = card.querySelector('.project-info') || card;
    info.appendChild(actionDiv);
  });

  updateComparisonBar();
}

function toggleCompare(id, isChecked) {
  if (isChecked) {
    if (comparedProjectIds.length >= 3) {
      alert('En fazla 3 projeyi aynı anda karşılaştırabilirsiniz.');
      updateComparisonCheckboxes();
      return;
    }
    if (!comparedProjectIds.includes(id)) comparedProjectIds.push(id);
  } else {
    comparedProjectIds = comparedProjectIds.filter(item => item !== id);
  }
  localStorage.setItem('vitren_compared', JSON.stringify(comparedProjectIds));
  updateComparisonBar();
  updateComparisonCheckboxes();
}

function updateComparisonCheckboxes() {
  document.querySelectorAll('.compare-checkbox').forEach(cb => {
    const id = cb.getAttribute('data-id');
    cb.checked = comparedProjectIds.includes(id);
  });
}

function clearComparison() {
  comparedProjectIds = [];
  localStorage.setItem('vitren_compared', JSON.stringify(comparedProjectIds));
  updateComparisonBar();
  updateComparisonCheckboxes();
}

function updateComparisonBar() {
  const bar = document.getElementById('comparisonBar');
  const countTxt = document.getElementById('compareCountTxt');
  if (!bar) return;

  if (comparedProjectIds.length > 0) {
    bar.classList.add('active');
    if (countTxt) countTxt.innerText = `${comparedProjectIds.length} Proje Seçildi`;
  } else {
    bar.classList.remove('active');
  }
}

function openCompareModal() {
  if (comparedProjectIds.length === 0) return;
  const selected = PROJECTS_DATA.filter(p => comparedProjectIds.includes(p.id));

  let modal = document.getElementById('compareModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compareModal';
    modal.className = 'appointment-modal';
    modal.setAttribute('aria-hidden', 'true');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="appointment-card" style="max-width: 900px;">
      <div class="appointment-header">
        <h3>Proje Karşılaştırma</h3>
        <span class="appointment-close" onclick="closeModal('compareModal')">&times;</span>
      </div>
      <div style="padding: 1.5rem; overflow-x: auto;">
        <table class="compare-modal-table">
          <thead>
            <tr>
              <th>Özellik</th>
              ${selected.map(p => `<th style="text-align:center;"><img src="${p.image}" style="width:100%; height:120px; object-fit:cover; border-radius:4px; margin-bottom:8px;"><br>${p.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Lokasyon</th>
              ${selected.map(p => `<td style="text-align:center;">${p.location}</td>`).join('')}
            </tr>
            <tr>
              <th>Proje Tipi</th>
              ${selected.map(p => `<td style="text-align:center;">${p.type}</td>`).join('')}
            </tr>
            <tr>
              <th>Metrekare</th>
              ${selected.map(p => `<td style="text-align:center;">${p.area}</td>`).join('')}
            </tr>
            <tr>
              <th>Oda Tipi</th>
              ${selected.map(p => `<td style="text-align:center;">${p.rooms}</td>`).join('')}
            </tr>
            <tr>
              <th>Teslim Yılı</th>
              ${selected.map(p => `<td style="text-align:center;">${p.delivery}</td>`).join('')}
            </tr>
            <tr>
              <th>Özellikler</th>
              ${selected.map(p => `<td style="font-size:0.8rem; text-align:center;">${p.features.join(', ')}</td>`).join('')}
            </tr>
            <tr>
              <th>İşlem</th>
              ${selected.map(p => `
                <td style="text-align:center;">
                  <button class="btn btn-primary" style="padding: 6px 12px; font-size:0.75rem; width:100%; margin-bottom:6px;" onclick="window.location.href='${p.url}'">İncele</button>
                  <button class="btn btn-outline btn-appointment-trigger" data-project="${p.name}" style="padding: 6px 12px; font-size:0.75rem; width:100%;">Randevu Al</button>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

/* =========================================================
   3. QUIZ DISCOVERY WIZARD
   ========================================================= */
let wizardAnswers = { city: '', type: '', feature: '', area: '' };
let currentWizardStep = 1;

function initWizardUI() {
  const wizardContainer = document.getElementById('wizardStepContent');
  if (!wizardContainer) return;
  renderWizardStep(1);
}

function renderWizardStep(step) {
  currentWizardStep = step;
  const container = document.getElementById('wizardStepContent');
  const fill = document.getElementById('wizardProgressFill');
  if (!container) return;

  if (fill) fill.style.width = `${(step / 4) * 100}%`;

  if (step === 1) {
    container.innerHTML = `
      <div class="wizard-question-title">1. Nerede yaşamak istiyorsunuz?</div>
      <div class="wizard-options-grid">
        <div class="wizard-option-btn ${wizardAnswers.city === 'İstanbul' ? 'selected' : ''}" onclick="selectWizardAnswer('city', 'İstanbul', 2)">İstanbul</div>
        <div class="wizard-option-btn ${wizardAnswers.city === 'Bodrum' ? 'selected' : ''}" onclick="selectWizardAnswer('city', 'Bodrum', 2)">Bodrum</div>
        <div class="wizard-option-btn ${wizardAnswers.city === 'Farketmez' ? 'selected' : ''}" onclick="selectWizardAnswer('city', 'Farketmez', 2)">Tüm Lokasyonlar</div>
      </div>
    `;
  } else if (step === 2) {
    container.innerHTML = `
      <div class="wizard-question-title">2. Nasıl bir yaşam arıyorsunuz?</div>
      <div class="wizard-options-grid">
        <div class="wizard-option-btn ${wizardAnswers.type === 'Villa' ? 'selected' : ''}" onclick="selectWizardAnswer('type', 'Villa', 3)">Villa</div>
        <div class="wizard-option-btn ${wizardAnswers.type === 'Rezidans' ? 'selected' : ''}" onclick="selectWizardAnswer('type', 'Rezidans', 3)">Rezidans</div>
        <div class="wizard-option-btn ${wizardAnswers.type === 'Kıyı Malikanesi' ? 'selected' : ''}" onclick="selectWizardAnswer('type', 'Kıyı Malikanesi', 3)">Deniz Kenarı Yaşam</div>
        <div class="wizard-option-btn ${wizardAnswers.type === 'Farketmez' ? 'selected' : ''}" onclick="selectWizardAnswer('type', 'Farketmez', 3)">Fark Etmez</div>
      </div>
      <div class="wizard-nav-actions">
        <button class="btn btn-outline" onclick="renderWizardStep(1)">← Geri</button>
      </div>
    `;
  } else if (step === 3) {
    container.innerHTML = `
      <div class="wizard-question-title">3. Hangi özellik sizin için öncelikli?</div>
      <div class="wizard-options-grid">
        <div class="wizard-option-btn ${wizardAnswers.feature === 'Orman' ? 'selected' : ''}" onclick="selectWizardAnswer('feature', 'Orman', 4)">Doğayla İç İçe</div>
        <div class="wizard-option-btn ${wizardAnswers.feature === 'Manzara' ? 'selected' : ''}" onclick="selectWizardAnswer('feature', 'Manzara', 4)">Deniz & Boğaz Manzarası</div>
        <div class="wizard-option-btn ${wizardAnswers.feature === 'Merkez' ? 'selected' : ''}" onclick="selectWizardAnswer('feature', 'Merkez', 4)">Şehir Merkezine Yakınlık</div>
      </div>
      <div class="wizard-nav-actions">
        <button class="btn btn-outline" onclick="renderWizardStep(2)">← Geri</button>
      </div>
    `;
  } else if (step === 4) {
    renderWizardResults();
  }
}

function selectWizardAnswer(key, val, nextStep) {
  wizardAnswers[key] = val;
  renderWizardStep(nextStep);
}

function renderWizardResults() {
  const container = document.getElementById('wizardStepContent');
  if (!container) return;

  // Simple matching logic with real data
  let matches = PROJECTS_DATA.filter(p => {
    let matchCity = !wizardAnswers.city || wizardAnswers.city === 'Farketmez' || p.city === wizardAnswers.city;
    let matchType = !wizardAnswers.type || wizardAnswers.type === 'Farketmez' || p.type.includes(wizardAnswers.type);
    return matchCity && matchType;
  });

  if (matches.length === 0) matches = PROJECTS_DATA;

  container.innerHTML = `
    <div class="wizard-question-title" style="text-align:center;">Size En Uygun VİTREN Projeleri</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      ${matches.map(p => `
        <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:4px; overflow:hidden;">
          <img src="${p.image}" style="width:100%; height:140px; object-fit:cover;">
          <div style="padding: 1rem;">
            <h4 style="margin:0 0 4px 0; font-size:1.1rem; color:var(--text-primary);">${p.name}</h4>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">${p.location} • ${p.rooms}</div>
            <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">${p.desc}</p>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary" style="padding:6px 12px; font-size:0.75rem; flex:1;" onclick="window.location.href='${p.url}'">Projeyi İncele</button>
              <button class="btn btn-outline btn-appointment-trigger" data-project="${p.name}" style="padding:6px 12px; font-size:0.75rem;">Randevu Al</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;">
      <button class="btn btn-outline" onclick="renderWizardStep(1)">Tercihleri Yeniden Belirle ↺</button>
    </div>
  `;
}

/* =========================================================
   4. RULE-BASED VIP VİTREN AI ASSISTANT
   ========================================================= */
function initAIAssistantUI() {
  if (document.getElementById('aiAssistantTrigger')) return;

  const trigger = document.createElement('div');
  trigger.id = 'aiAssistantTrigger';
  trigger.className = 'ai-assistant-trigger';
  trigger.innerHTML = `
    <span class="ai-assistant-badge-dot"></span>
    <span>VİTREN Asistan</span>
  `;
  document.body.appendChild(trigger);

  const panel = document.createElement('div');
  panel.id = 'aiAssistantPanel';
  panel.className = 'ai-assistant-panel';
  panel.innerHTML = `
    <div class="ai-header">
      <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">VİTREN VIP Asistan</div>
      <span style="cursor:pointer; font-size:1.2rem;" onclick="toggleAIAssistant()">&times;</span>
    </div>
    <div class="ai-body" id="aiBody">
      <div class="ai-msg ai-msg-bot">
        Merhaba, VİTREN gayrimenkul portföyü ve özel yaşam alanları hakkında size nasıl yardımcı olabilirim?
      </div>
      <div class="ai-quick-options">
        <span class="ai-quick-chip" onclick="askAIAssistant('istanbul')">İstanbul Projeleri</span>
        <span class="ai-quick-chip" onclick="askAIAssistant('bodrum')">Bodrum Projeleri</span>
        <span class="ai-quick-chip" onclick="askAIAssistant('villa')">Villa Seçenekleri</span>
        <span class="ai-quick-chip" onclick="askAIAssistant('randevu')">Randevu Al</span>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  trigger.addEventListener('click', toggleAIAssistant);
}

function toggleAIAssistant() {
  const panel = document.getElementById('aiAssistantPanel');
  if (panel) {
    panel.classList.toggle('active');
  }
}

function askAIAssistant(queryKey) {
  const body = document.getElementById('aiBody');
  if (!body) return;

  let userText = '';
  let replyHtml = '';

  if (queryKey === 'istanbul') {
    userText = 'İstanbul’daki projeleriniz nelerdir?';
    replyHtml = `
      İstanbul’da 2 özel projemiz bulunmaktadır:<br>
      • <strong>VİTREN Reserve (Beykoz):</strong> 6+2 Müstakil Havuzlu Orman Villaları.<br>
      • <strong>VİTREN Tower (Levent):</strong> Boğaz Panoramalı Lüks Rezidans Kulesi.
    `;
  } else if (queryKey === 'bodrum') {
    userText = 'Bodrum’daki projeleriniz nelerdir?';
    replyHtml = `
      Bodrum Yalıkavak’ta yer alan <strong>VİTREN Horizon</strong> projemiz, denize sıfır özel iskeleli sonsuzluk havuzlu kıyı malikanelerinden oluşmaktadır.
    `;
  } else if (queryKey === 'villa') {
    userText = 'Villa projelerini incelemek istiyorum.';
    replyHtml = `
      Villa ve müstakil yaşam seçeneklerimiz:<br>
      • <strong>VİTREN Reserve (Beykoz):</strong> 650 m² Müstakil Villa.<br>
      • <strong>VİTREN Horizon (Bodrum):</strong> 520 m² Kıyı Malikanesi.
    `;
  } else if (queryKey === 'randevu') {
    userText = 'Randevu oluşturmak istiyorum.';
    replyHtml = `
      VIP Showroom randevunuzu hemen oluşturmak için aşağıdaki butona tıklayabilirsiniz.
      <br><br>
      <button class="btn btn-primary btn-appointment-trigger" data-project="Genel VİTREN Bilgilendirme" style="padding:6px 14px; font-size:0.75rem; width:100%;">Randevu Formunu Aç</button>
    `;
  }

  // User msg
  const uMsg = document.createElement('div');
  uMsg.className = 'ai-msg ai-msg-user';
  uMsg.innerText = userText;
  body.appendChild(uMsg);

  // Bot msg
  setTimeout(() => {
    const bMsg = document.createElement('div');
    bMsg.className = 'ai-msg ai-msg-bot';
    bMsg.innerHTML = replyHtml;
    body.appendChild(bMsg);
    body.scrollTop = body.scrollHeight;
  }, 300);
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}
