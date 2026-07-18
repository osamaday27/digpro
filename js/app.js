/* =====================================================================
   Digital Products Master Guide — app logic
   Everything below is organized in clearly labeled blocks:
   DATA → STORE (localStorage) → RENDER → NAVIGATION → SEARCH →
   DARK MODE → MOBILE MENU → DOWNLOADS → INIT
   See README.md for a plain-language walkthrough of each part.
   ===================================================================== */

/* ================= DATA =================
   Edit these arrays to change the guide's content — the UI rebuilds
   itself automatically from whatever is in here. */
const PRODUCTS = [
  {id:'saas', title:'SaaS من الفكرة حتى الإطلاق', tag:'Subscription', icon:'bi-cloud-arrow-up'},
  {id:'ai', title:'AI Products', tag:'ML / LLM', icon:'bi-cpu'},
  {id:'apis', title:'APIs المدفوعة', tag:'Usage-based', icon:'bi-plug'},
  {id:'laravel', title:'Laravel Templates', tag:'One-time', icon:'bi-layers'},
  {id:'wp', title:'WordPress Plugins', tag:'License', icon:'bi-wordpress'},
  {id:'ext', title:'Chrome Extensions', tag:'Freemium', icon:'bi-puzzle'},
  {id:'notion', title:'Notion Templates', tag:'One-time', icon:'bi-sticky'},
  {id:'mobile', title:'Mobile Apps', tag:'App Store', icon:'bi-phone'},
  {id:'ebook', title:'E-books', tag:'Digital Download', icon:'bi-book'},
  {id:'course', title:'Online Courses', tag:'Cohort / Self-paced', icon:'bi-mortarboard'},
];
const RESOURCES = [
  {id:'r1', title:'أدوات بناء وتطوير سريع', tag:'Build', icon:'bi-hammer'},
  {id:'r2', title:'منصات نشر واستضافة', tag:'Deploy', icon:'bi-cloud-upload'},
  {id:'r3', title:'أدوات تسعير واشتراكات', tag:'Billing', icon:'bi-credit-card'},
  {id:'r4', title:'أدوات تسويق ومحتوى', tag:'Marketing', icon:'bi-megaphone'},
  {id:'r5', title:'مجتمعات وقنوات توزيع', tag:'Distribution', icon:'bi-people'},
  {id:'r6', title:'مراجع وتعلّم مستمر', tag:'Learning', icon:'bi-journal-bookmark'},
];
const ROADMAP = [
  {id:'p1', days:'يوم 1 — 30', title:'البناء والتأسيس', desc:'تحديد المنتج، بناء أول نسخة قابلة للاستخدام (MVP)، وتجهيز الأساس التقني والتجاري قبل أي إطلاق.'},
  {id:'p2', days:'يوم 31 — 60', title:'الإطلاق والتسويق', desc:'نشر المنتج على الإنترنت، تفعيل استراتيجية التسعير، وبدء التسويق المستمر لبناء جمهور حقيقي.'},
  {id:'p3', days:'يوم 61 — 90', title:'أول العملاء والنمو', desc:'التركيز الكامل على تحويل الزوار لعملاء دافعين، وجمع الملاحظات لتطوير المنتج بناءً على الاستخدام الفعلي.'},
];
const CHECKLIST = [
  {group:'البناء والتأسيس', items:[
    {id:'c1', text:'تحديد نوع المنتج ونطاق النسخة الأولى'},
    {id:'c2', text:'بناء MVP قابل للاستخدام فعليًا'},
    {id:'c3', text:'تجهيز صفحة هبوط بسيطة'},
  ]},
  {group:'الإطلاق والتسويق', items:[
    {id:'c4', text:'تحديد السعر ونموذج البيع'},
    {id:'c5', text:'نشر المنتج على منصة مناسبة'},
    {id:'c6', text:'بدء التسويق المستمر (محتوى + قنوات)'},
  ]},
  {group:'أول العملاء والنمو', items:[
    {id:'c7', text:'التواصل المباشر مع أول 10 عملاء محتملين'},
    {id:'c8', text:'إغلاق أول صفقة بيع فعلية'},
    {id:'c9', text:'جمع ملاحظات المستخدمين وتحديث المنتج'},
  ]},
];

/* ================= STORE (localStorage) =================
   All user state (checked items, saved notes, bookmarks, dark-mode
   choice) lives in one JSON object under a single localStorage key,
   so it's easy to inspect, back up, or reset. */
const STORE_KEY = 'dpg_state_v1';
function defaultState(){ return { checklist:{}, roadmap:{}, bookmarks:[], notes:[], dark:false }; }
let state = defaultState();
try{ const saved = JSON.parse(localStorage.getItem(STORE_KEY)); if(saved) state = Object.assign(defaultState(), saved); }catch(e){}
function persist(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){} }

/* ================= RENDER ================= */
function renderCards(list, container, bookmarkPrefix){
  container.innerHTML = list.map(p=>{
    const bmId = bookmarkPrefix+':'+p.id;
    const active = state.bookmarks.includes(bmId);
    return `<div class="item-card">
      <button class="bookmark-btn ${active?'active':''}" data-bm="${bmId}" data-title="${p.title}" data-icon="${p.icon}" data-tag="${p.tag}"><i class="bi ${active?'bi-bookmark-star-fill':'bi-bookmark'}"></i></button>
      <i class="bi ${p.icon} main-i"></i>
      <h3>${p.title}</h3>
      <span class="tag">${p.tag}</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.bookmark-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-bm');
      toggleBookmark(id, btn.getAttribute('data-title'), btn.getAttribute('data-icon'), btn.getAttribute('data-tag'));
      renderAll();
    });
  });
}

function toggleBookmark(id, title, icon, tag){
  const idx = state.bookmarks.indexOf(id);
  if(idx>-1){ state.bookmarks.splice(idx,1); }
  else{ state.bookmarks.push(id); }
  if(!state._bmMeta) state._bmMeta = {};
  state._bmMeta[id] = {title, icon, tag};
  persist();
}

function renderRoadmap(){
  const el = document.getElementById('roadmapList');
  el.innerHTML = `<div class="roadmap-line"></div>` + ROADMAP.map(r=>{
    const done = !!state.roadmap[r.id];
    return `<div class="roadmap-phase ${done?'done':''}">
      <div class="roadmap-top">
        <div><span class="days">${r.days}</span><h3>${r.title}</h3></div>
        <button class="phase-toggle ${done?'done':''}" data-phase="${r.id}"><i class="bi ${done?'bi-check-circle-fill':'bi-circle'}"></i> ${done?'مخلّصة':'علّمها كمخلّصة'}</button>
      </div>
      <p>${r.desc}</p>
    </div>`;
  }).join('');
  el.querySelectorAll('.phase-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-phase');
      state.roadmap[id] = !state.roadmap[id];
      persist(); renderAll();
    });
  });
}

function renderChecklist(){
  const wrap = document.getElementById('checklistWrap');
  wrap.innerHTML = CHECKLIST.map(g=>`
    <div class="checklist-group">
      <h4>${g.group}</h4>
      ${g.items.map(it=>{
        const done = !!state.checklist[it.id];
        return `<label class="check-row ${done?'done':''}">
          <input type="checkbox" data-check="${it.id}" ${done?'checked':''}>
          <span>${it.text}</span>
        </label>`;
      }).join('')}
    </div>
  `).join('');
  wrap.querySelectorAll('[data-check]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const id = cb.getAttribute('data-check');
      state.checklist[id] = cb.checked;
      persist(); renderAll();
    });
  });
}

function renderNotes(){
  const list = document.getElementById('notesList');
  if(state.notes.length === 0){
    list.innerHTML = `<div class="empty-state"><i class="bi bi-sticky"></i>لسه مفيش ملاحظات. اكتب أول واحدة فوق.</div>`;
    return;
  }
  list.innerHTML = state.notes.slice().reverse().map(n=>`
    <div class="note-card">
      <div><div class="txt">${escapeHtml(n.text)}</div><div class="meta">${n.date}</div></div>
      <button class="del-btn" data-del="${n.id}"><i class="bi bi-trash"></i></button>
    </div>
  `).join('');
  list.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-del');
      state.notes = state.notes.filter(n=>String(n.id)!==id);
      persist(); renderAll();
    });
  });
}

function renderBookmarks(){
  const container = document.getElementById('bookmarksList');
  if(state.bookmarks.length === 0){
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="bi bi-bookmark"></i>لسه مفيش حاجة محفوظة. دوس على النجمة في أي كارت.</div>`;
    return;
  }
  container.innerHTML = state.bookmarks.map(id=>{
    const meta = (state._bmMeta && state._bmMeta[id]) || {title:id, icon:'bi-bookmark', tag:''};
    return `<div class="item-card">
      <button class="bookmark-btn active" data-bm="${id}"><i class="bi bi-bookmark-star-fill"></i></button>
      <i class="bi ${meta.icon} main-i"></i>
      <h3>${meta.title}</h3>
      <span class="tag">${meta.tag}</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.bookmark-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-bm');
      const idx = state.bookmarks.indexOf(id);
      if(idx>-1) state.bookmarks.splice(idx,1);
      persist(); renderAll();
    });
  });
}

function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* ================= PROGRESS =================
   Overall completion = 70% weight on the checklist + 30% weight on the
   roadmap phases marked done. Adjust the 0.7 / 0.3 split if you want
   a different balance. */
function computeProgress(){
  const checkTotal = CHECKLIST.reduce((s,g)=>s+g.items.length,0);
  const checkDone = Object.values(state.checklist).filter(Boolean).length;
  const roadDone = Object.values(state.roadmap).filter(Boolean).length;
  const pct = Math.round(((checkDone/checkTotal)*0.7 + (roadDone/ROADMAP.length)*0.3)*100);
  return {pct, checkDone, checkTotal, roadDone, roadTotal:ROADMAP.length};
}

function renderStats(){
  const {pct, checkDone, checkTotal, roadDone, roadTotal} = computeProgress();
  document.getElementById('ringEl').style.setProperty('--pct', pct);
  document.getElementById('ringText').textContent = pct+'%';
  document.getElementById('topProgress').textContent = pct+'%';
  document.getElementById('sidebarBar').style.width = pct+'%';
  document.getElementById('statChecklist').textContent = checkDone+'/'+checkTotal;
  document.getElementById('statRoadmap').textContent = roadDone+'/'+roadTotal;
  document.getElementById('statBookmarks').textContent = state.bookmarks.length;
  document.getElementById('statNotes').textContent = state.notes.length;
  document.getElementById('cnt-checklist').textContent = checkDone+'/'+checkTotal;
  document.getElementById('cnt-notes').textContent = state.notes.length;
  document.getElementById('cnt-bookmarks').textContent = state.bookmarks.length;
  document.getElementById('checklistSummary').textContent = checkDone+' من '+checkTotal+' مكتملة';
}

function renderAll(){
  renderCards(PRODUCTS, document.getElementById('productsGrid'), 'product');
  renderCards(RESOURCES, document.getElementById('resourcesGrid'), 'resource');
  renderRoadmap();
  renderChecklist();
  renderNotes();
  renderBookmarks();
  renderStats();
}

/* ================= NAVIGATION ================= */
const navItems = document.querySelectorAll('.nav-item[data-page]');
function goto(page){
  navItems.forEach(n=>n.classList.toggle('active', n.getAttribute('data-page')===page));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  closeMobileMenu();
}
navItems.forEach(n=> n.addEventListener('click', ()=> goto(n.getAttribute('data-page'))));
document.querySelectorAll('[data-goto]').forEach(a=>{
  a.addEventListener('click', (e)=>{ e.preventDefault(); goto(a.getAttribute('data-goto')); });
});

/* ================= NOTES INPUT ================= */
document.getElementById('saveNoteBtn').addEventListener('click', ()=>{
  const input = document.getElementById('noteInput');
  const text = input.value.trim();
  if(!text) return;
  state.notes.push({id:Date.now(), text, date:new Date().toLocaleString('ar-EG')});
  input.value='';
  persist(); renderAll();
});

/* ================= SEARCH =================
   Builds one flat searchable index from all content arrays, then does
   a simple case-insensitive substring match as the user types. */
const searchIndex = [
  ...PRODUCTS.map(p=>({title:p.title, type:'منتج', page:'products', icon:p.icon})),
  ...RESOURCES.map(r=>({title:r.title, type:'مورد', page:'resources', icon:r.icon})),
  ...CHECKLIST.flatMap(g=>g.items.map(it=>({title:it.text, type:'Checklist', page:'checklist', icon:'bi-check2-square'}))),
  ...ROADMAP.map(r=>({title:r.title, type:'Roadmap', page:'roadmap', icon:'bi-map'})),
];
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim();
  if(!q){ searchResults.classList.remove('show'); return; }
  const matches = searchIndex.filter(i=> i.title.toLowerCase().includes(q.toLowerCase()));
  searchResults.innerHTML = matches.length ? matches.slice(0,8).map(m=>`
    <div class="res-item" data-goto="${m.page}"><i class="bi ${m.icon}"></i> ${m.title} <small>${m.type}</small></div>
  `).join('') : `<div class="search-empty">مفيش نتائج لـ "${q}"</div>`;
  searchResults.classList.add('show');
  searchResults.querySelectorAll('[data-goto]').forEach(el=>{
    el.addEventListener('click', ()=>{ goto(el.getAttribute('data-goto')); searchResults.classList.remove('show'); searchInput.value=''; });
  });
});
document.addEventListener('click', (e)=>{ if(!e.target.closest('.search-wrap')) searchResults.classList.remove('show'); });

/* ================= DARK MODE =================
   Light theme is the default (see css/style.css :root). Adding the
   "dark" class to <body> swaps every CSS variable to the dark set. */
const darkToggle = document.getElementById('darkToggle');
function applyMode(){
  document.body.classList.toggle('dark', state.dark);
  darkToggle.innerHTML = state.dark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
}
darkToggle.addEventListener('click', ()=>{ state.dark = !state.dark; persist(); applyMode(); });

/* ================= MOBILE MENU ================= */
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
let overlay = null;
function ensureOverlay(){
  if(overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', closeMobileMenu);
  document.body.appendChild(overlay);
  return overlay;
}
function openMobileMenu(){ sidebar.classList.add('open'); ensureOverlay().classList.add('show'); }
function closeMobileMenu(){ sidebar.classList.remove('open'); if(overlay) overlay.classList.remove('show'); }
mobileMenuBtn.addEventListener('click', ()=>{ sidebar.classList.contains('open') ? closeMobileMenu() : openMobileMenu(); });

/* ================= DOWNLOADS =================
   Generates plain-text files client-side from the same data arrays
   above and triggers a real browser download — no server needed. */
function buildRoadmapText(){ return 'خطة الـ 90 يوم\n\n' + ROADMAP.map(r=>`${r.days} — ${r.title}\n${r.desc}\n`).join('\n'); }
function buildChecklistText(){ return 'Checklist للتنفيذ\n\n' + CHECKLIST.map(g=> g.group+'\n'+g.items.map(it=>'[ ] '+it.text).join('\n')).join('\n\n'); }
function buildResourcesText(){ return 'أدوات ومراجع\n\n' + RESOURCES.map(r=>'- '+r.title+' ('+r.tag+')').join('\n'); }
function buildFullText(){
  return 'Digital Products Master Guide\n\n' +
    'أنواع المنتجات:\n' + PRODUCTS.map(p=>'- '+p.title).join('\n') + '\n\n' +
    buildRoadmapText() + '\n\n' + buildChecklistText() + '\n\n' + buildResourcesText();
}
function downloadText(filename, text){
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
document.querySelectorAll('[data-dl]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.getAttribute('data-dl');
    if(type==='roadmap') downloadText('roadmap-90-days.txt', buildRoadmapText());
    if(type==='checklist') downloadText('checklist.txt', buildChecklistText());
    if(type==='resources') downloadText('resources.txt', buildResourcesText());
    if(type==='full') downloadText('digital-products-guide.txt', buildFullText());
  });
});

/* ================= INIT ================= */
applyMode();
renderAll();
