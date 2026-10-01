(() => {
  'use strict';

  const VERSION = '1.0.0';
  const ACTIVITY_LOCAL_KEY = 'hk-school-calendar-activity-logs-v1';

  const S = {
    user: null,
    submissions: [],
    activities: [],
    unsubSubmissions: null,
    unsubActivities: null,
    firebaseReady: false
  };

  const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));

  const hkToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone:'Asia/Hong_Kong',
      year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(new Date());
    const g = t => parts.find(p => p.type === t)?.value || '';
    return `${g('year')}-${g('month')}-${g('day')}`;
  };

  const fmt = d => {
    if (!d) return '—';
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  function addCss() {
    if (document.getElementById('planner-enhancements-css')) return;
    const style = document.createElement('style');
    style.id = 'planner-enhancements-css';
    style.textContent = `
      .pe-today-card{
        position:absolute; z-index:2147481000; width:min(430px,calc(100vw - 24px));
        border:1px solid #efd5a7; border-radius:13px; background:#fff9e9;
        color:#5b4638; padding:10px 11px; box-shadow:0 5px 18px #0002;
        font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif;
      }
      .pe-today-card .pe-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .pe-today-card .pe-head b{font-size:12px;color:#8a5c32}
      .pe-today-card .pe-head button{border:0;border-radius:7px;background:#a86f3d;color:#fff;padding:4px 8px;font-size:9px;font-weight:800}
      .pe-today-card .pe-row{font-size:9px;line-height:1.55;color:#725845;overflow-wrap:anywhere}
      .pe-today-card .pe-empty{font-size:9px;color:#8b7768}

      .pe-calendar-tools{
        position:fixed; left:12px; bottom:14px; z-index:2147481500;
        display:none; gap:6px; flex-wrap:wrap;
      }
      .pe-calendar-tools.show{display:flex}
      .pe-calendar-tools button{
        border:1px solid #d9c2a4;border-radius:999px;background:#fff8db;color:#80542f;
        padding:8px 11px;font-size:10px;font-weight:800;box-shadow:0 4px 13px #0002;
      }

      .pe-modal{
        display:none; position:fixed; inset:0; z-index:2147483600;
        background:#0005; align-items:center; justify-content:center; padding:14px;
        font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif;
      }
      .pe-modal.open{display:flex}
      .pe-dialog{
        width:min(720px,100%); max-height:90vh; overflow:auto;
        border:1px solid #e8d9c4;border-radius:16px;background:#fffdf8;color:#4a3428;
        box-shadow:0 15px 48px #0005;padding:14px;
      }
      .pe-dialog h3{margin:0 0 5px;color:#80542f;font-size:15px}
      .pe-note{margin:0 0 10px;color:#857365;font-size:10px;line-height:1.45}
      .pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .pe-field label{display:block;margin:0 0 3px;color:#857365;font-size:10px;font-weight:700}
      .pe-field input,.pe-field select,.pe-field textarea{
        width:100%;border:1px solid #decdb9;border-radius:8px;background:#fff;
        color:#4a3428;padding:8px;font:600 11px inherit;box-sizing:border-box;
      }
      .pe-field textarea{min-height:62px;resize:vertical}
      .pe-full{grid-column:1/-1}
      .pe-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}
      .pe-btn{border:1px solid #d9c2a4;border-radius:8px;background:#fff;color:#80542f;padding:7px 10px;font-size:10px;font-weight:800}
      .pe-btn.primary{background:#a86f3d;border-color:#a86f3d;color:#fff}
      .pe-btn.danger{color:#c64545}

      .pe-stat-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0}
      .pe-stat-toolbar select,.pe-stat-toolbar input{
        width:100%;border:1px solid #decdb9;border-radius:8px;padding:7px;background:#fff;color:#4a3428;font-size:10px
      }
      .pe-stat-group{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px;margin-top:7px}
      .pe-stat-group summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800;color:#80542f}
      .pe-stat-group summary::-webkit-details-marker{display:none}
      .pe-stat-list{margin-top:6px;border-top:1px dashed #eadfce;padding-top:5px}
      .pe-stat-item{display:grid;grid-template-columns:78px 1fr auto;gap:6px;align-items:start;padding:5px 0;border-bottom:1px solid #f1e9dd;font-size:9px}
      .pe-stat-item:last-child{border-bottom:0}
      .pe-stat-item b{color:#6d5545}.pe-stat-item small{color:#8b7768;line-height:1.4}
      .pe-stat-item button{border:0;background:transparent;color:#c64545;font-size:9px;font-weight:800;padding:2px}

      @media(max-width:700px){
        .pe-today-card{width:calc(100vw - 20px);left:10px!important;right:auto!important}
        .pe-grid{grid-template-columns:1fr}
        .pe-full{grid-column:auto}
        .pe-stat-toolbar{grid-template-columns:1fr}
        .pe-calendar-tools{left:8px;bottom:10px}
      }
      @media print{
        .pe-today-card,.pe-calendar-tools,.pe-modal{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function waitForFirebase(timeout=12000) {
    return new Promise(resolve => {
      const start = Date.now();
      const timer = setInterval(() => {
        if (window.firebase?.auth && window.firebase?.firestore) {
          clearInterval(timer); resolve(true); return;
        }
        if (Date.now() - start > timeout) {
          clearInterval(timer); resolve(false);
        }
      }, 180);
    });
  }

  async function getUser() {
    const ok = await waitForFirebase();
    if (!ok) return null;
    const auth = window.firebase.auth();
    if (auth.currentUser) return auth.currentUser;
    return new Promise(resolve => {
      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) { finished = true; resolve(null); }
      }, 8000);
      const unsub = auth.onAuthStateChanged(u => {
        if (finished || !u) return;
        finished = true; clearTimeout(timeout);
        try { unsub(); } catch {}
        resolve(u);
      });
    });
  }

  function subCollection() {
    return window.firebase.firestore().collection('users').doc(S.user.uid).collection('submissionRecords');
  }
  function activityCollection() {
    return window.firebase.firestore().collection('users').doc(S.user.uid).collection('calendarActivityLogs');
  }

  function needsFollowup(r) {
    const missing = Array.isArray(r.missing) ? r.missing : [];
    if (!missing.length) return false;
    const t = hkToday();
    return (!!r.dueDate && r.dueDate <= t) || (!!r.deadlineDate && r.deadlineDate <= t);
  }

  function loadActivityLocal() {
    try {
      const v = JSON.parse(localStorage.getItem(ACTIVITY_LOCAL_KEY) || '[]');
      S.activities = Array.isArray(v) ? v : [];
    } catch { S.activities = []; }
  }
  function saveActivityLocal() {
    try { localStorage.setItem(ACTIVITY_LOCAL_KEY, JSON.stringify(S.activities)); } catch {}
  }

  async function connectData() {
    loadActivityLocal();
    const user = await getUser();
    if (!user) return;

    S.user = user;
    S.firebaseReady = true;

    S.unsubSubmissions?.();
    S.unsubActivities?.();

    S.unsubSubmissions = subCollection().onSnapshot(snap => {
      S.submissions = snap.docs.map(d => ({id:d.id,...d.data()}));
      updateTodayCard();
    }, err => console.warn('[planner-enhancements] submissions', err));

    S.unsubActivities = activityCollection().orderBy('date','desc').onSnapshot(snap => {
      S.activities = snap.docs.map(d => ({id:d.id,...d.data()}));
      saveActivityLocal();
      renderStatsIfOpen();
      refreshCategoryDatalist();
    }, err => console.warn('[planner-enhancements] activities', err));
  }

  function ensureTodayCard() {
    let el = document.getElementById('pe-today-card');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pe-today-card';
      el.className = 'pe-today-card';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    return el;
  }

  function positionTodayCard() {
    const board = document.querySelector('.today-board');
    const card = ensureTodayCard();
    if (!board || !isVisible(board)) {
      card.style.display = 'none';
      return;
    }
    const r = board.getBoundingClientRect();
    card.style.display = 'block';
    card.style.left = `${Math.max(10, window.scrollX + r.left)}px`;
    card.style.top = `${window.scrollY + r.bottom + 10}px`;
    card.style.width = `${Math.min(430, Math.max(260, r.width))}px`;
  }

  function updateTodayCard() {
    const card = ensureTodayCard();
    const list = S.submissions.filter(needsFollowup);
    const totalPeople = list.reduce((sum,r)=>sum+(Array.isArray(r.missing)?r.missing.length:0),0);
    const html = `
      <div class="pe-head">
        <b>📋 今日追收${list.length ? `・${totalPeople} 人次` : ''}</b>
        <button type="button" id="pe-open-submissions">查看全部</button>
      </div>
      ${list.length ? list.slice(0,5).map(r => {
        const nums=(r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、');
        return `<div class="pe-row">${esc(r.className||'')}｜${esc(r.name||r.type||'項目')}：${esc(nums)}</div>`;
      }).join('') : '<div class="pe-empty">今日沒有需要追收的項目。</div>'}
    `;
    if (card.innerHTML !== html) {
      card.innerHTML = html;
      card.querySelector('#pe-open-submissions')?.addEventListener('click', () => {
        document.querySelector('.submission-launcher')?.click();
      });
    }
    positionTodayCard();
  }

  function isVisible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function currentCalendarVisible() {
    const grid = document.querySelector('.calendar-grid');
    return !!grid && isVisible(grid);
  }

  function ensureCalendarTools() {
    let bar = document.getElementById('pe-calendar-tools');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'pe-calendar-tools';
      bar.className = 'pe-calendar-tools';
      bar.innerHTML = `
        <button type="button" id="pe-add-activity">＋ 活動紀錄</button>
        <button type="button" id="pe-show-stats">📊 活動統計</button>`;
      document.body.appendChild(bar);
      bar.querySelector('#pe-add-activity')?.addEventListener('click', () => openActivityModal());
      bar.querySelector('#pe-show-stats')?.addEventListener('click', () => openStatsModal());
    }
    return bar;
  }

  function ensureActivityModal() {
    let modal = document.getElementById('pe-activity-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id='pe-activity-modal';
    modal.className='pe-modal';
    modal.innerHTML=`
      <div class="pe-dialog">
        <h3>＋ 新增活動紀錄</h3>
        <p class="pe-note">專門記錄日後需要按「類別」統計次數／日期的臨時或突發活動。</p>
        <div class="pe-grid">
          <div class="pe-field"><label>日期</label><input id="pe-act-date" type="date"></div>
          <div class="pe-field"><label>活動類別</label><input id="pe-act-category" list="pe-category-list" placeholder="例如：家長聯絡"></div>
          <datalist id="pe-category-list"></datalist>
          <div class="pe-field pe-full"><label>活動名稱</label><input id="pe-act-title" placeholder="例如：家長到校面談"></div>
          <div class="pe-field pe-full"><label>備註（可留空）</label><textarea id="pe-act-note" placeholder="補充資料"></textarea></div>
        </div>
        <div class="pe-actions">
          <button type="button" class="pe-btn" id="pe-act-cancel">取消</button>
          <button type="button" class="pe-btn primary" id="pe-act-save">加入紀錄</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-act-cancel')?.addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-act-save')?.addEventListener('click', saveActivity);
    return modal;
  }

  function refreshCategoryDatalist() {
    const dl = document.getElementById('pe-category-list');
    if (!dl) return;
    const cats = [...new Set(S.activities.map(x => (x.category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-HK'));
    dl.innerHTML = cats.map(c=>`<option value="${esc(c)}"></option>`).join('');
  }

  function inferCalendarSelectedDate() {
    // Prefer the month currently shown in the calendar controls.
    const monthInput = [...document.querySelectorAll('input[type="month"]')].find(isVisible);
    const month = monthInput?.value;
    if (month && /^\d{4}-\d{2}$/.test(month)) return `${month}-01`;
    return hkToday();
  }

  function openActivityModal(date='') {
    const modal = ensureActivityModal();
    refreshCategoryDatalist();
    document.getElementById('pe-act-date').value = date || inferCalendarSelectedDate() || hkToday();
    document.getElementById('pe-act-category').value = '';
    document.getElementById('pe-act-title').value = '';
    document.getElementById('pe-act-note').value = '';
    modal.classList.add('open');
  }

  function closeModal(modal) {
    modal?.classList.remove('open');
  }

  async function saveActivity() {
    const date = document.getElementById('pe-act-date').value;
    const category = document.getElementById('pe-act-category').value.trim();
    const title = document.getElementById('pe-act-title').value.trim();
    const note = document.getElementById('pe-act-note').value.trim();
    if (!date || !category || !title) {
      alert('請填寫日期、活動類別及活動名稱。');
      return;
    }
    const rec = {
      id:`act_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      date, category, title, note,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
    S.activities.unshift(rec);
    saveActivityLocal();
    closeModal(document.getElementById('pe-activity-modal'));
    if (S.firebaseReady) {
      try {
        await activityCollection().doc(rec.id).set({
          date,category,title,note,createdAt:rec.createdAt,updatedAt:rec.updatedAt
        });
      } catch (e) {
        alert('Firestore 儲存失敗，紀錄已暫存在本機。');
      }
    }
    renderStatsIfOpen();
  }

  function ensureStatsModal() {
    let modal=document.getElementById('pe-stats-modal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='pe-stats-modal';
    modal.className='pe-modal';
    modal.innerHTML=`
      <div class="pe-dialog">
        <h3>📊 活動紀錄統計</h3>
        <p class="pe-note">按類別一次過檢視出現次數及日期。</p>
        <div class="pe-stat-toolbar">
          <select id="pe-stat-range">
            <option value="year">全學年</option>
            <option value="term1">上學期</option>
            <option value="term2">下學期</option>
            <option value="month">本月</option>
          </select>
          <input id="pe-stat-search" placeholder="搜尋類別／活動名稱">
        </div>
        <div id="pe-stat-content"></div>
        <div class="pe-actions">
          <button type="button" class="pe-btn" id="pe-stat-close">關閉</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-stat-close')?.addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-stat-range')?.addEventListener('change',renderStats);
    modal.querySelector('#pe-stat-search')?.addEventListener('input',renderStats);
    return modal;
  }

  function schoolYearBounds() {
    const [y,m] = hkToday().split('-').map(Number);
    const startYear = m >= 8 ? y : y - 1;
    return {
      year:[`${startYear}-08-01`,`${startYear+1}-07-31`],
      term1:[`${startYear}-08-01`,`${startYear}-12-31`],
      term2:[`${startYear+1}-01-01`,`${startYear+1}-07-31`]
    };
  }

  function filterActivities() {
    const range=document.getElementById('pe-stat-range')?.value || 'year';
    const q=(document.getElementById('pe-stat-search')?.value||'').trim().toLowerCase();
    const bounds=schoolYearBounds();
    let start,end;
    if(range==='month'){
      const t=hkToday();
      const ym=t.slice(0,7);
      start=`${ym}-01`;
      const [y,m]=ym.split('-').map(Number);
      const last=new Date(y,m,0).getDate();
      end=`${ym}-${String(last).padStart(2,'0')}`;
    } else [start,end]=bounds[range] || bounds.year;
    return S.activities.filter(a=>{
      if(!a.date || a.date<start || a.date>end)return false;
      if(!q)return true;
      return `${a.category||''} ${a.title||''} ${a.note||''}`.toLowerCase().includes(q);
    });
  }

  function renderStats() {
    const out=document.getElementById('pe-stat-content');
    if(!out)return;
    const items=filterActivities();
    const groups={};
    items.forEach(a=>{
      const k=(a.category||'未分類').trim()||'未分類';
      (groups[k] ||= []).push(a);
    });
    const entries=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0],'zh-HK'));
    out.innerHTML=entries.length ? entries.map(([cat,arr])=>`
      <details class="pe-stat-group" open>
        <summary><span>${esc(cat)}</span><span>${arr.length} 次</span></summary>
        <div class="pe-stat-list">
          ${arr.sort((a,b)=>a.date.localeCompare(b.date)).map(a=>`
            <div class="pe-stat-item">
              <b>${fmt(a.date)}</b>
              <small><strong>${esc(a.title||'')}</strong>${a.note?`<br>${esc(a.note)}`:''}</small>
              <button type="button" data-delete-activity="${esc(a.id||'')}">刪除</button>
            </div>`).join('')}
        </div>
      </details>`).join('') : '<div class="pe-note">這個範圍暫時未有活動紀錄。</div>';
    out.querySelectorAll('[data-delete-activity]').forEach(btn=>{
      btn.addEventListener('click',()=>deleteActivity(btn.dataset.deleteActivity));
    });
  }

  function openStatsModal() {
    const modal=ensureStatsModal();
    modal.classList.add('open');
    renderStats();
  }

  function renderStatsIfOpen() {
    if(document.getElementById('pe-stats-modal')?.classList.contains('open')) renderStats();
  }

  async function deleteActivity(id) {
    const rec=S.activities.find(x=>x.id===id);
    if(!rec)return;
    if(!confirm(`刪除「${rec.title}」？`))return;
    S.activities=S.activities.filter(x=>x.id!==id);
    saveActivityLocal();
    if(S.firebaseReady){
      try{await activityCollection().doc(id).delete()}catch(e){console.warn(e)}
    }
    renderStats();
  }

  function updateCalendarTools() {
    const bar=ensureCalendarTools();
    bar.classList.toggle('show', currentCalendarVisible());
  }

  function uiTick() {
    if(document.visibilityState!=='visible')return;
    updateTodayCard();
    updateCalendarTools();
  }

  async function start() {
    addCss();
    ensureTodayCard();
    ensureCalendarTools();
    ensureActivityModal();
    ensureStatsModal();
    await connectData();
    uiTick();
    window.setInterval(uiTick, 1800);
    window.addEventListener('resize', uiTick, {passive:true});
    window.addEventListener('scroll', positionTodayCard, {passive:true});
    console.info(`[planner-enhancements] v${VERSION} ready`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();