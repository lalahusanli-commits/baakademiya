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

      // Gizlədilmiş Markdown mənbəyi (.tpl-md-source) üçün innerText boş
      // qaytarır — bu halda textContent-ə keçirik ki, təmiz Markdown kopyalansın.
      const text = (promptEl.innerText || promptEl.textContent || '').trim();
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

  /* =======================================================
     Şablonlar səhifəsi — kateqoriya filtri
     Filtr düyməsinə basanda yalnız uyğun .tpl-card-lar görünür.
     Accordion açılması və "Kopyala" düyməsi yuxarıdakı mövcud
     .prompt-card / .copy-btn məntiqi ilə işləyir.
     ======================================================= */
  const tplFilters = Array.from(document.querySelectorAll('.tpl-filter'));

  if (tplFilters.length) {
    const tplCards = Array.from(document.querySelectorAll('.tpl-card'));
    const tplNoResult = document.querySelector('.tpl-noresult');

    tplFilters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.dataset.filter;  // "all" və ya kateqoriya açarı

        // Aktiv düyməni dəyiş
        tplFilters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Kartları süz (bir kart birdən çox kateqoriyaya aid ola bilər:
        // data-cat="analiz comm" — boşluqla ayrılmış açarlar)
        let visible = 0;
        tplCards.forEach(function (card) {
          const cats = (card.dataset.cat || '').split(/\s+/);
          const match = filter === 'all' || cats.indexOf(filter) !== -1;
          card.style.display = match ? '' : 'none';
          if (!match) card.classList.remove('open');  // gizlədiləni bağla
          if (match) visible++;
        });

        if (tplNoResult) {
          tplNoResult.style.display = visible === 0 ? 'block' : 'none';
        }
      });
    });
  }

  /* =======================================================
     Şablonlar — Markdown cədvəllərini səliqəli HTML cədvələ çevirir.
     Yalnız tərkibində cədvəl olan şablon kartlarına tətbiq olunur;
     digər kartlara toxunulmur. Markdown mətni gizli mənbə kimi
     saxlanılır ki, "Kopyala" düyməsi təmiz Markdown versiyasını
     kopyalaya bilsin (yuxarıdakı textContent ehtiyat üsulu ilə).
     ======================================================= */
  function isSeparatorLine(l) {
    var t = l.trim();
    return t.indexOf('|') !== -1 && /-{2,}/.test(t) && /^[\s|:\-]+$/.test(t);
  }

  function isTableRow(l) {
    return l.trim().charAt(0) === '|';
  }

  function splitRow(l) {
    return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) {
      return c.trim();
    });
  }

  function buildTable(rows) {
    var headCells = splitRow(rows[0]);
    var cols = headCells.length;

    var wrap = document.createElement('div');
    wrap.className = 'tpl-table-wrap';

    var table = document.createElement('table');
    table.className = 'tpl-table';

    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    headCells.forEach(function (c) {
      var th = document.createElement('th');
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var r = 1; r < rows.length; r++) {
      var tr = document.createElement('tr');
      var cells = splitRow(rows[r]);
      for (var c = 0; c < cols; c++) {
        var td = document.createElement('td');
        td.textContent = cells[c] || '';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    // Geniş (çoxsütunlu) cədvəllər üçün minimum en + sürüşdürmə məsləhəti
    if (cols >= 5) {
      table.style.minWidth = (cols * 130) + 'px';
      var holder = document.createElement('div');
      var hint = document.createElement('p');
      hint.className = 'tpl-scroll-hint';
      hint.textContent = '→ Cədvəli tam görmək üçün sağa sürüşdürün.';
      holder.appendChild(hint);
      wrap.appendChild(table);
      holder.appendChild(wrap);
      return holder;
    }

    wrap.appendChild(table);
    return wrap;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.tpl-card .prompt-text'), function (pre) {
    var md = pre.textContent.replace(/\r/g, '');
    var lines = md.split('\n');
    if (!lines.some(isSeparatorLine)) return;  // cədvəli olmayan şablona toxunma

    var rendered = document.createElement('div');
    rendered.className = 'tpl-rendered';
    var buf = [];

    function flushText() {
      while (buf.length && buf[0].trim() === '') buf.shift();
      while (buf.length && buf[buf.length - 1].trim() === '') buf.pop();
      if (buf.length) {
        var block = document.createElement('pre');
        block.className = 'tpl-text-block';
        block.textContent = buf.join('\n');
        rendered.appendChild(block);
      }
      buf = [];
    }

    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var next = lines[i + 1] || '';
      if (isTableRow(line) && isSeparatorLine(next)) {
        flushText();
        var rows = [line];   // başlıq sətri
        i += 2;              // başlıq + separator sətrini ötür
        while (i < lines.length && isTableRow(lines[i]) && !isSeparatorLine(lines[i])) {
          rows.push(lines[i]);
          i++;
        }
        rendered.appendChild(buildTable(rows));
      } else {
        buf.push(line);
        i++;
      }
    }
    flushText();

    pre.classList.add('tpl-md-source');            // gizli Markdown mənbəyi (yalnız kopyalama üçün)
    pre.parentNode.insertBefore(rendered, pre);
  });
});
