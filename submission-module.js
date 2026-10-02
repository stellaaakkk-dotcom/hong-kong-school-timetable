(() => {
  'use strict';

  const VERSION = '1.4.0';
  const LOCAL_KEY = 'hk-school-submission-records-v1';
  const PENDING_KEY = 'hk-school-submission-pending-v1';
  const CLASS_PREF_KEY = 'hk-school-class-student-counts-v1';
  const COLORS = {
    cream: '#fff8d9',
    cream2: '#fff3b8',
    caramel: '#a86f3d',
    caramelDark: '#7f4f2d',
    milk: '#fffdf8',
    line: '#eadfce',
    bg: '#fffaf0',
    danger: '#d64545',
    dangerBg: '#fff0ef',
    success: '#6f8f57',
    muted: '#8b7768'
  };

  const state = {
    records: [],
    activeId: null,
    unsubscribe: null,
    user: null,
    usingFirestore: false,
    pendingCount: 0
  };

  const pad = n => String(n).padStart(2, '0');

  function hkDateString() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function esc(v='') {
    return String(v).replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[ch]));
  }

  function fmtDate(s) {
    if (!s) return '—';
    const [y,m,d] = s.split('-');
    return `${d}/${m}/${y}`;
  }

  function loadClassPrefs(){
    try{
      const x=JSON.parse(localStorage.getItem(CLASS_PREF_KEY)||'{}');
      return x&&typeof x==='object'?x:{};
    }catch{return{}}
  }

  function rememberClassPref(className,count){
    const cls=String(className||'').trim();
    const n=Math.max(1,Math.min(60,Number(count)||30));
    if(!cls||cls==='班別')return;
    const prefs=loadClassPrefs();
    prefs[cls]=n;
    try{localStorage.setItem(CLASS_PREF_KEY,JSON.stringify(prefs))}catch{}
  }

  function knownClassPrefs(){
    const prefs=loadClassPrefs();
    state.records.forEach(r=>{
      const cls=String(r.className||'').trim();
      if(cls&&cls!=='班別'&&!prefs[cls])prefs[cls]=Number(r.studentCount)||30;
    });
    return prefs;
  }

  function attachClassAutoFill(classInputId,countInputId){
    const cls=document.getElementById(classInputId),count=document.getElementById(countInputId);
    if(!cls||!count||cls.dataset.classAutoFill==='1')return;
    cls.dataset.classAutoFill='1';
    const apply=()=>{
      const prefs=knownClassPrefs(),name=cls.value.trim();
      if(prefs[name])count.value=String(prefs[name]);
    };
    cls.addEventListener('input',apply);
    cls.addEventListener('change',apply);
    cls.addEventListener('blur',apply);
  }


  function id() {
    return `sub_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  }

  function active() {
    return state.records.find(r => r.id === state.activeId) || state.records[0] || null;
  }

  function isCompleted(r) {
    return (r.missing || []).length === 0;
  }

  function isExpired(r) {
    const ref = r.deadlineDate || r.dueDate || '';
    return !!ref && ref < hkDateString();
  }

  function needsFollowup(r) {
    if (isCompleted(r)) return false;
    const today = hkDateString();
    return (!!r.dueDate && r.dueDate <= today) ||
           (!!r.deadlineDate && r.deadlineDate <= today);
  }

  function normalizeRecord(r) {
    const count = Math.max(1, Math.min(60, Number(r.studentCount) || 30));
    return {
      id: r.id || id(),
      name: r.name || '未命名項目',
      type: r.type || '作業',
      className: r.className || '班別',
      studentCount: count,
      issueDate: r.issueDate || '',
      dueDate: r.dueDate || '',
      deadlineDate: r.deadlineDate || '',
      missing: (Array.isArray(r.missing) ? r.missing : [])
        .map(Number).filter(n => n >= 1 && n <= count)
        .sort((a,b)=>a-b),
      missingMeta: (r.missingMeta && typeof r.missingMeta === 'object') ? r.missingMeta : {},
      studentHistory: Array.isArray(r.studentHistory) ? r.studentHistory : (Array.isArray(r.missing) ? r.missing.map(n=>({student:Number(n),action:'missing',at:r.updatedAt||r.createdAt||new Date().toISOString()})) : []),
      sourceKey: r.sourceKey || '',
      sourceSubject: r.sourceSubject || '',
      sourcePeriod: r.sourcePeriod || '',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    };
  }

  function loadLocal() {
    try {
      const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      state.records = Array.isArray(arr) ? arr.map(normalizeRecord) : [];
    } catch {
      state.records = [];
    }
    if (!state.activeId && state.records[0]) state.activeId = state.records[0].id;
  }

  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state.records));
    } catch {}
  }

  async function waitForFirebase(timeout=15000) {
    if (window.firebase?.auth && window.firebase?.firestore) return true;

    if (window.__firebaseReadyPromise) {
      try {
        await Promise.race([
          window.__firebaseReadyPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase bootstrap timeout')), timeout))
        ]);
      } catch {}
      return !!(window.firebase?.auth && window.firebase?.firestore);
    }

    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (window.firebase?.auth && window.firebase?.firestore) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }

  async function getUser(timeout=12000) {
    if (!await waitForFirebase()) return null;

    const auth = window.firebase.auth();
    if (auth.currentUser) return auth.currentUser;
    if (window.__firebaseAuthResolved) return window.__firebaseAuthUser || null;

    return new Promise(resolve => {
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        try { unsub(); } catch {}
        resolve(auth.currentUser || null);
      }, timeout);

      const unsub = auth.onAuthStateChanged(user => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { unsub(); } catch {}
        resolve(user || null);
      });
    });
  }

  function collectionRef() {
    if (!state.user || !window.firebase?.firestore) return null;
    return window.firebase.firestore()
      .collection('users')
      .doc(state.user.uid)
      .collection('submissionRecords');
  }

  function loadPending(){
    try{const q=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');state.pendingCount=Array.isArray(q)?q.length:0;return Array.isArray(q)?q:[]}catch{state.pendingCount=0;return[]}
  }
  function savePending(q){try{localStorage.setItem(PENDING_KEY,JSON.stringify(q));state.pendingCount=q.length}catch{}renderStatus();window.dispatchEvent(new CustomEvent('submission-pending-changed',{detail:{count:state.pendingCount}}))}
  function queuePending(item){const q=loadPending().filter(x=>x.id!==item.id);q.push(item);savePending(q)}
  async function flushPending(){
    if(!navigator.onLine||!state.usingFirestore)return;
    let q=loadPending(); if(!q.length)return;
    const remain=[];
    for(const item of q){
      try{
        if(item.op==='delete') await collectionRef().doc(item.id).delete();
        else await collectionRef().doc(item.id).set(item.data,{merge:true});
      }catch{remain.push(item)}
    }
    savePending(remain);
  }
  function repeatMissingCount(record,student){
    const cls=record.className||''; let count=0;
    for(const r of state.records){
      if((r.className||'')!==cls)continue;
      count+=(r.studentHistory||[]).filter(e=>Number(e.student)===Number(student)&&e.action==='missing').length;
    }
    return count;
  }

  async function connectStorage() {
    loadLocal();
    loadPending();
    render();

    const user = await getUser();
    if (!user) {
      state.usingFirestore = false;
      renderStatus();
      return;
    }

    state.user = user;
    state.usingFirestore = true;
    await flushPending();

    try {
      state.unsubscribe?.();
    } catch {}

    state.unsubscribe = collectionRef()
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        state.records = snapshot.docs.map(doc => normalizeRecord({ id: doc.id, ...doc.data() }));
        if (!state.records.find(r => r.id === state.activeId)) {
          state.activeId = state.records[0]?.id || null;
        }
        saveLocal();
        render();
      }, err => {
        console.error('[Submission module] Firestore listener', err);
        state.usingFirestore = false;
        renderStatus();
      });
  }

  async function upsertRecord(record) {
    const r = normalizeRecord({ ...record, updatedAt: new Date().toISOString() });
    const idx = state.records.findIndex(x => x.id === r.id);
    if (idx >= 0) state.records[idx] = r;
    else state.records.unshift(r);
    state.activeId = r.id;
    rememberClassPref(r.className,r.studentCount);
    saveLocal();
    render();

    const cloudData = {
          name: r.name,
          type: r.type,
          className: r.className,
          studentCount: r.studentCount,
          issueDate: r.issueDate,
          dueDate: r.dueDate,
          deadlineDate: r.deadlineDate,
          missing: r.missing,
          missingMeta: r.missingMeta || {},
          studentHistory: r.studentHistory || [],
          sourceKey: r.sourceKey || '',
          sourceSubject: r.sourceSubject || '',
          sourcePeriod: r.sourcePeriod || '',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
    if (state.usingFirestore && navigator.onLine) {
      try {
        await collectionRef().doc(r.id).set(cloudData, { merge: true });
        const q=loadPending().filter(x=>!(x.op==='set'&&x.id===r.id));savePending(q);
      } catch (err) {
        console.error('[Submission module] save', err);
        queuePending({op:'set',id:r.id,data:cloudData});
        toast('Firestore 儲存失敗，已加入待同步', 'error');
      }
    } else {
      queuePending({op:'set',id:r.id,data:cloudData});
    }
  }

  async function removeRecord(recordId) {
    state.records = state.records.filter(r => r.id !== recordId);
    if (state.activeId === recordId) state.activeId = state.records[0]?.id || null;
    saveLocal();
    render();
    if (state.usingFirestore && navigator.onLine) {
      try { await collectionRef().doc(recordId).delete(); }
      catch (err) { console.error('[Submission module] delete', err); queuePending({op:'delete',id:recordId}); toast('刪除已加入待同步', 'error'); }
    } else queuePending({op:'delete',id:recordId});
  }

  function toast(message, kind='ok') {
    let el = document.getElementById('submission-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'submission-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    Object.assign(el.style, {
      position:'fixed', right:'14px', bottom:'14px', zIndex:'2147483647',
      padding:'9px 12px', borderRadius:'10px', font:'700 12px system-ui',
      boxShadow:'0 4px 16px #0002',
      background:kind === 'error' ? COLORS.dangerBg : '#f0f8ed',
      color:kind === 'error' ? COLORS.danger : COLORS.success
    });
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.remove(), 2400);
  }

  function injectCss() {
    if (document.getElementById('submission-module-style')) return;
    const style = document.createElement('style');
    style.id = 'submission-module-style';
    style.textContent = `
      #submission-page{display:none;position:fixed;inset:0;z-index:2147483000;background:${COLORS.bg};padding:54px 12px 16px;overflow:auto;-webkit-overflow-scrolling:touch}
      #submission-page.active{display:block}
      .submission-launcher{position:fixed;right:14px;bottom:16px;z-index:2147482000;border:0;border-radius:999px;background:${COLORS.caramel};color:#fff;padding:10px 14px;font-size:12px;font-weight:800;box-shadow:0 6px 18px #0003}
      .submission-close{position:fixed;right:14px;top:12px;z-index:2147483001;border:1px solid ${COLORS.line};border-radius:999px;background:#fffdf8;color:${COLORS.caramelDark};padding:7px 11px;font-size:11px;font-weight:800;box-shadow:0 3px 12px #0002}
      #submission-page *{box-sizing:border-box}
      .sub-wrap{max-width:1080px;margin:auto;color:#4a3428;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}
      .sub-bubble{background:${COLORS.milk};border:1px solid ${COLORS.line};border-radius:14px;padding:10px 12px;margin-bottom:8px;box-shadow:0 2px 8px rgba(127,79,45,.045)}
      .sub-bubble.new{background:#fff8d9;border-color:#efdca0}
      .sub-bubble.follow{background:#fff3df;border-color:#efd3ae}
      .sub-bubble.status{background:#fffaf0}
      .sub-title{display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:13px;font-weight:800;color:${COLORS.caramelDark}}
      .sub-num{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:${COLORS.caramel};color:#fff;font-size:10px}
      .sub-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
      .sub-field label{display:block;margin-bottom:3px;color:${COLORS.muted};font-size:10px;font-weight:700}
      .sub-field input,.sub-field select,.sub-select{width:100%;min-width:0;border:1px solid ${COLORS.line};border-radius:8px;background:#fffdf8;padding:7px 8px;color:#4a3428;font:600 12px inherit;outline:none}
      .sub-field input:focus,.sub-field select:focus,.sub-select:focus{border-color:#c89d6b;box-shadow:0 0 0 2px #c89d6b1c}
      .sub-btn{border:1px solid ${COLORS.line};border-radius:8px;background:#fffdf8;color:${COLORS.caramelDark};padding:7px 9px;font-size:11px;font-weight:800}
      .sub-btn.primary{background:${COLORS.caramel};border-color:${COLORS.caramel};color:#fff}
      .sub-btn.danger{color:${COLORS.danger}}
      .sub-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
      .sub-stats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid ${COLORS.line};border-radius:10px;overflow:hidden;margin:7px 0}
      .sub-stat{padding:7px 3px;text-align:center;border-right:1px solid ${COLORS.line}}
      .sub-stat:last-child{border-right:0}.sub-stat span{display:block;font-size:9px;color:${COLORS.muted}}.sub-stat b{font-size:17px}.sub-stat.done b{color:${COLORS.success}}.sub-stat.missing b{color:${COLORS.danger}}
      .sub-students{display:grid;grid-template-columns:repeat(12,minmax(34px,1fr));gap:5px 3px;align-items:center;justify-items:center}
      .sub-student{width:36px;height:36px;padding:0;border-radius:50%;border:1.5px solid #d8c2aa;background:#fffdf8;color:${COLORS.caramelDark};font-size:11px;font-weight:800}
      .sub-student.missing{border-color:#e5a29e;background:${COLORS.dangerBg};color:${COLORS.danger}}
      .sub-missing-summary{margin-top:7px;padding:7px 9px;border:1px solid ${COLORS.line};border-radius:9px;background:#fffdf8;font-size:11px}
      .sub-missing-details{margin-top:7px;display:grid;gap:5px}
      .sub-missing-row{display:grid;grid-template-columns:62px 110px 1fr auto;gap:5px;align-items:center;padding:6px;border:1px solid ${COLORS.line};border-radius:8px;background:#fff}
      .sub-missing-row b{font-size:10px}.sub-missing-row small{font-size:8px;color:${COLORS.muted}}
      .sub-missing-row select,.sub-missing-row input{min-width:0;border:1px solid ${COLORS.line};border-radius:7px;padding:6px;font-size:9px;background:#fffdf8}
      .sub-repeat{font-size:8px;color:${COLORS.danger};font-weight:800}

      .sub-follow-item,.sub-record{border:1px solid ${COLORS.line};border-radius:10px;background:#fffdf8;padding:8px 9px;margin-top:6px}
      .sub-follow-item{border-color:#edcfb7;background:#fff7eb}
      .sub-item-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .sub-item-title{font-size:12px;font-weight:800}.sub-meta{margin-top:3px;color:${COLORS.muted};font-size:10px;line-height:1.4}
      .sub-tag{display:inline-block;border:1px solid #dfc7ad;border-radius:999px;padding:3px 7px;background:#fff3d6;color:${COLORS.caramelDark};font-size:10px;font-weight:800;white-space:nowrap}
      .sub-tag.red{border-color:#efc5c1;background:${COLORS.dangerBg};color:${COLORS.danger}}
      .sub-empty{padding:8px;text-align:center;color:${COLORS.muted};font-size:11px}
      .sub-history summary{cursor:pointer;font-size:12px;font-weight:800;color:${COLORS.caramelDark};list-style:none}.sub-history summary::-webkit-details-marker{display:none}
      .sub-storage{font-size:9px;color:${COLORS.muted};margin-left:auto}
      .journal-homework-cell{position:relative!important}
      .journal-followup-btn{position:absolute;right:4px;bottom:3px;z-index:3;border:1px solid #d8c2aa;border-radius:999px;background:#fff7df;color:${COLORS.caramelDark};padding:2px 5px;font-size:7px;font-weight:800;line-height:1.2;box-shadow:0 1px 3px #0001}
      .journal-followup-btn.added{background:#eef7e9;color:${COLORS.success};border-color:#bfd5b1}
      .journal-homework-cell textarea{padding-bottom:17px!important}
      .journal-followup-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:#0004;align-items:center;justify-content:center;padding:14px}
      .journal-followup-modal.open{display:flex}
      .journal-followup-dialog{width:min(430px,100%);max-height:90vh;overflow:auto;background:${COLORS.milk};border:1px solid ${COLORS.line};border-radius:16px;padding:14px;box-shadow:0 12px 40px #0004;color:#4a3428}
      .journal-followup-dialog h3{margin:0 0 4px;color:${COLORS.caramelDark};font-size:15px}
      .journal-followup-dialog .source{margin:0 0 10px;color:${COLORS.muted};font-size:10px;line-height:1.45}
      .journal-followup-dialog .sub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .journal-followup-dialog .full{grid-column:1/-1}
      .journal-followup-dialog .modal-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:10px}
      .today-submission-card{margin:10px 0 0;padding:9px 11px;border:1px solid #efd3ae;border-radius:10px;background:#fff7eb;color:#5a4031}
      .today-submission-card .head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .today-submission-card .head b{font-size:11px;color:${COLORS.caramelDark}}.today-submission-card .head button{border:0;background:${COLORS.caramel};color:#fff;border-radius:7px;padding:4px 7px;font-size:9px;font-weight:800}
      .today-submission-card .row{font-size:9px;line-height:1.55;color:#725845}
      @media(max-width:900px){
        #submission-page{padding:50px 7px 12px}
        .sub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .sub-students{grid-template-columns:repeat(6,minmax(34px,1fr))}
        .sub-missing-row{grid-template-columns:54px 92px 1fr auto}
        .sub-bubble{padding:8px 9px;margin-bottom:6px;border-radius:12px}
      }
      @media(max-width:600px){.sub-missing-row{grid-template-columns:54px 1fr}.sub-missing-row input{grid-column:1/-1}}
      @media print{#submission-page,.submission-launcher,.today-submission-card,.journal-followup-btn,.journal-followup-modal{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensurePage() {
    let page = document.getElementById('submission-page');
    if (!page) {
      page = document.createElement('main');
      page.id = 'submission-page';
      const workspace = document.querySelector('.workspace');
      if (workspace) workspace.insertAdjacentElement('afterend', page);
      else document.body.appendChild(page);
    }
    return page;
  }

  function ensureLauncher() {
    let btn = document.querySelector('.submission-launcher');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'submission-launcher';
      btn.textContent = '📋 作業／回條';
      btn.addEventListener('click', showPage);
      document.body.appendChild(btn);
    }
    return btn;
  }

  function showPage() {
    const page = ensurePage();
    page.classList.add('active');
    document.body.style.overflow = 'hidden';
    render();
    window.scrollTo({top:0});
  }

  function hidePage() {
    document.getElementById('submission-page')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderStatus() {
    const el = document.querySelector('#submission-page .sub-storage');
    if (el) el.textContent = state.pendingCount ? `⚠ 待同步 ${state.pendingCount}` : (state.usingFirestore ? '● Firestore 已同步' : '○ 本機暫存');
  }

  function render() {
    const page = ensurePage();
    const r = active();
    const followups = state.records.filter(needsFollowup);
    const current = state.records.filter(x => !isCompleted(x) && !isExpired(x));
    const historyDone = state.records.filter(isCompleted);
    const historyExpired = state.records.filter(x => !isCompleted(x) && isExpired(x));

    page.innerHTML = `
      <button type="button" class="submission-close" id="submission-close">✕ 關閉</button>
      <div class="sub-wrap">
        <section class="sub-bubble new">
          <div class="sub-title"><span class="sub-num">1</span> 新增回條／作業 <span class="sub-storage"></span></div>
          <div class="sub-grid">
            <div class="sub-field"><label>名稱</label><input id="sub-name" placeholder="例如：家長日回條"></div>
            <div class="sub-field"><label>類別</label><select id="sub-type"><option>作業</option><option>回條</option><option>其他</option></select></div>
            <div class="sub-field"><label>班別</label><input id="sub-class" list="sub-class-list" placeholder="例如：3A"><datalist id="sub-class-list">${Object.keys(knownClassPrefs()).sort((a,b)=>a.localeCompare(b,'zh-HK')).map(c=>`<option value="${esc(c)}"></option>`).join('')}</datalist></div>
            <div class="sub-field"><label>學生人數</label><input id="sub-count" type="number" min="1" max="60" value="30"></div>
            <div class="sub-field"><label>派發日期</label><input id="sub-issue" type="date" value="${hkDateString()}"></div>
            <div class="sub-field"><label>繳交日期</label><input id="sub-due" type="date"></div>
            <div class="sub-field"><label>追收死線</label><input id="sub-deadline" type="date"></div>
            <div class="sub-field" style="display:flex;align-items:end"><button id="sub-create" class="sub-btn primary" style="width:100%">新增項目</button></div>
          </div>
        </section>

        <section class="sub-bubble follow">
          <div class="sub-title"><span class="sub-num">2</span> 今日追收</div>
          <div id="sub-follow-list">
            ${followups.length ? followups.map(x => followupHtml(x)).join('') : '<div class="sub-empty">今日沒有需要追收的項目。</div>'}
          </div>
        </section>

        <section class="sub-bubble status">
          <div class="sub-title"><span class="sub-num">3</span> 繳交狀況</div>
          ${state.records.length ? `
            <select id="sub-active" class="sub-select">
              ${state.records.map(x => `<option value="${esc(x.id)}" ${x.id===r?.id?'selected':''}>${esc(x.className)}｜${esc(x.type)}｜${esc(x.name)}</option>`).join('')}
            </select>
            ${r ? statusHtml(r) : ''}
          ` : '<div class="sub-empty">尚未有作業／回條紀錄。</div>'}
        </section>

        <section class="sub-bubble">
          <div class="sub-title">進行中紀錄</div>
          ${current.length ? current.map(recordHtml).join('') : '<div class="sub-empty">目前沒有進行中的紀錄。</div>'}
        </section>

        <section class="sub-bubble">
          <details class="sub-history">
            <summary>查看過往紀錄（已交齊 ${historyDone.length}／已過期 ${historyExpired.length}）</summary>
            <div style="margin-top:7px">
              ${historyDone.length ? `<div class="sub-meta">已交齊</div>${historyDone.map(x => recordHtml(x,'已交齊')).join('')}` : ''}
              ${historyExpired.length ? `<div class="sub-meta" style="margin-top:8px">已過期</div>${historyExpired.map(x => recordHtml(x,'已過期')).join('')}` : ''}
              ${!historyDone.length && !historyExpired.length ? '<div class="sub-empty">暫時未有過往紀錄。</div>' : ''}
            </div>
          </details>
        </section>
      </div>
    `;

    wireEvents();
    renderStatus();
    refreshJournalButtons();
  }

  function followupHtml(r) {
    const miss = r.missing || [];
    return `
      <div class="sub-follow-item">
        <div class="sub-item-top">
          <div><div class="sub-item-title">${esc(r.className)}｜${esc(r.name)}</div>
          <div class="sub-meta">${esc(r.type)} ・ 繳交 ${fmtDate(r.dueDate)} ・ 追收死線 ${fmtDate(r.deadlineDate)}</div></div>
          <span class="sub-tag red">欠交 ${miss.length}</span>
        </div>
        <div class="sub-meta" style="color:${COLORS.danger};margin-top:5px">班號：${miss.map(pad).join('、')}</div>
        <div class="sub-actions"><button class="sub-btn" data-open="${esc(r.id)}">查看／追收</button></div>
      </div>`;
  }

  function statusHtml(r) {
    const miss = r.missing || [];
    const count = r.studentCount || 30;
    return `
      <div class="sub-stats">
        <div class="sub-stat"><span>全班</span><b>${count}</b></div>
        <div class="sub-stat done"><span>已交</span><b>${count-miss.length}</b></div>
        <div class="sub-stat missing"><span>欠交</span><b>${miss.length}</b></div>
      </div>
      <div class="sub-students">
        ${Array.from({length:count},(_,i)=>i+1).map(n =>
          `<button class="sub-student ${miss.includes(n)?'missing':''}" data-student="${n}" aria-label="${n}號">${pad(n)}</button>`
        ).join('')}
      </div>
      <div class="sub-missing-summary">${miss.length ? `<b style="color:${COLORS.danger}">欠交 ${miss.length} 人：</b> ${miss.map(pad).join('、')}` : '目前沒有欠交學生。'}</div>
      ${miss.length?`<div class="sub-missing-details">${miss.map(n=>{const meta=r.missingMeta?.[n]||{};const repeat=repeatMissingCount(r,n);return `<div class="sub-missing-row"><div><b>${pad(n)}號</b>${repeat>1?`<div class="sub-repeat">累計 ${repeat} 次</div>`:''}</div><select data-missing-reason="${n}"><option ${meta.reason==='未交'?'selected':''}>未交</option><option ${meta.reason==='病假'?'selected':''}>病假</option><option ${meta.reason==='缺席'?'selected':''}>缺席</option><option ${meta.reason==='忘記'?'selected':''}>忘記</option><option ${meta.reason==='其他'?'selected':''}>其他</option></select><input data-missing-note="${n}" value="${esc(meta.note||'')}" placeholder="備註"><button class="sub-btn" data-returned="${n}">已補交</button></div>`}).join('')}</div>`:''}
      <div class="sub-actions">
        <button class="sub-btn" id="sub-all-done">全部已交</button>
        <button class="sub-btn danger" id="sub-all-missing">全部欠交</button>
        <button class="sub-btn" id="sub-edit">編輯項目</button>
        <button class="sub-btn danger" id="sub-delete">刪除</button>
      </div>`;
  }

  function recordHtml(r, forced='') {
    const miss = (r.missing || []).length;
    const label = forced || (miss ? `欠交 ${miss}` : '已交齊');
    const red = forced === '已過期' || miss;
    return `
      <div class="sub-record">
        <div class="sub-item-top">
          <div>
            <div class="sub-item-title">${esc(r.name)}</div>
            <div class="sub-meta">${esc(r.className)}／${r.studentCount}人 ・ ${esc(r.type)} ・ 派發 ${fmtDate(r.issueDate)} ・ 繳交 ${fmtDate(r.dueDate)} ・ 追收 ${fmtDate(r.deadlineDate)}</div>
          </div>
          <span class="sub-tag ${red?'red':''}">${esc(label)}</span>
        </div>
        <div class="sub-actions"><button class="sub-btn" data-open="${esc(r.id)}">查看</button></div>
      </div>`;
  }

  function wireEvents() {
    document.getElementById('submission-close')?.addEventListener('click', hidePage);
    attachClassAutoFill('sub-class','sub-count');
    document.getElementById('sub-create')?.addEventListener('click', async () => {
      const name = document.getElementById('sub-name').value.trim();
      if (!name) return toast('請輸入名稱', 'error');
      await upsertRecord({
        id: id(),
        name,
        type: document.getElementById('sub-type').value,
        className: document.getElementById('sub-class').value.trim() || '班別',
        studentCount: Number(document.getElementById('sub-count').value) || 30,
        issueDate: document.getElementById('sub-issue').value,
        dueDate: document.getElementById('sub-due').value,
        deadlineDate: document.getElementById('sub-deadline').value,
        missing: []
      });
      toast('已新增項目');
    });

    document.getElementById('sub-active')?.addEventListener('change', e => {
      state.activeId = e.target.value;
      render();
    });

    document.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeId = btn.dataset.open;
        render();
        document.querySelector('.sub-bubble.status')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.querySelectorAll('[data-student]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const r = active();
        if (!r) return;
        const n = Number(btn.dataset.student);
        const missing = [...(r.missing || [])];
        const meta={...(r.missingMeta||{})};
        const hist=[...(r.studentHistory||[])];
        const idx = missing.indexOf(n);
        if (idx >= 0) {
          missing.splice(idx,1);
          meta[n]={...(meta[n]||{}),returnedAt:new Date().toISOString()};
          hist.push({student:n,action:'returned',at:new Date().toISOString()});
        } else {
          missing.push(n);
          meta[n]={reason:meta[n]?.reason||'未交',note:meta[n]?.note||'',missingAt:new Date().toISOString()};
          hist.push({student:n,action:'missing',at:new Date().toISOString()});
        }
        missing.sort((a,b)=>a-b);
        await upsertRecord({...r, missing, missingMeta:meta, studentHistory:hist});
      });
    });

    document.querySelectorAll('[data-missing-reason]').forEach(el=>el.addEventListener('change',async()=>{const r=active();if(!r)return;const n=Number(el.dataset.missingReason),meta={...(r.missingMeta||{})};meta[n]={...(meta[n]||{}),reason:el.value};await upsertRecord({...r,missingMeta:meta})}));
    document.querySelectorAll('[data-missing-note]').forEach(el=>el.addEventListener('change',async()=>{const r=active();if(!r)return;const n=Number(el.dataset.missingNote),meta={...(r.missingMeta||{})};meta[n]={...(meta[n]||{}),note:el.value};await upsertRecord({...r,missingMeta:meta})}));
    document.querySelectorAll('[data-returned]').forEach(btn=>btn.addEventListener('click',async()=>{const r=active();if(!r)return;const n=Number(btn.dataset.returned),missing=(r.missing||[]).filter(x=>x!==n),meta={...(r.missingMeta||{})},hist=[...(r.studentHistory||[])];meta[n]={...(meta[n]||{}),returnedAt:new Date().toISOString()};hist.push({student:n,action:'returned',at:new Date().toISOString()});await upsertRecord({...r,missing,missingMeta:meta,studentHistory:hist})}));

    document.getElementById('sub-all-done')?.addEventListener('click', async () => {
      const r = active(); if (!r) return;
      const meta={...(r.missingMeta||{})},hist=[...(r.studentHistory||[])],now=new Date().toISOString();
      (r.missing||[]).forEach(n=>{meta[n]={...(meta[n]||{}),returnedAt:now};hist.push({student:n,action:'returned',at:now})});
      await upsertRecord({...r, missing:[],missingMeta:meta,studentHistory:hist});
    });

    document.getElementById('sub-all-missing')?.addEventListener('click', async () => {
      const r = active(); if (!r) return;
      await upsertRecord({...r, missing:Array.from({length:r.studentCount},(_,i)=>i+1)});
    });

    document.getElementById('sub-delete')?.addEventListener('click', async () => {
      const r = active(); if (!r) return;
      if (!confirm(`刪除「${r.name}」？`)) return;
      await removeRecord(r.id);
    });

    document.getElementById('sub-edit')?.addEventListener('click', async () => {
      const r = active(); if (!r) return;
      const name = prompt('名稱', r.name); if (name === null) return;
      const className = prompt('班別', r.className); if (className === null) return;
      const countRaw = prompt('學生人數', String(r.studentCount)); if (countRaw === null) return;
      const count = Math.max(1, Math.min(60, Number(countRaw) || r.studentCount));
      const missing = (r.missing || []).filter(n => n <= count);
      await upsertRecord({...r, name:name.trim()||r.name, className:className.trim()||r.className, studentCount:count, missing});
    });
  }



  function inferJournalDate(dayEl) {
    const dateText = dayEl?.querySelector('.day-heading b')?.textContent || '';
    const m = dateText.match(/(\d{1,2})月(\d{1,2})日/);
    if (!m) return hkDateString();

    const month = Number(m[1]);
    const day = Number(m[2]);

    const nowParts = hkDateString().split('-').map(Number);
    let year = nowParts[0];
    const currentMonth = nowParts[1];

    // School-year friendly inference for Aug-Jul views.
    if (currentMonth >= 8 && month < 8) year += 1;
    else if (currentMonth < 8 && month >= 8) year -= 1;

    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function journalSourceFromButton(btn) {
    const cell = btn.closest('td');
    const row = btn.closest('tr');
    const dayEl = btn.closest('.journal-day');
    const textarea = cell?.querySelector('textarea[aria-label*="功課"]');
    const subject = row?.querySelector('.subject-cell')?.textContent?.trim() || '';
    const issueDate = inferJournalDate(dayEl);
    const homework = textarea?.value?.trim() || '';
    const label = textarea?.getAttribute('aria-label') || '';
    const periodMatch = label.match(/第(\d+)節/);
    const period = periodMatch ? `第${periodMatch[1]}節` : '';
    const sourceKey = [issueDate, subject, period, homework].join('|');
    return { issueDate, subject, homework, period, sourceKey };
  }

  function isJournalRecordAdded(sourceKey) {
    return !!sourceKey && state.records.some(r => r.sourceKey === sourceKey);
  }

  function ensureJournalModal() {
    let modal = document.getElementById('journal-followup-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'journal-followup-modal';
    modal.className = 'journal-followup-modal';
    modal.innerHTML = `
      <div class="journal-followup-dialog">
        <h3>加入追收項目</h3>
        <p class="source" id="jf-source"></p>
        <div class="sub-grid">
          <div class="sub-field full"><label>功課名稱</label><input id="jf-name"></div>
          <div class="sub-field"><label>班別</label><input id="jf-class" list="jf-class-list" placeholder="例如：3A"><datalist id="jf-class-list"></datalist></div>
          <div class="sub-field"><label>學生人數</label><input id="jf-count" type="number" min="1" max="60" value="30"></div>
          <div class="sub-field"><label>派發日期</label><input id="jf-issue" type="date"></div>
          <div class="sub-field"><label>繳交日期</label><input id="jf-due" type="date"></div>
          <div class="sub-field full"><label>追收死線</label><input id="jf-deadline" type="date"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="sub-btn" id="jf-cancel">取消</button>
          <button type="button" class="sub-btn primary" id="jf-save">加入追收</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target === modal) closeJournalModal();
    });
    modal.querySelector('#jf-cancel')?.addEventListener('click', closeJournalModal);
    modal.querySelector('#jf-save')?.addEventListener('click', saveJournalFollowup);
    return modal;
  }

  function closeJournalModal() {
    document.getElementById('journal-followup-modal')?.classList.remove('open');
  }

  function openJournalModal(btn) {
    const src = journalSourceFromButton(btn);
    if (!src.homework) {
      toast('請先填寫功課內容', 'error');
      return;
    }
    if (isJournalRecordAdded(src.sourceKey)) {
      toast('這項功課已加入追收');
      return;
    }

    const modal = ensureJournalModal();
    modal.dataset.sourceKey = src.sourceKey;
    modal.dataset.subject = src.subject;
    modal.dataset.period = src.period;

    document.getElementById('jf-source').textContent =
      `${src.issueDate} ・ ${src.subject || '未有科目'}${src.period ? ' ・ ' + src.period : ''}`;
    document.getElementById('jf-name').value =
      `${src.subject ? src.subject + '｜' : ''}${src.homework}`;
    const prefs=knownClassPrefs(),classes=Object.keys(prefs).sort((a,b)=>a.localeCompare(b,'zh-HK'));
    const dl=document.getElementById('jf-class-list');
    if(dl)dl.innerHTML=classes.map(c=>`<option value="${esc(c)}"></option>`).join('');
    document.getElementById('jf-class').value = '';
    document.getElementById('jf-count').value = '30';
    attachClassAutoFill('jf-class','jf-count');
    document.getElementById('jf-issue').value = src.issueDate;
    document.getElementById('jf-due').value = src.issueDate;
    document.getElementById('jf-deadline').value = '';
    modal.classList.add('open');
  }

  async function saveJournalFollowup() {
    const modal = document.getElementById('journal-followup-modal');
    if (!modal) return;

    const name = document.getElementById('jf-name').value.trim();
    if (!name) return toast('請輸入功課名稱', 'error');

    const sourceKey = modal.dataset.sourceKey || '';
    if (isJournalRecordAdded(sourceKey)) {
      closeJournalModal();
      refreshJournalButtons();
      return toast('這項功課已加入追收');
    }

    await upsertRecord({
      id: id(),
      name,
      type: '作業',
      className: document.getElementById('jf-class').value.trim() || '班別',
      studentCount: Number(document.getElementById('jf-count').value) || 30,
      issueDate: document.getElementById('jf-issue').value,
      dueDate: document.getElementById('jf-due').value,
      deadlineDate: document.getElementById('jf-deadline').value,
      missing: [],
      sourceKey,
      sourceSubject: modal.dataset.subject || '',
      sourcePeriod: modal.dataset.period || ''
    });

    closeJournalModal();
    refreshJournalButtons();
    toast('已加入追收項目');
  }

  function refreshJournalButtons() {
    const homeworkAreas = document.querySelectorAll('.journal-table textarea[aria-label*="功課"]');

    homeworkAreas.forEach(textarea => {
      const cell = textarea.closest('td');
      if (!cell) return;
      cell.classList.add('journal-homework-cell');

      let btn = cell.querySelector('.journal-followup-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'journal-followup-btn';
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          openJournalModal(btn);
        });
        cell.appendChild(btn);
      }

      const src = journalSourceFromButton(btn);
      const added = !!src.homework && isJournalRecordAdded(src.sourceKey);
      btn.classList.toggle('added', added);
      btn.textContent = added ? '已加入 ✓' : '＋追收';
      btn.title = added ? '已加入追收項目' : '將這項功課加入追收';
    });
  }

  function installJournalScanner() {
    // Low-frequency scan only; no MutationObserver, to avoid interfering with React.
    refreshJournalButtons();
    window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!document.querySelector('.journal-table')) return;
      refreshJournalButtons();
    }, 1800);
  }

  window.__submissionTrackerAPI={
    getRecords:()=>state.records.map(r=>({...r})),
    getPendingCount:()=>{loadPending();return state.pendingCount},
    flushPending,
    open:showPage,
    openRecord:(id)=>{
      if(!id)return;
      state.activeId=id;
      showPage();
      render();
    }
  };
  window.addEventListener('online',()=>flushPending());

  window.addEventListener('firebase-auth-state', e => {
    if (e.detail?.user) {
      connectStorage().catch(err => console.warn('[Submission module] auth reconnect', err));
    }
  });

  async function start() {
    injectCss();
    ensurePage();
    ensureLauncher();
    ensureJournalModal();
    await connectStorage();
    installJournalScanner();
    console.info(`[Submission module] v${VERSION} ready`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();