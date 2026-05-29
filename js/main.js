/* =========================================================
   BA Akademiya — Sadə JavaScript
   Funksiya: Mobil cihazlarda menyunu açıb-bağlamaq.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');  // Hamburger düyməsi
  const links = document.querySelector('.nav-links');    // Menyu siyahısı

  // Düyməyə basanda menyunu aç/bağla
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    // Menyudakı linkə basanda menyunu bağla (mobil üçün)
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  /* =======================================================
     Prompt kopyalama düymələri (Prompt Engineering səhifəsi)
     Hər ".copy-btn" basıldıqda öz kartındakı promptu kopyalayır.
     ======================================================= */
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Başlığa basmaqla accordion açılmasın — yalnız kopyala işləsin
      e.stopPropagation();

      // Eyni kartın içindəki prompt mətnini tap
      const card = btn.closest('.prompt-card');
      const promptEl = card ? card.querySelector('.prompt-text') : null;
      if (!promptEl) return;

      const text = promptEl.innerText.trim();
      const original = btn.innerHTML;

      // Uğurlu kopyalamanı istifadəçiyə göstər
      function showCopied() {
        btn.innerHTML = '✓ Kopyalandı';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerHTML = original;
          btn.classList.remove('copied');
        }, 1800);
      }

      // Müasir Clipboard API (köhnə brauzerlər üçün ehtiyat üsulu ilə)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); showCopied(); } catch (e) { /* keç */ }
        document.body.removeChild(temp);
      }
    });
  });

  /* =======================================================
     Prompt accordion — başlığa basanda kartı aç/bağla
     (hər kart müstəqildir; default hamısı bağlıdır)
     ======================================================= */
  document.querySelectorAll('.prompt-head').forEach(function (head) {
    head.addEventListener('click', function () {
      const card = head.closest('.prompt-card');
      if (card) card.classList.toggle('open');
    });
  });

  /* =======================================================
     Terminlər lüğəti — canlı axtarış (filtr)
     İstifadəçi yazanda kartlar real vaxtda süzülür.
     Həm ingiliscə, həm azərbaycanca mətndə axtarır.
     ======================================================= */
  const search = document.querySelector('.term-search');

  if (search) {
    const cards = Array.from(document.querySelectorAll('.term-card'));
    const categories = Array.from(document.querySelectorAll('.term-category'));
    const noResult = document.querySelector('.term-noresult');

    // Hər kartın axtarılacaq mətnini əvvəlcədən hazırla (kiçik hərflərlə)
    cards.forEach(function (card) {
      card.dataset.search = card.innerText.toLowerCase();
    });

    search.addEventListener('input', function () {
      const q = search.value.trim().toLowerCase();
      let visibleTotal = 0;

      // Kartları göstər/gizlət
      cards.forEach(function (card) {
        const match = card.dataset.search.indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) visibleTotal++;
      });

      // Boş qalan kateqoriya bölmələrini gizlət
      categories.forEach(function (cat) {
        const anyVisible = cat.querySelector('.term-card:not([style*="display: none"])');
        cat.style.display = anyVisible ? '' : 'none';
      });

      // "Nəticə tapılmadı" mesajı
      if (noResult) {
        noResult.style.display = visibleTotal === 0 ? 'block' : 'none';
      }
    });
  }
});
