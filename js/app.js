/**
 * Photo Board — app.js
 *
 * Features:
 *  ✅ Cork board with animated photo cards
 *  ✅ Slide transition to filmstrip album view
 *  ✅ Add / delete albums dynamically
 *  ✅ Upload photos with image compression
 *  ✅ Delete individual photos
 *  ✅ Drag & drop reorder photos inside album
 *  ✅ Search albums (board) and photos (album)
 *  ✅ Dark mode toggle
 *  ✅ Board color picker
 *  ✅ Export album as ZIP (via JSZip)
 *  ✅ Lightbox with counter + keyboard nav
 *  ✅ localStorage persistence
 *  ✅ Accessibility (aria, keyboard)
 */

// ═══ CONFIG ═══
const ROW_SIZE   = 4;   // max photos per wire row
const BG_SYMS    = ['✦','❋','✿','◈','⬡','◆','✸','❂'];
const ROTS       = [-2.8, 1.4, -2, 2.6, -1.5, 2.8, -2.2, 1.8, -1.2, 3.0];
const COMPRESS_W = 800; // max image width/height after compression (px)

// Helper for search (case and accent insensitive)
const normalizeText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ═══ STATE ═══
let albums       = [];
let currentAlbum = -1;
let lbPhotos     = [];
let lbIdx        = 0;
let dragSrcIdx   = -1; // drag & drop source index
let boardColor   = '#e8a820';
let darkMode     = false;
let confirmCb    = null;

// ═══ BOOT ═══
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (albums.length === 0) initDefaultAlbums();
  buildBgDeco();
  renderBoard();
  bindStaticEvents();
  applyTheme();
});

// ─── Default albums ───
function initDefaultAlbums() {
  albums = Array.from({ length: 7 }, (_, i) => ({
    id:     Date.now() + i,
    name:   `Álbum ${i + 1}`,
    photos: [],        // array of { src: base64, caption: string }
  }));
}

// ─── Persist ───
function save() {
  const meta = {
    boardTitle: document.querySelector('.board-title')?.textContent || 'My Photo Board',
    boardSub:   document.querySelector('.board-sub')?.textContent   || '',
    boardColor,
    darkMode,
  };
  Storage.save(albums, meta);
}

function loadState() {
  const data = Storage.load();
  if (!data) return;
  albums     = data.albums     || [];
  boardColor = data.meta?.boardColor || '#e8a820';
  darkMode   = data.meta?.darkMode   || false;

  // Restore text after DOM renders
  setTimeout(() => {
    if (data.meta?.boardTitle) document.querySelector('.board-title').textContent = data.meta.boardTitle;
    if (data.meta?.boardSub)   document.querySelector('.board-sub').textContent   = data.meta.boardSub;
    document.getElementById('colorPicker').value = boardColor;
    applyBoardColor(boardColor);
    applyTheme();
  }, 0);
}

// ═══════════════════════
// BACKGROUND DECO
// ═══════════════════════
function buildBgDeco() {
  const container = document.getElementById('bgDeco');
  container.innerHTML = '';
  for (let i = 0; i < 32; i++) {
    const s = document.createElement('span');
    s.textContent = BG_SYMS[i % BG_SYMS.length];
    s.style.left      = Math.random() * 100 + '%';
    s.style.top       = Math.random() * 100 + '%';
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    s.setAttribute('aria-hidden', 'true');
    container.appendChild(s);
  }
}

// ═══════════════════════
// RENDER BOARD
// ═══════════════════════
function renderBoard(filter = '') {
  const rows = document.getElementById('rows');
  rows.innerHTML = '';

  // "No results" message
  let noResults = document.querySelector('.no-results');
  if (!noResults) {
    noResults = document.createElement('p');
    noResults.className = 'no-results';
    noResults.textContent = '😕 Ningún álbum encontrado';
    rows.after(noResults);
  }

  // Chunk albums into rows of ROW_SIZE
  const chunks = [];
  for (let i = 0; i < albums.length; i += ROW_SIZE) {
    chunks.push(albums.slice(i, i + ROW_SIZE));
  }

  let visibleCount = 0;

  chunks.forEach((chunk, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'wire-row';
    rowEl.innerHTML = '<div class="wire"></div>';

    const pr = document.createElement('div');
    pr.className = 'photos-row';

    chunk.forEach((alb, ci) => {
      const globalIdx = ri * ROW_SIZE + ci;
      const matches   = !filter || normalizeText(alb.name).includes(normalizeText(filter));
      const card      = buildCard(alb, globalIdx, ri, ci, !matches);
      if (matches) visibleCount++;
      pr.appendChild(card);
    });

    rowEl.appendChild(pr);
    rows.appendChild(rowEl);
  });

  noResults.classList.toggle('visible', visibleCount === 0 && filter.length > 0);
}

function buildCard(alb, globalIdx, rowIdx, colIdx, hidden) {
  const card = document.createElement('div');
  card.className = 'photo-card' + (hidden ? ' hidden' : '');
  card.style.setProperty('--rot',   (ROTS[globalIdx % ROTS.length]) + 'deg');
  card.style.setProperty('--delay', (globalIdx * 0.1) + 's');
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir álbum: ${alb.name}`);

  // New badge on first of second row
  if (rowIdx === 1 && colIdx === 0) {
    const badge = document.createElement('div');
    badge.className   = 'new-badge';
    badge.textContent = '✨ New Photos';
    badge.setAttribute('aria-hidden', 'true');
    card.appendChild(badge);
  }

  const clip = document.createElement('div');
  clip.className = 'clip';
  clip.setAttribute('aria-hidden', 'true');
  card.appendChild(clip);

  const frame = document.createElement('div');
  frame.className = 'frame';

  if (alb.photos.length > 0) {
    const img = document.createElement('img');
    img.src  = alb.photos[0].src;
    img.alt  = alb.name;
    img.loading = 'lazy';
    frame.appendChild(img);
    if (alb.photos.length > 1) {
      const cnt = document.createElement('div');
      cnt.className   = 'photo-count';
      cnt.textContent = alb.photos.length;
      cnt.setAttribute('aria-label', `${alb.photos.length} fotos`);
      card.appendChild(cnt);
    }
  } else {
    const ph = document.createElement('div');
    ph.className   = 'placeholder';
    ph.textContent = '🖼️';
    ph.setAttribute('aria-hidden', 'true');
    frame.appendChild(ph);
  }

  const cap = document.createElement('div');
  cap.className       = 'caption';
  cap.textContent     = alb.name;
  cap.title           = 'Doble clic para renombrar';
  cap.addEventListener('dblclick', e => {
    e.stopPropagation();
    cap.contentEditable = 'true';
    cap.focus();
    const range = document.createRange();
    range.selectNodeContents(cap);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
  cap.addEventListener('blur', () => {
    cap.contentEditable = 'false';
    alb.name = cap.textContent.trim() || alb.name;
    save();
  });
  cap.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); cap.blur(); } });
  frame.appendChild(cap);
  card.appendChild(frame);

  // Open album on click or Enter/Space
  const openFn = () => openAlbum(globalIdx);
  card.addEventListener('click', openFn);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFn(); } });

  return card;
}

// ═══════════════════════
// OPEN / CLOSE ALBUM
// ═══════════════════════
function openAlbum(idx) {
  currentAlbum = idx;
  document.getElementById('albumTitle').textContent = albums[idx].name;
  document.getElementById('albumSearch').value = '';
  renderFilmstrip();
  document.getElementById('pages').classList.add('album-open');
  document.getElementById('backBtn').focus();
}

function closeAlbum() {
  document.getElementById('pages').classList.remove('album-open');
  currentAlbum = -1;
  setTimeout(renderBoard, 580);
}

// ═══════════════════════
// FILMSTRIP
// ═══════════════════════
function renderFilmstrip(filter = '') {
  const alb    = albums[currentAlbum];
  const photos = alb.photos;
  const row1   = document.getElementById('filmRow1');
  const row2   = document.getElementById('filmRow2');
  row1.innerHTML = '';
  row2.innerHTML = '';

  const filtered = filter
    ? photos.filter(p => normalizeText(p.caption || '').includes(normalizeText(filter)))
    : photos;

  if (filtered.length === 0) {
    [row1, row2].forEach((row, ri) => {
      for (let i = 0; i < 4; i++) {
        const cell = makeFilmCell(i * 0.08);
        if (ri === 0 && i === 0) cell.appendChild(makeAddDiv());
        else { cell.style.background = '#1a1a1a'; cell.style.borderColor = '#222'; }
        row.appendChild(cell);
      }
    });
    return;
  }

  const half = Math.ceil(filtered.length / 2);
  addFilmCells(row1, filtered.slice(0, half), photos, 0);
  addFilmCells(row2, filtered.slice(half),    photos, half);
}

function addFilmCells(row, arr, allPhotos, offset) {
  arr.forEach((photo, i) => {
    const realIdx = allPhotos.indexOf(photo);
    const cell    = makeFilmCell((offset + i) * 0.055);
    cell.setAttribute('draggable', 'true');
    cell.dataset.idx = realIdx;

    const img = document.createElement('img');
    img.src     = photo.src;
    img.alt     = photo.caption || `Foto ${realIdx + 1}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => {
      lbPhotos = allPhotos;
      lbIdx    = realIdx;
      openLightbox();
    });
    cell.appendChild(img);

    // Caption overlay
    if (photo.caption) {
      const cap = document.createElement('div');
      cap.className   = 'film-caption';
      cap.textContent = photo.caption;
      cell.appendChild(cap);
    }

    // Delete button
    const del = document.createElement('button');
    del.className   = 'cell-del';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Eliminar foto');
    del.addEventListener('click', e => {
      e.stopPropagation();
      confirmAction(`¿Eliminar esta foto del álbum "${albums[currentAlbum].name}"?`, () => {
        albums[currentAlbum].photos.splice(realIdx, 1);
        save();
        renderFilmstrip(document.getElementById('albumSearch').value);
        renderBoard(document.getElementById('searchInput').value);
      });
    });
    cell.appendChild(del);

    // Drag & drop
    cell.addEventListener('dragstart', () => { dragSrcIdx = realIdx; cell.style.opacity = '0.4'; });
    cell.addEventListener('dragend',   () => { cell.style.opacity = '1'; dragSrcIdx = -1; });
    cell.addEventListener('dragover',  e => { e.preventDefault(); cell.classList.add('drag-over'); });
    cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
    cell.addEventListener('drop', e => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      if (dragSrcIdx === -1 || dragSrcIdx === realIdx) return;
      const photosArr = albums[currentAlbum].photos;
      const [moved]   = photosArr.splice(dragSrcIdx, 1);
      // If we removed an item before realIdx, realIdx shifted left by 1
      const insertIdx = dragSrcIdx < realIdx ? realIdx - 1 : realIdx;
      photosArr.splice(insertIdx, 0, moved);
      save();
      renderFilmstrip(document.getElementById('albumSearch').value);
    });

    row.appendChild(cell);
  });

  // Add cell
  const addCell = makeFilmCell((offset + arr.length) * 0.055);
  addCell.appendChild(makeAddDiv());
  row.appendChild(addCell);
}

function makeFilmCell(delaySec) {
  const cell = document.createElement('div');
  cell.className = 'film-cell';
  cell.style.setProperty('--fd', delaySec + 's');
  cell.setAttribute('role', 'listitem');
  return cell;
}

function makeAddDiv() {
  const div = document.createElement('div');
  div.className = 'add-cell';
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', 'Agregar fotos');
  div.innerHTML = '<div aria-hidden="true">＋</div><span>Agregar</span>';
  const trigger = () => document.getElementById('albumFileInput').click();
  div.addEventListener('click',   trigger);
  div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') trigger(); });
  return div;
}

// ═══════════════════════
// IMAGE UPLOAD + COMPRESS
// ═══════════════════════
function handleUpload(files) {
  if (currentAlbum < 0) return;
  Array.from(files).forEach(file => {
    compressImage(file, COMPRESS_W, compressed => {
      albums[currentAlbum].photos.push({ src: compressed, caption: file.name.replace(/\.[^.]+$/, '') });
      save();
      renderFilmstrip(document.getElementById('albumSearch').value);
      renderBoard(document.getElementById('searchInput').value);
    });
  });
}

function compressImage(file, maxSize, cb) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * maxSize / width);  width  = maxSize; }
        else                { width  = Math.round(width  * maxSize / height); height = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      cb(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ═══════════════════════
// EXPORT ZIP
// ═══════════════════════
async function exportAlbum() {
  if (currentAlbum < 0) return;
  const alb = albums[currentAlbum];
  if (!alb.photos.length) { alert('El álbum está vacío.'); return; }

  if (typeof JSZip === 'undefined') { alert('JSZip no está disponible. Revisá tu conexión a internet.'); return; }

  const zip  = new JSZip();
  const folder = zip.folder(alb.name);

  alb.photos.forEach((photo, i) => {
    const base64 = photo.src.split(',')[1];
    const ext    = photo.src.startsWith('data:image/png') ? 'png' : 'jpg';
    const name   = `${String(i + 1).padStart(3, '0')}_${(photo.caption || 'foto').replace(/[^\w\s-]/g, '')}.${ext}`;
    folder.file(name, base64, { base64: true });
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${alb.name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════
// DARK MODE & COLOR
// ═══════════════════════
function applyTheme() {
  document.body.classList.toggle('dark', darkMode);
  const btn = document.getElementById('darkToggle');
  btn.textContent = darkMode ? '☀️' : '🌙';
  btn.setAttribute('aria-pressed', String(darkMode));
}

function applyBoardColor(color) {
  document.documentElement.style.setProperty('--board-color', color);
  // Darken for hover states
  document.documentElement.style.setProperty('--board-dark', shadeColor(color, -20));
}

function shadeColor(hex, pct) {
  const num = parseInt(hex.replace('#',''), 16);
  const r   = Math.min(255, Math.max(0, (num >> 16) + pct));
  const g   = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
  const b   = Math.min(255, Math.max(0, (num & 0xff) + pct));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ═══════════════════════
// CONFIRM DIALOG
// ═══════════════════════
function confirmAction(msg, onOk) {
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOverlay').classList.add('on');
  confirmCb = onOk;
  document.getElementById('confirmOk').focus();
}

// ═══════════════════════
// LIGHTBOX
// ═══════════════════════
function openLightbox() {
  const photo = lbPhotos[lbIdx];
  document.getElementById('lbImg').src       = photo.src;
  document.getElementById('lbImg').alt       = photo.caption || `Foto ${lbIdx + 1}`;
  document.getElementById('lbCounter').textContent = `${lbIdx + 1} / ${lbPhotos.length}`;
  document.getElementById('lightbox').classList.add('on');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('on');
}

// ═══════════════════════
// STATIC EVENT BINDINGS
// ═══════════════════════
function bindStaticEvents() {

  // ── Back ──
  document.getElementById('backBtn').addEventListener('click', () => {
    save();
    closeAlbum();
  });

  // ── Album file upload ──
  document.getElementById('albumFileInput').addEventListener('change', e => {
    handleUpload(e.target.files);
    e.target.value = '';
  });

  // ── Album title sync ──
  document.getElementById('albumTitle').addEventListener('blur', () => {
    if (currentAlbum >= 0) {
      albums[currentAlbum].name = document.getElementById('albumTitle').textContent.trim()
        || albums[currentAlbum].name;
      save();
      renderBoard(document.getElementById('searchInput').value);
    }
  });

  // ── Board title / sub save ──
  document.querySelector('.board-title').addEventListener('blur', save);
  document.querySelector('.board-sub').addEventListener('blur',   save);

  // ── Search board ──
  document.getElementById('searchInput').addEventListener('input', e => {
    renderBoard(e.target.value);
  });

  // ── Search album ──
  document.getElementById('albumSearch').addEventListener('input', e => {
    renderFilmstrip(e.target.value);
  });

  // ── Dark mode ──
  document.getElementById('darkToggle').addEventListener('click', () => {
    darkMode = !darkMode;
    applyTheme();
    save();
  });

  // ── Color picker ──
  document.getElementById('colorPicker').addEventListener('input', e => {
    boardColor = e.target.value;
    applyBoardColor(boardColor);
    save();
  });

  // ── Add album ──
  document.getElementById('addAlbumBtn').addEventListener('click', () => {
    albums.push({ id: Date.now(), name: `Álbum ${albums.length + 1}`, photos: [] });
    save();
    renderBoard(document.getElementById('searchInput').value);
  });

  // ── Delete album ──
  document.getElementById('deleteAlbumBtn').addEventListener('click', () => {
    if (currentAlbum < 0) return;
    confirmAction(`¿Eliminar el álbum "${albums[currentAlbum].name}" y todas sus fotos?`, () => {
      albums.splice(currentAlbum, 1);
      save();
      closeAlbum();
    });
  });

  // ── Export album ──
  document.getElementById('exportBtn').addEventListener('click', exportAlbum);

  // ── Confirm dialog ──
  document.getElementById('confirmOk').addEventListener('click', () => {
    document.getElementById('confirmOverlay').classList.remove('on');
    if (confirmCb) { confirmCb(); confirmCb = null; }
  });
  document.getElementById('confirmCancel').addEventListener('click', () => {
    document.getElementById('confirmOverlay').classList.remove('on');
    confirmCb = null;
  });

  // ── Lightbox ──
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click',  () => { lbIdx = (lbIdx - 1 + lbPhotos.length) % lbPhotos.length; openLightbox(); });
  document.getElementById('lbNext').addEventListener('click',  () => { lbIdx = (lbIdx + 1) % lbPhotos.length; openLightbox(); });
  document.getElementById('lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });

  // ── Keyboard ──
  document.addEventListener('keydown', e => {
    // Lightbox navigation
    if (document.getElementById('lightbox').classList.contains('on')) {
      if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + lbPhotos.length) % lbPhotos.length; openLightbox(); }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbPhotos.length; openLightbox(); }
      if (e.key === 'Escape')     closeLightbox();
      return;
    }
    // Confirm dialog
    if (document.getElementById('confirmOverlay').classList.contains('on')) {
      if (e.key === 'Escape') { document.getElementById('confirmOverlay').classList.remove('on'); confirmCb = null; }
      return;
    }
    // Back from album with Escape
    if (e.key === 'Escape' && currentAlbum >= 0) { save(); closeAlbum(); }
  });

  // ── Drag & drop files onto the board ──
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    if (currentAlbum >= 0 && e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  });
}
