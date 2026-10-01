(() => {
  'use strict';

  const VERSION = '1.3.0';
  const ACTIVITY_LOCAL_KEY = 'hk-school-calendar-activity-logs-v1';
  const PLANNER_LOCAL_KEY = 'hk-school-planner-v3';
  const state = {
    user: null,
    submissions: [],
    activities: [],
    firebaseReady: false,
    sync: 'connecting',
    unsubSubmissions: null,
    unsubActivities: null,
    swControllerChanged: false
  };

  const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));

  const hkToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone:'Asia/Hong_Kong', year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(new Date());
    const g = t => parts.find(p => p.type === t)?.value || '';
    return `${g('year')}-${g('month')}-${g('day')}`;
  };

  const fmt = d => {
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d || '—';
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  function isVisible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function addCss() {
    if (document.getElementById('planner-enhancements-css')) return;
    const style = document.createElement('style');
    style.id = 'planner-enhancements-css';
    style.textContent = `
      .pe-sync-pill{position:fixed;right:12px;top:84px;z-index:2147481200;border:1px solid #d8e3df;border-radius:999px;background:#fff;color:#53665f;padding:5px 9px;font:800 9px "Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif;box-shadow:0 3px 10px #0001;pointer-events:none}
      .pe-sync-pill.ok{background:#eef8ef;color:#4f7754;border-color:#cfe2d0}.pe-sync-pill.wait{background:#fff8dd;color:#806525;border-color:#ead9a2}.pe-sync-pill.off{background:#fff0ef;color:#a94e4e;border-color:#e6bcbc}
      .pe-update-banner{display:none;position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483900;width:min(520px,calc(100vw - 24px));border:1px solid #d8c29f;border-radius:13px;background:#fff8df;color:#5e4937;padding:9px 11px;box-shadow:0 8px 28px #0003;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}
      .pe-update-banner.show{display:flex;align-items:center;gap:9px}.pe-update-banner b{font-size:11px}.pe-update-banner span{font-size:9px;color:#806c5c;flex:1}.pe-update-banner button{border:0;border-radius:8px;background:#a86f3d;color:#fff;padding:6px 9px;font-size:9px;font-weight:800}

      .pe-dashboard{display:none;position:fixed;right:12px;bottom:12px;z-index:2147481300;width:min(390px,calc(100vw - 24px));max-height:48vh;overflow:auto;border:1px solid #e9d5ac;border-radius:15px;background:#fffaf0;color:#594537;padding:10px 11px;box-shadow:0 8px 26px #0003;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}
      .pe-dashboard.show{display:block}.pe-dash-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}.pe-dash-head b{font-size:12px;color:#80542f}.pe-dash-head small{font-size:8px;color:#8c7767}.pe-dash-section{border-top:1px dashed #e3d3bf;padding-top:6px;margin-top:6px}.pe-dash-title{font-size:9px;font-weight:900;color:#8a5c32;margin-bottom:4px}.pe-dash-row{font-size:9px;line-height:1.55;color:#6e5848;overflow-wrap:anywhere}.pe-dash-empty{font-size:9px;color:#998678}.pe-dash-actions{display:flex;gap:5px;margin-top:7px}.pe-dash-actions button{flex:1;border:1px solid #d8c2a4;border-radius:8px;background:#fff;color:#80542f;padding:5px 6px;font-size:8px;font-weight:800}.pe-dash-actions button.primary{background:#a86f3d;color:#fff;border-color:#a86f3d}

      .pe-context-tools{position:fixed;left:10px;bottom:12px;z-index:2147481400;display:none;gap:6px;flex-wrap:wrap;max-width:calc(100vw - 20px)}.pe-context-tools.show{display:flex}.pe-context-tools button{border:1px solid #d8c2a4;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 10px;font-size:9px;font-weight:800;box-shadow:0 4px 13px #0002}

      .pe-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:#0005;align-items:center;justify-content:center;padding:14px;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}.pe-modal.open{display:flex}
      .pe-dialog{width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid #e8d9c4;border-radius:16px;background:#fffdf8;color:#4a3428;box-shadow:0 15px 48px #0005;padding:14px}.pe-dialog h3{margin:0 0 5px;color:#80542f;font-size:15px}.pe-note{margin:0 0 10px;color:#857365;font-size:10px;line-height:1.45}.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pe-field label{display:block;margin:0 0 3px;color:#857365;font-size:10px;font-weight:700}.pe-field input,.pe-field select,.pe-field textarea{width:100%;border:1px solid #decdb9;border-radius:8px;background:#fff;color:#4a3428;padding:8px;font:600 11px inherit;box-sizing:border-box}.pe-field textarea{min-height:62px;resize:vertical}.pe-full{grid-column:1/-1}.pe-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}.pe-btn{border:1px solid #d9c2a4;border-radius:8px;background:#fff;color:#80542f;padding:7px 10px;font-size:10px;font-weight:800}.pe-btn.primary{background:#a86f3d;border-color:#a86f3d;color:#fff}.pe-btn.danger{color:#c64545}
      .pe-stat-toolbar{display:grid;grid-template-columns:1fr 1fr auto auto;gap:6px;margin:9px 0}.pe-stat-toolbar select,.pe-stat-toolbar input{width:100%;border:1px solid #decdb9;border-radius:8px;padding:7px;background:#fff;color:#4a3428;font-size:10px}.pe-stat-toolbar button{border:1px solid #d8c2a4;border-radius:8px;background:#fff8db;color:#80542f;padding:7px 8px;font-size:9px;font-weight:800}.pe-stat-group{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px;margin-top:7px}.pe-stat-group summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800;color:#80542f}.pe-stat-group summary::-webkit-details-marker{display:none}.pe-stat-list{margin-top:6px;border-top:1px dashed #eadfce;padding-top:5px}.pe-stat-item{display:grid;grid-template-columns:78px 1fr auto;gap:6px;align-items:start;padding:5px 0;border-bottom:1px solid #f1e9dd;font-size:9px}.pe-stat-item:last-child{border-bottom:0}.pe-stat-item b{color:#6d5545}.pe-stat-item small{color:#8b7768;line-height:1.4}.pe-stat-item button{border:0;background:transparent;color:#c64545;font-size:9px;font-weight:800;padding:2px}
      .pe-search-results{margin-top:9px;display:grid;gap:6px}.pe-search-result{border:1px solid #eadfce;border-radius:9px;background:#fff;padding:8px}.pe-search-result .top{display:flex;justify-content:space-between;gap:8px;align-items:center}.pe-search-result b{font-size:10px;color:#80542f}.pe-search-result span{font-size:9px;color:#5f4b3d;line-height:1.45}.pe-search-result small{display:block;margin-top:3px;font-size:8px;color:#998678}.pe-search-hint{font-size:9px;color:#8c7868;line-height:1.5;margin-top:6px}
      @media(max-width:700px){.pe-sync-pill{top:auto;right:8px;bottom:64px}.pe-dashboard{right:8px;bottom:8px;width:calc(100vw - 16px);max-height:42vh}.pe-context-tools{left:8px;bottom:8px}.pe-grid{grid-template-columns:1fr}.pe-full{grid-column:auto}.pe-stat-toolbar{grid-template-columns:1fr 1fr}.pe-stat-item{grid-template-columns:68px 1fr auto}}
      @media print{.pe-sync-pill,.pe-update-banner,.pe-dashboard,.pe-context-tools,.pe-modal{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function setSync(status) {
    state.sync = status;
    const pill = ensureSyncPill();
    const map = {
      connecting:['wait','⟳ 連接中'], syncing:['wait','⟳ 同步中'], ok:['ok','☁ 已同步'], offline:['off','⚠ 離線暫存']
    };
    const [cls,text] = map[status] || map.connecting;
    pill.className = `pe-sync-pill ${cls}`;
    pill.textContent = text;
  }

  function ensureSyncPill() {
    let el = document.getElementById('pe-sync-pill');
    if (!el) { el = document.createElement('div'); el.id='pe-sync-pill'; document.body.appendChild(el); }
    return el;
  }

  function installNetworkStatus() {
    const refresh = () => setSync(navigator.onLine ? (state.firebaseReady ? 'ok' : 'connecting') : 'offline');
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    refresh();
  }

  async function waitForFirebase(timeout=12000) {
    const start = Date.now();
    while (Date.now()-start < timeout) {
      if (window.firebase?.auth && window.firebase?.firestore) return true;
      await new Promise(r=>setTimeout(r,180));
    }
    return false;
  }

  async function getUser() {
    if (!await waitForFirebase()) return null;
    const auth = window.firebase.auth();
    if (auth.currentUser) return auth.currentUser;
    return new Promise(resolve => {
      let finished = false;
      const timer = setTimeout(()=>{ if (!finished) { finished=true; resolve(null); } },8000);
      const unsub = auth.onAuthStateChanged(u=>{
        if (finished || !u) return;
        finished=true; clearTimeout(timer); try{unsub();}catch{} resolve(u);
      });
    });
  }

  const subCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('submissionRecords');
  const activityCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('calendarActivityLogs');

  function loadLocalActivities() {
    try { const x=JSON.parse(localStorage.getItem(ACTIVITY_LOCAL_KEY)||'[]'); state.activities=Array.isArray(x)?x:[]; } catch { state.activities=[]; }
  }
  function saveLocalActivities(){ try{localStorage.setItem(ACTIVITY_LOCAL_KEY,JSON.stringify(state.activities));}catch{} }

  async function connectData() {
    loadLocalActivities();
    setSync(navigator.onLine?'connecting':'offline');
    const user = await getUser();
    if (!user) { state.firebaseReady=false; setSync(navigator.onLine?'connecting':'offline'); return; }
    state.user=user; state.firebaseReady=true; setSync('syncing');
    try{state.unsubSubmissions?.();}catch{} try{state.unsubActivities?.();}catch{}
    state.unsubSubmissions = subCollection().onSnapshot(snap=>{
      state.submissions=snap.docs.map(d=>({id:d.id,...d.data()})); setSync(navigator.onLine?'ok':'offline'); renderDashboard();
    },()=>setSync(navigator.onLine?'connecting':'offline'));
    state.unsubActivities = activityCollection().orderBy('date','desc').onSnapshot(snap=>{
      state.activities=snap.docs.map(d=>({id:d.id,...d.data()})); saveLocalActivities(); setSync(navigator.onLine?'ok':'offline'); renderDashboard(); renderStatsIfOpen(); refreshCategoryList();
    },()=>setSync(navigator.onLine?'connecting':'offline'));
  }

  function installPwaUpdatePrompt() {
    if (!('serviceWorker' in navigator)) return;
    const banner = ensureUpdateBanner();
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (state.swControllerChanged) return;
      state.swControllerChanged = true;
      banner.classList.add('show');
      banner.querySelector('span').textContent='新版已準備好；重新載入即可使用最新功能。';
    });
    navigator.serviceWorker.ready.then(reg=>{
      reg.update().catch(()=>{});
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing; if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            banner.classList.add('show');
            banner.querySelector('span').textContent='偵測到網站更新，準備完成後可重新載入。';
          }
        });
      });
      setInterval(()=>reg.update().catch(()=>{}),30*60*1000);
    }).catch(()=>{});
  }

  function ensureUpdateBanner(){
    let el=document.getElementById('pe-update-banner');
    if(!el){
      el=document.createElement('div'); el.id='pe-update-banner'; el.className='pe-update-banner';
      el.innerHTML='<b>✨ 有新版本</b><span>新版已準備好。</span><button type="button">立即更新</button>';
      el.querySelector('button').addEventListener('click',()=>window.location.reload());
      document.body.appendChild(el);
    }
    return el;
  }

  function needsFollowup(r) {
    const missing=Array.isArray(r.missing)?r.missing:[]; if(!missing.length)return false;
    const t=hkToday(); return (!!r.dueDate&&r.dueDate<=t)||(!!r.deadlineDate&&r.deadlineDate<=t);
  }

  function todayActivities(){ return state.activities.filter(a=>a.date===hkToday()); }

  function ensureDashboard(){
    let el=document.getElementById('pe-dashboard');
    if(!el){el=document.createElement('aside');el.id='pe-dashboard';el.className='pe-dashboard';document.body.appendChild(el);} return el;
  }

  function renderDashboard(){
    const board=document.querySelector('.today-board'); const el=ensureDashboard();
    if(!board||!isVisible(board)){el.classList.remove('show');return;}
    const follow=state.submissions.filter(needsFollowup); const acts=todayActivities();
    const active=board.querySelector('.today-item.active-now');
    const activeText=active ? active.textContent.replace(/\s+/g,' ').trim() : '';
    const total=follow.reduce((s,r)=>s+(r.missing?.length||0),0);
    el.innerHTML=`
      <div class="pe-dash-head"><b>☀ 今日工作台</b><small>${fmt(hkToday())}</small></div>
      <div class="pe-dash-section"><div class="pe-dash-title">而家</div>${activeText?`<div class="pe-dash-row">${esc(activeText)}</div>`:'<div class="pe-dash-empty">目前未偵測到進行中的課節。</div>'}</div>
      <div class="pe-dash-section"><div class="pe-dash-title">📋 今日追收${follow.length?`・${total} 人次`:''}</div>${follow.length?follow.slice(0,5).map(r=>`<div class="pe-dash-row">${esc(r.className||'')}｜${esc(r.name||r.type||'項目')}：${esc((r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、'))}</div>`).join(''):'<div class="pe-dash-empty">今日沒有需要追收。</div>'}</div>
      <div class="pe-dash-section"><div class="pe-dash-title">📅 今日活動</div>${acts.length?acts.slice(0,5).map(a=>`<div class="pe-dash-row">${esc(a.category||'活動')}｜${esc(a.title||'')}</div>`).join(''):'<div class="pe-dash-empty">今日未有活動紀錄。</div>'}</div>
      <div class="pe-dash-actions"><button type="button" id="pe-open-sub">查看追收</button><button type="button" class="primary" id="pe-add-today-act">＋今日活動</button></div>`;
    el.querySelector('#pe-open-sub')?.addEventListener('click',()=>document.querySelector('.submission-launcher')?.click());
    el.querySelector('#pe-add-today-act')?.addEventListener('click',()=>openActivityModal(hkToday()));
    el.classList.add('show');
  }

  function currentCalendarVisible(){const g=document.querySelector('.calendar-grid');return !!g&&isVisible(g)}
  function currentJournalVisible(){const g=document.querySelector('.journal-table');return !!g&&isVisible(g)}

  function ensureContextTools(){
    let el=document.getElementById('pe-context-tools');
    if(!el){el=document.createElement('div');el.id='pe-context-tools';el.className='pe-context-tools';document.body.appendChild(el);} return el;
  }
  function renderContextTools(){
    const el=ensureContextTools();
    if(currentCalendarVisible()){
      el.innerHTML='<button type="button" id="pe-add-act">＋ 活動紀錄</button><button type="button" id="pe-stats">📊 活動統計</button>';
      el.querySelector('#pe-add-act').addEventListener('click',()=>openActivityModal());
      el.querySelector('#pe-stats').addEventListener('click',openStatsModal); el.classList.add('show');
    } else if(currentJournalVisible()){
      el.innerHTML='<button type="button" id="pe-search-journal">🔎 搜尋教學日誌</button>';
      el.querySelector('#pe-search-journal').addEventListener('click',openJournalSearch); el.classList.add('show');
    } else { el.classList.remove('show'); el.innerHTML=''; }
  }

  function ensureActivityModal(){
    let modal=document.getElementById('pe-activity-modal'); if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-activity-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog"><h3>＋ 新增活動紀錄</h3><p class="pe-note">適合記錄學期尾需要按類別統計次數／日期的臨時或突發活動。</p><div class="pe-grid"><div class="pe-field"><label>日期</label><input id="pe-act-date" type="date"></div><div class="pe-field"><label>活動類別</label><input id="pe-act-category" list="pe-category-list" placeholder="例如：家長聯絡"></div><datalist id="pe-category-list"></datalist><div class="pe-field pe-full"><label>活動名稱</label><input id="pe-act-title" placeholder="例如：家長到校面談"></div><div class="pe-field pe-full"><label>備註（可留空）</label><textarea id="pe-act-note"></textarea></div></div><div class="pe-actions"><button class="pe-btn" id="pe-act-cancel">取消</button><button class="pe-btn primary" id="pe-act-save">加入紀錄</button></div></div>`;
    document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});modal.querySelector('#pe-act-cancel').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-act-save').addEventListener('click',saveActivity);return modal;
  }
  function refreshCategoryList(){const dl=document.getElementById('pe-category-list');if(!dl)return;const cats=[...new Set(state.activities.map(x=>(x.category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-HK'));dl.innerHTML=cats.map(c=>`<option value="${esc(c)}"></option>`).join('')}
  function inferCalendarDate(){const input=[...document.querySelectorAll('input[type="month"]')].find(isVisible);return input?.value?`${input.value}-01`:hkToday()}
  function openActivityModal(date=''){const m=ensureActivityModal();refreshCategoryList();document.getElementById('pe-act-date').value=date||inferCalendarDate();document.getElementById('pe-act-category').value='';document.getElementById('pe-act-title').value='';document.getElementById('pe-act-note').value='';m.classList.add('open')}
  function closeModal(m){m?.classList.remove('open')}

  async function saveActivity(){
    const date=document.getElementById('pe-act-date').value,category=document.getElementById('pe-act-category').value.trim(),title=document.getElementById('pe-act-title').value.trim(),note=document.getElementById('pe-act-note').value.trim();
    if(!date||!category||!title){alert('請填寫日期、活動類別及活動名稱。');return}
    const rec={id:`act_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,date,category,title,note,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    state.activities.unshift(rec);saveLocalActivities();closeModal(document.getElementById('pe-activity-modal'));renderDashboard();renderStatsIfOpen();
    if(state.firebaseReady){setSync('syncing');try{await activityCollection().doc(rec.id).set({date,category,title,note,createdAt:rec.createdAt,updatedAt:rec.updatedAt});setSync('ok')}catch{setSync(navigator.onLine?'connecting':'offline');alert('Firestore 儲存失敗，紀錄已暫存在本機。')}}
  }

  function ensureStatsModal(){
    let modal=document.getElementById('pe-stats-modal');if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-stats-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog"><h3>📊 活動紀錄統計</h3><p class="pe-note">按類別檢視出現次數、日期，亦可匯出 CSV 或列印／另存 PDF。</p><div class="pe-stat-toolbar"><select id="pe-stat-range"><option value="year">全學年</option><option value="term1">上學期</option><option value="term2">下學期</option><option value="month">本月</option></select><input id="pe-stat-search" placeholder="搜尋類別／活動名稱"><button id="pe-export-csv">匯出 CSV</button><button id="pe-print-stats">列印／PDF</button></div><div id="pe-stat-content"></div><div class="pe-actions"><button class="pe-btn" id="pe-stat-close">關閉</button></div></div>`;
    document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});modal.querySelector('#pe-stat-close').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-stat-range').addEventListener('change',renderStats);modal.querySelector('#pe-stat-search').addEventListener('input',renderStats);modal.querySelector('#pe-export-csv').addEventListener('click',exportActivitiesCsv);modal.querySelector('#pe-print-stats').addEventListener('click',printActivityStats);return modal;
  }
  function schoolYearBounds(){const[y,m]=hkToday().split('-').map(Number),sy=m>=8?y:y-1;return{year:[`${sy}-08-01`,`${sy+1}-07-31`],term1:[`${sy}-08-01`,`${sy}-12-31`],term2:[`${sy+1}-01-01`,`${sy+1}-07-31`]}}
  function filteredActivities(){const range=document.getElementById('pe-stat-range')?.value||'year',q=(document.getElementById('pe-stat-search')?.value||'').trim().toLowerCase(),b=schoolYearBounds();let start,end;if(range==='month'){const ym=hkToday().slice(0,7),[y,m]=ym.split('-').map(Number);start=`${ym}-01`;end=`${ym}-${String(new Date(y,m,0).getDate()).padStart(2,'0')}`}else[start,end]=b[range]||b.year;return state.activities.filter(a=>a.date&&a.date>=start&&a.date<=end&&(!q||`${a.category||''} ${a.title||''} ${a.note||''}`.toLowerCase().includes(q)))}
  function renderStats(){const out=document.getElementById('pe-stat-content');if(!out)return;const items=filteredActivities(),groups={};items.forEach(a=>(groups[(a.category||'未分類').trim()||'未分類']||=[]).push(a));const entries=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],'zh-HK'));out.innerHTML=entries.length?entries.map(([cat,arr])=>`<details class="pe-stat-group" open><summary><span>${esc(cat)}</span><span>${arr.length} 次</span></summary><div class="pe-stat-list">${arr.sort((a,b)=>a.date.localeCompare(b.date)).map(a=>`<div class="pe-stat-item"><b>${fmt(a.date)}</b><small><strong>${esc(a.title||'')}</strong>${a.note?`<br>${esc(a.note)}`:''}</small><button data-delete-activity="${esc(a.id||'')}">刪除</button></div>`).join('')}</div></details>`).join(''):'<div class="pe-note">這個範圍暫時未有活動紀錄。</div>';out.querySelectorAll('[data-delete-activity]').forEach(b=>b.addEventListener('click',()=>deleteActivity(b.dataset.deleteActivity)))}
  function openStatsModal(){ensureStatsModal().classList.add('open');renderStats()}
  function renderStatsIfOpen(){if(document.getElementById('pe-stats-modal')?.classList.contains('open'))renderStats()}
  async function deleteActivity(id){const r=state.activities.find(x=>x.id===id);if(!r||!confirm(`刪除「${r.title}」？`))return;state.activities=state.activities.filter(x=>x.id!==id);saveLocalActivities();renderStats();renderDashboard();if(state.firebaseReady){setSync('syncing');try{await activityCollection().doc(id).delete();setSync('ok')}catch{setSync(navigator.onLine?'connecting':'offline')}}}

  function csvCell(v){return `"${String(v??'').replace(/"/g,'""')}"`}
  function exportActivitiesCsv(){const rows=filteredActivities().sort((a,b)=>a.date.localeCompare(b.date));const csv=['日期,活動類別,活動名稱,備註',...rows.map(a=>[a.date,a.category,a.title,a.note].map(csvCell).join(','))].join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`活動紀錄_${hkToday()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function printActivityStats(){const items=filteredActivities().sort((a,b)=>a.date.localeCompare(b.date));const w=window.open('','_blank');if(!w){alert('瀏覽器阻擋咗列印視窗，請允許彈出視窗後再試。');return}w.document.write(`<!doctype html><meta charset="utf-8"><title>活動紀錄統計</title><style>body{font-family:Arial,"Microsoft JhengHei",sans-serif;padding:24px;color:#333}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:7px;font-size:12px;text-align:left}th{background:#f3eee7}</style><h1>活動紀錄統計</h1><p>匯出日期：${fmt(hkToday())}</p><table><thead><tr><th>日期</th><th>類別</th><th>活動</th><th>備註</th></tr></thead><tbody>${items.map(a=>`<tr><td>${esc(fmt(a.date))}</td><td>${esc(a.category)}</td><td>${esc(a.title)}</td><td>${esc(a.note||'')}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()<\/script>`);w.document.close()}

  function readPlannerData(){try{return JSON.parse(localStorage.getItem(PLANNER_LOCAL_KEY)||'{}')}catch{return{}}}
  function ensureSearchModal(){
    let modal=document.getElementById('pe-search-modal');if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-search-modal';modal.className='pe-modal';modal.innerHTML=`<div class="pe-dialog"><h3>🔎 搜尋教學日誌</h3><p class="pe-note">可搜尋日期、教學進度及功課；目前畫面內亦會連科目一併搜尋。</p><div class="pe-grid"><div class="pe-field pe-full"><label>關鍵字</label><input id="pe-journal-query" placeholder="例如：記敘文／詞語改正／2026-09-15"></div></div><div class="pe-search-hint">提示：全部歷史紀錄會由本機 lessonNotes 搜尋；科目名稱則以目前載入的循環週為準。</div><div id="pe-search-results" class="pe-search-results"></div><div class="pe-actions"><button class="pe-btn" id="pe-search-close">關閉</button></div></div>`;document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});modal.querySelector('#pe-search-close').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-journal-query').addEventListener('input',renderJournalSearch);return modal;
  }
  function openJournalSearch(){const m=ensureSearchModal();m.classList.add('open');document.getElementById('pe-journal-query').focus();renderJournalSearch()}
  function currentVisibleSubjectMap(){const map={};document.querySelectorAll('.journal-table tbody tr').forEach(row=>{const subject=row.querySelector('.subject-cell')?.textContent?.trim();const ta=row.querySelector('textarea[aria-label*="進度"],textarea[aria-label*="功課"]');const label=ta?.getAttribute('aria-label')||'';const m=label.match(/第(\d+)節/);if(subject&&m)map[Number(m[1])-1]=subject});return map}
  function journalRows(){const data=readPlannerData(),notes=data.lessonNotes||{},subjects=currentVisibleSubjectMap(),rows=[];for(const[key,val]of Object.entries(notes)){if(!val||typeof val!=='string')continue;const m=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-(p|h)$/);if(!m)continue;const date=m[1],period=Number(m[2])+1,type=m[3]==='p'?'教學進度':'功課';rows.push({date,period,type,text:val,subject:subjects[Number(m[2])]||''})}return rows}
  function renderJournalSearch(){const out=document.getElementById('pe-search-results');if(!out)return;const q=(document.getElementById('pe-journal-query')?.value||'').trim().toLowerCase();if(!q){out.innerHTML='<div class="pe-note">輸入關鍵字開始搜尋。</div>';return}const rows=journalRows().filter(r=>`${r.date} ${r.period} ${r.type} ${r.text} ${r.subject}`.toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date)||a.period-b.period).slice(0,100);out.innerHTML=rows.length?rows.map(r=>`<div class="pe-search-result"><div class="top"><b>${fmt(r.date)}・第${r.period}節${r.subject?`・${esc(r.subject)}`:''}</b><span>${r.type}</span></div><small>${esc(r.text)}</small></div>`).join(''):'<div class="pe-note">找不到相符紀錄。</div>'}

  function uiTick(){if(document.visibilityState!=='visible')return;renderDashboard();renderContextTools()}

  async function start(){
    addCss();ensureSyncPill();installNetworkStatus();ensureDashboard();ensureContextTools();ensureActivityModal();ensureStatsModal();ensureSearchModal();installPwaUpdatePrompt();await connectData();uiTick();
    setInterval(uiTick,1800);
    console.info(`[planner-enhancements] v${VERSION} ready`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
