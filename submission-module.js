(() => {
  'use strict';

  const VERSION = '2.8.3';
  const LOCAL_KEY = 'hk-school-submission-records-v1';
  const PENDING_KEY = 'hk-school-submission-pending-v1';
  const CLASS_PREF_KEY = 'hk-school-class-student-counts-v1';
  let COLORS = {
    cream: '#f8f1e6',
    cream2: '#efe1cf',
    caramel: '#9b6a3f',
    caramelDark: '#80542f',
    milk: '#fffdf9',
    line: '#e5dbd1',
    bg: '#faf7f2',
    danger: '#d64545',
    dangerBg: '#fff0ef',
    success: '#6f8f57',
    muted: '#85776d'
  };

  const DEFAULT_THEME_COLORS={...COLORS};

  function normalizeSubmissionTheme(theme={}){
    const accent=String(theme.accent||DEFAULT_THEME_COLORS.caramel);
    const soft=String(theme.soft||DEFAULT_THEME_COLORS.cream);
    const soft2=String(theme.soft2||theme.soft||DEFAULT_THEME_COLORS.cream2);
    const text=String(theme.text||accent);
    const line=String(theme.line||DEFAULT_THEME_COLORS.line);
    const bg=String(theme.bg||soft2||DEFAULT_THEME_COLORS.bg);
    return {name:String(theme.name||''),accent,soft,soft2,text,line,bg};
  }

  function applySubmissionTheme(theme={}){
    const t=normalizeSubmissionTheme(theme);
    COLORS={
      ...COLORS,
      cream:t.soft,
      cream2:t.soft2,
      caramel:t.accent,
      caramelDark:t.text,
      line:t.line,
      bg:t.bg
    };
    const old=document.getElementById('submission-module-style');
    if(old)old.remove();
    injectCss();
    try{localStorage.setItem('hk-school-theme-sync-v1',JSON.stringify(t))}catch{}
    return t;
  }

  window.__submissionThemeAPI={
    applyTheme:applySubmissionTheme,
    getTheme:()=>normalizeSubmissionTheme({
      accent:COLORS.caramel,
      soft:COLORS.cream,
      soft2:COLORS.cream2,
      text:COLORS.caramelDark,
      line:COLORS.line,
      bg:COLORS.bg
    })
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

  function isCompleted(r){
    const count=Number(r?.studentCount)||30;
    return (r?.submitted||[]).length>=count && !(r?.missing||[]).length;
  }

  function isExpired(r) {
    const ref = r.deadlineDate || r.dueDate || '';
    return !!ref && ref < hkDateString();
  }

  function isFollowupArchived(r){
    return r?.followupArchived===true;
  }

  function activeMissingNumbers(r){
    return (r?.missing||[]).filter(n=>r?.missingMeta?.[n]?.collectionStatus!=='closed');
  }

  function archivedMissingNumbers(r){
    return (r?.missing||[]).filter(n=>r?.missingMeta?.[n]?.collectionStatus==='closed');
  }

  function needsFollowup(r){
    return !isFollowupArchived(r) && activeMissingNumbers(r).length>0;
  }

  function isTodayRelevant(r){
    if(isFollowupArchived(r))return false;
    const today=hkDateString();
    const ref=String(r?.dueDate||r?.deadlineDate||r?.issueDate||'');
    return needsFollowup(r) && (!ref || ref<=today);
  }

  const FOLLOW_FILTER_KEY='hk-submission-filter-v1';
  function loadFollowFilters(){
    try{
      return {...{date:'all',className:'all',status:'all',type:'all'},...(JSON.parse(localStorage.getItem(FOLLOW_FILTER_KEY)||'{}')||{})};
    }catch{
      return {date:'all',className:'all',status:'all',type:'all'};
    }
  }
  function saveFollowFilters(v){
    try{localStorage.setItem(FOLLOW_FILTER_KEY,JSON.stringify(v||{}))}catch{}
  }
  function recordStatusKey(r){
    if(isFollowupArchived(r))return 'archived';
    if(isCompleted(r))return 'done';
    const active=activeMissingNumbers(r);
    if(active.some(n=>r?.missingMeta?.[n]?.collectionStatus==='unable'))return 'unable';
    if(active.length)return isExpired(r)?'expired':'followup';
    const count=Number(r?.studentCount)||30;
    const pending=Math.max(0,count-(r?.missing||[]).length-(r?.submitted||[]).length);
    return pending>0?'pending':'done';
  }
  function recordMatchesFollowFilters(r,f){
    if(f.date==='today' && !isTodayRelevant(r))return false;
    if(f.className!=='all' && r.className!==f.className)return false;
    if(f.type!=='all' && r.type!==f.type)return false;
    if(f.status!=='all' && recordStatusKey(r)!==f.status)return false;
    return true;
  }

  function normalizeRecord(r){
    const count=Math.max(1,Math.min(60,Number(r?.studentCount)||30));
    const statusVersion=Number(r?.statusVersion)||1;
    const missing=Array.isArray(r?.missing)?r.missing.map(Number).filter(n=>n>=1&&n<=count):[];
    let submitted=Array.isArray(r?.submitted)?r.submitted.map(Number).filter(n=>n>=1&&n<=count):[];

    // Only legacy v1 records infer "not missing = submitted".
    // New v2 records must preserve [] + [] as all-white / unprocessed.
    if(statusVersion<2 && !Array.isArray(r?.submitted) && Array.isArray(r?.missing)){
      const missSet=new Set(missing);
      submitted=Array.from({length:count},(_,i)=>i+1).filter(n=>!missSet.has(n));
    }

    const missSet=new Set(missing);
    submitted=[...new Set(submitted)].filter(n=>!missSet.has(n)).sort((a,b)=>a-b);

    return {
      id:r?.id||id(),
      statusVersion:statusVersion>=2?2:1,
      name:String(r?.name||''),
      type:String(r?.type||'作業'),
      className:String(r?.className||''),
      studentCount:count,
      issueDate:String(r?.issueDate||''),
      dueDate:String(r?.dueDate||''),
      deadlineDate:String(r?.deadlineDate||''),
      followupArchived:r?.followupArchived===true,
      followupArchivedAt:String(r?.followupArchivedAt||''),
      missing:[...new Set(missing)].sort((a,b)=>a-b),
      submitted,
      missingMeta:r?.missingMeta&&typeof r.missingMeta==='object'?r.missingMeta:{},
      studentHistory:Array.isArray(r?.studentHistory)?r.studentHistory:[],
      sourceKey:String(r?.sourceKey||''),
      sourceSubject:String(r?.sourceSubject||''),
      sourcePeriod:String(r?.sourcePeriod||''),
      createdAt:r?.createdAt||new Date().toISOString(),
      updatedAt:r?.updatedAt||new Date().toISOString()
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

  function normalizePendingQueue(q=[]){
    const map=new Map();
    for(const raw of Array.isArray(q)?q:[]){
      if(!raw||!raw.id)continue;
      const item={...raw,id:String(raw.id),op:raw.op==='delete'?'delete':'set'};
      map.set(item.id,item);
    }
    return [...map.values()];
  }
  function applyPendingQueueToRecords(records=[],queue=[]){
    const map=new Map((Array.isArray(records)?records:[]).map(r=>[String(r.id),normalizeRecord(r)]));
    for(const item of normalizePendingQueue(queue)){
      const id=String(item.id||'');if(!id)continue;
      if(item.op==='delete')map.delete(id);
      else map.set(id,normalizeRecord({...(map.get(id)||{}),...(item.data||{}),id}));
    }
    return [...map.values()];
  }
  function loadPending(){
    try{
      const q=normalizePendingQueue(JSON.parse(localStorage.getItem(PENDING_KEY)||'[]'));
      state.pendingCount=q.length;
      return q;
    }catch{state.pendingCount=0;return[]}
  }
  function savePending(q){
    const clean=normalizePendingQueue(q);
    try{localStorage.setItem(PENDING_KEY,JSON.stringify(clean));state.pendingCount=clean.length}catch{}
    renderStatus();
    window.dispatchEvent(new CustomEvent('submission-pending-changed',{detail:{count:state.pendingCount}}));
  }
  function queuePending(item){
    const q=loadPending();
    q.push(item);
    savePending(q);
  }
  function withSyncTimeout(promise,ms=7000){
    return Promise.race([
      promise,
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('submission sync timeout')),ms))
    ]);
  }

  let flushPromise=null;
  async function flushPending(){
    if(flushPromise)return flushPromise;
    if(!navigator.onLine||!state.usingFirestore)return;
    flushPromise=(async()=>{
      let q=loadPending(); if(!q.length)return;
      const remain=[];
      for(const item of q){
        try{
          if(item.op==='delete') await withSyncTimeout(collectionRef().doc(item.id).delete());
          else await withSyncTimeout(collectionRef().doc(item.id).set(item.data,{merge:true}));
        }catch{remain.push(item)}
      }
      savePending(remain);
    })().finally(()=>{flushPromise=null});
    return flushPromise;
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
        const cloud = snapshot.docs.map(doc => normalizeRecord({ id: doc.id, ...doc.data() }));
        state.records = applyPendingQueueToRecords(cloud, loadPending());
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


  function allStudentNumbers(count=30){
    const n=Math.max(1,Math.min(60,Number(count)||30));
    return Array.from({length:n},(_,i)=>i+1);
  }

  async function upsertRecordRaw(record) {
    const r = normalizeRecord({ ...record, updatedAt: new Date().toISOString() });
    const idx = state.records.findIndex(x => x.id === r.id);
    if (idx >= 0) state.records[idx] = r;
    else state.records.unshift(r);
    state.activeId = r.id;
    rememberClassPref(r.className,r.studentCount);
    saveLocal();
    render();
    try{window.dispatchEvent(new CustomEvent('submission-records-changed',{detail:{type:'save',id:r.id}}))}catch{}

    const cloudData = {
          statusVersion: r.statusVersion || 1,
          name: r.name,
          type: r.type,
          className: r.className,
          studentCount: r.studentCount,
          issueDate: r.issueDate,
          dueDate: r.dueDate,
          deadlineDate: r.deadlineDate,
          missing: r.missing,
          submitted: r.submitted || [],
          missingMeta: r.missingMeta || {},
          studentHistory: r.studentHistory || [],
          sourceKey: r.sourceKey || '',
          sourceSubject: r.sourceSubject || '',
          sourcePeriod: r.sourcePeriod || '',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
    // Queue first. Only remove this operation after Firestore confirms success.
    // This also covers Android/Chrome cases where navigator.onLine remains true
    // while Firestore is actually unreachable.
    queuePending({op:'set',id:r.id,data:cloudData});

    if (state.usingFirestore && navigator.onLine) {
      try {
        await withSyncTimeout(collectionRef().doc(r.id).set(cloudData, { merge: true }));
        const q=loadPending().filter(x=>!(x.op==='set'&&x.id===r.id));
        savePending(q);
      } catch (err) {
        console.warn('[Submission module] save kept in offline queue', err);
        toast('尚未同步，已保留待同步', 'error');
      }
    }
    return r;
  }

  async function removeRecordRaw(recordId) {
    state.records = state.records.filter(r => r.id !== recordId);
    if (state.activeId === recordId) state.activeId = state.records[0]?.id || null;
    saveLocal();
    render();
    try{window.dispatchEvent(new CustomEvent('submission-records-changed',{detail:{type:'delete',id:recordId}}))}catch{}
    // Same rule as save: queue first, clear only after confirmed cloud delete.
    queuePending({op:'delete',id:recordId});
    if (state.usingFirestore && navigator.onLine) {
      try {
        await withSyncTimeout(collectionRef().doc(recordId).delete());
        const q=loadPending().filter(x=>!(x.op==='delete'&&x.id===recordId));
        savePending(q);
      } catch (err) {
        console.warn('[Submission module] delete kept in offline queue', err);
        toast('刪除尚未同步，已保留待同步', 'error');
      }
    }
    return true;
  }

  async function upsertRecord(record){
    const svc=window.__schoolDataService;
    if(svc?.submissions?.save){
      try{return await svc.submissions.save(record)}
      catch(err){console.warn('[Submission module] data service save fallback',err)}
    }
    return upsertRecordRaw(record);
  }

  async function removeRecord(recordId){
    const svc=window.__schoolDataService;
    if(svc?.submissions?.remove){
      try{return await svc.submissions.remove(recordId)}
      catch(err){console.warn('[Submission module] data service delete fallback',err)}
    }
    return removeRecordRaw(recordId);
  }


  function localDateKey(d){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function isSchoolDay(dateStr){
    try{
      if(typeof window.__HK_IS_SCHOOL_DAY==='function'){
        return !!window.__HK_IS_SCHOOL_DAY(dateStr);
      }
      if(typeof window.__HK_GET_JOURNAL_DAY==='function'){
        const rows=window.__HK_GET_JOURNAL_DAY(dateStr);
        return Array.isArray(rows)&&rows.length>0;
      }
    }catch(e){
      console.warn('[Submission module] school-day lookup failed',dateStr,e);
    }

    // Compatibility fallback only if the journal resolver is unavailable.
    const d=new Date(`${dateStr}T12:00:00`);
    const day=d.getDay();
    return day>=1&&day<=5;
  }

  function nextSchoolDate(issueDate){
    if(!issueDate)return '';
    const d=new Date(`${issueDate}T12:00:00`);

    for(let i=0;i<45;i++){
      d.setDate(d.getDate()+1);
      const key=localDateKey(d);
      if(isSchoolDay(key))return key;
    }

    // Very defensive fallback: next weekday.
    const fallback=new Date(`${issueDate}T12:00:00`);
    do{fallback.setDate(fallback.getDate()+1)}while([0,6].includes(fallback.getDay()));
    return localDateKey(fallback);
  }

  function wireDueDateAuto(issueId,dueId){
    const issue=document.getElementById(issueId);
    const due=document.getElementById(dueId);
    if(!issue||!due)return;

    const refresh=()=>{
      if(due.dataset.userEdited==='1')return;
      due.value=nextSchoolDate(issue.value);
    };

    // Set initial default.
    refresh();

    issue.addEventListener('change',()=>{
      due.dataset.userEdited='';
      refresh();
    });

    due.addEventListener('input',()=>{
      due.dataset.userEdited='1';
    });
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
      .sub-bubble.follow{background:#fff3df;border-color:#e4d2c2}
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
      .sub-stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid ${COLORS.line};border-radius:10px;overflow:hidden;margin:7px 0}
      .sub-stat{padding:7px 3px;text-align:center;border-right:1px solid ${COLORS.line}}
      .sub-stat:last-child{border-right:0}.sub-stat span{display:block;font-size:9px;color:${COLORS.muted}}.sub-stat b{font-size:17px}.sub-stat.done b{color:${COLORS.success}}.sub-stat.missing b{color:${COLORS.danger}}
      .sub-students{display:grid;grid-template-columns:repeat(12,minmax(34px,1fr));gap:5px 3px;align-items:center;justify-items:center}
      .sub-student{width:36px;height:36px;padding:0;border-radius:50%;border:1.5px solid #d9c8ba;background:#fffdf8;color:${COLORS.caramelDark};font-size:11px;font-weight:800}
      .sub-student.missing{border-color:#e5a29e;background:${COLORS.dangerBg};color:${COLORS.danger}}
      .sub-missing-summary{margin-top:7px;padding:7px 9px;border:1px solid ${COLORS.line};border-radius:9px;background:#fffdf8;font-size:11px}
      .sub-missing-details{margin-top:7px;display:grid;gap:5px}
      .sub-missing-row{display:grid;grid-template-columns:62px 110px 1fr auto;gap:5px;align-items:center;padding:6px;border:1px solid ${COLORS.line};border-radius:8px;background:#fff}
      .sub-missing-row b{font-size:10px}.sub-missing-row small{font-size:8px;color:${COLORS.muted}}
      .sub-missing-row select,.sub-missing-row input{min-width:0;border:1px solid ${COLORS.line};border-radius:7px;padding:6px;font-size:9px;background:#fffdf8}
      .sub-repeat{font-size:8px;color:${COLORS.danger};font-weight:800}
      .sub-unable-btn{border-color:#d7c4a8!important;background:#fff8df!important;color:#8a642d!important}
      .sub-unable-btn.active{background:#f3dfae!important;border-color:#c79f57!important;color:#6e4b16!important}
      .sub-close-follow-btn{border-color:#d4b5b0!important;background:#fff3f0!important;color:#8b4f47!important}
      .sub-follow-history{margin-top:9px;border-top:1px dashed ${COLORS.line};padding-top:8px}
      .sub-follow-history summary{cursor:pointer;font-size:11px;font-weight:850;color:${COLORS.caramelDark}}
      .sub-follow-history-card{border:1px solid ${COLORS.line};border-radius:9px;background:#f8f4ee;padding:7px;margin-top:5px}
      .sub-follow-history-card .head{display:flex;justify-content:space-between;gap:6px;align-items:center}
      .sub-filter-bar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:7px 0}
      .sub-filter-bar label{display:grid;gap:3px;font-size:9px;font-weight:800;color:${COLORS.muted}}
      .sub-filter-bar select{width:100%;min-width:0;border:1px solid ${COLORS.line};border-radius:8px;background:#fffdf8;padding:7px;font-size:10px;color:${COLORS.caramelDark}}
      .sub-filter-summary{font-size:9px;color:${COLORS.muted};margin:2px 0 6px}
      .sub-archive-card{border:1px solid #d7cdc2;border-radius:10px;background:#f5f1eb;padding:8px 9px;margin-top:6px}
      .sub-archive-card .head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .sub-archive-tag{display:inline-block;border:1px solid #cfc2b5;border-radius:999px;padding:3px 7px;background:#ece4dc;color:#75675a;font-size:9px;font-weight:850;white-space:nowrap}
      @media(max-width:700px){.sub-filter-bar{grid-template-columns:repeat(2,minmax(0,1fr))}}

      .sub-student.closed{border-color:#cabdb0;background:#eee7df;color:#7a6d61}

      .sub-unable-note{font-size:8px;font-weight:800;color:#8a642d;margin-top:1px}


      .sub-follow-item,.sub-record{border:1px solid ${COLORS.line};border-radius:10px;background:#fffdf8;padding:8px 9px;margin-top:6px}
      .sub-follow-item{border-color:#e4d4c5;background:#faf5ee}
      .sub-item-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .sub-item-title{font-size:12px;font-weight:800}.sub-meta{margin-top:3px;color:${COLORS.muted};font-size:10px;line-height:1.4}
      .sub-tag{display:inline-block;border:1px solid #dcc8b8;border-radius:999px;padding:3px 7px;background:#f5eadc;color:${COLORS.caramelDark};font-size:10px;font-weight:800;white-space:nowrap}
      .sub-tag.red{border-color:#efc5c1;background:${COLORS.dangerBg};color:${COLORS.danger}}
      .sub-empty{padding:8px;text-align:center;color:${COLORS.muted};font-size:11px}
      .sub-history summary{cursor:pointer;font-size:12px;font-weight:800;color:${COLORS.caramelDark};list-style:none}.sub-history summary::-webkit-details-marker{display:none}
      .sub-storage{font-size:9px;color:${COLORS.muted};margin-left:auto}
      .journal-homework-cell{position:relative!important}
      .journal-followup-btn{position:absolute;right:4px;bottom:3px;z-index:3;border:1px solid #d9c8ba;border-radius:999px;background:#f7efe5;color:${COLORS.caramelDark};padding:2px 5px;font-size:7px;font-weight:800;line-height:1.2;box-shadow:0 1px 3px #0001}
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
      .today-submission-card{margin:10px 0 0;padding:9px 11px;border:1px solid #e4d2c2;border-radius:10px;background:#faf5ee;color:#5f4a3d}
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
    style.textContent += `
      .jf-items{display:grid;gap:6px}
      .jf-item{display:flex;align-items:flex-start;gap:8px;border:1px solid ${COLORS.line};border-radius:9px;background:#fffdf8;padding:8px}
      .jf-item input[type="checkbox"]{width:18px;height:18px;margin-top:1px;flex:0 0 auto}
      .jf-item-main{min-width:0;flex:1}
      .jf-item-name{font-size:12px;font-weight:800;color:${COLORS.caramelDark};white-space:pre-wrap;word-break:break-word}
      .jf-item-status{font-size:9px;color:${COLORS.muted};margin-top:2px}
      .jf-item.added{opacity:.62;background:#f4f1eb}
    `;
    style.textContent += `
      .sub-missing-details{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:7px!important;
        margin-top:8px!important;
      }
      .sub-missing-row{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:5px!important;
        align-content:start!important;
        min-width:0!important;
        border:1px solid ${COLORS.line}!important;
        border-radius:10px!important;
        background:#fffdf8!important;
        padding:8px!important;
      }
      .sub-missing-row>div:first-child{
        display:flex!important;
        justify-content:space-between!important;
        align-items:center!important;
        gap:5px!important;
      }
      .sub-missing-row select,
      .sub-missing-row input,
      .sub-missing-row button{
        width:100%!important;
        min-width:0!important;
      }
      .sub-missing-row .sub-repeat{
        font-size:8px!important;
        margin-top:0!important;
      }
      @media(max-width:900px){
        .sub-missing-details{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
      @media(max-width:700px){
        .sub-missing-details{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important}
        .sub-missing-row{padding:6px!important}
        .sub-missing-row select,
        .sub-missing-row input,
        .sub-missing-row button{font-size:9px!important;padding:5px!important}
      }
      @media(max-width:430px){
        .sub-missing-details{grid-template-columns:repeat(4,minmax(0,1fr))!important}
        .sub-missing-row{padding:5px!important}
        .sub-missing-row input{font-size:8px!important}
      }
    `;
    style.textContent += `
      .sub-student.pending{
        background:#fff!important;
        color:${COLORS.caramelDark}!important;
        border-color:${COLORS.line}!important;
      }
      .sub-student.submitted{
        background:#eef8ea!important;
        color:${COLORS.success}!important;
        border-color:#bcd7b2!important;
      }
      .sub-student.missing{
        background:${COLORS.dangerBg}!important;
        color:${COLORS.danger}!important;
        border-color:#e4b6ae!important;
      }
    `;
    style.textContent += `
      .sub-tag.pending{
        border-color:#d9d4cb!important;
        background:#fff!important;
        color:${COLORS.muted}!important;
      }
      .sub-tag.done{
        border-color:#bdd9b6!important;
        background:#eff8ec!important;
        color:${COLORS.success}!important;
      }
      .sub-missing-card select,
      .sub-missing-card input,
      .sub-missing-card button{
        font-size:9px!important;
        padding:5px!important;
        box-sizing:border-box!important;
      }
      @media(max-width:700px){
        .sub-missing-details{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          gap:4px!important;
        }
        .sub-missing-card{padding:5px!important}
      }
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
    let r = active();
    const filters=loadFollowFilters();
    const classes=[...new Set(state.records.map(x=>x.className).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-HK'));
    const types=[...new Set(state.records.map(x=>x.type).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-HK'));
    const visibleRecords=state.records.filter(x=>recordMatchesFollowFilters(x,filters));
    if(r && !visibleRecords.some(x=>x.id===r.id))r=visibleRecords[0]||null;
    const followups = visibleRecords.filter(needsFollowup);
    const current = visibleRecords.filter(x => !isFollowupArchived(x) && !isCompleted(x) && !isExpired(x));
    const historyDone = visibleRecords.filter(x => !isFollowupArchived(x) && isCompleted(x));
    const historyExpired = visibleRecords.filter(x => !isFollowupArchived(x) && !isCompleted(x) && isExpired(x));
    const historyArchived = visibleRecords.filter(isFollowupArchived);

    page.innerHTML = `
      <button type="button" class="submission-close" id="submission-close">✕ 關閉</button>
      <div class="sub-wrap">
        <section class="sub-bubble new">
          <div class="sub-title"><span class="sub-num">1</span> 新增回條／作業 <small style="opacity:.55">v2.4.30 三態</small><span class="sub-storage"></span></div>
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

        <section class="sub-bubble">
          <div class="sub-title"><span class="sub-num">2</span> 追收篩選</div>
          <div class="sub-filter-bar">
            <label>日期
              <select id="sub-filter-date">
                <option value="all" ${filters.date==='all'?'selected':''}>全部</option>
                <option value="today" ${filters.date==='today'?'selected':''}>今日要追收</option>
              </select>
            </label>
            <label>班別
              <select id="sub-filter-class">
                <option value="all">全部班別</option>
                ${classes.map(c=>`<option value="${esc(c)}" ${filters.className===c?'selected':''}>${esc(c)}</option>`).join('')}
              </select>
            </label>
            <label>狀態
              <select id="sub-filter-status">
                <option value="all" ${filters.status==='all'?'selected':''}>全部狀態</option>
                <option value="followup" ${filters.status==='followup'?'selected':''}>待追收</option>
                <option value="unable" ${filters.status==='unable'?'selected':''}>未能追收</option>
                <option value="pending" ${filters.status==='pending'?'selected':''}>未處理</option>
                <option value="done" ${filters.status==='done'?'selected':''}>已交齊</option>
                <option value="expired" ${filters.status==='expired'?'selected':''}>已過期</option>
                <option value="archived" ${filters.status==='archived'?'selected':''}>不再追收</option>
              </select>
            </label>
            <label>類別
              <select id="sub-filter-type">
                <option value="all">全部類別</option>
                ${types.map(t=>`<option value="${esc(t)}" ${filters.type===t?'selected':''}>${esc(t)}</option>`).join('')}
              </select>
            </label>
          </div>
          <div class="sub-filter-summary">符合篩選：${visibleRecords.length} 項</div>
        </section>

        <section class="sub-bubble follow">
          <div class="sub-title"><span class="sub-num">3</span> 今日追收</div>
          <div id="sub-follow-list">
            ${followups.length ? followups.map(x => followupHtml(x)).join('') : '<div class="sub-empty">今日沒有需要追收的項目。</div>'}
          </div>
        </section>

        <section class="sub-bubble status">
          <div class="sub-title"><span class="sub-num">4</span> 繳交狀況</div>
          ${state.records.length ? `
            <select id="sub-active" class="sub-select">
              ${visibleRecords.map(x => `<option value="${esc(x.id)}" ${x.id===r?.id?'selected':''}>${isFollowupArchived(x)?'［不再追收］':''}${esc(x.className)}｜${esc(x.type)}｜${esc(x.name)}</option>`).join('')}
            </select>
            ${r ? statusHtml(r) : ''}
          ` : '<div class="sub-empty">尚未有作業／回條紀錄。</div>'}
        </section>

        <section class="sub-bubble">
          <div class="sub-title">進行中紀錄</div>
          ${current.length ? current.map(recordHtml).join('') : '<div class="sub-empty">目前沒有進行中的紀錄。</div>'}
        </section>

        <section class="sub-bubble">
          <details class="sub-history" ${filters.status==='archived'?'open':''}>
            <summary>查看追收歷史（已交齊 ${historyDone.length}／已過期 ${historyExpired.length}／不再追收 ${historyArchived.length}）</summary>
            <div style="margin-top:7px">
              ${historyDone.length ? `<div class="sub-meta">已交齊</div>${historyDone.map(x => recordHtml(x,'已交齊')).join('')}` : ''}
              ${historyExpired.length ? `<div class="sub-meta" style="margin-top:8px">已過期</div>${historyExpired.map(x => recordHtml(x,'已過期')).join('')}` : ''}
              ${historyArchived.length ? `<div class="sub-meta" style="margin-top:8px">不再追收</div>${historyArchived.map(x => archivedRecordHtml(x)).join('')}` : ''}
              ${!historyDone.length && !historyExpired.length && !historyArchived.length ? '<div class="sub-empty">暫時未有追收歷史。</div>' : ''}
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
    const miss = activeMissingNumbers(r);
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
    const allMiss = r.missing || [];
    const miss = activeMissingNumbers(r);
    const archived = archivedMissingNumbers(r);
    const submitted = r.submitted || [];
    const count = r.studentCount || 30;
    const pendingCount=Math.max(0,count-allMiss.length-submitted.length);
    const unable=miss.filter(n=>r.missingMeta?.[n]?.collectionStatus==='unable');

    return `
      <div class="sub-stats">
        <div class="sub-stat"><span>全班</span><b>${count}</b></div>
        <div class="sub-stat done"><span>已交</span><b>${submitted.length}</b></div>
        <div class="sub-stat missing"><span>欠交</span><b>${allMiss.length}</b></div>
        <div class="sub-stat"><span>未處理</span><b>${pendingCount}</b></div>
      </div>
      <div class="sub-students">
        ${Array.from({length:count},(_,i)=>i+1).map(n => {
          const isClosed=archived.includes(n);
          const cls=isClosed?'closed':allMiss.includes(n)?'missing':submitted.includes(n)?'submitted':'pending';
          const label=isClosed?'欠交／不再追收':cls==='missing'?'欠交':cls==='submitted'?'已交':'未處理';
          return `<button class="sub-student ${cls}" data-student="${n}" aria-label="${n}號 ${label}" title="${label}">${pad(n)}</button>`;
        }).join('')}
      </div>
      <div class="sub-missing-summary">
        ${pendingCount?`<b>未處理 ${pendingCount} 人</b>`:'沒有未處理學生。'}
        ${miss.length?`<br><b style="color:${COLORS.danger}">待追收 ${miss.length} 人：</b> ${miss.map(pad).join('、')}`:''}
        ${unable.length?`<br><b style="color:#8a642d">未能追收 ${unable.length} 人：</b> ${unable.map(pad).join('、')}`:''}
        ${archived.length?`<br><b style="color:#75675a">不再追收 ${archived.length} 人：</b> ${archived.map(pad).join('、')}`:''}
      </div>
      ${miss.length?`<div class="sub-missing-details" style="display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important">${miss.map(n=>{const meta=r.missingMeta?.[n]||{};const repeat=repeatMissingCount(r,n);return `<div class="sub-missing-card" style="min-width:0;border:1px solid ${COLORS.line};border-radius:10px;background:#fffdf8;padding:6px;display:grid;gap:5px"><div style="display:flex;justify-content:space-between;gap:4px;align-items:center"><b>${pad(n)}號</b>${repeat>1?`<span class="sub-repeat">累計 ${repeat} 次</span>`:''}</div><select style="width:100%;min-width:0" data-missing-reason="${n}"><option ${meta.reason==='未交'?'selected':''}>未交</option><option ${meta.reason==='病假'?'selected':''}>病假</option><option ${meta.reason==='缺席'?'selected':''}>缺席</option><option ${meta.reason==='忘記'?'selected':''}>忘記</option><option ${meta.reason==='其他'?'selected':''}>其他</option></select><input style="width:100%;min-width:0" data-missing-note="${n}" value="${esc(meta.note||'')}" placeholder="備註">${meta.collectionStatus==='unable'?`<div class="sub-unable-note">已標記：未能追收${meta.unableAt?` ・ ${fmtDate(meta.unableAt.slice(0,10))}`:''}</div>`:''}<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><button style="width:100%" class="sub-btn" data-returned="${n}">已補交</button><button style="width:100%" class="sub-btn sub-unable-btn ${meta.collectionStatus==='unable'?'active':''}" data-unable="${n}">${meta.collectionStatus==='unable'?'✓ 未能追收':'未能追收'}</button></div></div>`}).join('')}</div>`:'<div class="sub-empty">目前沒有待追收學生。</div>'}
      ${archived.length?`
        <details class="sub-follow-history">
          <summary>舊版個別停止追收（${archived.length} 人）</summary>
          <div>
            ${archived.map(n=>{const meta=r.missingMeta?.[n]||{};return `<div class="sub-follow-history-card"><div class="head"><b>${pad(n)}號｜不再追收</b><button class="sub-btn" data-reopen-follow="${n}">重新追收</button></div><div class="sub-meta">欠交原因：${esc(meta.reason||'未交')}${meta.note?` ・ 備註：${esc(meta.note)}`:''}${meta.closedAt?` ・ 結束：${fmtDate(meta.closedAt.slice(0,10))}`:''}</div></div>`}).join('')}
          </div>
        </details>`:''}
      <div class="sub-actions">
        <button class="sub-btn" id="sub-all-done">全部已交</button>
        <button class="sub-btn danger" id="sub-all-missing">全部欠交</button>
        ${isFollowupArchived(r)
          ? '<button class="sub-btn" id="sub-reopen-record">重新追收</button>'
          : '<button class="sub-btn sub-close-follow-btn" id="sub-archive-record">不再追收</button>'}
        <button class="sub-btn" id="sub-edit">編輯項目</button>
        <button class="sub-btn danger" id="sub-delete">刪除</button>
      </div>`;
  }

  function archivedRecordHtml(r){
    const miss=(r.missing||[]).length;
    const unable=activeMissingNumbers(r).filter(n=>r?.missingMeta?.[n]?.collectionStatus==='unable').length;
    return `
      <div class="sub-archive-card">
        <div class="head">
          <div>
            <div class="sub-item-title">${esc(r.className)}｜${esc(r.name)}</div>
            <div class="sub-meta">${esc(r.type)} ・ 欠交 ${miss} 人${unable?` ・ 未能追收 ${unable} 人`:''}${r.followupArchivedAt?` ・ 封存 ${fmtDate(r.followupArchivedAt.slice(0,10))}`:''}</div>
          </div>
          <span class="sub-archive-tag">不再追收</span>
        </div>
        <div class="sub-actions">
          <button class="sub-btn" data-open="${esc(r.id)}">查看</button>
          <button class="sub-btn" data-reopen-record="${esc(r.id)}">重新追收</button>
        </div>
      </div>`;
  }

  function recordHtml(r, forced='') {
    const allMiss=(r.missing||[]).length;
    const activeMiss=activeMissingNumbers(r).length;
    const archivedMiss=archivedMissingNumbers(r).length;
    const miss=allMiss;
    const submitted=(r.submitted||[]).length;
    const count=r.studentCount||30;
    const pending=Math.max(0,count-miss-submitted);

    let label=forced;
    let tagClass='';

    if(!label){
      if(isFollowupArchived(r)){
        label='不再追收';
        tagClass='pending';
      }else if(activeMiss){
        label=`待追收 ${activeMiss}${archivedMiss?`／已結案 ${archivedMiss}`:''}`;
        tagClass='red';
      }else if(archivedMiss){
        label=`欠交 ${archivedMiss}／不再追收`;
        tagClass='pending';
      }else if(pending){
        label=`未處理 ${pending}`;
        tagClass='pending';
      }else{
        label='已交齊';
        tagClass='done';
      }
    }else if(forced==='已過期'){
      tagClass='red';
    }else if(forced==='已交齊'){
      tagClass='done';
    }

    return `
      <div class="sub-record">
        <div class="sub-item-top">
          <div>
            <div class="sub-item-title">${esc(r.name)}</div>
            <div class="sub-meta">${esc(r.className)}／${r.studentCount}人 ・ ${esc(r.type)} ・ 派發 ${fmtDate(r.issueDate)} ・ 繳交 ${fmtDate(r.dueDate)} ・ 追收 ${fmtDate(r.deadlineDate)}</div>
          </div>
          <span class="sub-tag ${tagClass}">${esc(label)}</span>
        </div>
        <div class="sub-actions"><button class="sub-btn" data-open="${esc(r.id)}">查看</button></div>
      </div>`;
  }

  function wireEvents() {
    document.getElementById('submission-close')?.addEventListener('click', hidePage);
    ['date','class','status','type'].forEach(key=>{
      document.getElementById(`sub-filter-${key}`)?.addEventListener('change',()=>{
        const f=loadFollowFilters();
        if(key==='class')f.className=document.getElementById('sub-filter-class')?.value||'all';
        else f[key]=document.getElementById(`sub-filter-${key}`)?.value||'all';
        saveFollowFilters(f);
        render();
      });
    });
    attachClassAutoFill('sub-class','sub-count');
    wireDueDateAuto('sub-issue','sub-due');
    document.getElementById('sub-create')?.addEventListener('click', async () => {
      const name = document.getElementById('sub-name').value.trim();
      if (!name) return toast('請輸入名稱', 'error');
      await upsertRecord({
        id: id(),
        statusVersion: 2,
        name,
        type: document.getElementById('sub-type').value,
        className: document.getElementById('sub-class').value.trim() || '班別',
        studentCount: Number(document.getElementById('sub-count').value) || 30,
        issueDate: document.getElementById('sub-issue').value,
        dueDate: document.getElementById('sub-due').value,
        deadlineDate: document.getElementById('sub-deadline').value,
        missing: [],
        submitted: []
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
        let missing=[...(r.missing||[])];
        let submitted=[...(r.submitted||[])];
        const meta={...(r.missingMeta||{})};
        const hist=[...(r.studentHistory||[])];
        const now=new Date().toISOString();

        if(r.missingMeta?.[n]?.collectionStatus==='closed')return;
        const isMissing=missing.includes(n);
        const isSubmitted=submitted.includes(n);

        if(isMissing){
          // Red -> Green
          missing=missing.filter(x=>x!==n);
          if(!submitted.includes(n))submitted.push(n);
          meta[n]={...(meta[n]||{}),returnedAt:now,collectionStatus:'',unableAt:'',closedAt:''};
      hist.push({student:n,action:'returned',at:now});
        }else if(isSubmitted){
          // Green -> Red
          submitted=submitted.filter(x=>x!==n);
          if(!missing.includes(n))missing.push(n);
          meta[n]={reason:meta[n]?.reason||'未交',note:meta[n]?.note||'',missingAt:now};
          hist.push({student:n,action:'missing',at:now});
        }else{
          // White -> Green on first tap
          submitted.push(n);
          hist.push({student:n,action:'submitted',at:now});
        }

        missing.sort((a,b)=>a-b);
        submitted.sort((a,b)=>a-b);
        await upsertRecord({...r,missing,submitted,missingMeta:meta,studentHistory:hist});
      });
    });

    document.querySelectorAll('[data-missing-reason]').forEach(el=>el.addEventListener('change',async()=>{const r=active();if(!r)return;const n=Number(el.dataset.missingReason),meta={...(r.missingMeta||{})};meta[n]={...(meta[n]||{}),reason:el.value};await upsertRecord({...r,missingMeta:meta})}));
    document.querySelectorAll('[data-missing-note]').forEach(el=>el.addEventListener('change',async()=>{const r=active();if(!r)return;const n=Number(el.dataset.missingNote),meta={...(r.missingMeta||{})};meta[n]={...(meta[n]||{}),note:el.value};await upsertRecord({...r,missingMeta:meta})}));
    document.querySelectorAll('[data-unable]').forEach(btn=>btn.addEventListener('click',async()=>{
      const r=active();if(!r)return;
      const n=Number(btn.dataset.unable);
      if(!(r.missing||[]).includes(n))return;
      const meta={...(r.missingMeta||{})};
      const hist=[...(r.studentHistory||[])];
      const now=new Date().toISOString();
      const isUnable=meta[n]?.collectionStatus==='unable';
      meta[n]={
        ...(meta[n]||{}),
        collectionStatus:isUnable?'':'unable',
        unableAt:isUnable?'':now
      };
      hist.push({student:n,action:isUnable?'resume-followup':'unable-to-collect',at:now});
      await upsertRecord({...r,missingMeta:meta,studentHistory:hist});
    }));

    document.getElementById('sub-archive-record')?.addEventListener('click',async()=>{
      const r=active();if(!r||isFollowupArchived(r))return;
      if(!confirm(`「${r.name}」會整項移到「不再追收」歷史，並由今日追收／進行中移走。欠交資料會完整保留。確定？`))return;
      const now=new Date().toISOString();
      const hist=[...(r.studentHistory||[]),{action:'archive-followup-record',at:now}];
      await upsertRecord({...r,followupArchived:true,followupArchivedAt:now,studentHistory:hist});
    });

    document.getElementById('sub-reopen-record')?.addEventListener('click',async()=>{
      const r=active();if(!r||!isFollowupArchived(r))return;
      const now=new Date().toISOString();
      const hist=[...(r.studentHistory||[]),{action:'reopen-followup-record',at:now}];
      await upsertRecord({...r,followupArchived:false,followupArchivedAt:'',studentHistory:hist});
    });

    document.querySelectorAll('[data-reopen-record]').forEach(btn=>btn.addEventListener('click',async()=>{
      const r=state.records.find(x=>x.id===btn.dataset.reopenRecord);if(!r)return;
      state.activeId=r.id;
      const now=new Date().toISOString();
      const hist=[...(r.studentHistory||[]),{action:'reopen-followup-record',at:now}];
      await upsertRecord({...r,followupArchived:false,followupArchivedAt:'',studentHistory:hist});
    }));

    document.querySelectorAll('[data-returned]').forEach(btn=>btn.addEventListener('click',async()=>{
      const r=active();if(!r)return;
      const n=Number(btn.dataset.returned);
      const now=new Date().toISOString();
      const missing=(r.missing||[]).filter(x=>x!==n);
      const submitted=[...(r.submitted||[])];
      if(!submitted.includes(n))submitted.push(n);
      submitted.sort((a,b)=>a-b);
      const meta={...(r.missingMeta||{})};
      const hist=[...(r.studentHistory||[])];
      meta[n]={...(meta[n]||{}),returnedAt:now,collectionStatus:'',unableAt:'',closedAt:''};
      hist.push({student:n,action:'returned',at:now});
      await upsertRecord({...r,missing,submitted,missingMeta:meta,studentHistory:hist});
    }));

    document.getElementById('sub-all-done')?.addEventListener('click', async () => {
      const r=active();if(!r)return;
      const now=new Date().toISOString();
      const count=r.studentCount||30;
      const submitted=allStudentNumbers(count);
      const hist=[...(r.studentHistory||[])];
      hist.push({action:'all-submitted',at:now});
      await upsertRecord({...r,missing:[],submitted,studentHistory:hist});
    });

    document.getElementById('sub-all-missing')?.addEventListener('click', async () => {
      const r=active();if(!r)return;
      const now=new Date().toISOString();
      const count=r.studentCount||30;
      const missing=allStudentNumbers(count);
      const meta={...(r.missingMeta||{})};
      const hist=[...(r.studentHistory||[])];
      missing.forEach(n=>{
        meta[n]={reason:meta[n]?.reason||'未交',note:meta[n]?.note||'',missingAt:meta[n]?.missingAt||now};
      });
      hist.push({action:'all-missing',at:now});
      await upsertRecord({...r,missing,submitted:[],missingMeta:meta,studentHistory:hist});
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


  function splitJournalHomeworkLines(text=''){
    return String(text||'')
      .split(/\r?\n|\r/g)
      .map(x=>x.trim())
      .filter(Boolean);
  }

  function journalHomeworkLineSourceKey(issueDate='',subject='',period='',homework=''){
    return [issueDate,subject,period,homework].join('|');
  }

  function journalSourceFromButton(btn) {
    const cell = btn.closest('td');
    const row = btn.closest('tr');
    const dayEl = btn.closest('.journal-day');
    const textarea = cell?.querySelector('textarea[aria-label*="功課"]');
    const subject = row?.querySelector('.subject-cell')?.textContent?.trim() || '';
    const issueDate = inferJournalDate(dayEl);
    const homework = textarea?.value?.trim() || '';
    const homeworkLines = splitJournalHomeworkLines(homework);
    const label = textarea?.getAttribute('aria-label') || '';
    const periodMatch = label.match(/第(\d+)節/);
    const period = periodMatch ? `第${periodMatch[1]}節` : '';
    const sourceKey = [issueDate, subject, period, homework].join('|');
    return { issueDate, subject, homework, homeworkLines, period, sourceKey };
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
        <h3>加入追收項目 <small style="font-size:.65em;opacity:.55">v2.2.4 分行模式</small></h3>
        <p class="source" id="jf-source"></p>
        <div class="sub-grid">
          <div class="sub-field full">
            <label>功課項目（每個換行＝一份獨立追收）</label>
            <div id="jf-items" class="jf-items"></div>
          </div>
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
    wireDueDateAuto('jf-issue','jf-due');
    return modal;
  }

  function closeJournalModal() {
    document.getElementById('journal-followup-modal')?.classList.remove('open');
  }

  function openJournalModal(btn) {
    const src = journalSourceFromButton(btn);
    if (!src.homeworkLines.length) {
      toast('請先填寫功課內容', 'error');
      return;
    }

    const modal = ensureJournalModal();
    modal.dataset.subject = src.subject;
    modal.dataset.period = src.period;
    modal.dataset.issueDate = src.issueDate;

    document.getElementById('jf-source').textContent =
      `${src.issueDate} ・ ${src.subject || '未有科目'}${src.period ? ' ・ ' + src.period : ''}`;

    const items=document.getElementById('jf-items');
    items.innerHTML=src.homeworkLines.map((line,idx)=>{
      const key=journalHomeworkLineSourceKey(src.issueDate,src.subject,src.period,line);
      const added=isJournalRecordAdded(key);
      return `<label class="jf-item ${added?'added':''}">
        <input type="checkbox"
          data-jf-line="${esc(line)}"
          data-jf-source-key="${esc(key)}"
          ${added?'disabled':'checked'}>
        <div class="jf-item-main">
          <div class="jf-item-name">${esc(line)}</div>
          <div class="jf-item-status">${added?'已加入追收':`第 ${idx+1} 項・將建立獨立追收紀錄`}</div>
        </div>
      </label>`;
    }).join('');

    const prefs=knownClassPrefs(),classes=Object.keys(prefs).sort((a,b)=>a.localeCompare(b,'zh-HK'));
    const dl=document.getElementById('jf-class-list');
    if(dl)dl.innerHTML=classes.map(c=>`<option value="${esc(c)}"></option>`).join('');

    document.getElementById('jf-class').value = '';
    document.getElementById('jf-count').value = '30';
    attachClassAutoFill('jf-class','jf-count');

    document.getElementById('jf-issue').value = src.issueDate;
    document.getElementById('jf-due').dataset.userEdited = '';
    document.getElementById('jf-due').value = nextSchoolDate(src.issueDate);
    document.getElementById('jf-deadline').value = '';

    modal.classList.add('open');
  }

  async function saveJournalFollowup() {
    const modal = document.getElementById('journal-followup-modal');
    if (!modal) return;

    const selected=[...modal.querySelectorAll('#jf-items input[type="checkbox"]:checked:not(:disabled)')];
    if(!selected.length)return toast('請至少選擇一份未加入嘅功課', 'error');

    const className=document.getElementById('jf-class').value.trim() || '班別';
    const studentCount=Number(document.getElementById('jf-count').value) || 30;
    const issueDate=document.getElementById('jf-issue').value;
    const dueDate=document.getElementById('jf-due').value;
    const deadlineDate=document.getElementById('jf-deadline').value;
    const subject=modal.dataset.subject || '';
    const period=modal.dataset.period || '';

    let addedCount=0;

    for(const checkbox of selected){
      const homework=checkbox.dataset.jfLine||'';
      // Rebuild with current issue date in case teacher changed it in modal.
      const sourceKey=journalHomeworkLineSourceKey(issueDate,subject,period,homework);
      if(isJournalRecordAdded(sourceKey))continue;

      await upsertRecord({
        id:id(),
        statusVersion:2,
        name:`${subject ? subject + '｜' : ''}${homework}`,
        type:'作業',
        className,
        studentCount,
        issueDate,
        dueDate,
        deadlineDate,
        missing:[],
        submitted:[],
        sourceKey,
        sourceSubject:subject,
        sourcePeriod:period
      });
      addedCount++;
    }

    closeJournalModal();
    refreshJournalButtons();

    if(addedCount===1)toast('已加入 1 份功課追收');
    else toast(`已加入 ${addedCount} 份功課追收`);
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
      const lines=src.homeworkLines||[];
      const addedCount=lines.filter(line=>
        isJournalRecordAdded(journalHomeworkLineSourceKey(src.issueDate,src.subject,src.period,line))
      ).length;
      const allAdded=lines.length>0&&addedCount===lines.length;
      const someAdded=addedCount>0&&!allAdded;

      btn.classList.toggle('added',allAdded);
      btn.textContent=allAdded
        ? '已加入 ✓'
        : someAdded
          ? `＋追收 ${addedCount}/${lines.length}`
          : lines.length>1
            ? `＋追收（${lines.length}份）`
            : '＋追收';

      btn.dataset.homeworkCount=String(lines.length);
      btn.title=allAdded
        ? `全部 ${lines.length} 份功課已加入追收`
        : lines.length>1
          ? `新版分行追收：偵測到 ${lines.length} 份功課；每個換行會建立獨立追收`
          : '新版分行追收：將這項功課加入追收';
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

  async function ensureOnlineSync(){
    if(!navigator.onLine)return false;
    if(!state.usingFirestore||!state.user){
      await connectStorage();
      return !!state.usingFirestore;
    }
    await flushPending();
    return true;
  }

  window.__submissionTrackerAPI={
    version:2,
    getRecords:()=>state.records.map(r=>({...r})),
    getById:(id)=>state.records.find(r=>r.id===id)||null,
    findBySourceKey:(key)=>state.records.find(r=>r.sourceKey===key)||null,
    getPendingCount:()=>{loadPending();return state.pendingCount},
    saveInternal:upsertRecordRaw,
    removeInternal:removeRecordRaw,
    save:upsertRecord,
    remove:removeRecord,
    flushPending,
    ensureOnlineSync,
    open:showPage,
    openRecord:(id)=>{
      if(!id)return;
      state.activeId=id;
      showPage();
      render();
    }
  };
  window.addEventListener('online',()=>ensureOnlineSync().catch(err=>console.warn('[Submission module] online reconnect',err)));

  window.addEventListener('firebase-auth-state', e => {
    if (e.detail?.user) {
      connectStorage().catch(err => console.warn('[Submission module] auth reconnect', err));
    }
  });

  async function start() {
    try{
      const saved=JSON.parse(localStorage.getItem('hk-school-theme-sync-v1')||'null');
      if(saved)applySubmissionTheme(saved);
      else injectCss();
    }catch{injectCss()}
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