/* ==========================================================================
   VİTREN — Etkileşim & Dinamik Mantık (JavaScript)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Efekti
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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

    // Menü linklerine tıklandığında mobilde menüyü kapat
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
      });
    });
  }

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

  // 4. İnteraktif Proje Detay Modalı Data & Mantığı
  const projectsData = {
    'reserve': {
      title: 'VİTREN Reserve',
      location: 'Beykoz / İstanbul',
      type: 'Müstakil Villa',
      area: '650 m²',
      units: '24 Adet Villa',
      delivery: 'Aralık 2026',
      img: 'assets/images/project1.jpg',
      desc: 'VİTREN Reserve, ormanla kucaklaşan Beykoz sırtlarında doğallık ile yüksek mimari teknolojiyi bir araya getiriyor. Özel yüzme havuzları, geniş peyzaj alanları ve brüt beton - ahşap uyumuyla müstakil bir yaşam ayrıcalığı sunuyor.',
      specs: [
        'Akıllı ev otomasyonu',
        'Özel ısıtmalı sonsuzluk havuzu',
        'Yer altı kapalı otoparkı (4 araçlık)',
        'Özel güvenlik ve VIP konsiyerj hizmeti'
      ]
    },
    'tower': {
      title: 'VİTREN Tower',
      location: 'Levent / İstanbul',
      type: 'Rezidans & Penthouse',
      area: '180 - 450 m²',
      units: '120 Daire',
      delivery: 'Eylül 2027',
      img: 'assets/images/project2.jpg',
      desc: 'İstanbul finans merkezinin kalbinde yükselen VİTREN Tower, parametrik cephe mimarisi ve 360 derece kesintisiz boğaz manzarası ile simgeleşen bir rezidans projesidir.',
      specs: [
        'Heliped (Helikopter pisti)',
        'Sky lounge & Panoramik restoran',
        'Kapalı olimpik yüzme havuzu & SPA',
        'LEED Gold Yeşil Bina Sertifikası'
      ]
    },
    'horizon': {
      title: 'VİTREN Horizon',
      location: 'Yalıkavak / Bodrum',
      type: 'Kıyı Villaları',
      area: '520 m²',
      units: '16 Adet Villa',
      delivery: 'Haziran 2026',
      img: 'assets/images/project3.jpg',
      desc: 'Ege’nin turkuaz sularına nazır kayalıklar üzerinde konsol mimari teknikleriyle inşa edilen VİTREN Horizon, kesintisiz gün batımı manzarası ve özel marinaya doğrudan erişim sunuyor.',
      specs: [
        'Özel plaj ve marinaya erişim',
        'Biyo-iklimsel pergola ve teraslar',
        'Güneş enerjili kendi kendine yeten altyapı',
        'Buggy ile sahil transferi'
      ]
    }
  };

  const modal = document.getElementById('projectModal');
  const modalClose = document.querySelector('.modal-close');
  const modalBackdrop = document.querySelector('.modal-backdrop');

  const modalTitle = document.getElementById('modalTitle');
  const modalLocation = document.getElementById('modalLocation');
  const modalDesc = document.getElementById('modalDesc');
  const modalImg = document.getElementById('modalImg');
  const modalType = document.getElementById('modalType');
  const modalArea = document.getElementById('modalArea');
  const modalDelivery = document.getElementById('modalDelivery');
  const modalSpecsList = document.getElementById('modalSpecsList');

  // Kartlara tıklama olayı
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-id');
      const data = projectsData[projectId];

      if (data) {
        modalTitle.textContent = data.title;
        modalLocation.textContent = data.location;
        modalDesc.textContent = data.desc;
        modalImg.src = data.img;
        modalType.textContent = data.type;
        modalArea.textContent = data.area;
        modalDelivery.textContent = data.delivery;

        // Özellikler listesini doldur
        modalSpecsList.innerHTML = '';
        data.specs.forEach(spec => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.alignItems = 'center';
          li.style.gap = '10px';
          li.style.fontSize = '0.95rem';
          li.style.color = 'var(--text-secondary)';
          li.style.marginBottom = '8px';
          li.innerHTML = `<span style="color: var(--color-brand-red); font-weight: bold;">✓</span> ${spec}`;
          modalSpecsList.appendChild(li);
        });

        // Modalı aç
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Modal kapama
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // ESC tuşu ile modal kapama
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 5. İletişim Formu Gönderimi (Mock)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = 'Gönderiliyor...';
      btn.disabled = true;

      setTimeout(() => {
        alert('Talebiniz başarıyla alındı. VİTREN VIP Satış Temsilcimiz en kısa sürede sizinle iletişime geçecektir.');
        contactForm.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 1200);
    });
  }
});
