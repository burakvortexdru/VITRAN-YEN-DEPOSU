/* ==========================================================================
   VİTREN — Etkileşim & Dinamik Mantık (JavaScript)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Koyu Tema Değiştirme
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('vitren-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('vitren-theme', 'dark');
      }
    });
  }

  // 1. Header Scroll Efekti (arka plan + aşağı kaydırınca kaybolma)
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (currentScrollY > lastScrollY && currentScrollY > 150) {
      // Aşağı kaydırılıyor → header kaybolsun
      header.classList.add('header-hidden');
    } else {
      // Yukarı kaydırılıyor veya en üstteyken → header görünsün
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  });

  // 2. Mobil Menü Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }

  // Menü linklerine tıklandığında sayfaya git (proje kartlarıyla aynı mantık)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      if (navMenu) navMenu.classList.remove('active');
      if (mobileToggle) mobileToggle.classList.remove('active');

      window.location.href = link.getAttribute('href');
    });
  });

  // 3. Proje Filtreleme
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Aktif buton sınıfını güncelle
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || filterValue === category) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 4. Proje Kartına Tıklayınca İlgili Proje Sayfasına Git
  const projectPages = {
    'reserve': 'project-reserve.html',
    'tower': 'project-tower.html',
    'horizon': 'project-horizon.html'
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-id');
      const targetPage = projectPages[projectId];

      if (targetPage) {
        window.location.href = targetPage;
      }
    });
  });

  // 5. İletişim Formu Gönderimi (Real API Submission)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector('#fullName')?.value || '';
      const phone = contactForm.querySelector('#phone')?.value || '';
      const email = contactForm.querySelector('#email')?.value || '';
      const projectSelect = contactForm.querySelector('#projectSelect')?.value || 'Genel Bilgi';
      const message = contactForm.querySelector('#message')?.value || '';
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      btn.innerHTML = 'Gönderiliyor...';
      btn.disabled = true;

      try {
        const response = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email,
            project: projectSelect === 'reserve' ? 'VİTREN Reserve — Beykoz' :
                     projectSelect === 'tower' ? 'VİTREN Tower — Levent' :
                     projectSelect === 'horizon' ? 'VİTREN Horizon — Yalıkavak / Bodrum' : 'Genel VİTREN Bilgilendirme',
            type: 'Merkez Showroom / Online',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            note: message,
            sourceUrl: window.location.href,
            sourceProject: 'Ana Sayfa İletişim Formu'
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          alert('Randevu talebiniz başarıyla alındı. VİTREN VIP Müşteri Temsilcimiz en kısa sürede sizinle iletişime geçecektir.');
          contactForm.reset();
        } else {
          alert(data.message || 'Talebiniz gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden iletişime geçin.');
        }
      } catch (err) {
        alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden iletişime geçin.');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }

  // ==========================================================================
  // 6. MERKEZİ RANDEVU SİSTEMİ (CENTRAL APPOINTMENT SYSTEM)
  // ==========================================================================

  function ensureAppointmentModalDOM() {
    if (document.getElementById('appointmentModal')) return;

    const modalDiv = document.createElement('div');
    modalDiv.className = 'appointment-modal';
    modalDiv.id = 'appointmentModal';
    modalDiv.setAttribute('aria-hidden', 'true');
    modalDiv.innerHTML = `
      <div class="appointment-card">
        <div class="appointment-header">
          <div>
            <h3 style="margin: 0; font-size: 1.25rem;">Randevu Talebi Oluştur</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Size en uygun seçenekleri görüşmek için randevu talebinizi oluşturun.</p>
          </div>
          <span class="appointment-close" id="appointmentClose">&times;</span>
        </div>

        <form id="centralAppointmentForm" class="appointment-body" style="padding: 1.5rem 1.75rem;">
          <div class="form-row-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Ad Soyad *</label>
              <input type="text" class="form-input" id="appntName" required placeholder="Ahmet Yılmaz">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Telefon *</label>
              <input type="tel" class="form-input" id="appntPhone" required placeholder="0532 000 00 00">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">E-posta *</label>
            <input type="email" class="form-input" id="appntEmail" required placeholder="ahmet@example.com">
          </div>

          <div class="form-row-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">İlgilendiğiniz Proje *</label>
              <select class="form-input" id="appntProject" required>
                <option value="Genel VİTREN Bilgilendirme">Genel VİTREN Bilgilendirme</option>
                <option value="VİTREN Reserve — Beykoz">VİTREN Reserve — Beykoz</option>
                <option value="VİTREN Tower — Levent">VİTREN Tower — Levent</option>
                <option value="VİTREN Horizon — Yalıkavak / Bodrum">VİTREN Horizon — Yalıkavak / Bodrum</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Görüşme Türü *</label>
              <select class="form-input" id="appntType" required>
                <option value="Merkez Showroom">Merkez Showroom</option>
                <option value="Online Görüşme">Online Görüşme</option>
                <option value="Telefon Görüşmesi">Telefon Görüşmesi</option>
              </select>
            </div>
          </div>

          <div class="form-row-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Tarih *</label>
              <input type="date" class="form-input" id="appntDate" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Saat *</label>
              <select class="form-input" id="appntTime" required>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00" selected>10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1.2rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text-primary);">Notunuz</label>
            <textarea class="form-input" id="appntNote" rows="2" placeholder="Varsa eklemek istediğiniz özel istek veya sorularınız..."></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.2rem;">
            <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="appntKvkk" required style="margin-top: 2px;">
              <span>Randevu talebim kapsamında verdiğim iletişim bilgilerimin benimle iletişime geçilmesi amacıyla kullanılmasını kabul ediyorum. *</span>
            </label>
          </div>

          <div id="appntStatusMsg" style="display: none; margin-bottom: 1rem; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 500;"></div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 1.25rem;">
            <button type="button" class="btn btn-outline" id="appntCancelBtn" style="padding: 8px 18px; font-size: 0.85rem;">İptal</button>
            <button type="submit" class="btn btn-primary" id="appntSubmitBtn" style="padding: 8px 24px; font-size: 0.85rem;">Randevu Talebini Gönder</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  ensureAppointmentModalDOM();

  function detectCurrentPageProject() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('reserve')) return 'VİTREN Reserve — Beykoz';
    if (path.includes('tower')) return 'VİTREN Tower — Levent';
    if (path.includes('horizon')) return 'VİTREN Horizon — Yalıkavak / Bodrum';
    return 'Genel VİTREN Bilgilendirme';
  }

  window.openAppointmentModal = function(requestedProject) {
    ensureAppointmentModalDOM();
    bindCentralFormSubmit();
    const modal = document.getElementById('appointmentModal');
    const projectSelect = document.getElementById('appntProject');
    const dateInput = document.getElementById('appntDate');
    const statusMsg = document.getElementById('appntStatusMsg');
    const submitBtn = document.getElementById('appntSubmitBtn');

    if (!modal) return;

    const selectedProj = requestedProject || detectCurrentPageProject();
    if (projectSelect) {
      projectSelect.value = selectedProj;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = todayStr;
      if (!dateInput.value || dateInput.value < todayStr) {
        dateInput.value = todayStr;
      }
    }

    if (statusMsg) {
      statusMsg.style.display = 'none';
      statusMsg.className = '';
      statusMsg.innerHTML = '';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Randevu Talebini Gönder';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeAppointmentModal = function() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

  document.addEventListener('click', (e) => {
    if (e.target.id === 'appointmentClose' || e.target.id === 'appntCancelBtn') {
      window.closeAppointmentModal();
    } else if (e.target.classList.contains('appointment-modal')) {
      window.closeAppointmentModal();
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .btn, .quick-help-opt, [data-open-appointment]');
    if (!target) return;

    if (target.id === 'appntSubmitBtn' || target.closest('#centralAppointmentForm')) return;
    if (target.href && target.href.includes('wa.me')) return;

    const text = (target.textContent || '').trim().toLowerCase();
    const isRandevuTrigger = 
      target.classList.contains('btn-appointment-trigger') ||
      target.hasAttribute('data-open-appointment') ||
      text.includes('randevu') ||
      text.includes('appointment') ||
      text.includes('meeting') ||
      text.includes('showroom') ||
      text.includes('bilgi ve randevu');

    if (isRandevuTrigger) {
      e.preventDefault();
      
      let proj = target.getAttribute('data-project');
      if (!proj) {
        const parentCard = target.closest('[data-id]');
        if (parentCard) {
          const id = parentCard.getAttribute('data-id');
          if (id === 'reserve') proj = 'VİTREN Reserve — Beykoz';
          if (id === 'tower') proj = 'VİTREN Tower — Levent';
          if (id === 'horizon') proj = 'VİTREN Horizon — Yalıkavak / Bodrum';
        }
      }
      
      window.openAppointmentModal(proj);
    }
  });

  function bindCentralFormSubmit() {
    const centralForm = document.getElementById('centralAppointmentForm');
    if (!centralForm || centralForm.hasAttribute('data-bound')) return;

    centralForm.setAttribute('data-bound', 'true');
    centralForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('appntName')?.value.trim();
      const phone = document.getElementById('appntPhone')?.value.trim();
      const email = document.getElementById('appntEmail')?.value.trim();
      const project = document.getElementById('appntProject')?.value;
      const type = document.getElementById('appntType')?.value;
      const date = document.getElementById('appntDate')?.value;
      const time = document.getElementById('appntTime')?.value;
      const note = document.getElementById('appntNote')?.value.trim();
      const kvkk = document.getElementById('appntKvkk')?.checked;
      const statusMsg = document.getElementById('appntStatusMsg');
      const submitBtn = document.getElementById('appntSubmitBtn');

      function showStatus(message, isSuccess) {
        if (!statusMsg) return;
        statusMsg.style.display = 'block';
        statusMsg.className = isSuccess ? 'success' : 'error';
        statusMsg.innerHTML = message;
      }

      if (!name || !phone || !email || !project || !type || !date || !time) {
        showStatus('Lütfen tüm zorunlu (*) alanları doldurunuz.', false);
        return;
      }

      if (!kvkk) {
        showStatus('Lütfen KVKK onay kutusunu işaretleyiniz.', false);
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        showStatus('Geçmiş bir tarih seçemezsiniz. Lütfen bugünü veya gelecek bir tarihi seçiniz.', false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('Lütfen geçerli bir e-posta adresi giriniz.', false);
        return;
      }

      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        showStatus('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).', false);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Gönderiliyor...';
      showStatus('Randevu talebiniz iletiliyor...', true);

      let apiUrl = '/api/appointment';
      if (window.location.port === '5500' || window.location.protocol === 'file:') {
        apiUrl = 'http://localhost:3000/api/appointment';
      }

      try {
        let response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              phone,
              email,
              project,
              type,
              date,
              time,
              note,
              sourceUrl: window.location.href,
              sourceProject: detectCurrentPageProject()
            })
          });
        } catch (fetchErr) {
          if (apiUrl !== '/api/appointment') {
            response = await fetch('/api/appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, email, project, type, date, time, note, sourceUrl: window.location.href, sourceProject: detectCurrentPageProject() })
            });
          } else {
            throw fetchErr;
          }
        }

        const resData = await response.json();

        if (response.ok && resData.success) {
          showStatus('<strong>Randevu talebiniz başarıyla alındı.</strong><br><span style="font-size:0.85em;">VİTREN ekibimiz en kısa sürede sizinle iletişime geçecektir.</span>', true);
          centralForm.reset();
          submitBtn.innerHTML = 'Gönderildi ✓';
          setTimeout(() => {
            window.closeAppointmentModal();
          }, 3000);
        } else {
          showStatus(resData.message || 'Randevu talebiniz gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden bizimle iletişime geçin.', false);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Randevu Talebini Gönder';
        }
      } catch (err) {
        console.error('Appointment submit error:', err);
        showStatus('Randevu talebiniz gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden bizimle iletişime geçin.', false);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Randevu Talebini Gönder';
      }
    });
  }

  bindCentralFormSubmit();

  // ==========================================================================
  // 7. SIZE NASIL YARDIMCI OLABİLİRİZ? PANELİ
  // ==========================================================================
  const helpToggleBtn = document.getElementById('quickHelpToggle');
  const helpPanel = document.getElementById('quickHelpPanel');
  const helpCloseBtn = document.getElementById('quickHelpClose');

  if (helpToggleBtn && helpPanel) {
    helpToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helpPanel.classList.toggle('active');
    });

    if (helpCloseBtn) {
      helpCloseBtn.addEventListener('click', () => {
        helpPanel.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (!helpPanel.contains(e.target) && !helpToggleBtn.contains(e.target)) {
        helpPanel.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 8. GALERİ LIGHTBOX & THUMBNAIL DEĞİŞİMİ & KLAVYE / SWIPE DESTEĞİ
  // ==========================================================================
  const mainGalleryImg = document.getElementById('mainGalleryImg');
  const thumbs = document.querySelectorAll('.thumb-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxThumbsContainer = document.getElementById('lightboxThumbs');

  if (thumbs.length > 0) {
    const gallerySources = Array.from(thumbs).map(t => t.querySelector('img')?.getAttribute('src')).filter(Boolean);
    let currentIndex = 0;

    // Render Lightbox Thumbs if container exists
    if (lightboxThumbsContainer && lightboxThumbsContainer.children.length === 0) {
      gallerySources.forEach((src, idx) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `lightbox-thumb-item ${idx === 0 ? 'active' : ''}`;
        thumbDiv.innerHTML = `<img src="${src}" alt="Küçük Görsel ${idx + 1}" loading="lazy">`;
        thumbDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          updateMainGalleryImage(idx);
        });
        lightboxThumbsContainer.appendChild(thumbDiv);
      });
    }

    function updateMainGalleryImage(index) {
      if (index < 0 || index >= gallerySources.length) return;
      currentIndex = index;

      // Update page grid thumbs
      thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));

      // Update Lightbox thumbs strip
      if (lightboxThumbsContainer) {
        Array.from(lightboxThumbsContainer.children).forEach((t, i) => {
          t.classList.toggle('active', i === currentIndex);
        });
      }

      // Update images
      if (mainGalleryImg) {
        mainGalleryImg.setAttribute('src', gallerySources[currentIndex]);
      }
      if (lightboxImg) {
        lightboxImg.setAttribute('src', gallerySources[currentIndex]);
      }

      // Update counter
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentIndex + 1} / ${gallerySources.length}`;
      }
    }

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        updateMainGalleryImage(index);
      });
    });

    if (mainGalleryImg) {
      mainGalleryImg.addEventListener('click', () => {
        if (lightboxModal && lightboxImg) {
          updateMainGalleryImage(currentIndex);
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    function closeLightbox() {
      if (lightboxModal) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('lightbox-main-stage')) {
          closeLightbox();
        }
      });

      // Prev / Next Buttons
      const prevBtn = document.getElementById('lightboxPrev');
      const nextBtn = document.getElementById('lightboxNext');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIdx = (currentIndex - 1 + gallerySources.length) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIdx = (currentIndex + 1) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        });
      }

      // Keyboard Navigation (ESC, Left, Right)
      document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          const newIdx = (currentIndex - 1 + gallerySources.length) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        } else if (e.key === 'ArrowRight') {
          const newIdx = (currentIndex + 1) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        }
      });

      // Mobile Touch Swipe Navigation
      let touchStartX = 0;
      let touchEndX = 0;

      lightboxModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      lightboxModal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const threshold = 40;
        if (touchEndX < touchStartX - threshold) {
          const newIdx = (currentIndex + 1) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        } else if (touchEndX > touchStartX + threshold) {
          const newIdx = (currentIndex - 1 + gallerySources.length) % gallerySources.length;
          updateMainGalleryImage(newIdx);
        }
      }
    }
  }

  // ==========================================================================
  // 9. SCROLL REVEAL ANİMASYONLARI
  // ==========================================================================
  const observerOptions = {
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section-title, .project-card, .contact-box, .stat-item, .about-content').forEach(el => {
    el.classList.add('fade-up-init');
    observer.observe(el);
  });
});