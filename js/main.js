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