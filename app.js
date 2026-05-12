// ===== DATA IMPORTED FROM filamentos.js =====

// ===== STATE =====
let activeFilter = 'all';
let activeSort = 'weight-asc';
let searchQuery = '';
let currentQRSpool = null;

// ===== FAVORITES =====
let favorites = new Set(JSON.parse(localStorage.getItem('3dbat-favs') || '[]'));

function saveFavorites() {
  localStorage.setItem('3dbat-favs', JSON.stringify([...favorites]));
}

function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  saveFavorites();
  renderSpoolGrid();
}

// ===== DOM REFS =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderSpoolGrid();
  renderCalcOptions();
  renderComparison();
  renderColabs();
  bindEvents();
  animateHeroStats();

  // Set current date
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  $('#last-update').textContent = `Actualizado: ${dateStr} · Herramienta creada con el fin de aportar valor al mundo maker 🧵`;

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('✅ SW registrado — app disponible offline'))
      .catch(e => console.warn('SW no disponible:', e));
  }
});

// ===== RENDER SPOOL GRID =====
function getFilteredSpools() {
  let list = [...SPOOLS];
  if (activeFilter === '1kg') list = list.filter(s => s.nominal === 1000);
  else if (activeFilter === '2kg') list = list.filter(s => s.nominal === 2000);
  else if (activeFilter === '4kg') list = list.filter(s => s.nominal === 4000);
  else if (activeFilter === 'plastico') list = list.filter(s => s.material === 'Plástico');
  else if (activeFilter === 'carton') list = list.filter(s => s.material === 'Cartón');
  else if (activeFilter === 'favoritos') list = list.filter(s => favorites.has(s.id));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(s =>
      s.brand.toLowerCase().includes(q) ||
      s.variant.toLowerCase().includes(q) ||
      s.material.toLowerCase().includes(q)
    );
  }
  if (activeSort === 'weight-asc') list.sort((a,b) => a.weight - b.weight);
  else if (activeSort === 'weight-desc') list.sort((a,b) => b.weight - a.weight);
  else if (activeSort === 'name') list.sort((a,b) => a.brand.localeCompare(b.brand));
  return list;
}

function renderSpoolGrid() {
  const grid = $('#spool-grid');
  const list = getFilteredSpools();

  if (list.length === 0) {
    const emptyMsg = activeFilter === 'favoritos'
      ? '¡Todavía no tenés favoritos! Hacé click en ❤️ en cualquier tarjeta.'
      : 'No se encontraron carretes con esa búsqueda';
    grid.innerHTML = `<div class="no-results"><div class="no-results-icon">🔍</div><p>${emptyMsg}</p></div>`;
    return;
  }

  grid.innerHTML = list.map((s, i) => {
    const isFav = favorites.has(s.id);
    const imgBlock = s.imageUrl
      ? `<div class="spool-img-wrap">
           <img class="spool-img" src="${s.imageUrl}" alt="${s.brand} ${s.variant}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=\\'spool-color-dot\\' style=\\'background:${s.accent}\\'></div>'">
         </div>`
      : `<div class="spool-img-wrap"><div class="spool-color-dot" style="background:${s.accent}"></div></div>`;

    return `
    <div class="spool-card" style="--card-accent:${s.accent}; animation-delay:${i * 50}ms">
      ${imgBlock}
      <div class="spool-brand">${s.brand}</div>
      <div class="spool-variant">${s.variant}</div>
      <div class="spool-weight">${s.weight !== null ? s.weight + ' g' : 'N/R'}</div>
      ${s.range ? `<div class="spool-range">Rango: ${s.range} g</div>` : '<div class="spool-range">&nbsp;</div>'}
      <div class="spool-tags">
        <span class="spool-tag tag-nominal">${s.nominal / 1000} kg</span>
        <span class="spool-tag ${s.material === 'Cartón' ? 'tag-carton' : 'tag-material'}">${s.material}</span>
      </div>
      <div class="spool-actions">
        <button class="spool-action-btn fav-btn ${isFav ? 'active' : ''}"
          onclick="toggleFavorite(${s.id})" title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <button class="spool-action-btn" onclick="copySpool(${s.id})" title="Copiar datos">📋</button>
        <button class="spool-action-btn" onclick="openQRModal(${s.id})" title="Generar etiqueta QR">🏷️</button>
      </div>
    </div>
  `}).join('');

  requestAnimationFrame(() => {
    grid.querySelectorAll('.spool-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 60);
    });
  });
}

// ===== CALCULATOR =====
function renderCalcOptions() {
  const brandSel = $('#calc-brand');
  const matSel = $('#calc-material');
  brandSel.innerHTML = SPOOLS.map(s =>
    `<option value="${s.id}" ${s.weight === null ? 'disabled' : ''}>${s.brand} · ${s.variant} ${s.weight !== null ? '(' + s.weight + ' g vacío)' : '(N/R)'}</option>`
  ).join('');
  matSel.innerHTML = FILAMENT_MATERIALS.map(m =>
    `<option value="${m.density}">${m.name}</option>`
  ).join('');
}

function calculateFilament() {
  const scaleWeight = parseFloat($('#calc-weight').value) || 0;
  const spoolId = parseInt($('#calc-brand').value);
  const density = parseFloat($('#calc-material').value);
  const spool = SPOOLS.find(s => s.id === spoolId);
  if (!spool || scaleWeight <= 0) {
    $('#calc-remaining').textContent = '— g';
    $('#calc-percent').textContent = '— %';
    $('#calc-meters').textContent = '— m';
    $('.calc-progress-bar').style.width = '0%';
    return;
  }
  const remaining = Math.max(0, scaleWeight - spool.weight);
  const percent = Math.min(100, (remaining / spool.nominal) * 100);
  const radiusCm = (1.75 / 2) / 10;
  const areaCm2 = Math.PI * radiusCm * radiusCm;
  const meters = (remaining / density) / areaCm2 / 100;
  $('#calc-remaining').textContent = `${Math.round(remaining)} g`;
  $('#calc-percent').textContent = `${Math.round(percent)}%`;
  $('#calc-meters').textContent = `${meters.toFixed(1)} m`;
  $('.calc-progress-bar').style.width = `${percent}%`;
}

// ===== COMPARISON RANKING =====
function renderComparison() {
  const container = $('#comp-grid');
  if (!container) return;
  const sorted = [...SPOOLS].sort((a,b) => a.weight - b.weight);
  const maxWeight = Math.max(...sorted.map(s => s.weight));

  container.innerHTML = sorted.map((s, index) => {
    const pct = (s.weight / maxWeight) * 100;
    const imgHtml = s.imageUrl
      ? `<img class="comp-card-img" src="${s.imageUrl}" alt="${s.brand}" loading="lazy"
           onerror="this.outerHTML='<div class=\\'comp-card-color-dot\\' style=\\'background:${s.accent}\\'></div>'">`
      : `<div class="comp-card-color-dot" style="background:${s.accent}"></div>`;
    return `
      <div class="comp-card">
        <div class="comp-card-header">
          <div class="comp-card-img-wrap">${imgHtml}</div>
          <div class="comp-card-info">
            <div class="comp-card-brand">${s.brand}</div>
            <div class="comp-card-variant">${s.variant !== 'Estándar' ? s.variant : ''}</div>
          </div>
          <div class="comp-card-weight">${s.weight}g</div>
        </div>
        <div class="comp-card-bar-bg">
          <div class="comp-card-bar" data-width="${pct}"></div>
        </div>
        <div class="comp-card-rank">#${index + 1} del ranking</div>
      </div>
    `;
  }).join('');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        container.querySelectorAll('.comp-card-bar').forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 40);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(container);
}

// ===== RENDER COLABS =====
function renderColabs() {
  const container = $('#hall-grid');
  if (!container) return;
  const inviteBtn = container.querySelector('.hall-invite').outerHTML;
  const html = COLABS.map(c => `
    <div class="hall-card">
      <div class="hall-avatar">${c.initials}</div>
      <div class="hall-info">
        <div class="hall-name">${c.name}</div>
        <div class="hall-desc">${c.desc}</div>
      </div>
    </div>
  `).join('');
  container.innerHTML = html + inviteBtn;
}

// ===== QR MODAL =====
function buildQRText(s) {
  return `3DBAT Impresiones\nMarca: ${s.brand}\nVariante: ${s.variant}\nPeso vacío: ${s.range ? s.range + ' g' : s.weight + ' g'}\nMaterial: ${s.material}\nCapacidad: ${s.nominal / 1000}kg\nhttps://3dbatimpresiones.github.io/dbcarretesvacios/`;
}

function openQRModal(id) {
  const s = SPOOLS.find(sp => sp.id === id);
  if (!s) return;
  currentQRSpool = s;
  const encoded = encodeURIComponent(buildQRText(s));
  $('#qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}&bgcolor=0B0B1A&color=00F0FF&margin=10`;
  $('#qr-brand-name').textContent = `${s.brand} · ${s.variant}`;
  $('#qr-label-preview').innerHTML = `
    <div class="qr-info-brand">${s.brand}</div>
    <div class="qr-info-variant">${s.variant}</div>
    <div class="qr-info-row">⚖️ Vacío: <strong>${s.range ? s.range + ' g' : s.weight + ' g'}</strong></div>
    <div class="qr-info-row">📦 ${s.nominal / 1000}kg · ${s.material}</div>
  `;
  $('#qr-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeQRModal() {
  $('#qr-modal').style.display = 'none';
  document.body.style.overflow = '';
  currentQRSpool = null;
}

function printQRLabel() {
  if (!currentQRSpool) return;
  const s = currentQRSpool;
  const encoded = encodeURIComponent(buildQRText(s));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=FFFFFF&color=000000&margin=10`;
  const pw = window.open('', '_blank', 'width=480,height=360');
  pw.document.write(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Etiqueta ${s.brand} | 3DBAT</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background:#fff; color:#000; }
  .label { display:flex; align-items:center; gap:14px; border:2px solid #000; border-radius:10px; padding:14px; width:340px; margin:30px auto; }
  .label img { width:110px; height:110px; flex-shrink:0; }
  .brand { font-size:1.4rem; font-weight:900; }
  .variant { font-size:0.88rem; color:#555; margin-bottom:8px; }
  .row { font-size:0.85rem; margin:3px 0; }
  .footer { font-size:0.7rem; color:#888; margin-top:8px; border-top:1px solid #ddd; padding-top:6px; }
</style></head>
<body>
  <div class="label">
    <img src="${qrUrl}" alt="QR">
    <div>
      <div class="brand">${s.brand}</div>
      <div class="variant">${s.variant}</div>
      <div class="row">⚖️ Vacío: <b>${s.range ? s.range + ' g' : s.weight + ' g'}</b></div>
      <div class="row">📦 ${s.nominal / 1000}kg · ${s.material}</div>
      <div class="footer">3DBAT Impresiones 🧵</div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 600);<\/script>
</body></html>`);
  pw.document.close();
}

// ===== EVENTS =====
function bindEvents() {
  $('#search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderSpoolGrid();
  });

  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderSpoolGrid();
    });
  });

  $$('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSort = btn.dataset.sort;
      renderSpoolGrid();
    });
  });

  $('#calc-weight').addEventListener('input', calculateFilament);
  $('#calc-brand').addEventListener('change', calculateFilament);
  $('#calc-material').addEventListener('change', calculateFilament);
  $('#btn-copy-all').addEventListener('click', copyAllData);
  $('#btn-share').addEventListener('click', shareWhatsApp);

  // QR Modal — click outside to close
  $('#qr-modal').addEventListener('click', (e) => {
    if (e.target === $('#qr-modal')) closeQRModal();
  });

  // Scroll progress
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    $('#scroll-progress').style.width = pct + '%';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('#qr-modal').style.display === 'flex') { closeQRModal(); return; }
      $('#search-input').value = '';
      searchQuery = '';
      $('#search-input').blur();
      renderSpoolGrid();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      $('#search-input').focus();
    }
  });
}

// ===== COPY / SHARE =====
function copySpool(id) {
  const s = SPOOLS.find(sp => sp.id === id);
  if (!s) return;
  const text = `${s.brand} (${s.variant}) – ${s.range ? s.range + ' g' : s.weight + ' g'} | Carrete vacío`;
  navigator.clipboard.writeText(text).then(() => showToast('📋 Copiado al portapapeles'));
}

function copyAllData() {
  let text = 'Peso de carretes vacíos según su marca:\n\n';
  SPOOLS.forEach(s => { text += `· ${s.brand} (${s.variant}) – ${s.range ? s.range + ' g' : s.weight + ' g'}\n`; });
  text += '\nDatos cortesía de @3dbat.impresiones\nCOMUNIDAD MAKERS 3DBAT';
  navigator.clipboard.writeText(text).then(() => showToast('📋 Tabla completa copiada'));
}

function shareWhatsApp() {
  const url = window.location.href;
  const text = encodeURIComponent(`⚖️ Peso de carretes vacíos para impresión 3D\n\nBase de datos gratuita de la Comunidad Makers 3DBAT 🧵\n\n${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

// ===== TOAST =====
function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== HERO STATS ANIMATION =====
function animateHeroStats() {
  const brandsCount = new Set(SPOOLS.map(s => s.brand)).size;
  const weights = SPOOLS.filter(s => s.weight !== null).map(s => s.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  
  // Actualizar Meta Tags dinámicamente
  const dynamicDesc = `Consultá el peso de bobinas vacías de ${brandsCount}+ marcas. Calculá cuánto filamento te queda. Gratis para la comunidad maker.`;
  const mDesc = $('meta[name="description"]');
  if (mDesc) mDesc.setAttribute('content', dynamicDesc);
  const mOg = $('meta[property="og:description"]');
  if (mOg) mOg.setAttribute('content', dynamicDesc);

  const stats = [
    { el: $$('.hero-stat-val')[0], target: brandsCount },
    { el: $$('.hero-stat-val')[1], target: minW },
    { el: $$('.hero-stat-val')[2], target: maxW }
  ];
  stats.forEach(s => {
    let current = 0;
    const step = Math.max(1, Math.floor(s.target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= s.target) { current = s.target; clearInterval(interval); }
      s.el.textContent = current;
    }, 30);
  });
}
