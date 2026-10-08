(() => {
  'use strict';

  const VERSION = '2.8.2';
  const ACTIVITY_LOCAL_KEY = 'hk-school-calendar-activity-logs-v1';
  const ACTIVITY_PENDING_KEY = 'hk-school-calendar-activity-pending-v1';
  const PENDING_LOCAL_KEY = 'hk-school-pending-items-v1';
  const PENDING_QUEUE_KEY = 'hk-school-pending-items-queue-v1';
  const CAL_TAG_VIS_KEY = 'hk-school-calendar-tag-visibility-v1';
  const PLANNER_LOCAL_KEY = 'hk-school-planner-v3';
  const CLASS_CORE_LOCAL_KEY = 'hk-school-class-core-v2';
  const CLASS_CORE_QUEUE_KEY = 'hk-school-class-core-queue-v2';
  const IDENTITY_V1_KEY = 'hk-school-identity-v1';
  const ACTIVE_CLASS_KEY = 'hk-school-active-class-v2';
  const INBOX_VIEW_STATE_KEY = 'hk-school-inbox-view-state-v1';
  const state = {
    user: null,
    submissions: [],
    activities: [],
    pendingItems: [],
    classCore: [],
    identityV1: null,
    activeWorkspaceClass: '',
    unsubClassCore: null,
    pendingQueueCount: 0,
    firebaseReady: false,
    sync: 'connecting',
    unsubSubmissions: null,
    unsubActivities: null,
    unsubPending: null,
    connectRetryTimer: null,
    connecting: false,
    swControllerChanged: false
  };

  // Calendar sources mirrored from this timetable build so the Today dashboard
  // can read calendar choices without modifying React's internal DOM/state.
  const PREP_CYCLES = [["A",["22/9","20/10","1/12","5/1","2/3","13/4","4/5"],["P.1\u4E2D","P.2\u4E2D","P.6\u5E38","P.3\u82F1NET"],["P.1\u82F1","P.2\u82F1","P.3\u5E38","P.6\u4E2D"],["P.5\u82F1","P.1\u6578","P.2\u6578","P.2\u82F1NET"]],["B",["6/10","27/10","8/12","12/1","23/3","20/4","11/5"],["P.3\u4E2D","P.5\u4E2D","P.4\u79D1","P.6\u82F1NET"],["P.3\u82F1","P.6\u82F1","P.1\u79D1"],["P.3\u6578","P.1\u4EBA","P.2\u4EBA","P.4\u82F1NET"]],["C",["13/10","3/11","15/12","23/2","6/4","27/4","18/5"],["P.4\u4E2D","P.4\u4EBA","P.5\u4EBA","P.5\u6578"],["P.4\u82F1","P.5\u79D1","P.4\u6578","P.1\u82F1NET"],["P.6\u6578","P.2\u79D1","P.5\u82F1NET"]]];
  const DEFAULT_SCHOOL_EVENTS = [...[{start:"2026-09-01",title:"\u4E0A\u5B78\u671F\u958B\u8AB2\u65E5",type:"special"},{start:"2026-09-18",title:"\u958B\u5B78\u7948\u79B1\u79AE\uFF08\u7B2C3\u20134\u7BC0\uFF09",type:"religious"},{start:"2026-09-26",title:"\u4E2D\u79CB\u7BC0\u7FCC\u65E5",type:"holiday"},{start:"2026-10-01",title:"\u570B\u6176\u65E5",type:"holiday"},{start:"2026-10-02",title:"\u5B78\u6821\u5047\u671F",type:"holiday"},{start:"2026-10-18",title:"\u91CD\u967D\u7BC0",type:"holiday"},{start:"2026-10-19",title:"\u91CD\u967D\u7BC0\u7FCC\u65E5",type:"holiday"},{start:"2026-11-12",end:"2026-11-16",title:"\u7B2C\u4E00\u6B21\u8003\u8A66 P.1\u20136",type:"special"},{start:"2026-11-26",title:"\u5B78\u6821\u65C5\u884C",type:"special"},{start:"2026-11-27",title:"\u8475\u6D8C\u5340\u6559\u5E2B\u767C\u5C55\u65E5",type:"special"},{start:"2026-12-04",title:"\u8475\u9752\u5929\u4E3B\u6559\u5B78\u6821\u4E2D\u5C0F\u5B78\u8A2A\u6821\u4EA4\u6D41",type:"special"},{start:"2026-12-08",title:"\u8056\u6BCD\u7121\u539F\u7F6A\u77BB\u79AE",type:"religious"},{start:"2026-12-19",title:"\u6D3E\u767C\u6210\u7E3E\u8868\u53CA\u5BB6\u9577\u65E5",type:"special"},{start:"2026-12-21",title:"\u8056\u8A95\u806F\u6B61\u6703\u53CA\u7948\u79B1\u79AE",type:"special"},{start:"2026-12-22",end:"2027-01-04",title:"\u8056\u8A95\u53CA\u65B0\u66C6\u5143\u65E6\u5047\u671F",type:"holiday"},{start:"2027-01-18",end:"2027-01-22",title:"\u4E3B\u984C\u5B78\u7FD2\u9031\u53CA\u6210\u679C\u5C55\u793A",type:"special"},{start:"2027-01-20",end:"2027-02-02",title:"\u6D3B\u52D5\u65E5",type:"special"},{start:"2027-01-25",title:"\u8056\u9B91\u601D\u9AD8\u77BB\u79AE\uFF08\u7B2C2\u20133\u7BC0\uFF09",type:"religious"},{start:"2027-01-27",end:"2027-01-29",title:"P.4\u5883\u5916\u4EA4\u6D41\uFF0FP.5\u8A13\u7DF4\uFF0FP.6\u6559\u80B2\u71DF",type:"special"},{start:"2027-02-01",title:"\u4E0B\u5B78\u671F\u958B\u8AB2\u65E5",type:"special"},{start:"2027-02-02",title:"\u4E2D\u83EF\u6587\u5316\u65E5",type:"special"},{start:"2027-02-03",end:"2027-02-14",title:"\u8FB2\u66C6\u65B0\u5E74\u5047\u671F",type:"holiday"},{start:"2027-02-17",title:"P.3\u20136\u9678\u904B\u6703",type:"special"},{start:"2027-02-18",title:"P.1\u20132\u7AF6\u6280\u65E5",type:"special"},{start:"2027-02-19",title:"\u904B\u52D5\u6703\u5F8C\u4E00\u5929\u5047\u671F",type:"holiday"},{start:"2027-02-19",end:"2027-02-20",title:"\u6148\u5E7C\u6703\u5B78\u6821\u6821\u76E3\u3001\u6821\u9577\u9748\u4FEE\u71DF",type:"special"},{start:"2027-03-11",end:"2027-03-15",title:"\u7B2C\u4E8C\u6B21\u8003\u8A66 P.1\u20136",type:"special"},{start:"2027-03-20",title:"\u806F\u6821\u516C\u6559\u6559\u5E2B\u9000\u7701",type:"special"},{start:"2027-03-26",end:"2027-04-04",title:"\u5FA9\u6D3B\u7BC0\u5047\u671F",type:"holiday"},{start:"2027-04-05",title:"\u6E05\u660E\u7BC0",type:"holiday"},{start:"2027-04-14",title:"\u5FA9\u6D3B\u7948\u79B1\u79AE\uFF08\u7B2C3\u20134\u7BC0\uFF09",type:"religious"},{start:"2027-04-17",title:"\u6D3E\u767C\u6210\u7E3E\u8868\u53CA\u5BB6\u9577\u65E5",type:"special"},{start:"2027-04-23",title:"\u6559\u5E2B\u767C\u5C55\u65E5",type:"special"},{start:"2027-04-24",title:"\u5C0F\u5B78\u6148\u9752\u65E5",type:"special"},{start:"2027-05-01",title:"\u52DE\u52D5\u7BC0",type:"holiday"},{start:"2027-05-04",end:"2027-05-05",title:"P.3 TSA\u8AAA\u8A71\u8A55\u4F30",type:"special"},{start:"2027-05-07",title:"\u980C\u89AA\u6069\u665A\u6703",type:"special"},{start:"2027-05-11",end:"2027-05-12",title:"P.6 TSA\u8AAA\u8A71\u8A55\u4F30",type:"special"},{start:"2027-05-13",title:"\u4F5B\u8A95",type:"holiday"},{start:"2027-05-14",title:"\u6559\u5E2B\u767C\u5C55\u65E5",type:"special"},{start:"2027-05-24",title:"\u8056\u6BCD\u9032\u6559\u4E4B\u4F51\u77BB\u79AE",type:"religious"},{start:"2027-06-03",end:"2027-06-07",title:"\u7B2C\u4E09\u6B21\u8003\u8A66 P.1\u20136",type:"special"},{start:"2027-06-09",title:"\u7AEF\u5348\u7BC0",type:"holiday"},{start:"2027-06-14",end:"2027-06-15",title:"P.3\u53CAP.6 TSA\u7D19\u7B46\u8A55\u4F30",type:"special"},{start:"2027-06-21",title:"P.6\u7562\u696D\u611F\u6069\u796D",type:"religious"},{start:"2027-06-23",end:"2027-07-13",title:"\u6D3B\u52D5\u65E5",type:"special"},{start:"2027-06-25",title:"\u5B78\u85DD\u6210\u5C31\u9812\u734E\u79AE",type:"special"},{start:"2027-06-30",title:"\u7562\u696D\u5178\u79AE",type:"special"},{start:"2027-07-01",title:"\u9999\u6E2F\u7279\u5225\u884C\u653F\u5340\u6210\u7ACB\u7D00\u5FF5\u65E5",type:"holiday"},{start:"2027-07-05",title:"\u7D50\u696D\u79AE",type:"special"},{start:"2027-07-06",title:"\u5347\u4E2D\u6D3E\u4F4D",type:"special"},{start:"2027-07-07",title:"\u7D50\u696D\u79AE",type:"special"},{start:"2027-07-12",title:"\u6D3E\u767C\u6210\u7E3E\u8868\u53CA\u5BB6\u9577\u65E5",type:"special"},{start:"2027-07-14",end:"2027-08-31",title:"\u6691\u5047",type:"holiday"}], ...[{start:"2026-08-27",title:"\u958B\u5B78\u5F4C\u6492 13:00\u201313:45",type:"religious"},{start:"2026-10-26",title:"\u516C\u6559\u8077\u54E1\u5DE5\u4F5C\u574A(I)\uFF1AAI 16:00\u201317:00",type:"religious"},{start:"2026-11-30",title:"\u516C\u6559\u8077\u54E1\u5DE5\u4F5C\u574A(II)\uFF1A\u4E94\u5927\u6838\u5FC3\u50F9\u503C 15:30\u201316:15",type:"religious"},{start:"2026-12-09",title:"\u8056\u6BCD\u7121\u539F\u7F6A\u77BB\u79AE\uFF08\u7B2C3\u20134\u7BC0\uFF09",type:"religious"},{start:"2026-12-21",title:"\u8056\u8A95\u7948\u79B1\u79AE 08:30\u201309:00",type:"religious"},{start:"2027-01-25",title:"\u516C\u6559\u8077\u54E1\u5DE5\u4F5C\u574A(IV)\uFF1A\u8056\u9B91\u601D\u9AD8\u9748\u4FEE 14:00\u201315:00",type:"religious"},{start:"2027-03-22",title:"\u516C\u6559\u8077\u54E1\u56DB\u65EC\u671F\u6D3B\u52D5 15:30\u201316:15",type:"religious"},{start:"2027-05-24",title:"\u9032\u6559\u4E4B\u4F51\u5F4C\u6492 15:45\u201316:30",type:"religious"},{start:"2027-05-26",title:"\u9032\u6559\u4E4B\u4F51\u77BB\u79AE\uFF08\u7B2C3\u20134\u7BC0\uFF09",type:"religious"},{start:"2027-07-05",title:"P.4\u20136\u7D50\u696D\u79AE\u611F\u6069\u7948\u79B1 09:30\u201310:00",type:"religious"},{start:"2027-07-07",title:"P.1\u20133\u7D50\u696D\u79AE\u611F\u6069\u7948\u79B1 09:30\u201310:00",type:"religious"},{start:"2027-07-07",title:"\u5168\u9AD4\u8077\u54E1\u7D50\u696D\u8B1D\u6069\u7948\u79B1\u6703 14:00\u201315:00",type:"religious"}], ...[{start:"2026-08-31",title:"\u7B2C1\u9031\uFF5C\u73ED\u7D1A\u7D93\u71DF\u6D3B\u52D51\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2026-09-14",title:"\u7B2C3\u9031\uFF5C\u5C0F\u6D77\u8C5A\u8A02\u76EE\u6A19\uFF08\u5BB6\uFF09",type:"homeroom"},{start:"2026-09-21",title:"\u7B2C4\u9031\uFF5C\u793E\u4EA4\u60C5\u610F\u8AB21\uFF08\u5F64\uFF09",type:"homeroom"},{start:"2026-09-28",title:"\u7B2C5\u9031\uFF5C\u7559\u7D66P.1\u73ED\u4E3B\u4EFB\u8A13\u7DF4\u5B78\u751F\u767E\u65E5\u5BB4",type:"homeroom"},{start:"2026-10-05",title:"\u7B2C6\u9031\uFF5C\u914D\u5408\u7CBE\u795E\u5065\u5EB7\u65E5\uFF08\u73ED\u7D1A\u7D93\u71DF\u8AB22\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2026-10-12",title:"\u7B2C7\u9031\uFF5C\u793E\u4EA4\u60C5\u610F\u8AB22\uFF08\u5F64\uFF09",type:"homeroom"},{start:"2026-10-19",title:"\u7B2C8\u9031\uFF5C\u7559\u7D66P.1\u73ED\u4E3B\u4EFB\u8A13\u7DF4\u5B78\u751F\u767E\u65E5\u5BB4",type:"homeroom"},{start:"2026-10-26",title:"\u7B2C9\u9031\uFF5C\u7559\u7D66P.1\u73ED\u4E3B\u4EFB\u8A13\u7DF4\u5B78\u751F\u767E\u65E5\u5BB4",type:"homeroom"},{start:"2026-11-09",title:"\u7B2C11\u9031\uFF5C\u7559\u7D66\u73ED\u4E3B\u4EFB\u9810\u509926/11\u5B78\u751F\u65C5\u884C",type:"homeroom"},{start:"2026-11-23",title:"\u7B2C13\u9031\uFF5C\u7559\u7D66\u73ED\u4E3B\u4EFB\u9810\u509926/11\u5B78\u751F\u65C5\u884C",type:"homeroom"},{start:"2026-11-30",title:"\u7B2C14\u9031\uFF5C\u793E\u4EA4\u60C5\u610F\u8AB23\uFF08\u5F64\uFF09",type:"homeroom"},{start:"2026-12-07",title:"\u7B2C15\u9031\uFF5C\u914D\u5408\u4E3B\u984C\u5B78\u7FD2\u9031\u6D3B\u52D5\uFF08\u73ED\u7D1A\u7D93\u71DF\u8AB23\uFF09",type:"homeroom"},{start:"2026-12-14",title:"\u7B2C16\u9031\uFF5C\u7559\u7D66\u73ED\u4E3B\u4EFB\u9810\u5099\u8056\u8A95\u806F\u6B61\u6703",type:"homeroom"},{start:"2027-01-04",title:"\u7B2C19\u9031\uFF5C\u7559\u7D66P.3-P.6\u73ED\u4E3B\u4EFB\u9810\u5099\u9678\u904B\u6703",type:"homeroom"},{start:"2027-01-11",title:"\u7B2C20\u9031\uFF5C\u7559\u7D66\u73ED\u4E3B\u4EFB\u9810\u5099\u7AF6\u6280\u65E5\uFF0F\u9678\u904B\u6703",type:"homeroom"},{start:"2027-01-11",title:"\u7B2C20\u9031\uFF5CP.5\u300C\u667A\u9192\u6821\u5712\u300D\u8AB2\u5802\u5F0F\u5B88\u6CD5\u6559\u80B2\u6D3B\u52D5\uFF08\u6027\u5371\u6A5F\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-02-22",title:"\u4E0B\u5B78\u671F\u7B2C4\u9031\uFF5CP.3-P.6\u6301\u4EFD\u8005\u554F\u5377\uFF08\u73CA\uFF09",type:"homeroom"},{start:"2027-03-01",title:"\u4E0B\u5B78\u671F\u7B2C5\u9031\uFF5CP.5\u300C\u667A\u9192\u6821\u5712\u300D\u8AB2\u5802\u5F0F\u5B88\u6CD5\u6559\u80B2\u6D3B\u52D5\uFF08\u6027\u5371\u6A5F\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-03-22",title:"\u4E0B\u5B78\u671F\u7B2C8\u9031\uFF5CP.3\u300C\u667A\u9192\u6821\u5712\u300D\u8AB2\u5802\u5F0F\u5B88\u6CD5\u6559\u80B2\u6D3B\u52D5\uFF08\u66B4\u529B\u6B3A\u51CC\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-04-05",title:"\u4E0B\u5B78\u671F\u7B2C10\u9031\uFF5CP.3-P.6 APASO\u60C5\u610F\u554F\u5377\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-04-12",title:"\u4E0B\u5B78\u671F\u7B2C11\u9031\uFF5CP.3\u300C\u667A\u9192\u6821\u5712\u300D\u8AB2\u5802\u5F0F\u5B88\u6CD5\u6559\u80B2\u6D3B\u52D5\uFF08\u66B4\u529B\u6B3A\u51CC\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-04-19",title:"\u4E0B\u5B78\u671F\u7B2C12\u9031\uFF5CP.3\u300C\u667A\u9192\u6821\u5712\u300D\u8AB2\u5802\u5F0F\u5B88\u6CD5\u6559\u80B2\u6D3B\u52D5\uFF08\u66B4\u529B\u6B3A\u51CC\uFF09\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-04-26",title:"\u4E0B\u5B78\u671F\u7B2C13\u9031\uFF5C\u5B78\u751F\u554F\u5377\u8ABF\u67E5\uFF08\u5F64\uFF09",type:"homeroom"},{start:"2027-05-03",title:"\u4E0B\u5B78\u671F\u7B2C14\u9031\uFF5C\u8AB2\u5BA4\u6E05\u6F54\u65E5",type:"homeroom"},{start:"2027-05-24",title:"\u4E0B\u5B78\u671F\u7B2C17\u9031\uFF5C\u5C0F\u6D77\u8C5A\u5E74\u7D42\u6AA2\u8A0E\uFF08\u5BB6\uFF09",type:"homeroom"},{start:"2027-06-07",title:"\u4E0B\u5B78\u671F\u7B2C19\u9031\uFF5C\u73ED\u7D1A\u7D93\u71DF\u6D3B\u52D54\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-06-14",title:"\u4E0B\u5B78\u671F\u7B2C20\u9031\uFF5C\u73ED\u7D1A\u7D93\u71DF\u6D3B\u52D54\uFF08\u7F85\uFF09",type:"homeroom"},{start:"2027-06-21",title:"\u4E0B\u5B78\u671F\u7B2C21\u9031\uFF5C\u7559\u7D66P.6\u73ED\u4E3B\u4EFB\u9810\u5099\u7562\u696D\u5178\u79AE\u8868\u6F14",type:"homeroom"}]];


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
      .pe-update-banner.show{display:flex;align-items:center;gap:9px}.pe-update-banner b{font-size:11px}.pe-update-banner span{font-size:9px;color:#806c5c;flex:1}.pe-update-banner button{border:0;border-radius:8px;background:#9b6a3f;color:#fff;padding:6px 9px;font-size:9px;font-weight:800}

      .pe-dashboard-toggle{display:none;position:fixed;right:12px;bottom:62px;z-index:2147481350;border:1px solid #d9c9ba;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 11px;font:800 10px "Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif;box-shadow:0 4px 13px #0002}
      .pe-dashboard-toggle.show{display:block}
      .pe-dashboard{display:none;position:fixed;right:12px;bottom:104px;z-index:2147481300;width:min(390px,calc(100vw - 24px));max-height:68vh;overflow:auto;border:1px solid #e9d5ac;border-radius:15px;background:#fffaf0;color:#594537;padding:10px 11px;box-shadow:0 8px 26px #0003;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}
      .pe-dashboard.open{display:block}.pe-dash-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}.pe-dash-head b{font-size:12px;color:#80542f}.pe-dash-head small{font-size:8px;color:#8c7767}.pe-dash-close{margin-left:5px;border:1px solid #d9c9ba;border-radius:999px;background:#fff;color:#80542f;padding:3px 6px;font-size:8px;font-weight:800}.pe-dash-section{border-top:1px dashed #e3d3bf;padding-top:6px;margin-top:6px}.pe-dash-title{font-size:9px;font-weight:900;color:#8a5c32;margin-bottom:4px}.pe-dash-row{font-size:9px;line-height:1.55;color:#6e5848;overflow-wrap:anywhere}.pe-dash-empty{font-size:9px;color:#998678}.pe-dash-actions{display:flex;gap:5px;margin-top:7px}.pe-dash-actions button{flex:1;border:1px solid #d9c9ba;border-radius:8px;background:#fff;color:#80542f;padding:5px 6px;font-size:8px;font-weight:800}.pe-dash-actions button.primary{background:#9b6a3f;color:#fff;border-color:#9b6a3f}
      .pe-dash-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
      .pe-dash-card{border:1px solid #e4d3b9;border-radius:10px;background:#fff;padding:7px;cursor:pointer}
      .pe-dash-card b{display:block;font-size:15px;color:#7b5332;line-height:1.1}
      .pe-dash-card span{display:block;margin-top:2px;font-size:8px;color:#8c7767;font-weight:800}
      .pe-dash-card.warn{background:#fff7ef;border-color:#e8c7ad}
      .pe-dash-card.danger{background:#fff1ef;border-color:#e5bab4}
      .pe-dash-detail{display:none;margin-top:7px;border-top:1px dashed #e3d3bf;padding-top:6px}
      .pe-dash-detail.open{display:block}
      .pe-homework-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}
      .pe-homework-toolbar select,.pe-homework-toolbar input{width:100%;border:1px solid #ddcfc3;border-radius:8px;background:#fff;padding:7px;font-size:10px}
      .pe-homework-list{display:grid;gap:6px}
      .pe-homework-item{border:1px solid #e5dbd1;border-radius:9px;background:#fff;padding:8px}
      .pe-homework-item .top{display:flex;justify-content:space-between;gap:8px}
      .pe-homework-item b{font-size:10px;color:#80542f}.pe-homework-item small{font-size:8px;color:#8d796a}
      .pe-homework-item p{margin:4px 0 0;font-size:9px;line-height:1.45;color:#5f4b3d;white-space:pre-wrap}.pe-homework-unresolved{margin-top:9px;border:1px solid #e3d5c8;border-radius:9px;background:#fffaf1;padding:7px}.pe-homework-unresolved>summary{cursor:pointer;font-size:9px;font-weight:850;color:#936b4d}.pe-homework-unresolved[open]>summary{margin-bottom:6px}
      .pe-homework-periods{display:flex;flex-wrap:wrap;gap:4px;margin:7px 0}
      .pe-homework-periods button{border:1px solid #e5d5bf;border-radius:999px;background:#fffaf0;color:#7d5b42;padding:5px 8px;font-size:8px;font-weight:800}
      .pe-homework-periods button.active{background:#b67a45;color:#fff;border-color:#b67a45}
      .pe-homework-status{display:inline-flex;align-items:center;border-radius:999px;padding:3px 6px;font-size:7.5px;font-weight:850;margin-left:4px}
      .pe-homework-status.none{background:#f3eee8;color:#76695e}
      .pe-homework-status.open{background:#fff2d8;color:#9a641f}
      .pe-homework-status.done{background:#edf7ef;color:#4c7b55}
      .pe-homework-dup{margin-top:5px;padding:5px 6px;border:1px solid #f0d4ae;border-radius:7px;background:#faf4ec;color:#76533d;font-size:8px;line-height:1.35}
      .pe-homework-link{margin-left:4px;border:0;background:transparent;color:#76533d;text-decoration:underline;font-size:7.5px;font-weight:850;cursor:pointer}
      .pe-homework-status-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:5px;padding-top:5px;border-top:1px dashed #e8ddd2}
      .pe-homework-status-row .label{font-size:7.5px;color:#8b7768;font-weight:800}

      .pe-class-overview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .pe-class-card{border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:8px}
      .pe-class-card h4{margin:0 0 6px;color:#80542f;font-size:10px}
      .pe-class-overview-list{display:grid;gap:5px}
      .pe-class-overview-item{padding:6px;border-radius:8px;background:#fff9ef;border:1px solid #efe1ce;font-size:8.5px;line-height:1.4}
      .pe-v2-tabs{display:flex;gap:5px;flex-wrap:wrap;margin:7px 0 9px}
      .pe-v2-tabs button{border:1px solid #ddcec0;border-radius:999px;background:#f8f2ea;color:#76533b;padding:5px 9px;font-size:8px;font-weight:850}
      .pe-v2-tabs button.active{background:#876047;color:#fff;border-color:#876047}
      .pe-class-core-grid{display:grid;grid-template-columns:180px 1fr;gap:8px;min-height:330px}
      .pe-class-core-list{border:1px solid #eadfce;border-radius:10px;padding:6px;background:#fffaf2;display:grid;align-content:start;gap:4px}
      .pe-class-core-list button{border:1px solid #ead9c4;border-radius:8px;background:#fff;color:#72513a;padding:7px 8px;text-align:left;font-size:8.5px;font-weight:800}
      .pe-class-core-list button.active{background:var(--pe-theme-accent,#9b6a3f);color:#fff;border-color:var(--pe-theme-accent,#9b6a3f)}
      .pe-class-core-editor{border:1px solid #eadfce;border-radius:10px;padding:9px;background:#fff}
      .pe-class-core-editor textarea{min-height:210px}
      .pe-kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:7px 0}
      .pe-kpi{border:1px solid #eadfce;border-radius:9px;background:#fffaf2;padding:7px;text-align:center}
      .pe-kpi b{display:block;font-size:14px;color:#80542f}.pe-kpi small{font-size:7.5px;color:#8c7868}
      .pe-inbox-toolbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:7px 0}.pe-scope-tag{display:inline-block;margin-right:4px;border:1px solid #ddcec0;border-radius:999px;background:#f8f1e8;color:#70513e;padding:2px 6px;font-size:7px;font-weight:850}.pe-scope-tag.school{background:#eef4ff;border-color:#cad8ef;color:#4d6484}.pe-scope-tag.subject{background:#f4efff;border-color:#d8ccef;color:#695589}.pe-scope-tag.grade{background:#eef8ef;border-color:#c8dec9;color:#547255}.pe-scope-tag.personal{background:#f5f5f5;border-color:#dddddd;color:#666}
      .pe-chip-row{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none}
      .pe-chip-row::-webkit-scrollbar{display:none}
      .pe-filter-chip{flex:0 0 auto;border:1px solid #dfd7cd;background:#fff;border-radius:999px;padding:6px 10px;font-size:8px;font-weight:800;color:#5c5147}
      .pe-filter-chip.active{background:var(--pe-theme-accent,#2f6fed);color:#fff;border-color:var(--pe-theme-accent,#2f6fed)}
      .pe-workflow-stack{display:grid;gap:7px}
      .pe-workflow-card{border:1px solid #e5ded5;border-radius:12px;padding:9px;background:#fff}
      .pe-workflow-card h4{margin:0 0 4px;font-size:9px}
      .pe-workflow-primary{border-color:#cfdcf6;background:#f7faff}
      .pe-workflow-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}
      .pe-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .pe-settings-grid button{min-height:42px}

      .pe-inbox-list{display:grid;gap:6px}
      .pe-inbox-item{border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:8px}
      .pe-inbox-item.overdue{background:#fff6f4;border-color:#e9c3bb}
      .pe-inbox-item.today{background:#fffaf0;border-color:#e4ca86}
      .pe-inbox-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .pe-inbox-top b{font-size:9.5px;color:#684b38}.pe-inbox-top small{font-size:7.5px;color:#8b7768}
      .pe-inbox-meta{margin-top:3px;font-size:8px;color:#806d60;line-height:1.4}
      .pe-inbox-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
      .pe-inbox-actions button{border:1px solid #ddcec0;border-radius:7px;background:#faf4ec;color:#775239;padding:4px 7px;font-size:7.5px;font-weight:850}
      .pe-workflow-head{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .pe-workflow-periods{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:8px 0}
      .pe-workflow-periods button{border:1px solid var(--pe-theme-line,#e1d2bf);border-radius:8px;background:var(--pe-theme-soft,#fff9ed);color:var(--pe-theme-text,#77543c);padding:6px 4px;font-size:8px;font-weight:850}
      .pe-workflow-periods button.active{background:var(--pe-theme-accent,#a16e42);color:#fff;border-color:var(--pe-theme-accent,#a16e42)}
      .pe-workflow-card{border:1px solid #e5dbd1;border-radius:11px;background:#fff;padding:9px}
      .pe-workflow-card h4{margin:0 0 6px;font-size:10px;color:#7a5539}
      .pe-workflow-block{padding:7px;border-radius:8px;background:#faf6f0;border:1px solid #efe2d0;margin-top:5px;font-size:8.5px;line-height:1.45}
      .pe-workflow-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:8px}
      .pe-workflow-actions button{border:1px solid #d9c3a7;border-radius:8px;background:#fff8e7;color:#79533a;padding:7px 5px;font-size:8px;font-weight:850}
      .pe-workflow-actions button.primary{background:var(--pe-theme-accent,#9e6b3f);color:#fff;border-color:var(--pe-theme-accent,#9e6b3f)}
      
  .pe-add-class-theme{
    background:var(--pe-theme-accent,#9b6a3f)!important;
    border-color:var(--pe-theme-accent,#9b6a3f)!important;
    color:#fff!important;
  }
  .pe-add-class-theme:hover,
  .pe-add-class-theme:focus{
    background:var(--pe-theme-secondary,var(--pe-theme-accent,#9b6a3f))!important;
    border-color:var(--pe-theme-secondary,var(--pe-theme-accent,#9b6a3f))!important;
  }

  @media(max-width:700px){
        .pe-class-core-grid{grid-template-columns:1fr}
        .pe-class-core-list{grid-template-columns:repeat(3,minmax(0,1fr))}
        .pe-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}
        .pe-workflow-periods{grid-template-columns:repeat(3,minmax(0,1fr))}
        .pe-workflow-actions{grid-template-columns:1fr}
      }

      
      .pe-status-stack{position:fixed;right:8px;top:84px;z-index:2147482000;display:grid;gap:4px;justify-items:end;pointer-events:none}
      .pe-status-chip{display:flex;align-items:center;gap:5px;border:1px solid #dfd3c4;border-radius:999px;background:#fffdf8ee;box-shadow:0 2px 8px #0001;padding:4px 7px;font-size:7.5px;font-weight:850;color:#715945;backdrop-filter:blur(6px)}
      .pe-status-chip.cloud.ok{background:#f1f8ef;border-color:#c9ddc3;color:#4f7350}
      .pe-status-chip.cloud.wait{background:#fff8df;border-color:#e4cf91;color:#8a6a22}
      .pe-status-chip.cloud.off{background:#fff2ef;border-color:#e6c3bc;color:#9a5549}
      .pe-status-chip.cache{background:#f3f4f8;border-color:#d8dbe6;color:#596174}
      .pe-status-chip small{font-size:7px;font-weight:700;opacity:.8}
      .pe-version-btn{pointer-events:auto;border:1px solid currentColor;border-radius:999px;background:#fff8;padding:2px 6px;font-size:7px;font-weight:950;color:inherit;line-height:1;white-space:nowrap}
      .pe-version-btn:active{transform:translateY(1px)}
      .pe-update-banner{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483640;display:none;align-items:center;gap:8px;max-width:min(92vw,520px);padding:8px 10px;border:1px solid #d9c18a;border-radius:12px;background:#fff8d9;color:#715126;box-shadow:0 8px 28px #0003;font-size:9px;font-weight:850;pointer-events:auto}
      .pe-update-banner.show{display:flex}
      .pe-update-banner button{border:1px solid #9b6a3f;border-radius:8px;background:#9b6a3f;color:#fff;padding:6px 8px;font-size:8px;font-weight:900}
      .pe-update-banner .secondary{background:#fff;color:#7d5b3d;border-color:#d8c7b7}
      .pe-stat-quick-panel{display:grid;gap:8px;margin:8px 0 10px;padding:9px;border:1px solid #e3d5c8;border-radius:11px;background:#fff9ec}
      .pe-stat-quick-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .pe-stat-quick-head b{font-size:10px;color:#80542f}
      .pe-stat-quick-head button{border:1px solid #c9a97f;border-radius:8px;background:#fff;color:#80542f;padding:6px 8px;font-size:8px;font-weight:900}
      .pe-quick-dates{display:flex;gap:5px;flex-wrap:wrap;min-height:24px;padding:6px;border:1px dashed #d9c8b6;border-radius:9px;background:#fff}
      .pe-quick-date-chip{display:inline-flex;align-items:center;gap:4px;border:1px solid #d6c3aa;border-radius:999px;background:#fff6d8;color:#745334;padding:4px 6px;font-size:8px;font-weight:850}
      .pe-quick-date-chip button{border:0;background:transparent;color:#9a5549;padding:0;font-size:10px;font-weight:900}
      .pe-stat-row-actions{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}

      @media(max-width:700px){.pe-status-stack{top:84px;right:8px}}
@media(max-width:700px){.pe-class-overview-grid{grid-template-columns:1fr}}

      .pe-category-manager-list{display:grid;gap:6px;margin-top:8px}
      .pe-category-manager-row{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center;border:1px solid #e5dbd1;border-radius:9px;background:#fff;padding:8px}
      .pe-category-manager-row b{font-size:10px;color:#80542f}.pe-category-manager-row small{display:block;font-size:8px;color:#8c7868;margin-top:2px}
      @media(max-width:700px){.pe-dash-summary,.pe-homework-toolbar{grid-template-columns:1fr 1fr}.pe-category-manager-row{grid-template-columns:1fr}}


      .pe-context-tools{position:fixed;left:10px;bottom:12px;z-index:2147481400;display:none;gap:6px;flex-wrap:wrap;max-width:calc(100vw - 20px)}.pe-context-tools.show{display:flex}.pe-context-tools button{border:1px solid #d9c9ba;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 10px;font-size:9px;font-weight:800;box-shadow:0 4px 13px #0002}

      .pe-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:#0005;align-items:center;justify-content:center;padding:14px;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}.pe-modal.open{display:flex}
      .pe-dialog{width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid #e8d9c4;border-radius:16px;background:#fffdf8;color:#4a3428;box-shadow:0 15px 48px #0005;padding:14px}.pe-dialog h3{margin:0 0 5px;color:#80542f;font-size:15px}.pe-note{margin:0 0 10px;color:#857365;font-size:10px;line-height:1.45}.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pe-field label{display:block;margin:0 0 3px;color:#857365;font-size:10px;font-weight:700}.pe-field input,.pe-field select,.pe-field textarea{width:100%;border:1px solid #ddcfc3;border-radius:8px;background:#fff;color:#4a3428;padding:8px;font:600 11px inherit;box-sizing:border-box}.pe-field textarea{min-height:62px;resize:vertical}.pe-full{grid-column:1/-1}.pe-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}.pe-btn{border:1px solid #d9c9ba;border-radius:8px;background:#fff;color:#80542f;padding:7px 10px;font-size:10px;font-weight:800}.pe-btn.primary{background:#9b6a3f;border-color:#9b6a3f;color:#fff}.pe-btn.danger{color:#c64545}
      .pe-stat-toolbar{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;margin:9px 0}.pe-stat-actions{display:grid;grid-template-columns:repeat(2,auto);gap:4px;align-items:stretch}.pe-stat-actions button{min-width:44px;padding:7px 8px}.pe-stat-toolbar select,.pe-stat-toolbar input{width:100%;border:1px solid #ddcfc3;border-radius:8px;padding:7px;background:#fff;color:#4a3428;font-size:10px}.pe-stat-toolbar button{border:1px solid #d9c9ba;border-radius:8px;background:#fff8db;color:#80542f;padding:7px 8px;font-size:9px;font-weight:800}.pe-stat-group{border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:8px;margin-top:7px}.pe-stat-group summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800;color:#80542f}.pe-stat-group summary::-webkit-details-marker{display:none}.pe-stat-list{margin-top:6px;border-top:1px dashed #e5dbd1;padding-top:5px}.pe-stat-item{display:grid;grid-template-columns:78px 1fr auto;gap:6px;align-items:start;padding:5px 0;border-bottom:1px solid #f1e9dd;font-size:9px}.pe-stat-item:last-child{border-bottom:0}.pe-stat-item b{color:#6d5545}.pe-stat-item small{color:#8b7768;line-height:1.4}.pe-stat-item button{border:0;background:transparent;color:#c64545;font-size:9px;font-weight:800;padding:2px}.pe-stat-row-actions{display:flex;gap:2px;justify-content:flex-end;align-items:center}.pe-stat-row-actions button:first-child{color:#70513e}
      .pe-search-results{margin-top:9px;display:grid;gap:6px}.pe-search-result{border:1px solid #e5dbd1;border-radius:9px;background:#fff;padding:8px}.pe-search-result .top{display:flex;justify-content:space-between;gap:8px;align-items:center}.pe-search-result b{font-size:10px;color:#80542f}.pe-search-result span{font-size:9px;color:#5f4b3d;line-height:1.45}.pe-search-result small{display:block;margin-top:3px;font-size:8px;color:#998678}.pe-search-hint{font-size:9px;color:#8c7868;line-height:1.5;margin-top:6px}
      .pe-search-result{cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
      .pe-search-result:hover{box-shadow:0 3px 10px #5c3d2418;transform:translateY(-1px)}
      .pe-search-result .jump{margin-left:auto;border:1px solid #ddc9ad;border-radius:999px;background:#faf4ec;color:#80542f;padding:3px 7px;font-size:7.5px;font-weight:900;white-space:nowrap}
      .pe-source-flash{outline:3px solid #e7b75d!important;outline-offset:3px!important;box-shadow:0 0 0 7px #fff1b899!important;transition:box-shadow .2s ease}

      
      @media(min-width:701px){
        .pe-desktop-more-toggle{
          display:block;position:fixed;right:14px;bottom:14px;z-index:2147482500;
          border:1px solid #d9c9ba;border-radius:999px;background:#fff8db;color:#80542f;
          padding:9px 13px;font-size:10px;font-weight:900;box-shadow:0 5px 16px #0002
        }
        .pe-mobile-more{
          left:auto;right:14px;bottom:58px;width:320px;
          border:1px solid #ddd0bd;border-radius:15px;background:#fffdf8;padding:8px;
          box-shadow:0 8px 28px #0003
        }
        .pe-mobile-more.open{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
        .pe-mobile-more button{
          min-height:42px;border:1px solid #e6d8c6;border-radius:10px;background:#fff8e6;
          color:#78533a;padding:7px;font-size:10px;font-weight:800
        }.pe-more-group{display:grid;gap:4px;padding:7px 0;border-bottom:1px solid #e5dbd1}.pe-more-group:last-child{border-bottom:0}.pe-more-group>b{padding:1px 8px 3px;font-size:8px;color:#a17b5d;letter-spacing:.08em}.pe-more-group button{width:100%}
      }

@media(max-width:700px){.pe-sync-pill{top:84px;right:8px;bottom:auto}.pe-dashboard-toggle{right:8px;bottom:62px}.pe-dashboard{right:8px;bottom:102px;width:calc(100vw - 16px);max-height:65vh}.pe-context-tools{left:8px;bottom:8px}.pe-grid{grid-template-columns:1fr}.pe-full{grid-column:auto}.pe-stat-toolbar{grid-template-columns:1fr}.pe-stat-item{grid-template-columns:68px 1fr auto}}
      @media print{.pe-sync-pill,.pe-update-banner,.pe-dashboard-toggle,.pe-dashboard,.pe-context-tools,.pe-modal{display:none!important}}
      .pe-today-done-btn{width:100%;margin-top:7px;border:1px solid #c9a97f;border-radius:9px;background:#fff5d5;color:#80542f;padding:7px 9px;font-size:9px;font-weight:900}
      .pe-done-summary{display:grid;gap:7px;margin-top:8px}
      .pe-done-card{border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:8px}
      .pe-done-card.good{background:#f2f8ed;border-color:#c9dabd;color:#587148}
      .pe-done-card.warn{background:#fff4ef;border-color:#ebc7bc;color:#9b4f3d}
      .pe-done-card b{display:block;font-size:11px;margin-bottom:3px}
      .pe-done-card div{font-size:9px;line-height:1.5}
      .pe-pending-summary{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}
      .pe-pending-badge{border:1px solid #ddcfc3;border-radius:999px;background:#fff8e6;color:#6f5140;padding:4px 7px;font-size:8px;font-weight:800}
      .pe-pending-badge.today{background:#fff5d5;border-color:#e0c27b;color:#8a641f}
      .pe-pending-badge.overdue{background:#fff0ef;border-color:#e7b8b3;color:#a94438}
      .pe-pending-item{border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:8px;margin-top:7px}
      .pe-pending-item.today{background:#fffaf0;border-color:#e0c27b}
      .pe-pending-item.overdue{background:#fff7f6;border-color:#e7b8b3}
      .pe-pending-title{font-size:10px;font-weight:900;color:#684b38}
      .pe-pending-meta{font-size:8px;color:#8b7768;margin-top:3px;line-height:1.4}
      .pe-pending-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
      .pe-pending-actions button{border:1px solid #dccab4;border-radius:7px;background:#fff;color:#6f5140;padding:4px 6px;font-size:8px;font-weight:800}
      .pe-pending-actions button.primary{background:#9b6a3f;color:#fff;border-color:#9b6a3f}
      .pe-quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}
      .pe-quick-grid button{min-height:62px;border:1px solid #ddcfc3;border-radius:11px;background:#fff9e8;color:#6f5140;font-size:10px;font-weight:900;padding:8px 5px}
      .pe-quick-grid button span{display:block;font-size:18px;margin-bottom:3px}
      .pe-tag-toggle-list{display:grid;gap:8px;margin-top:10px}
      .pe-tag-toggle-list label{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #e5dbd1;border-radius:10px;background:#fff;padding:9px 10px;font-size:10px;font-weight:800;color:#684b38}
      .pe-tag-toggle-list input{width:18px;height:18px}
      .pe-reminder-soon{color:#936b1f;font-weight:800}
      @media(max-width:700px){.pe-quick-grid{grid-template-columns:1fr}}


      .submission-launcher{display:none!important}
      .pe-context-tools{display:none!important}
      .pe-desktop-more-toggle{display:none}
      .pe-cal-activity-layer{display:none!important}
      .pe-cal-activity-chip{position:fixed;max-width:46%;border:1px solid #d9b879;border-radius:6px;background:#fff0b8;color:#6f4827;padding:2px 4px;font-size:7px;font-weight:900;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 4px #0002}
      .pe-cal-activity-chip.more{background:#fffaf0;color:#8a6c4e}
      @media(max-width:700px){.pe-cal-activity-chip{font-size:6px;max-width:52%;padding:1px 3px}}
      @media print{.pe-cal-activity-layer{display:none!important}}
      .pe-mobile-nav{display:none}
      .pe-mobile-more{display:none}


      .pe-ipad-rail{display:none}
      .pe-ipad-more-panel{display:none}
      @media(min-width:701px) and (max-width:1100px){
        .pe-desktop-more-toggle{display:none!important}
        .pe-ipad-rail{
          display:grid;position:fixed;right:10px;top:50%;transform:translateY(-50%);
          z-index:2147483000;gap:6px;padding:6px;border:1px solid #ddd0bd;border-radius:16px;
          background:#fffdf8ee;backdrop-filter:blur(12px);box-shadow:0 8px 26px #0002;
          pointer-events:auto!important;touch-action:manipulation;
        }
        .pe-ipad-rail button{
          width:58px;min-height:52px;border:0;border-radius:10px;background:transparent;
          color:#705642;font-size:9px;font-weight:850;line-height:1.15;
          pointer-events:auto!important;touch-action:manipulation;cursor:pointer;
          -webkit-tap-highlight-color:transparent;
        }
        .pe-ipad-rail .ico{display:block;font-size:17px;margin-bottom:2px}
        .pe-ipad-rail button.active{background:#fff0bc;color:#7d532f}
        .pe-ipad-more-panel{
          display:none;position:fixed;right:78px;top:50%;transform:translateY(-50%);
          z-index:2147483600;width:330px;max-height:min(78vh,620px);overflow:auto;
          box-sizing:border-box;padding:7px;gap:6px;border:1px solid #ddd0bd;border-radius:15px;
          background:#fffdf8;box-shadow:0 10px 34px #0003;pointer-events:auto!important;
          touch-action:manipulation;-webkit-overflow-scrolling:touch;
        }
        .pe-ipad-more-panel.open{display:grid!important;grid-template-columns:1fr!important}
        .pe-ipad-more-panel .pe-more-group{
          display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:4px!important;padding:6px!important;border:1px solid #e5dbd1!important;
          border-radius:10px!important;background:#fff!important
        }
        .pe-ipad-more-panel .pe-more-group>b{
          grid-column:1/-1!important;color:#936b4d!important;font-size:8px!important;
          font-weight:900!important;padding:0 2px 2px!important;border-bottom:1px solid #f0e7da!important
        }
        .pe-ipad-more-panel button{
          width:100%!important;min-height:42px!important;border:1px solid #e3d5c8!important;
          border-radius:9px!important;background:#fff9ec!important;color:#6e4d35!important;
          font-size:9px!important;font-weight:850!important;padding:7px 5px!important;
          pointer-events:auto!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent
        }
        .pe-mobile-more{right:78px!important;bottom:auto!important;top:50%!important;transform:translateY(-50%);width:330px!important;z-index:2147483100!important;pointer-events:auto!important;touch-action:manipulation}
        .pe-dialog{width:min(820px,calc(100vw - 120px))}
        #submission-page .sub-wrap{max-width:920px;padding-right:66px}
        .sub-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
      }
      @media(max-width:700px){
        body{padding-bottom:0!important}
        .pe-mobile-nav{
          display:grid;position:fixed;left:8px;right:8px;bottom:8px;z-index:2147482500;
          grid-template-columns:repeat(5,1fr);gap:4px;padding:5px;
          border:1px solid #ddd0bd;border-radius:16px;background:#fffdf8ee;
          backdrop-filter:blur(12px);box-shadow:0 8px 28px #0003
        }
        .pe-mobile-nav button{
          min-height:48px;border:0;border-radius:11px;background:transparent;color:#6f5b4a;
          padding:4px 2px;font-size:9px;font-weight:850;line-height:1.2
        }
        .pe-mobile-nav button .ico{display:block;font-size:16px;margin-bottom:2px}
        .pe-mobile-nav button.active{background:#fff0bc;color:#7d532f}
        .pe-mobile-more{
          display:none;position:fixed;left:8px;right:8px;bottom:72px;z-index:2147482450;
          border:1px solid #ddd0bd;border-radius:15px;background:#fffdf8;padding:8px;
          box-shadow:0 8px 28px #0003
        }
        .pe-mobile-more.open{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
        .pe-mobile-more button{
          min-height:42px;border:1px solid #e6d8c6;border-radius:10px;background:#fff8e6;
          color:#78533a;padding:7px;font-size:10px;font-weight:800
        }
        .submission-launcher{bottom:78px!important}
        .pe-dashboard-toggle{bottom:78px!important}
        .pe-dashboard{bottom:126px!important}
        .pe-context-tools{bottom:78px!important}
      }


      html.pe-ipad-mode .pe-ipad-rail{
        display:grid!important;position:fixed!important;right:12px!important;top:50%!important;
        bottom:auto!important;transform:translateY(-50%)!important;z-index:2147483600!important;
        gap:6px!important;padding:6px!important;border:1px solid #ddd0bd!important;border-radius:16px!important;
        background:#fffdf8ee!important;backdrop-filter:blur(12px)!important;box-shadow:0 8px 26px #0002!important;
        pointer-events:auto!important;touch-action:manipulation!important
      }
      html.pe-ipad-mode .pe-ipad-rail button{
        display:block!important;width:60px!important;min-height:52px!important;border:0!important;border-radius:10px!important;
        background:transparent!important;color:#705642!important;font-size:9px!important;font-weight:850!important;
        line-height:1.15!important;pointer-events:auto!important;touch-action:manipulation!important
      }
      html.pe-ipad-mode .pe-ipad-rail .ico{display:block!important;font-size:17px!important;margin-bottom:2px!important}
      html.pe-ipad-mode .pe-ipad-rail button.active{background:#fff0bc!important;color:#7d532f!important}
      html.pe-ipad-mode .pe-mobile-nav,html.pe-ipad-mode .pe-desktop-more-toggle{display:none!important}
      html.pe-ipad-mode .pe-ipad-more-panel{
        display:none!important;position:fixed!important;right:84px!important;left:auto!important;top:50%!important;
        bottom:auto!important;transform:translateY(-50%)!important;width:340px!important;max-height:min(76vh,620px)!important;
        overflow:auto!important;z-index:2147483700!important;box-sizing:border-box!important;padding:7px!important;
        border:1px solid #ddd0bd!important;border-radius:15px!important;background:#fffdf8!important;
        box-shadow:0 10px 34px #0003!important;pointer-events:auto!important;touch-action:manipulation!important
      }
      html.pe-ipad-mode .pe-ipad-more-panel.open{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}
      html.pe-ipad-mode .pe-ipad-more-panel .pe-more-group{
        display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important;padding:6px!important;
        border:1px solid #e5dbd1!important;border-radius:10px!important;background:#fff!important
      }
      html.pe-ipad-mode .pe-ipad-more-panel .pe-more-group>b{grid-column:1/-1!important}
      html.pe-ipad-mode .pe-dashboard-toggle{right:84px!important;bottom:18px!important}

      /* v2.7.8 PWA standalone navigation */
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-mobile-nav{
        display:grid!important;position:fixed!important;left:8px!important;right:8px!important;
        bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;z-index:2147483600!important;
        grid-template-columns:repeat(5,1fr)!important;gap:4px!important;padding:5px!important;
        border:1px solid #ddd0bd!important;border-radius:16px!important;background:#fffdf8ee!important;
        backdrop-filter:blur(12px)!important;box-shadow:0 8px 28px #0003!important;
        pointer-events:auto!important;touch-action:manipulation!important;
      }
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-mobile-nav button{
        display:block!important;min-height:48px!important;border:0!important;border-radius:11px!important;
        background:transparent!important;color:#6f5b4a!important;padding:4px 2px!important;font-size:9px!important;
        font-weight:850!important;line-height:1.2!important;pointer-events:auto!important;touch-action:manipulation!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-mobile-nav button .ico{display:block!important;font-size:16px!important;margin-bottom:2px!important}
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-mobile-nav button.active{background:#fff0bc!important;color:#7d532f!important}
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-ipad-rail,html.pe-standalone-mode:not(.pe-ipad-mode) .pe-desktop-more-toggle{display:none!important}
      html.pe-standalone-mode:not(.pe-ipad-mode) .pe-mobile-more{
        position:fixed!important;left:8px!important;right:8px!important;bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;
        top:auto!important;transform:none!important;width:auto!important;max-height:min(66vh,470px)!important;overflow:auto!important;
        z-index:2147483550!important;-webkit-overflow-scrolling:touch!important;
      }
      html.pe-standalone-mode:not(.pe-ipad-mode) body{padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))!important}
      html.pe-standalone-mode.pe-ipad-mode .pe-ipad-rail{display:grid!important}
      html.pe-standalone-mode.pe-ipad-mode .pe-mobile-nav,html.pe-standalone-mode.pe-ipad-mode .pe-desktop-more-toggle{display:none!important}

      @media print{.pe-mobile-nav,.pe-mobile-more,.pe-ipad-more-panel{display:none!important}}


      /* v1.8.4 compact grouped More menu */
      .pe-mobile-more{
        box-sizing:border-box!important;
        padding:7px!important;
        gap:6px!important;
      }
      .pe-mobile-more.open{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:6px!important;
      }
      .pe-more-group{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:4px!important;
        padding:6px!important;
        border:1px solid #e5dbd1!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 2px 6px #5c3d240d!important;
      }
      .pe-more-group:last-child{border-bottom:1px solid #e5dbd1!important}
      .pe-more-group>b{
        grid-column:1/-1!important;
        display:flex!important;
        align-items:center!important;
        min-height:16px!important;
        padding:0 2px 2px!important;
        margin:0!important;
        border-bottom:1px solid #f0e7da!important;
        color:#936b4d!important;
        font-size:8px!important;
        font-weight:900!important;
        letter-spacing:.06em!important;
      }
      .pe-more-group button{
        width:100%!important;
        min-width:0!important;
        min-height:36px!important;
        margin:0!important;
        padding:6px 5px!important;
        border:1px solid #e3d5c8!important;
        border-radius:8px!important;
        background:#fff9ec!important;
        color:#6e4d35!important;
        font-size:8.5px!important;
        font-weight:850!important;
        line-height:1.18!important;
        text-align:center!important;
        white-space:normal!important;
      }
      .pe-more-group button:active{transform:translateY(1px)}
      .pe-more-group button:last-child:nth-child(even){grid-column:1/-1!important}
      @media(min-width:701px){
        .pe-mobile-more{width:330px!important}
      }
      @media(max-width:700px){
        .pe-mobile-more{
          width:min(94vw,340px)!important;
          max-height:min(66vh,470px)!important;
          overflow:auto!important;
        }
      }

      /* v1.7.2 stability hotfix: later generic rules must not hide the navigation. */
      @media(max-width:700px){
        .pe-mobile-nav{display:grid!important}
        .pe-ipad-rail,.pe-desktop-more-toggle{display:none!important}
      }
      @media(min-width:701px) and (max-width:1100px){
        .pe-ipad-rail{display:grid!important}
        .pe-mobile-nav,.pe-desktop-more-toggle{display:none!important}
      }
      /* v2.4.18 cache-proof mobile layout fixes.
         These live in the versioned planner JS, not index.html. */
      @media(max-width:900px){
        /* First panel section = 教師及班級資料.
           Target structurally so this works even when cached index.html has no identity-* classes. */
        .panel>section:first-child>label>input,
        .panel>section:first-child>.two-col>label>input{
          display:block!important;
          box-sizing:border-box!important;
          width:210px!important;
          max-width:calc(100vw - 64px)!important;
          min-width:0!important;
          height:38px!important;
          min-height:38px!important;
          max-height:38px!important;
          padding:7px 10px!important;
          line-height:22px!important;
          flex:none!important;
          align-self:flex-start!important;
        }
        .panel>section:first-child>.two-col{
          grid-template-columns:max-content max-content!important;
          justify-content:start!important;
          align-items:start!important;
          gap:10px!important;
        }
        .panel>section:first-child>.two-col>label{
          width:auto!important;min-width:0!important;align-self:start!important
        }
      }

      @media(max-width:700px){
        .panel>section:first-child>label>input,
        .panel>section:first-child>.two-col>label>input{
          width:175px!important;
          max-width:calc(100vw - 64px)!important;
          height:38px!important;
          min-height:38px!important;
          max-height:38px!important;
        }
        .panel>section:first-child>.two-col{
          grid-template-columns:max-content!important;
          gap:4px!important;
        }

        /* Fixed mobile dock clearance for every main React page.
           Use real padding on the common scrolling content, not body::after. */
        body{
          padding-bottom:calc(138px + env(safe-area-inset-bottom))!important;
        }
        .workspace{
          padding-bottom:calc(118px + env(safe-area-inset-bottom))!important;
          min-height:calc(100vh - 76px)!important;
        }
        .preview-wrap,
        .today-board,
        .planner-page{
          padding-bottom:calc(96px + env(safe-area-inset-bottom))!important;
        }
      }

      @media(max-width:390px){
        .panel>section:first-child>label>input,
        .panel>section:first-child>.two-col>label>input{
          width:165px!important;
        }
      }

      @media(min-width:701px) and (max-width:1100px){
        .workspace{padding-bottom:64px!important}
        .preview-wrap,.today-board,.planner-page{padding-bottom:44px!important}
      }

      /* v2.4.23 Today mobile row alignment */
      @media(max-width:700px){
        .today-item-time b{white-space:nowrap!important}
        .today-board{margin-bottom:48px!important}

        /* Give long duty labels their own space, then shift the whole value column right. */
        .today-item{
          grid-template-columns:122px minmax(0,1fr) auto!important;
          column-gap:10px!important;
        }
        .today-item>strong{
          justify-self:start!important;
          padding-left:2px!important;
        }
      }

      /* v2.4.19 unified mobile layout */
      @media(max-width:900px){
        /* 教師及班級資料：真正 2 x 2 排列。 */
        .panel>section:first-child{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:10px 12px!important;
          align-items:start!important;
        }
        .panel>section:first-child>.section-title{
          grid-column:1/-1!important;
          margin-bottom:2px!important;
        }
        .panel>section:first-child>.two-col{
          display:contents!important;
        }
        .panel>section:first-child>label,
        .panel>section:first-child>.two-col>label{
          width:100%!important;
          min-width:0!important;
          margin:0!important;
        }
        .panel>section:first-child>label>input,
        .panel>section:first-child>.two-col>label>input{
          display:block!important;
          box-sizing:border-box!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          height:38px!important;
          min-height:38px!important;
          max-height:38px!important;
          padding:7px 9px!important;
          line-height:22px!important;
          flex:none!important;
        }
      }

      @media(max-width:700px){
        /* Only one dock clearance layer; don't stack body/workspace/preview padding. */
        body{padding-bottom:calc(108px + env(safe-area-inset-bottom))!important}
        .workspace{padding-bottom:0!important}
        .preview-wrap,.today-board,.planner-page{padding-bottom:initial}
        .preview-wrap{margin-bottom:0!important}
      }

      @media(min-width:701px) and (max-width:1100px){
        body{padding-bottom:48px!important}
        .workspace{padding-bottom:0!important}
        .preview-wrap,.today-board,.planner-page{margin-bottom:0!important}
      }


      .pe-submission-counts{
        display:inline-flex;
        flex-wrap:wrap;
        align-items:center;
        gap:0;
        margin-top:3px;
        font-size:10px;
        line-height:1.4;
        font-weight:800;
        color:#8b7768;
      }
      .pe-submission-counts .submitted,
      .pe-submission-counts .pending,
      .pe-submission-counts .done,
      .pe-submission-counts .sep{color:#8b7768}
      .pe-submission-counts .missing{color:#d64545}

      /* v2.4.29 hard theme override — use the original v2.4.26 class-center brown */
      :root{
        --pe-purin-brown:#9b6a3f;
        --pe-purin-brown-2:#a87446;
        --pe-purin-text:#80542f;
        --pe-purin-soft:#fff9ef;
        --pe-purin-soft-2:#fffaf2;
        --pe-purin-line:#eadfce;
      }

      /* Class Center: restore exact v2.4.26 feel */
      #pe-class-center-modal .pe-v2-tabs button{
        background:#fff9ea!important;
        color:#76533b!important;
        border-color:#ddcbb4!important;
      }
      #pe-class-center-modal .pe-v2-tabs button.active{
        background:#9b6a3f!important;
        color:#fff!important;
        border-color:#9b6a3f!important;
      }
      #pe-class-center-modal .pe-class-card{
        border-color:#eadfce!important;
        background:#fff!important;
      }
      #pe-class-center-modal .pe-class-card h4{
        color:#80542f!important;
      }
      #pe-class-center-modal .pe-class-overview-item{
        background:#fff9ef!important;
        border-color:#efe1ce!important;
      }
      #pe-class-center-modal .pe-class-core-list{
        background:#fffaf2!important;
        border-color:#eadfce!important;
      }
      #pe-class-center-modal .pe-class-core-list button{
        color:#72513a!important;
        border-color:#ead9c4!important;
      }
      #pe-class-center-modal .pe-class-core-list button.active{
        background:var(--pe-theme-accent,#9b6a3f)!important;
        color:#fff!important;
        border-color:var(--pe-theme-accent,#9b6a3f)!important;
      }

      /* Main Pompompurin UI: use the same medium brown, not orange / not dark coffee */
      .pe-btn.primary,
      .pe-dash-actions button.primary,
      .pe-pending-actions button.primary,
      .pe-update-banner button{
        background:#9b6a3f!important;
        border-color:#9b6a3f!important;
        color:#fff!important;
      }

      .pe-dashboard-toggle,
      .pe-desktop-more-toggle,
      .pe-btn,
      .pe-dash-close,
      .pe-dash-actions button,
      .pe-stat-toolbar button{
        color:#80542f!important;
      }

      .pe-mobile-nav button.active,
      .pe-ipad-rail button.active{
        background:#9b6a3f!important;
        color:#fff!important;
      }

      .pe-mobile-nav,
      .pe-ipad-rail,
      .pe-mobile-more{
        background:#fffdf8ee!important;
        border-color:#ddd0bd!important;
      }

      .pe-mobile-more button{
        background:#fff8e6!important;
        color:#76533b!important;
        border-color:#e6d8c6!important;
      }

      .pe-dashboard{
        background:#fffaf0!important;
        color:#594537!important;
      }
      .pe-dash-head b,
      .pe-class-card h4,
      .pe-homework-item b,
      .pe-search-result b{
        color:#80542f!important;
      }

      /* v2.4.32 Theme Sync Phase 1 */
      #pe-class-center-modal .pe-v2-tabs button.active,
      .pe-btn.primary,
      .pe-dash-actions button.primary,
      .pe-pending-actions button.primary,
      .pe-update-banner button,
      .pe-mobile-nav button.active,
      .pe-ipad-rail button.active{
        background:var(--pe-theme-accent,#9b6a3f)!important;
        border-color:var(--pe-theme-accent,#9b6a3f)!important;
        color:#fff!important;
      }
      #pe-class-center-modal .pe-class-core-list button.active{
        background:var(--pe-theme-secondary,var(--pe-theme-accent,#a87446))!important;
        border-color:var(--pe-theme-secondary,var(--pe-theme-accent,#a87446))!important;
        color:#fff!important;
      }
      #pe-class-center-modal .pe-class-card h4,
      #pe-class-center-modal .pe-kpi b,
      .pe-dashboard-toggle,
      .pe-desktop-more-toggle,
      .pe-btn,
      .pe-dash-close,
      .pe-dash-actions button,
      .pe-stat-toolbar button,
      .pe-dash-head b,
      .pe-homework-item b,
      .pe-search-result b,
      .pe-seat-score-head b{
        color:var(--pe-theme-text,var(--pe-theme-accent,#80542f))!important;
      }
      #pe-class-center-modal .pe-class-overview-item{
        background:var(--pe-theme-soft,#fff9ef)!important;
        border-color:var(--pe-theme-line,#eadfce)!important;
      }
      #pe-class-center-modal .pe-class-core-list,
      .pe-dashboard,
      .pe-mobile-more,
      .pe-mobile-nav,
      .pe-ipad-rail{
        border-color:var(--pe-theme-line,#eadfce)!important;
      }
      .pe-seat-score-modal,
      .pe-seat-score-shell{
        background:var(--pe-theme-bg,#fffaf2)!important;
      }
      .pe-seat-score-head{
        border-bottom-color:var(--pe-theme-line,#eadfce)!important;
      }

      @media(min-width:1101px){
        .pe-desktop-more-toggle{display:block!important}
        .pe-mobile-nav,.pe-ipad-rail{display:none!important}
      }

    `;
    document.head.appendChild(style);
  }


  const LAST_CLOUD_OK_KEY='hk-school-last-cloud-success-v1';

  function fmtClock(iso){
    if(!iso)return '';
    const d=new Date(iso);
    if(Number.isNaN(d.getTime()))return '';
    return new Intl.DateTimeFormat('zh-HK',{
      timeZone:'Asia/Hong_Kong',
      month:'numeric',day:'numeric',
      hour:'2-digit',minute:'2-digit',
      hourCycle:'h23'
    }).format(d);
  }

  function markCloudSuccess(){
    try{
      localStorage.setItem(LAST_CLOUD_OK_KEY,new Date().toISOString());
    }catch{}
  }

  function ensureStatusStack(){
    let el=document.getElementById('pe-status-stack');
    if(el)return el;
    el=document.createElement('div');
    el.id='pe-status-stack';
    el.className='pe-status-stack';
    document.body.appendChild(el);
    return el;
  }

  function cacheStatusText(){
    if(!('serviceWorker' in navigator))return '網站：一般模式';
    return navigator.serviceWorker.controller
      ? '網站：已緩存，可離線使用'
      : '網站：緩存準備中';
  }

  function cloudStatusMeta(){
    const map={
      connecting:['wait','雲端：連接中'],
      syncing:['wait','雲端：同步中'],
      ok:['ok','雲端：已連線'],
      signedout:['off','雲端：未登入'],
      error:['off','雲端：連線失敗'],
      offline:['off','雲端：目前離線']
    };
    return map[state.sync]||map.connecting;
  }

  function renderStatusStack() {
    const el=document.getElementById('pe-status-stack');
    if(!el)return;

    const n=totalPending();
    let cloudLabel='已連接';
    let cls='ok';

    if(n>0){
      cloudLabel=`待同步 ${n}`;
      cls='wait';
    }else if(!navigator.onLine){
      cloudLabel='離線';
      cls='off';
    }else if(state.sync==='syncing'){
      cloudLabel='同步中';
      cls='wait';
    }else if(state.sync==='connecting'){
      cloudLabel='連接中';
      cls='wait';
    }else if(state.sync==='signedout'){
      cloudLabel='未登入';
      cls='off';
    }else if(state.sync==='error'){
      cloudLabel='載入失敗';
      cls='off';
    }

    let last='';
    try{last=localStorage.getItem(LAST_CLOUD_OK_KEY)||''}catch{}
    el.innerHTML=`
      <div class="pe-status-chip cache">💾 ${cacheStatusText()}</div>
      <div class="pe-status-chip cloud ${cls}">☁ 雲端：${cloudLabel}${last?` <small>最後成功：${fmtClock(last)}</small>`:''} <button type="button" class="pe-version-btn" id="pe-version-btn" title="檢查更新">v${VERSION}</button></div>`;
    const vb=el.querySelector('#pe-version-btn');
    if(vb)vb.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      vb.textContent='檢查中…';
      const result=await window.__HK_CHECK_APP_UPDATE?.(true);
      vb.textContent=`v${VERSION}`;
      if(result && !result.update && !result.error)alert(`目前已是最新版本 v${VERSION}`);
    });
  }

  function ensureUpdateBanner(){
    let el=document.getElementById('pe-update-banner');
    if(el)return el;
    el=document.createElement('div');
    el.id='pe-update-banner';
    el.className='pe-update-banner';
    document.body.appendChild(el);
    return el;
  }
  function showUpdateBanner(detail={}){
    const current=detail.current||VERSION,latest=detail.latest||window.__HK_LATEST_BUILD||'';
    if(!latest||latest===current)return;
    const el=ensureUpdateBanner();
    el.innerHTML=`<span>✨ 偵測到新版 <b>v${esc(latest)}</b>（目前 v${esc(current)}）</span><button type="button" id="pe-update-now">立即重新載入</button><button type="button" class="secondary" id="pe-update-later">稍後</button>`;
    el.classList.add('show');
    el.querySelector('#pe-update-now').addEventListener('click',()=>window.__HK_RELOAD_TO_BUILD?.(latest));
    el.querySelector('#pe-update-later').addEventListener('click',()=>el.classList.remove('show'));
  }
  window.addEventListener('hk-app-update-available',e=>showUpdateBanner(e.detail||{}));
  if(window.__HK_UPDATE_DETAIL)setTimeout(()=>showUpdateBanner(window.__HK_UPDATE_DETAIL),0);

  function setSync(status) {
    state.sync = status;
    const pill = ensureSyncPill();
    const map = {
      connecting:['wait','⟳ 連接中'],
      syncing:['wait','⟳ 同步中'],
      ok:['ok','☁ 已同步'],
      signedout:['off','☁ 未登入'],
      error:['off','⚠ 雲端載入失敗'],
      offline:['off','⚠ 目前離線']
    };
    const [cls,text] = map[status] || map.connecting;
    pill.className = `pe-sync-pill ${cls}`;
    pill.textContent = text;
    if(status==='ok')markCloudSuccess();
    renderStatusStack();
  }

  function applyOfflineQueueToRecords(records=[],queue=[]){
    const map=new Map((Array.isArray(records)?records:[]).map(r=>[String(r.id),{...r}]));
    for(const item of normalizeOfflineQueue(queue)){
      const id=String(item.id||'');if(!id)continue;
      if(item.op==='delete')map.delete(id);
      else map.set(id,{...(map.get(id)||{}),...(item.data||{}),id});
    }
    return [...map.values()];
  }
  function normalizeOfflineQueue(q=[]){
    const map=new Map();
    for(const raw of Array.isArray(q)?q:[]){
      if(!raw||!raw.id)continue;
      const item={...raw,id:String(raw.id),op:raw.op==='delete'?'delete':'set'};
      map.set(item.id,item); // newest operation for the same record wins
    }
    return [...map.values()];
  }
  function loadActivityPending(){
    try{
      const q=normalizeOfflineQueue(JSON.parse(localStorage.getItem(ACTIVITY_PENDING_KEY)||'[]'));
      state.activityPending=q.length;
      return q;
    }catch{state.activityPending=0;return[]}
  }
  function saveActivityPending(q){
    const clean=normalizeOfflineQueue(q);
    try{localStorage.setItem(ACTIVITY_PENDING_KEY,JSON.stringify(clean));state.activityPending=clean.length}catch{}
    updateSyncDisplay();
  }
  function queueActivityPending(item){
    const q=loadActivityPending();
    q.push(item);
    saveActivityPending(q);
  }
  function totalPending(){
    const sub=window.__submissionTrackerAPI?.getPendingCount?.()||0;
    return state.activityPending+(state.pendingQueueCount||0)+sub;
  }
  function broadcastSyncStatus(status,pendingCount=totalPending()){
    try{
      window.dispatchEvent(new CustomEvent('schoolSyncStatusChanged',{detail:{
        status,
        pendingCount,
        online:navigator.onLine,
        firebaseReady:!!state.firebaseReady,
        signedIn:!!state.user
      }}));
    }catch{}
  }
  function updateSyncDisplay(){
    const n=totalPending();
    if(n>0){
      const p=ensureSyncPill();
      p.className='pe-sync-pill off';
      p.textContent=`⚠ 待同步 ${n}`;
      renderStatusStack();
      broadcastSyncStatus('pending',n);
      return;
    }
    if(!navigator.onLine){setSync('offline');broadcastSyncStatus('offline',0);return}
    if(window.__firebaseBootstrapError){setSync('error');broadcastSyncStatus('error',0);return}
    if(window.__firebaseAuthResolved && !window.__firebaseAuthUser){setSync('signedout');broadcastSyncStatus('signedout',0);return}
    const next=state.firebaseReady?'ok':'connecting';
    setSync(next);
    broadcastSyncStatus(next,0);
  }
  let activityFlushPromise=null;
  async function flushActivityPending(){
    if(activityFlushPromise)return activityFlushPromise;
    if(!navigator.onLine||!state.firebaseReady)return;
    activityFlushPromise=(async()=>{
      let q=loadActivityPending(),remain=[];
      for(const item of q){
        try{
          if(item.op==='delete')await activityCollection().doc(item.id).delete();
          else await activityCollection().doc(item.id).set(item.data,{merge:true});
        }catch{remain.push(item)}
      }
      saveActivityPending(remain);
    })().finally(()=>{activityFlushPromise=null});
    return activityFlushPromise;
  }

  function loadPendingQueue(){
    try{
      const q=normalizeOfflineQueue(JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY)||'[]'));
      state.pendingQueueCount=q.length;
      return q;
    }catch{state.pendingQueueCount=0;return[]}
  }
  function savePendingQueue(q){
    const clean=normalizeOfflineQueue(q);
    try{
      localStorage.setItem(PENDING_QUEUE_KEY,JSON.stringify(clean));
      state.pendingQueueCount=clean.length;
    }catch{}
    updateSyncDisplay();
  }
  function queuePendingOp(item){
    const q=loadPendingQueue();
    q.push(item);
    savePendingQueue(q);
  }
  let pendingFlushPromise=null;
  async function flushPendingQueue(){
    if(pendingFlushPromise)return pendingFlushPromise;
    if(!navigator.onLine||!state.firebaseReady||!state.user)return;
    pendingFlushPromise=(async()=>{
      const col=pendingCollection(),q=loadPendingQueue(),remain=[];
      for(const item of q){
        try{
          if(item.op==='delete')await withPendingSyncTimeout(col.doc(item.id).delete());
          else await withPendingSyncTimeout(col.doc(item.id).set(item.data,{merge:true}));
        }catch{remain.push(item)}
      }
      savePendingQueue(remain);
    })().finally(()=>{pendingFlushPromise=null});
    return pendingFlushPromise;
  }

  (function hideLegacySyncPill(){
    try{
      const st=document.createElement('style');
      st.textContent='#pe-sync-pill{display:none !important}';
      document.head.appendChild(st);
    }catch{}
  })();

  function ensureSyncPill() {
    let el = document.getElementById('pe-sync-pill');
    if (!el) { el = document.createElement('div'); el.id='pe-sync-pill'; document.body.appendChild(el); }
    return el;
  }

  function installNetworkStatus() {
    let refreshPromise=null;
    const refresh = async () => {
      if(refreshPromise)return refreshPromise;
      refreshPromise=(async()=>{
        if(navigator.onLine){
          setSync('syncing');
          if(!state.firebaseReady||!state.user){
            try{await connectData()}catch{}
          }
          await flushActivityPending();
          await flushPendingQueue();
          try{await window.__submissionTrackerAPI?.ensureOnlineSync?.()}catch{}
          updateSyncDisplay();
        }else{
          setSync('offline');
          broadcastSyncStatus('offline',totalPending());
        }
      })().finally(()=>{refreshPromise=null});
      return refreshPromise;
    };
    window.addEventListener('online',()=>{
      refresh();
      setTimeout(refresh,1200);
    });
    window.addEventListener('offline', refresh);
    refresh();
  }

  async function waitForFirebase(timeout=15000) {
    if(window.firebase?.auth && window.firebase?.firestore) return true;

    if(window.__firebaseReadyPromise){
      try{
        await Promise.race([
          window.__firebaseReadyPromise,
          new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase bootstrap timeout')),timeout))
        ]);
      }catch{}
      return !!(window.firebase?.auth && window.firebase?.firestore);
    }

    const started=Date.now();
    while(Date.now()-started<timeout){
      if(window.firebase?.auth && window.firebase?.firestore) return true;
      await new Promise(r=>setTimeout(r,180));
    }
    return false;
  }

  async function getUser() {
    if(!await waitForFirebase()) return null;

    const auth=window.firebase.auth();
    if(auth.currentUser) return auth.currentUser;
    if(window.__firebaseAuthResolved) return window.__firebaseAuthUser || null;

    return new Promise(resolve=>{
      let done=false;
      const timer=setTimeout(()=>{
        if(done)return;
        done=true;
        try{unsub()}catch{}
        resolve(auth.currentUser || null);
      },10000);

      const unsub=auth.onAuthStateChanged(user=>{
        if(done)return;
        done=true;
        clearTimeout(timer);
        try{unsub()}catch{}
        resolve(user || null);
      });
    });
  }

  const subCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('submissionRecords');
  const activityCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('calendarActivityLogs');
  const pendingCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('pendingItems');
  const classCoreCollection = () => window.firebase.firestore().collection('users').doc(state.user.uid).collection('classProfiles');



  function getActiveClass(){
    if(state.activeWorkspaceClass)return state.activeWorkspaceClass;
    try{
      const x=localStorage.getItem(ACTIVE_CLASS_KEY)||'';
      state.activeWorkspaceClass=normalizeClassId(x);
    }catch{}
    return state.activeWorkspaceClass||'';
  }

  function setActiveClass(name=''){
    const cls=normalizeClassId(name);
    state.activeWorkspaceClass=cls;
    try{localStorage.setItem(ACTIVE_CLASS_KEY,cls)}catch{}
    try{window.dispatchEvent(new CustomEvent('activeClassChanged',{detail:{className:cls}}))}catch{}
    return cls;
  }


  function defaultSchoolYear(){
    const d=hkToday();
    const [y,m]=d.split('-').map(Number);
    const start=m>=8?y:y-1;
    return `${start}/${String(start+1).slice(-2)}`;
  }

  function normalizeSchoolYear(v=''){
    const s=String(v||'').trim().replace(/\s+/g,'');
    const m=s.match(/^(\d{4})[\/\-](\d{2}|\d{4})$/);
    if(!m)return defaultSchoolYear();
    const start=Number(m[1]);
    return `${start}/${String(start+1).slice(-2)}`;
  }

  function emptyIdentityV1(){
    return {
      schemaVersion:1,
      currentSchoolYear:defaultSchoolYear(),
      students:{},
      classInstances:{},
      enrollments:{},
      updatedAt:new Date().toISOString()
    };
  }

  function loadIdentityV1(){
    if(state.identityV1)return state.identityV1;
    try{
      const raw=JSON.parse(localStorage.getItem(IDENTITY_V1_KEY)||'null');
      state.identityV1=raw&&typeof raw==='object'?{
        ...emptyIdentityV1(),
        ...raw,
        currentSchoolYear:normalizeSchoolYear(raw.currentSchoolYear||defaultSchoolYear()),
        students:raw.students&&typeof raw.students==='object'?raw.students:{},
        classInstances:raw.classInstances&&typeof raw.classInstances==='object'?raw.classInstances:{},
        enrollments:raw.enrollments&&typeof raw.enrollments==='object'?raw.enrollments:{}
      }:emptyIdentityV1();
    }catch{state.identityV1=emptyIdentityV1()}
    return state.identityV1;
  }

  function saveIdentityV1(){
    const store=loadIdentityV1();
    store.updatedAt=new Date().toISOString();
    try{localStorage.setItem(IDENTITY_V1_KEY,JSON.stringify(store))}catch{}
    try{window.dispatchEvent(new CustomEvent('identityV1Changed',{detail:{schoolYear:store.currentSchoolYear}}))}catch{}
  }

  function currentSchoolYear(){
    return normalizeSchoolYear(loadIdentityV1().currentSchoolYear||defaultSchoolYear());
  }

  function enrollmentIdFor(schoolYear,classId,studentId){
    return `enr_${stableHash(`${schoolYear}|${classId}|${studentId}`)}`;
  }

  function isPlaceholderStudentName(name='',number=0){
    const raw=String(name||'').trim();
    if(!raw)return true;
    if(!/^\d{1,3}$/.test(raw))return false;
    const n=Number(raw);
    if(!Number.isFinite(n))return false;
    if(number>0 && n!==Number(number))return false;
    return true;
  }

  function hasRealRegistryIdentity(entry={}){
    const values=[
      entry.currentName,
      ...(Array.isArray(entry.aliases)?entry.aliases:[])
    ].filter(Boolean);
    return values.some(v=>!isPlaceholderStudentName(v));
  }

  function syncIdentityV1FromClassCore(){
    const store=loadIdentityV1();
    const now=new Date().toISOString();
    (state.classCore||[]).forEach(rec=>{
      const cls=normalizeClassProfile(rec);
      const year=normalizeSchoolYear(cls.schoolYear||store.currentSchoolYear);
      store.classInstances[cls.classId]={
        ...(store.classInstances[cls.classId]||{}),
        classId:cls.classId,
        name:cls.name,
        schoolYear:year,
        rosterVersion:Number(cls.rosterVersion)||1,
        archived:!!cls.archived,
        updatedAt:now
      };
      cls.students.forEach((s,i)=>{
        const sid=String(s.studentId||s.id||'');
        if(!sid)return;
        const number=Number(s.number)||i+1;
        const placeholder=isPlaceholderStudentName(s.name,number);
        const old=store.students[sid]||{};

        if(!placeholder){
          const aliases=[...new Set([
            ...(Array.isArray(old.aliases)?old.aliases:[]),
            old.currentName,
            s.name
          ].filter(v=>v&&!isPlaceholderStudentName(v)))];
          store.students[sid]={
            ...old,
            studentId:sid,
            currentName:s.name||old.currentName||'',
            aliases,
            firstSeenAt:old.firstSeenAt||now,
            lastSeenAt:now,
            active:true
          };
        }else if(store.students[sid] && !hasRealRegistryIdentity(store.students[sid])){
          // V1.1 cleanup: provisional roster numbers must not pollute permanent registry.
          delete store.students[sid];
        }

        const eid=enrollmentIdFor(year,cls.classId,sid);
        store.enrollments[eid]={
          enrollmentId:eid,
          studentId:sid,
          classId:cls.classId,
          className:cls.name,
          schoolYear:year,
          studentNo:number,
          provisional:placeholder,
          status:cls.archived?'archived':'active',
          updatedAt:now
        };
      });
    });
    // Remove stale entries created by V1 when the only known identity was a numeric placeholder.
    Object.keys(store.students||{}).forEach(sid=>{
      if(!hasRealRegistryIdentity(store.students[sid])) delete store.students[sid];
    });

    saveIdentityV1();
    try{dedupeIdentityEnrollments()}catch{}
    return store;
  }

  function identityLiveClassIds(){
    return new Set((state.classCore||[]).map(c=>String(c.classId||c.id||'')).filter(Boolean));
  }

  function identityLiveRosterStudentIds(){
    const ids=new Set();
    (state.classCore||[]).forEach(c=>{
      normalizeClassProfile(c).students.forEach(s=>{
        const sid=String(s.studentId||s.id||'');
        if(sid)ids.add(sid);
      });
    });
    return ids;
  }

  function isTestLikeClassName(name=''){
    return /(test|測試|臨時|temporary|demo)/i.test(String(name||'').trim());
  }

  function dedupeIdentityEnrollments(){
    const store=loadIdentityV1();
    const liveClassIds=identityLiveClassIds();
    const groups={};
    Object.entries(store.enrollments||{}).forEach(([id,e])=>{
      const sig=[
        String(e.studentId||''),
        normalizeSchoolYear(e.schoolYear||''),
        String(e.className||'').trim(),
        Number(e.studentNo)||0
      ].join('|');
      (groups[sig]||(groups[sig]=[])).push([id,e]);
    });

    let removed=0;
    Object.values(groups).forEach(rows=>{
      if(rows.length<2)return;
      rows.sort((a,b)=>{
        const aLive=liveClassIds.has(String(a[1].classId||''))?1:0;
        const bLive=liveClassIds.has(String(b[1].classId||''))?1:0;
        if(aLive!==bLive)return bLive-aLive;
        return String(b[1].updatedAt||'').localeCompare(String(a[1].updatedAt||''));
      });
      const keep=rows[0][0];
      rows.slice(1).forEach(([id,e])=>{
        // Never collapse two distinct live class instances automatically.
        const bothLive=liveClassIds.has(String(rows[0][1].classId||''))&&liveClassIds.has(String(e.classId||''));
        if(bothLive)return;
        if(id!==keep && store.enrollments[id]){
          delete store.enrollments[id];
          removed++;
        }
      });
    });
    if(removed)saveIdentityV1();
    return removed;
  }

  function isSafeRemovableEnrollment(e={}){
    const liveIds=identityLiveClassIds();
    const classId=String(e.classId||'');
    if(classId && liveIds.has(classId))return false;
    return isTestLikeClassName(e.className);
  }

  function removeSafeStudentEnrollment(studentId='', enrollmentId=''){
    const sid=String(studentId||'');
    const eid=String(enrollmentId||'');
    const store=loadIdentityV1();
    const e=store.enrollments?.[eid];
    if(!e || String(e.studentId)!==sid)return {ok:false,reason:'找不到紀錄'};
    if(!isSafeRemovableEnrollment(e))return {ok:false,reason:'呢個 Enrollment 仍屬正式／現存班級，不能直接刪除'};
    delete store.enrollments[eid];
    saveIdentityV1();
    cleanupEmptyTestClassInstances();
    return {ok:true};
  }

  function removeAllSafeTestEnrollments(studentId=''){
    const sid=String(studentId||'');
    const store=loadIdentityV1();
    let removed=0;
    Object.entries({...store.enrollments}).forEach(([eid,e])=>{
      if(String(e.studentId)!==sid)return;
      if(!isSafeRemovableEnrollment(e))return;
      delete store.enrollments[eid];
      removed++;
    });
    if(removed){
      saveIdentityV1();
      cleanupEmptyTestClassInstances();
    }
    return removed;
  }

  function studentIdentityUsage(studentId=''){
    const sid=String(studentId||'');
    const liveClasses=[];
    (state.classCore||[]).forEach(c=>{
      const cls=normalizeClassProfile(c);
      if(cls.students.some(s=>String(s.studentId||s.id)===sid))liveClasses.push(cls);
    });
    const history=Object.values(loadIdentityV1().enrollments||{})
      .filter(e=>String(e.studentId)===sid);
    const orphanHistory=history.filter(e=>!identityLiveClassIds().has(String(e.classId||'')));
    const safeTestDelete=liveClasses.length===0 &&
      history.length>0 &&
      history.every(e=>isTestLikeClassName(e.className));
    const safeEmptyDelete=liveClasses.length===0 && history.length===0;
    return {liveClasses,history,orphanHistory,safeDelete:safeTestDelete||safeEmptyDelete};
  }

  function cleanupEmptyTestClassInstances(){
    const store=loadIdentityV1();
    const live=identityLiveClassIds();
    const usedClassIds=new Set(Object.values(store.enrollments||{}).map(e=>String(e.classId||'')));
    let removed=0;
    Object.keys(store.classInstances||{}).forEach(cid=>{
      const c=store.classInstances[cid];
      if(!live.has(String(cid)) && !usedClassIds.has(String(cid)) && isTestLikeClassName(c?.name)){
        delete store.classInstances[cid];
        removed++;
      }
    });
    if(removed)saveIdentityV1();
    return removed;
  }

  function identityStudentHistory(studentId=''){
    const store=loadIdentityV1();
    return Object.values(store.enrollments||{})
      .filter(e=>String(e.studentId)===String(studentId))
      .sort((a,b)=>String(b.schoolYear).localeCompare(String(a.schoolYear))||Number(a.studentNo)-Number(b.studentNo));
  }

  function identityAudit(){
    const store=syncIdentityV1FromClassCore();
    const classIds=(state.classCore||[]).map(c=>String(c.classId||c.id||'')).filter(Boolean);
    const duplicateClassIds=classIds.filter((id,i,a)=>a.indexOf(id)!==i);

    const currentYear=currentSchoolYear();
    const studentLocations={};
    (state.classCore||[]).forEach(c=>{
      const cls=normalizeClassProfile(c);
      if(normalizeSchoolYear(cls.schoolYear||currentYear)!==currentYear||cls.archived)return;
      cls.students.forEach(s=>{
        const sid=String(s.studentId||s.id||'');
        if(!sid)return;
        (studentLocations[sid]||(studentLocations[sid]=[])).push(cls.name);
      });
    });
    const duplicateCurrentStudents=Object.entries(studentLocations)
      .filter(([,arr])=>new Set(arr).size>1)
      .map(([studentId,classes])=>({studentId,classes:[...new Set(classes)]}));

    const knownStudents=new Set(Object.keys(store.students||{}));
    (state.classCore||[]).forEach(c=>{
      normalizeClassProfile(c).students.forEach(s=>{
        const sid=String(s.studentId||s.id||'');
        if(sid)knownStudents.add(sid);
      });
    });
    const orphanPending=(state.pendingItems||[]).filter(x=>x.studentId&&!knownStudents.has(String(x.studentId)));
    const legacyPending=(state.pendingItems||[]).filter(x=>!x.studentId&&(x.studentName||x.studentNo));

    const submissions=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    const legacySubmissions=submissions.filter(r=>!r.classId||(!r.studentIds&&Array.isArray(r.missing)));

    const activeClasses=(state.classCore||[]).filter(c=>{
      const cls=normalizeClassProfile(c);
      return normalizeSchoolYear(cls.schoolYear||currentYear)===currentYear&&!cls.archived;
    });

    return {
      schoolYear:currentYear,
      classes:activeClasses.length,
      students:Object.keys(store.students||{}).length,
      enrollments:Object.keys(store.enrollments||{}).length,
      provisionalEnrollments:Object.values(store.enrollments||{}).filter(e=>e.provisional).length,
      duplicateClassIds:[...new Set(duplicateClassIds)],
      duplicateCurrentStudents,
      orphanPending,
      legacyPending,
      legacySubmissions,
      healthy:!duplicateClassIds.length&&!duplicateCurrentStudents.length&&!orphanPending.length
    };
  }

  function crossModuleDataAudit(){
    const currentYear=currentSchoolYear();
    const classes=(state.classCore||[])
      .map(normalizeClassProfile)
      .filter(c=>normalizeSchoolYear(c.schoolYear||currentYear)===currentYear&&!c.archived);

    const classById=new Map(classes.map(c=>[String(c.classId||c.id||''),c]).filter(([id])=>id));
    const classByName=new Map(classes.map(c=>[normalizeClassId(c.name),c]).filter(([name])=>name));

    const knownStudentIds=new Set();
    classes.forEach(c=>(c.students||[]).forEach(s=>{
      const sid=String(s.studentId||s.id||'');
      if(sid)knownStudentIds.add(sid);
    }));

    const pendingOrphans=(state.pendingItems||[])
      .filter(x=>x.studentId&&!knownStudentIds.has(String(x.studentId)))
      .map(x=>({id:x.id,title:x.title||'待辦',studentId:String(x.studentId)}));

    const pendingClassMismatches=(state.pendingItems||[])
      .map(x=>({x,scope:normalizedPendingScope(x)}))
      .filter(({scope})=>scope?.type==='class')
      .filter(({scope})=>{
        const byId=scope.id&&classById.has(String(scope.id));
        const byName=scope.name&&classByName.has(normalizeClassId(scope.name));
        return !byId&&!byName;
      })
      .map(({x,scope})=>({id:x.id,title:x.title||'待辦',classId:scope.id||'',className:scope.name||''}));

    const submissions=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    const submissionClassMismatches=submissions
      .filter(r=>String(r.className||'').trim())
      .filter(r=>!classByName.has(normalizeClassId(r.className)))
      .map(r=>({id:r.id,name:r.name||r.type||'追收項目',className:r.className||''}));

    let seatSnapshot=null;
    try{seatSnapshot=window.__schoolDataService?.seat?.snapshot?.()||null}catch{}
    const seatIssues={
      ready:!!seatSnapshot,
      classMismatch:false,
      unknownStudentIds:[],
      missingSeatStudents:[]
    };

    if(seatSnapshot){
      const seatClassId=String(seatSnapshot.classId||'');
      const seatClassName=normalizeClassId(seatSnapshot.className||'');
      const core=classById.get(seatClassId)||classByName.get(seatClassName)||null;
      seatIssues.classMismatch=!core;

      if(core){
        const coreIds=new Set((core.students||[]).map(s=>String(s.studentId||s.id||'')).filter(Boolean));
        const seatIds=new Set((seatSnapshot.students||[]).map(s=>String(s.id||s.studentId||'')).filter(Boolean));
        seatIssues.unknownStudentIds=[...seatIds].filter(id=>!coreIds.has(id));
        seatIssues.missingSeatStudents=[...coreIds].filter(id=>!seatIds.has(id));
      }
    }

    const criticalCount=
      pendingOrphans.length+
      pendingClassMismatches.length+
      (seatIssues.classMismatch?1:0)+
      seatIssues.unknownStudentIds.length;

    const warningCount=
      submissionClassMismatches.length+
      seatIssues.missingSeatStudents.length+
      (seatIssues.ready?0:1);

    return {
      checkedAt:new Date().toISOString(),
      schoolYear:currentYear,
      classCount:classes.length,
      knownStudentCount:knownStudentIds.size,
      pendingOrphans,
      pendingClassMismatches,
      submissionClassMismatches,
      seat:seatIssues,
      queuedWrites:totalPending(),
      criticalCount,
      warningCount,
      healthy:criticalCount===0
    };
  }

  function stableHash(text=''){
    let h=2166136261;
    for(const ch of String(text)){
      h^=ch.charCodeAt(0);
      h=Math.imul(h,16777619);
    }
    return (h>>>0).toString(36);
  }

  function newClassStableId(name='',schoolYear=''){
    const base=normalizeClassId(name).toLowerCase().replace(/[^a-z0-9]+/g,'_')||'class';
    const year=normalizeSchoolYear(schoolYear||currentSchoolYear()).replace('/','_');
    return `class_${year}_${base}_${Date.now().toString(36)}`;
  }

  function migratedStudentId(classId,index,name=''){
    return `student_${stableHash(`${classId}|${index}|${String(name).trim()}`)}`;
  }

  function newStudentId(classId=''){
    const rand=Math.random().toString(36).slice(2,8);
    return `student_${stableHash(classId)}_${Date.now().toString(36)}_${rand}`;
  }

  function normalizeStudentRecord(student,index,classId){
    if(student && typeof student==='object' && !Array.isArray(student)){
      const name=String(student.name||student.studentName||'').trim();
      return {
        id:String(student.id||student.studentId||migratedStudentId(classId,index,name)),
        studentId:String(student.studentId||student.id||migratedStudentId(classId,index,name)),
        name,
        number:index+1
      };
    }

    const name=String(student||'').trim();
    const sid=migratedStudentId(classId,index,name);
    return {id:sid,studentId:sid,name,number:index+1};
  }

  function normalizeClassProfile(rec={}){
    const classId=String(rec.classId||rec.id||newClassStableId(rec.name||''));
    const students=Array.isArray(rec.students)
      ? rec.students.map((s,i)=>normalizeStudentRecord(s,i,classId)).filter(s=>s.name)
      : [];

    return {
      ...rec,
      id:classId,
      classId,
      schemaVersion:2,
      rosterVersion:Number(rec.rosterVersion)||1,
      schoolYear:normalizeSchoolYear(rec.schoolYear||currentSchoolYear()),
      archived:!!rec.archived,
      name:normalizeClassId(rec.name||''),
      students:students.map((s,i)=>({...s,number:i+1})),
      createdAt:rec.createdAt||new Date().toISOString(),
      updatedAt:rec.updatedAt||new Date().toISOString()
    };
  }

  function studentName(student){
    return typeof student==='string' ? student : String(student?.name||'');
  }

  function studentIdOf(student){
    return typeof student==='object' && student
      ? String(student.studentId||student.id||'')
      : '';
  }

  function reconcileStudentNames(rec,names=[]){
    const cls=normalizeClassProfile(rec);
    const old=cls.students.map(x=>({...x}));
    const used=new Set();
    const result=new Array(names.length);

    // 1. Preserve IDs by exact name first. This also survives reordering.
    names.forEach((name,i)=>{
      const hitIndex=old.findIndex((s,j)=>!used.has(j)&&s.name===name);
      if(hitIndex>=0){
        used.add(hitIndex);
        result[i]={...old[hitIndex],name,number:i+1};
      }
    });

    // 2. If list length is unchanged, unmatched same-position item is most likely a rename.
    if(names.length===old.length){
      names.forEach((name,i)=>{
        if(result[i])return;
        if(!used.has(i)){
          used.add(i);
          result[i]={...old[i],name,number:i+1};
        }
      });
    }

    // 3. Truly new students get a new stable ID.
    names.forEach((name,i)=>{
      if(result[i])return;
      const sid=newStudentId(cls.classId);
      result[i]={id:sid,studentId:sid,name,number:i+1};
    });

    return result;
  }


  function parseStudentLinesOrdered(text=''){
    return String(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  }

  function renameStudentsByPosition(rec,names=[]){
    const cls=normalizeClassProfile(rec);
    const old=cls.students.map(x=>({...x}));
    if(names.length!==old.length){
      throw new Error(`改姓名模式必須保持原有人數（目前 ${old.length} 人，貼上 ${names.length} 人）。`);
    }
    return names.map((name,i)=>({
      ...old[i],
      id:old[i].studentId||old[i].id,
      studentId:old[i].studentId||old[i].id,
      name:String(name||'').trim(),
      number:i+1
    }));
  }

  function rebuildStudentsWithNewIds(rec,names=[]){
    const cls=normalizeClassProfile(rec);
    return names.map((name,i)=>{
      const sid=newStudentId(cls.classId);
      return {id:sid,studentId:sid,name:String(name||'').trim(),number:i+1};
    });
  }

  function numberedPlaceholderNames(count=0){
    const n=Math.max(0,Math.min(80,Number(count)||0));
    const width=Math.max(2,String(n).length);
    return Array.from({length:n},(_,i)=>String(i+1).padStart(width,'0'));
  }

  function migrateClassCoreRecords(records=[]){
    let changed=false;
    const normalized=(Array.isArray(records)?records:[]).map(rec=>{
      const next=normalizeClassProfile(rec);
      if(
        rec?.schemaVersion!==2 ||
        !rec?.classId ||
        !Array.isArray(rec?.students) ||
        rec.students.some(s=>typeof s==='string'||!s?.studentId)
      )changed=true;
      return next;
    });
    return {records:normalized,changed};
  }

  function classProfileByName(name=''){
    const cls=normalizeClassId(name),year=currentSchoolYear();
    const hits=state.classCore.filter(x=>normalizeClassId(x.name)===cls);
    return hits.find(x=>normalizeSchoolYear(x.schoolYear||year)===year&&!x.archived)
      ||hits.find(x=>!x.archived)
      ||hits[0]
      ||null;
  }

  function classIdForName(name=''){
    return classProfileByName(name)?.id||'';
  }

  function normalizeClassId(name=''){
    return String(name||'').trim().toUpperCase().replace(/\s+/g,'');
  }

  function loadClassCore(){
    let migrated=false;
    try{
      const x=JSON.parse(localStorage.getItem(CLASS_CORE_LOCAL_KEY)||'[]');
      const result=migrateClassCoreRecords(Array.isArray(x)?x:[]);
      state.classCore=result.records;
      migrated=result.changed;
    }catch{state.classCore=[]}
    loadIdentityV1();
    bootstrapClassCoreFromExisting();
    if(migrated)saveClassCore();
    syncIdentityV1FromClassCore();
  }

  function saveClassCore(){
    try{localStorage.setItem(CLASS_CORE_LOCAL_KEY,JSON.stringify(state.classCore))}catch{}
    try{window.dispatchEvent(new CustomEvent('classCoreChanged',{detail:state.classCore.map(x=>({...x}))}))}catch{}
    try{if(state.identityV1)syncIdentityV1FromClassCore()}catch(err){console.warn('[identity v1] sync',err)}
  }

  function bootstrapClassCoreFromExisting(){
    const names=new Set();
    try{knownClassNames().forEach(x=>names.add(normalizeClassId(x)))}catch{}
    homeworkHistoryRowsSafe().forEach(x=>x.className&&x.className!=='未分類'&&names.add(normalizeClassId(x.className)));
    state.submissions.forEach(r=>{
      const c=normalizeClassId(r.className);
      if(c&&c!=='班別')names.add(c);
    });
    let changed=false;
    names.forEach(name=>{
      if(!name)return;
      const year=currentSchoolYear();
      if(!state.classCore.some(c=>normalizeClassId(c.name)===name&&normalizeSchoolYear(c.schoolYear||year)===year&&!c.archived)){
        const classId=newClassStableId(name,year);
        state.classCore.push({
          id:classId,
          classId,
          schemaVersion:2,
          schoolYear:year,
          archived:false,
          name,
          students:[],
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString()
        });
        changed=true;
      }
    });
    if(changed)saveClassCore();
  }

  function homeworkHistoryRowsSafe(){
    try{return typeof homeworkHistoryRows==='function'?homeworkHistoryRows():[]}catch{return[]}
  }

  async function syncClassProfile(rec){
    const normalized=normalizeClassProfile(rec);
    const idx=state.classCore.findIndex(x=>x.id===rec.id);
    if(idx>=0)state.classCore[idx]=normalized;
    saveClassCore();
    if(!state.firebaseReady||!state.user||!navigator.onLine)return;
    try{
      await classCoreCollection().doc(normalized.classId).set(normalized,{merge:true});
      setSync('ok');
    }catch(err){
      console.warn('[v2] class profile sync',err);
      setSync('error');
    }
  }

  async function deleteClassProfile(id){
    state.classCore=state.classCore.filter(x=>x.id!==id);
    saveClassCore();
    if(state.firebaseReady&&state.user&&navigator.onLine){
      try{await classCoreCollection().doc(id).delete();setSync('ok')}catch(err){console.warn('[v2] delete class',err)}
    }
  }

  function loadLocalActivities() {
    try { const x=JSON.parse(localStorage.getItem(ACTIVITY_LOCAL_KEY)||'[]'); state.activities=Array.isArray(x)?x:[]; } catch { state.activities=[]; }
  }
  function notifyCalendarActivityChange(){try{window.dispatchEvent(new CustomEvent('calendarActivityLogsChanged',{detail:state.activities.map(x=>({...x}))}))}catch{try{window.dispatchEvent(new Event('calendarActivityLogsChanged'))}catch{}}}
  function saveLocalActivities(){ try{localStorage.setItem(ACTIVITY_LOCAL_KEY,JSON.stringify(state.activities));}catch{} notifyCalendarActivityChange(); }

  function loadLocalPending(){
    try{
      const x=JSON.parse(localStorage.getItem(PENDING_LOCAL_KEY)||'[]');
      state.pendingItems=Array.isArray(x)?x:[];
    }catch{state.pendingItems=[]}
  }
  function notifyPendingChange(){
    try{window.dispatchEvent(new CustomEvent('pendingItemsChanged',{detail:state.pendingItems.map(x=>({...x}))}))}
    catch{try{window.dispatchEvent(new Event('pendingItemsChanged'))}catch{}}
  }
  function saveLocalPending(){
    try{localStorage.setItem(PENDING_LOCAL_KEY,JSON.stringify(state.pendingItems))}catch{}
    notifyPendingChange();
  }


  function scheduleCloudReconnect(delay=2500){
    if(state.firebaseReady || state.connectRetryTimer) return;
    state.connectRetryTimer=setTimeout(()=>{
      state.connectRetryTimer=null;
      connectData().catch(err=>console.warn('[planner-enhancements] reconnect',err));
    },delay);
  }

  async function connectData() {
    if(state.connecting) return;
    state.connecting=true;

    loadLocalActivities();
    loadLocalPending();
    loadClassCore();
    setSync(navigator.onLine?'connecting':'offline');

    try{
      const user=await getUser();

      if(!user){
        state.firebaseReady=false;
        if(window.__firebaseAuthResolved) setSync('signedout');
        else updateSyncDisplay();
        return;
      }

      state.user=user;
      state.firebaseReady=true;

      if(state.connectRetryTimer){
        clearTimeout(state.connectRetryTimer);
        state.connectRetryTimer=null;
      }

      loadActivityPending();
      loadPendingQueue();
      setSync('syncing');

      await flushActivityPending();
      await flushPendingQueue();

      try{state.unsubSubmissions?.()}catch{}
      try{state.unsubActivities?.()}catch{}
      try{state.unsubPending?.()}catch{}
      try{state.unsubClassCore?.()}catch{}

      state.unsubSubmissions=subCollection().onSnapshot(snap=>{
        state.submissions=snap.docs.map(d=>({id:d.id,...d.data()}));
        updateSyncDisplay();
        renderDashboard();
      },err=>{
        console.warn('[planner-enhancements] submissions snapshot',err);
        state.firebaseReady=false;
        updateSyncDisplay();
        scheduleCloudReconnect(3000);
      });

      state.unsubActivities=activityCollection().orderBy('date','desc').onSnapshot(snap=>{
        const cloud=snap.docs.map(d=>({id:d.id,...d.data()}));
        state.activities=applyOfflineQueueToRecords(cloud,loadActivityPending());
        saveLocalActivities();
        updateSyncDisplay();
        renderDashboard();
        renderStatsIfOpen();
        refreshCategoryList();
        renderCalendarActivityOverlay();
      },err=>{
        console.warn('[planner-enhancements] activities snapshot',err);
        state.firebaseReady=false;
        updateSyncDisplay();
        scheduleCloudReconnect(3000);
      });

      state.unsubPending=pendingCollection().onSnapshot(snap=>{
        const cloud=snap.docs.map(d=>({id:d.id,...d.data()}));
        state.pendingItems=applyOfflineQueueToRecords(cloud,loadPendingQueue());
        saveLocalPending();
        renderDashboard();
        renderPendingList();
        updateSyncDisplay();
      },err=>{
        console.warn('[planner-enhancements] pending snapshot',err);
        state.firebaseReady=false;
        updateSyncDisplay();
        scheduleCloudReconnect(3000);
      });

      state.unsubClassCore=classCoreCollection().onSnapshot(snap=>{
        const cloud=snap.docs.map(d=>({id:d.id,...d.data()}));
        if(cloud.length){
          const migrated=migrateClassCoreRecords(cloud);
          state.classCore=migrated.records;
          saveClassCore();
          if(migrated.changed && navigator.onLine){
            Promise.all(state.classCore.map(rec=>
              classCoreCollection().doc(rec.classId).set(rec,{merge:true}).catch(err=>console.warn('[v2] class migration sync',err))
            )).catch(()=>{});
          }
        }else{
          bootstrapClassCoreFromExisting();
        }
        syncIdentityV1FromClassCore();
        renderWorkspace();
        renderClassCoreList();
      },err=>{
        console.warn('[planner-enhancements] classCore snapshot',err);
      });

      updateSyncDisplay();
    }catch(err){
      console.warn('[planner-enhancements] connectData',err);
      state.firebaseReady=false;
      updateSyncDisplay();
      scheduleCloudReconnect(3000);
    }finally{
      state.connecting=false;
    }
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

  function plannerState(){
    try { return JSON.parse(localStorage.getItem(PLANNER_LOCAL_KEY) || '{}') || {}; }
    catch { return {}; }
  }
  const readPlannerData = plannerState;

  function addDays(dateStr, delta){
    const d = new Date(`${dateStr}T12:00:00`);
    d.setDate(d.getDate() + delta);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function schoolDateFromDM(dm){
    const [day,month] = dm.split('/').map(Number);
    const year = month >= 9 ? 2026 : 2027;
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  function defaultEventKey(e){
    return `${e.start}|${e.end || ''}|${e.type}|${e.title}`;
  }

  function visibleEventType(type,p){
    if(type === 'holiday') return p.showHolidays !== false;
    if(type === 'religious') return p.showReligiousEvents !== false;
    if(type === 'homeroom') return p.showHomeroomEvents !== false;
    return p.showSpecialEvents !== false;
  }

  function prepForDate(date,p){
    const selected = Array.isArray(p.selectedPrepGroups) ? p.selectedPrepGroups : [];
    if(!selected.length) return [];
    const out = [];

    for(const [cycle, dates, day0, day1, day2] of PREP_CYCLES){
      for(const dm of dates){
        const base = schoolDateFromDM(dm);
        const schedule = [
          {date:addDays(base,-1), kind:'簡報會', groups:['全體簡報會']},
          {date:base, kind:'備課', groups:day0},
          {date:addDays(base,1), kind:'備課', groups:day1},
          {date:addDays(base,2), kind:'備課', groups:day2}
        ];
        for(const item of schedule){
          if(item.date !== date) continue;
          const groups = item.groups.filter(g => selected.includes(g));
          if(groups.length){
            out.push({
              category:'備課',
              title:`${item.kind}・${cycle}｜${groups.join('、')}`,
              source:'prep'
            });
          }
        }
      }
    }
    return out;
  }

  function schoolEventsForDate(date,p){
    const deleted = new Set(Array.isArray(p.deletedDefaultEventKeys) ? p.deletedDefaultEventKeys : []);
    const custom = Array.isArray(p.customCalendarEvents) ? p.customCalendarEvents : [];
    const all = [
      ...DEFAULT_SCHOOL_EVENTS.filter(e => !deleted.has(defaultEventKey(e))),
      ...custom
    ];

    return all.filter(e => {
      const start = e.start || e.date || '';
      const end = e.end || start;
      return start <= date && end >= date && visibleEventType(e.type || 'special', p);
    }).map(e => ({
      category:
        e.type === 'holiday' ? '假期' :
        e.type === 'religious' ? '宗教活動' :
        e.type === 'homeroom' ? '班主任課' : '特別活動',
      title:e.title || e.name || '活動',
      source:'calendar'
    }));
  }

  function manualNotesForDate(date,p){
    const note = p.calendarNotes?.[date];
    if(!String(note || '').trim()) return [];
    const prefix = p.showGoogleNoteLinks !== false ? '自行輸入・G記事' : '自行輸入';
    return String(note).split(/\n+/).map(x => x.trim()).filter(Boolean).map(title => ({
      category:prefix, title, source:'note'
    }));
  }

  function todayActivities(){
    const date = hkToday();
    const p = plannerState();

    const activityLogs = state.activities
      .filter(a => a.date === date)
      .map(a => ({
        category:a.category || '活動紀錄',
        title:a.title || '',
        source:'activity-log'
      }));

    const combined = [
      ...prepForDate(date,p),
      ...schoolEventsForDate(date,p),
      ...manualNotesForDate(date,p),
      ...activityLogs
    ];

    const seen = new Set();
    return combined.filter(x => {
      const key = `${x.category}|${x.title}`;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function ensureDashboardToggle(){
    let btn=document.getElementById('pe-dashboard-toggle');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='pe-dashboard-toggle';
      btn.className='pe-dashboard-toggle';
      btn.textContent='☀ 今日工作台';
      btn.addEventListener('click',()=>{
        const panel=ensureDashboard();
        panel.classList.toggle('open');
      });
      document.body.appendChild(btn);
    }
    return btn;
  }

  function ensureDashboard(){
    let el=document.getElementById('pe-dashboard');
    if(!el){
      el=document.createElement('aside');
      el.id='pe-dashboard';
      el.className='pe-dashboard';
      document.body.appendChild(el);
    }
    return el;
  }


  function ensureTodayActivityModal(){
    let m=document.getElementById('pe-today-activity-modal');
    if(m)return m;

    m=document.createElement('div');
    m.id='pe-today-activity-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>📅 今日活動</h3>
      <p class="pe-note" id="pe-today-activity-date"></p>
      <div id="pe-today-activity-list"></div>
      <div class="pe-actions">
        <button class="pe-btn primary" id="pe-today-activity-add">＋ 新增今日活動</button>
        <button class="pe-btn" id="pe-today-activity-close">關閉</button>
      </div>
    </div>`;

    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-today-activity-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-today-activity-add').addEventListener('click',()=>{
      const date=m.dataset.date||hkToday();
      closeModal(m);
      openActivityModal(date);
    });

    return m;
  }

  function renderTodayActivityModal(date=hkToday()){
    const m=ensureTodayActivityModal();
    m.dataset.date=date;

    const rows=todayActivities().filter(x=>!x.date||x.date===date);

    m.querySelector('#pe-today-activity-date').textContent=fmt(date);

    const list=m.querySelector('#pe-today-activity-list');
    list.innerHTML=rows.length
      ? rows.map(a=>`
          <button type="button" class="pe-workflow-card" data-today-activity-id="${esc(a.id||'')}">
            <h4>${esc(a.category||'活動')}</h4>
            <div>${esc(a.title||'')}</div>
            ${a.note?`<div class="pe-note">${esc(a.note)}</div>`:''}
          </button>
        `).join('')
      : '<div class="pe-note">今日未有活動紀錄。</div>';

    list.querySelectorAll('[data-today-activity-id]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.dataset.todayActivityId;
        if(!id)return;
        closeModal(m);
        openActivityEdit(id);
      });
    });

    m.classList.add('open');
  }

  function renderDashboard(){
    const board=document.querySelector('.today-board');
    const el=ensureDashboard();
    const toggle=ensureDashboardToggle();

    if(!board||!isVisible(board)){
      toggle.classList.remove('show');
      el.classList.remove('open');
      return;
    }

    toggle.classList.add('show');

    const today=hkToday();
    const lessonGroups=journalSubjectGroups(today);
    const inbox=unifiedInboxRows();
    const follow=state.submissions.filter(needsFollowup);
    const acts=todayActivities();

    const overdue=inbox.filter(x=>x.status==='overdue').length;
    const dueToday=inbox.filter(x=>x.status==='today').length;
    const followPeople=follow.reduce((s,r)=>s+(r.missing?.length||0),0);

    const active=board.querySelector('.today-item.active-now');
    const activeText=active ? active.textContent.replace(/\s+/g,' ').trim() : '';
    const wasOpen=el.classList.contains('open');

    el.innerHTML=`
      <div class="pe-dash-head">
        <b>☀ 今日工作台</b>
        <div><small>${fmt(today)}</small><button type="button" class="pe-dash-close" id="pe-close-dashboard">✕ 收起</button></div>
      </div>

      ${activeText?`<div class="pe-dash-row" style="margin-bottom:7px"><b style="color:#80542f">而家：</b>${esc(activeText)}</div>`:''}

      <div class="pe-dash-summary pe-dash-summary-v220">
        <button type="button" class="pe-dash-card pe-dash-direct" id="pe-dash-lessons">
          <b>${lessonGroups.length}</b>
          <span>🧭 今日課堂</span>
          <small>按班別＋科目整理</small>
        </button>

        <button type="button" class="pe-dash-card pe-dash-direct ${overdue?'danger':(dueToday?'warn':'')}" id="pe-dash-inbox">
          <b>${inbox.length}</b>
          <span>📥 未完成</span>
          <small>${overdue?`逾期 ${overdue}`:dueToday?`今日 ${dueToday}`:'查看 Inbox'}</small>
        </button>

        <button type="button" class="pe-dash-card pe-dash-direct ${follow.length?'warn':''}" id="pe-dash-follow">
          <b>${follow.length}</b>
          <span>📋 追收</span>
          <small>${followPeople?`欠 ${followPeople} 人次`:'暫無追收'}</small>
        </button>

        <button type="button" class="pe-dash-card pe-dash-direct" id="pe-dash-activity">
          <b>${acts.length}</b>
          <span>📅 活動</span>
          <small>${acts.length?'查看今日活動清單':'今日未有活動'}</small>
        </button>
      </div>`;

    el.querySelector('#pe-close-dashboard')?.addEventListener('click',()=>el.classList.remove('open'));

    el.querySelector('#pe-dash-lessons')?.addEventListener('click',()=>{
      el.classList.remove('open');
      safeOpenWorkflow(today,0);
    });

    el.querySelector('#pe-dash-inbox')?.addEventListener('click',()=>{
      el.classList.remove('open');
      safeOpenInbox();
    });

    el.querySelector('#pe-dash-follow')?.addEventListener('click',()=>{
      el.classList.remove('open');
      openClassCenter();
      setTimeout(()=>{
        const m=document.getElementById('pe-class-center-modal');
        if(m){
          m.dataset.tab='submission';
          safeRenderModule('Class Center',renderClassCenter,err=>{
            const out=m.querySelector('#pe-class-center-content');
            if(out)out.innerHTML=moduleErrorHtml('班級中心顯示錯誤',err);
          });
        }
      },0);
    });

    el.querySelector('#pe-dash-activity')?.addEventListener('click',()=>{
      el.classList.remove('open');
      safeRenderModule('Today Activity',()=>renderTodayActivityModal(today),err=>{
        const m=ensureTodayActivityModal();
        const out=m.querySelector('#pe-today-activity-list');
        if(out)out.innerHTML=moduleErrorHtml('今日活動顯示錯誤',err);
        m.classList.add('open');
      });
    });

    if(wasOpen)el.classList.add('open');
  }

  function visibleCalendarGrid(){
    return [...document.querySelectorAll('.calendar-grid')].find(g=>isVisible(g)) || null;
  }

  function visibleCalendarMonth(){
    const monthInput=[...document.querySelectorAll('.month-nav input[type="month"]')].find(el=>isVisible(el));
    if(monthInput?.value && /^\d{4}-\d{2}$/.test(monthInput.value)) return monthInput.value;

    const p=plannerState();
    if(p.month && /^\d{4}-\d{2}$/.test(p.month)) return p.month;

    return hkToday().slice(0,7);
  }

  function ensureCalendarActivityLayer(){return null}
  function renderCalendarActivityOverlay(){notifyCalendarActivityChange()}

  function currentCalendarVisible(){return !!visibleCalendarGrid()}
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
      el.innerHTML='<button type="button" id="pe-search-journal">🔎 全站搜尋</button>';
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

  const quickActivityDates=new Set();
  function renderQuickActivityDates(){
    const out=document.getElementById('pe-quick-act-dates');
    if(!out)return;
    const dates=[...quickActivityDates].sort();
    out.innerHTML=dates.length?dates.map(d=>`<span class="pe-quick-date-chip">${fmt(d)}<button type="button" data-remove-quick-date="${esc(d)}">×</button></span>`).join(''):'<span class="pe-note">未加入日期</span>';
    out.querySelectorAll('[data-remove-quick-date]').forEach(b=>b.addEventListener('click',()=>{quickActivityDates.delete(b.dataset.removeQuickDate);renderQuickActivityDates()}));
  }
  function addQuickActivityDate(date=''){
    const d=date||document.getElementById('pe-quick-act-date')?.value||'';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){alert('請先選擇日期。');return}
    quickActivityDates.add(d);renderQuickActivityDates();
  }
  function ensureActivityQuickModal(){
    let m=document.getElementById('pe-activity-quick-modal');
    if(m)return m;
    m=document.createElement('div');m.id='pe-activity-quick-modal';m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog"><h3>⚡ 快速新增活動紀錄</h3><p class="pe-note">同一活動可一次加入多個日期；儲存後每個日期會成為獨立紀錄，統計及月曆會自動更新。</p><div class="pe-grid"><div class="pe-field"><label>活動類別</label><input id="pe-quick-act-category" list="pe-category-list" placeholder="例如：家長聯絡"></div><div class="pe-field"><label>活動名稱</label><input id="pe-quick-act-title" placeholder="例如：家長到校面談"></div><div class="pe-field pe-full"><label>備註（可留空）</label><textarea id="pe-quick-act-note"></textarea></div><div class="pe-field pe-full"><label>加入日期</label><div style="display:grid;grid-template-columns:1fr auto;gap:6px"><input id="pe-quick-act-date" type="date"><button type="button" class="pe-btn" id="pe-quick-act-add-date">＋ 加入日期</button></div></div><div class="pe-field pe-full"><label>已選日期</label><div id="pe-quick-act-dates" class="pe-quick-dates"></div></div></div><div class="pe-actions"><button class="pe-btn" id="pe-quick-act-cancel">取消</button><button class="pe-btn primary" id="pe-quick-act-save">一次過加入</button></div></div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-quick-act-cancel').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-quick-act-add-date').addEventListener('click',()=>addQuickActivityDate());
    m.querySelector('#pe-quick-act-date').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addQuickActivityDate()}});
    m.querySelector('#pe-quick-act-save').addEventListener('click',saveQuickActivities);
    return m;
  }
  function openActivityQuickModal(seed={}){
    const m=ensureActivityQuickModal();refreshCategoryList();quickActivityDates.clear();
    document.getElementById('pe-quick-act-category').value=seed.category||document.getElementById('pe-stat-category')?.value||'';
    document.getElementById('pe-quick-act-title').value=seed.title||'';
    document.getElementById('pe-quick-act-note').value=seed.note||'';
    document.getElementById('pe-quick-act-date').value=hkToday();
    renderQuickActivityDates();m.classList.add('open');
  }
  async function saveQuickActivities(){
    const category=document.getElementById('pe-quick-act-category').value.trim();
    const title=document.getElementById('pe-quick-act-title').value.trim();
    const note=document.getElementById('pe-quick-act-note').value.trim();
    const dates=[...quickActivityDates].sort();
    if(!category||!title){alert('請填寫活動類別及活動名稱。');return}
    if(!dates.length){alert('請至少加入一個日期。');return}
    const now=new Date().toISOString();
    const records=dates.map((date,i)=>({id:`act_${Date.now()}_${i}_${Math.random().toString(36).slice(2,7)}`,date,category,title,note,createdAt:now,updatedAt:now}));
    state.activities.unshift(...records);saveLocalActivities();closeModal(document.getElementById('pe-activity-quick-modal'));
    refreshCategoryList();renderDashboard();renderStatsIfOpen();renderCalendarActivityOverlay();
    for(const rec of records){
      const cloudData={date:rec.date,category,title,note,createdAt:rec.createdAt,updatedAt:rec.updatedAt};
      if(state.firebaseReady&&navigator.onLine){
        try{await activityCollection().doc(rec.id).set(cloudData);saveActivityPending(loadActivityPending().filter(x=>!(x.op==='set'&&x.id===rec.id)))}
        catch{queueActivityPending({op:'set',id:rec.id,data:cloudData})}
      }else queueActivityPending({op:'set',id:rec.id,data:cloudData});
    }
    updateSyncDisplay();
  }

  async function saveActivity(){
    const date=document.getElementById('pe-act-date').value,category=document.getElementById('pe-act-category').value.trim(),title=document.getElementById('pe-act-title').value.trim(),note=document.getElementById('pe-act-note').value.trim();
    if(!date||!category||!title){alert('請填寫日期、活動類別及活動名稱。');return}
    const rec={id:`act_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,date,category,title,note,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    state.activities.unshift(rec);saveLocalActivities();closeModal(document.getElementById('pe-activity-modal'));renderDashboard();renderStatsIfOpen();renderCalendarActivityOverlay();
    const cloudData={date,category,title,note,createdAt:rec.createdAt,updatedAt:rec.updatedAt};
    if(state.firebaseReady&&navigator.onLine){setSync('syncing');try{await activityCollection().doc(rec.id).set(cloudData);saveActivityPending(loadActivityPending().filter(x=>!(x.op==='set'&&x.id===rec.id)));updateSyncDisplay()}catch{queueActivityPending({op:'set',id:rec.id,data:cloudData});alert('Firestore 儲存失敗，已加入待同步。')}}else queueActivityPending({op:'set',id:rec.id,data:cloudData});
  }




  function loadCalendarTagVisibility(){
    try{
      const x=JSON.parse(localStorage.getItem(CAL_TAG_VIS_KEY)||'{}');
      return {activities:x.activities!==false,pending:x.pending!==false};
    }catch{return{activities:true,pending:true}}
  }
  function saveCalendarTagVisibility(v){
    try{localStorage.setItem(CAL_TAG_VIS_KEY,JSON.stringify(v))}catch{}
    try{window.dispatchEvent(new CustomEvent('calendarTagVisibilityChanged',{detail:v}))}catch{}
  }

  function ensureTagVisibilityModal(){
    let modal=document.getElementById('pe-tag-visibility-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-tag-visibility-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog">
      <h3>🏷 月曆標籤顯示</h3>
      <p class="pe-note">只控制月曆上嘅 tag 顯示；資料唔會刪除。一般記事仍維持原本文字形式。</p>
      <div class="pe-tag-toggle-list">
        <label><span>活動紀錄 tag</span><input id="pe-show-activity-tags" type="checkbox"></label>
        <label><span>待處理事項 tag</span><input id="pe-show-pending-tags" type="checkbox"></label>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-tag-close">關閉</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#pe-tag-close').addEventListener('click',()=>closeModal(modal));
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    for(const id of ['pe-show-activity-tags','pe-show-pending-tags']){
      modal.querySelector('#'+id).addEventListener('change',()=>{
        saveCalendarTagVisibility({
          activities:document.getElementById('pe-show-activity-tags').checked,
          pending:document.getElementById('pe-show-pending-tags').checked
        });
      });
    }
    return modal;
  }

  function openTagVisibilityModal(){
    const m=ensureTagVisibilityModal(),v=loadCalendarTagVisibility();
    document.getElementById('pe-show-activity-tags').checked=v.activities;
    document.getElementById('pe-show-pending-tags').checked=v.pending;
    m.classList.add('open');
  }

  function ensureDateQuickModal(){
    let modal=document.getElementById('pe-date-quick-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-date-quick-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog">
      <h3 id="pe-date-quick-title">📅 日期快捷新增</h3>
      <p class="pe-note">一般記事會沿用原本月曆格嘅文字輸入，唔會變成 tag。</p>
      <div class="pe-quick-grid">
        <button id="pe-quick-note"><span>📝</span>一般記事</button>
        <button id="pe-quick-activity"><span>＋</span>活動紀錄</button>
        <button id="pe-quick-pending"><span>⏳</span>待處理事項</button>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-date-quick-close">取消</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-date-quick-close').addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-quick-note').addEventListener('click',()=>{
      const date=modal.dataset.date; closeModal(modal);
      const cell=document.querySelector(`.cal-cell[data-date="${CSS.escape(date)}"]`);
      const ta=cell?.querySelector('textarea');
      if(ta){cell.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>ta.focus(),250)}
    });
    modal.querySelector('#pe-quick-activity').addEventListener('click',()=>{
      const date=modal.dataset.date;closeModal(modal);openActivityModal(date);
    });
    modal.querySelector('#pe-quick-pending').addEventListener('click',()=>{
      const date=modal.dataset.date;closeModal(modal);openPendingModal(date);
    });
    return modal;
  }

  function openDateQuickModal(date){
    if(!date)return;
    const m=ensureDateQuickModal();m.dataset.date=date;
    document.getElementById('pe-date-quick-title').textContent=`📅 ${fmt(date)} 快捷新增`;
    m.classList.add('open');
  }

  function dateDiffDays(from,to){
    const a=new Date(`${from}T12:00:00`),b=new Date(`${to}T12:00:00`);
    return Math.round((b-a)/86400000);
  }
  function addDateDays(date,days){
    const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function nextRepeatDate(date,repeat){
    if(repeat==='weekly')return addDateDays(date,7);
    if(repeat==='biweekly')return addDateDays(date,14);
    if(repeat==='monthly'){
      const d=new Date(`${date}T12:00:00`),day=d.getDate();
      d.setDate(1);d.setMonth(d.getMonth()+1);
      const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
      d.setDate(Math.min(day,last));
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    return date;
  }
  function repeatLabel(v){return v==='weekly'?'每週':v==='biweekly'?'隔週':v==='monthly'?'每月':'不重複'}


  const SCOPE_LABELS={personal:'個人',class:'班別',grade:'年級',subject:'科組',school:'全校',other:'其他'};

  function normalizedPendingScope(item={}){
    const rawType=String(item.scopeType||item.scope||item.targetType||'').trim().toLowerCase();
    let type=rawType;
    let name=String(
      item.scopeName ??
      item.scopeValue ??
      item.targetName ??
      item.groupName ??
      item.className ??
      ''
    ).trim();
    let id=String(item.scopeId||item.classId||'').trim();

    const valid=new Set(['personal','class','grade','subject','school','other']);

    // Accept legacy / localized labels.
    const aliases={
      '個人':'personal','私人':'personal',
      '班別':'class','班級':'class','class':'class',
      '年級':'grade','級別':'grade','grade':'grade',
      '科組':'subject','科目':'subject','subject':'subject',
      '全校':'school','學校':'school','school':'school',
      '其他':'other','other':'other',
      'personal':'personal'
    };
    if(!valid.has(type) && aliases[item.scopeType])type=aliases[item.scopeType];
    if(!valid.has(type) && aliases[item.scope])type=aliases[item.scope];

    // Infer older records from dedicated legacy fields.
    if(!valid.has(type)){
      if(item.grade || item.gradeName){
        type='grade';
        name=String(item.grade||item.gradeName||name).trim();
      }else if(item.subject || item.subjectName || item.department){
        type='subject';
        name=String(item.subject||item.subjectName||item.department||name).trim();
      }else if(item.schoolWide===true || name==='全校'){
        type='school';
        name='全校';
      }else if(item.classId||item.className||item.lessonId||item.sourceType==='lessonWorkflow'){
        type='class';
      }else{
        type='personal';
      }
    }

    if(type==='class'){
      name=normalizeClassId(name||item.className||'');
      id=id||classIdForName(name)||'';
    }else if(type==='grade'){
      name=String(name||item.grade||item.gradeName||'').trim();
      const m=name.match(/(?:P\.?\s*)?([1-6])/i);
      if(m)name=`P.${m[1]}`;
      id='';
    }else if(type==='subject'){
      name=String(name||item.subject||item.subjectName||item.department||'').trim();
      id='';
    }else if(type==='school'){
      name='全校';
      id='';
    }else if(type==='other'){
      name=String(name||item.groupName||'其他').trim()||'其他';
      id='';
    }else{
      type='personal';
      name='個人';
      id='';
    }

    return {type,name,id};
  }

  function scopeLabel(type){return SCOPE_LABELS[type]||'其他'}

  function pendingScopeText(item={}){
    const s=normalizedPendingScope(item);
    return (s.type==='personal'||s.type==='school')
      ? scopeLabel(s.type)
      : (s.name?`${scopeLabel(s.type)}・${s.name}`:scopeLabel(s.type));
  }

  function classScopeOptions(selected=''){
    const names=new Set();
    state.classCore.forEach(c=>c.name&&names.add(normalizeClassId(c.name)));
    try{knownClassNames().forEach(c=>c&&names.add(normalizeClassId(c)))}catch{}
    const normalized=normalizeClassId(selected);
    const options=[...names].filter(Boolean).sort().map(c=>`<option value="${esc(c)}" ${normalized===c?'selected':''}>${esc(c)}</option>`).join('');
    const isCustom=!!selected && !names.has(normalized);
    return options+`<option value="__custom__" ${isCustom?'selected':''}>其他班別／自行輸入</option>`;
  }

  function refreshScopeEditor(prefix,scope={}){
    const typeEl=document.getElementById(`${prefix}-scope-type`);
    if(!typeEl)return;
    const type=typeEl.value||scope.type||'personal';
    const classField=document.getElementById(`${prefix}-scope-class-field`);
    const customClassField=document.getElementById(`${prefix}-scope-custom-class-field`);
    const gradeField=document.getElementById(`${prefix}-scope-grade-field`);
    const nameField=document.getElementById(`${prefix}-scope-name-field`);
    const classEl=document.getElementById(`${prefix}-scope-class`);
    const customClassEl=document.getElementById(`${prefix}-scope-custom-class`);
    const gradeEl=document.getElementById(`${prefix}-scope-grade`);
    const nameEl=document.getElementById(`${prefix}-scope-name`);

    if(classField)classField.style.display=type==='class'?'':'none';
    if(gradeField)gradeField.style.display=type==='grade'?'':'none';
    if(nameField)nameField.style.display=(type==='subject'||type==='other')?'':'none';

    if(classEl){
      const previousValue=classEl.value;
      const previousCustom=previousValue==='__custom__';
      const existingCustomText=(customClassEl?.value||'').trim();

      let selected='';
      if(scope.name){
        selected=scope.name;
      }else if(previousCustom){
        selected=existingCustomText;
      }else if(previousValue){
        selected=previousValue;
      }else{
        selected=getActiveClass();
      }

      classEl.innerHTML='<option value="">選擇班別</option>'+classScopeOptions(selected);

      const normalized=normalizeClassId(selected);
      const formalValues=[...classEl.options].map(o=>o.value).filter(v=>v && v!=='__custom__');
      const matched=formalValues.includes(normalized);

      if(previousCustom && !scope.name){
        classEl.value='__custom__';
      }else if(matched){
        classEl.value=normalized;
      }else if(selected){
        classEl.value='__custom__';
      }else{
        classEl.value='';
      }

      const isCustom=classEl.value==='__custom__';
      if(customClassField)customClassField.style.display=(type==='class'&&isCustom)?'':'none';

      if(customClassEl){
        if(isCustom){
          if(scope.name && !matched)customClassEl.value=scope.name;
          else if(existingCustomText)customClassEl.value=existingCustomText;
        }else{
          customClassEl.value='';
        }
      }
    }else if(customClassField){
      customClassField.style.display='none';
    }

    if(gradeEl && scope.name && /^P\.[1-6]$/i.test(scope.name))gradeEl.value=scope.name.toUpperCase();
    if(nameEl && scope.name && (type==='subject'||type==='other'))nameEl.value=scope.name;
  }

  function readScopeEditor(prefix){
    const type=document.getElementById(`${prefix}-scope-type`)?.value||'personal';
    let name='',id='';
    if(type==='class'){
      const selected=document.getElementById(`${prefix}-scope-class`)?.value||'';
      if(selected==='__custom__'){
        name=(document.getElementById(`${prefix}-scope-custom-class`)?.value||'').trim().toUpperCase();
        id='';
      }else{
        name=normalizeClassId(selected);
        id=classIdForName(name);
      }
    }else if(type==='grade'){
      name=document.getElementById(`${prefix}-scope-grade`)?.value||'';
    }else if(type==='subject'||type==='other'){
      name=document.getElementById(`${prefix}-scope-name`)?.value.trim()||'';
    }else if(type==='school') name='全校';
    else name='個人';
    return {scopeType:type,scopeName:name,scopeId:id};
  }

  function validateScope(scope){
    if(scope.scopeType==='class'&&!scope.scopeName)return '請選擇班別。';
    if(scope.scopeType==='grade'&&!scope.scopeName)return '請選擇年級。';
    if((scope.scopeType==='subject'||scope.scopeType==='other')&&!scope.scopeName)return '請輸入工作範圍名稱。';
    return '';
  }

  function pendingStatus(item){
    if(item.completed)return 'done';
    const t=hkToday();
    if(item.dueDate<t)return 'overdue';
    if(item.dueDate===t)return 'today';
    const days=dateDiffDays(t,item.dueDate);
    const remind=Number(item.remindDays??0);
    if(days>0&&days<=remind)return 'soon';
    return 'upcoming';
  }
  function pendingReminderText(item){
    const st=pendingStatus(item);
    if(st==='overdue')return '⚠ 逾期';
    if(st==='today')return '今日到期';
    if(st==='soon'){
      const d=dateDiffDays(hkToday(),item.dueDate);
      return d===1?'明日到期':`${d}日後到期`;
    }
    return '';
  }
  function pendingPriorityLabel(v){return v==='high'?'高':v==='low'?'低':'中'}


  function unifiedInboxRows(){
    const today=hkToday(),rows=[];

    (state.pendingItems||[]).filter(x=>!x.completed).forEach(x=>{
      const st=pendingStatus(x);
      const s=normalizedPendingScope(x);
      rows.push({
        kind:'待辦',
        type:'pending',
        id:x.id,
        date:x.dueDate||'',
        className:s.type==='class'?(s.name||x.className||''):'',
        scopeType:s.type,
        scopeName:s.name,
        title:x.title||'待辦',
        meta:[pendingReminderText(x),`優先：${pendingPriorityLabel(x.priority)}`].filter(Boolean).join('・'),
        status:st
      });
    });

    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    subs.forEach(r=>{
      const p=submissionProgress(r);
      if(p.state==='done'||p.state==='none')return;
      const date=r.dueDate||r.deadlineDate||r.issueDate||'';
      const st=date?(date<today?'overdue':date===today?'today':'upcoming'):'upcoming';
      const parts=[
        `已交 ${p.submitted}`,
        `欠交 ${p.missing}`,
        `未處理 ${p.pending}`
      ];
      rows.push({
        kind:'追收',
        type:'submission',
        id:r.id,
        date,
        className:r.className||'',
        scopeType:'class',
        scopeName:r.className||'',
        title:r.name||r.type||'追收項目',
        meta:parts.join('｜'),
        status:st
      });
    });

    return rows.sort((a,b)=>{
      const rank={overdue:0,today:1,soon:2,upcoming:3};
      return (rank[a.status]??9)-(rank[b.status]??9)||(a.date||'9999').localeCompare(b.date||'9999');
    });
  }


  function moduleErrorHtml(title='模組顯示錯誤',err=null){
    const msg=String(err?.message||err||'未知錯誤');
    return `<div class="pe-note" style="border:1px solid currentColor;padding:10px;border-radius:10px">
      <b>${esc(title)}</b><br>
      <span>${esc(msg)}</span><br>
      <small>其他功能仍可繼續使用；重新整理後可再試。</small>
    </div>`;
  }

  function ensureV220CompactStyles(){
    if(document.getElementById('pe-v220-compact-styles'))return;
    const s=document.createElement('style');
    s.id='pe-v220-compact-styles';
    s.textContent=`
      .pe-dash-summary-v220{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:7px!important;
      }
      .pe-dash-direct{
        appearance:none!important;
        text-align:left!important;
        min-height:82px!important;
        cursor:pointer!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:2px!important;
      }
      .pe-dash-direct b{font-size:18px!important;line-height:1!important}
      .pe-dash-direct span{font-size:10px!important;font-weight:900!important}
      .pe-dash-direct small{font-size:8px!important;opacity:.72!important}
      @media(max-width:700px){
        .pe-dash-summary-v220{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .pe-dash-direct{min-height:76px!important;padding:8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function safeRenderModule(name,fn,onError){
    try{
      return fn();
    }catch(err){
      console.error(`[planner-enhancements] ${name} render failed`,err);
      try{onError?.(err)}catch(inner){
        console.error(`[planner-enhancements] ${name} error UI failed`,inner);
      }
      return null;
    }
  }


  function loadInboxViewState(){
    try{
      const raw=JSON.parse(localStorage.getItem(INBOX_VIEW_STATE_KEY)||'{}');
      return {
        statusFilter:['all','today','overdue'].includes(raw.statusFilter)?raw.statusFilter:'all',
        scope:['','personal','class','grade','subject','school','other'].includes(raw.scope)?raw.scope:'',
        className:String(raw.className||''),
        scopeName:String(raw.scopeName||''),
        type:['','pending','submission'].includes(raw.type)?raw.type:''
      };
    }catch{
      return {statusFilter:'all',scope:'',className:'',scopeName:'',type:''};
    }
  }

  function saveInboxViewState(m){
    try{
      const scopeSel=m.querySelector('#pe-inbox-scope');
      const classSel=m.querySelector('#pe-inbox-class');
      const scopeNameSel=m.querySelector('#pe-inbox-scope-name');
      const typeSel=m.querySelector('#pe-inbox-type');

      localStorage.setItem(INBOX_VIEW_STATE_KEY,JSON.stringify({
        statusFilter:m.dataset.statusFilter||'all',
        scope:scopeSel?.value||'',
        className:classSel?.value||classSel?.dataset.lastClass||'',
        scopeName:scopeNameSel?.value||scopeNameSel?.dataset.lastValue||'',
        type:typeSel?.value||''
      }));
    }catch{}
  }

  function restoreInboxViewState(m){
    const s=loadInboxViewState();
    m.dataset.statusFilter=s.statusFilter;

    const scopeSel=m.querySelector('#pe-inbox-scope');
    const classSel=m.querySelector('#pe-inbox-class');
    const scopeNameSel=m.querySelector('#pe-inbox-scope-name');
    const typeSel=m.querySelector('#pe-inbox-type');

    if(scopeSel)scopeSel.value=s.scope;
    if(classSel)classSel.dataset.lastClass=s.className;
    if(scopeNameSel)scopeNameSel.dataset.lastValue=s.scopeName;
    if(typeSel)typeSel.value=s.type;
  }

  function ensureInboxModal(){
    let m=document.getElementById('pe-inbox-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-inbox-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>📥 待處理／追收</h3>
      <p class="pe-note">將未完成待辦、deadline 同功課追收集中處理。</p>

      <div class="pe-chip-row" id="pe-inbox-chips">
        <button class="pe-filter-chip active" data-inbox-chip="all">全部</button>
        <button class="pe-filter-chip" data-inbox-chip="today">今日</button>
        <button class="pe-filter-chip" data-inbox-chip="overdue">逾期</button>
        <button class="pe-filter-chip" data-inbox-chip="personal">個人</button>
        <button class="pe-filter-chip" data-inbox-chip="class">班別</button>
        <button class="pe-filter-chip" data-inbox-chip="grade">年級</button>
        <button class="pe-filter-chip" data-inbox-chip="subject">科組</button>
        <button class="pe-filter-chip" data-inbox-chip="school">全校</button>
        <button class="pe-filter-chip" data-inbox-chip="other">其他</button>
      </div>

      <div class="pe-inbox-toolbar">
        <select id="pe-inbox-scope">
          <option value="">全部範圍</option>
          <option value="personal">個人</option>
          <option value="class">班別</option>
          <option value="grade">年級</option>
          <option value="subject">科組</option>
          <option value="school">全校</option>
          <option value="other">其他</option>
        </select>
        <select id="pe-inbox-class"><option value="">全部班別</option></select>
        <select id="pe-inbox-scope-name" style="display:none"><option value="">全部</option></select>
        <select id="pe-inbox-type">
          <option value="">全部類型</option>
          <option value="pending">待辦／Deadline</option>
          <option value="submission">功課追收</option>
        </select>
      </div>

      <div class="pe-actions" style="margin:6px 0 8px">
        <button class="pe-btn primary" id="pe-inbox-add">＋ 新增待辦</button>
      </div>
      <div id="pe-inbox-summary" class="pe-note"></div>
      <div id="pe-inbox-list" class="pe-inbox-list"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-inbox-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);

    m.dataset.statusFilter='all';
    restoreInboxViewState(m);

    m.addEventListener('click',e=>{
      if(e.target===m){closeModal(m);return}

      const chip=e.target.closest('[data-inbox-chip]');
      if(chip){
        const key=chip.dataset.inboxChip||'all';
        const scopeSel=m.querySelector('#pe-inbox-scope');

        if(key==='today'||key==='overdue'){
          m.dataset.statusFilter=key;
          scopeSel.value='';
        }else if(key==='all'){
          m.dataset.statusFilter='all';
          scopeSel.value='';
        }else{
          m.dataset.statusFilter='all';
          scopeSel.value=key;
        }
        saveInboxViewState(m);
        renderInbox();
        return;
      }

      const openBtn=e.target.closest('[data-inbox-open]');
      if(openBtn){
        const type=openBtn.dataset.inboxOpen,id=openBtn.dataset.inboxId;
        closeModal(m);
        if(type==='submission')window.__submissionTrackerAPI?.openRecord?.(id);
        else if(type==='pending')openPendingEdit(id);
        return;
      }

      const doneBtn=e.target.closest('[data-inbox-done]');
      if(doneBtn){
        togglePendingComplete(doneBtn.dataset.inboxDone).then(renderInbox);
      }
    });

    m.querySelector('#pe-inbox-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-inbox-add').addEventListener('click',()=>{
      closeModal(m);
      openPendingModal();
    });

    m.querySelector('#pe-inbox-scope').addEventListener('change',()=>{
      m.dataset.statusFilter='all';
      saveInboxViewState(m);
      renderInbox();
    });

    m.querySelector('#pe-inbox-type').addEventListener('change',()=>{
      saveInboxViewState(m);
      renderInbox();
    });
    m.querySelector('#pe-inbox-scope-name').addEventListener('change',renderInbox);

    m.querySelector('#pe-inbox-class').addEventListener('change',()=>{
      const v=m.querySelector('#pe-inbox-class').value;
      m.querySelector('#pe-inbox-class').dataset.lastClass=v;
      if(v)setActiveClass(v);
      saveInboxViewState(m);
      renderInbox();
    });

    return m;
  }

  function renderInbox(){
    const m=ensureInboxModal();
    const all=unifiedInboxRows();

    const scopeSel=m.querySelector('#pe-inbox-scope');
    const classSel=m.querySelector('#pe-inbox-class');
    const scopeNameSel=m.querySelector('#pe-inbox-scope-name');
    const typeSel=m.querySelector('#pe-inbox-type');

    const statusFilter=m.dataset.statusFilter||'all';
    const scope=scopeSel.value||'';
    const type=typeSel.value||'';
    const rememberedClass=classSel.value||classSel.dataset.lastClass||getActiveClass()||'';
    const rememberedScopeName=scopeNameSel.value||scopeNameSel.dataset.lastValue||'';

    const classes=[...new Set(
      all.filter(x=>x.scopeType==='class')
         .map(x=>normalizeClassId(x.className||x.scopeName))
         .filter(Boolean)
    )].sort();

    classSel.innerHTML='<option value="">全部班別</option>'+
      classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');

    classSel.style.display=scope==='class'?'':'none';
    classSel.disabled=scope!=='class';

    if(scope==='class'){
      const normalized=normalizeClassId(rememberedClass);
      classSel.value=classes.includes(normalized)?normalized:'';
    }else{
      classSel.value='';
    }

    const namedScopeTypes=new Set(['grade','subject','other']);
    if(namedScopeTypes.has(scope)){
      const names=[...new Set(
        all.filter(x=>x.scopeType===scope)
           .map(x=>String(x.scopeName||'').trim())
           .filter(Boolean)
      )].sort((a,b)=>a.localeCompare(b,'zh-Hant'));

      const label=scope==='grade'?'全部年級':scope==='subject'?'全部科組':'全部其他';
      scopeNameSel.style.display='';
      scopeNameSel.innerHTML=`<option value="">${label}</option>`+
        names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
      if(names.includes(rememberedScopeName))scopeNameSel.value=rememberedScopeName;
    }else{
      scopeNameSel.style.display='none';
      scopeNameSel.value='';
    }

    const cls=classSel.value;
    const scopeName=scopeNameSel.value;

    const rows=all.filter(x=>{
      if(statusFilter==='today'&&x.status!=='today')return false;
      if(statusFilter==='overdue'&&x.status!=='overdue')return false;
      if(scope&&x.scopeType!==scope)return false;
      if(scope==='class'&&cls&&normalizeClassId(x.className||x.scopeName)!==cls)return false;
      if(namedScopeTypes.has(scope)&&scopeName&&String(x.scopeName||'')!==scopeName)return false;
      if(type&&x.type!==type)return false;
      return true;
    });

    const overdue=rows.filter(x=>x.status==='overdue').length;
    const today=rows.filter(x=>x.status==='today').length;

    m.querySelector('#pe-inbox-summary').innerHTML=
      `共 <b>${rows.length}</b> 項・逾期 <b>${overdue}</b>・今日 <b>${today}</b>`;

    m.querySelector('#pe-inbox-list').innerHTML=rows.length?rows.map(x=>`
      <div class="pe-inbox-item ${x.status}">
        <div class="pe-inbox-top">
          <b>${esc(x.kind)}｜${esc(x.title)}</b>
          <small>${x.date?fmt(x.date):'未設日期'}</small>
        </div>
        <div class="pe-inbox-meta">
          <span class="pe-scope-tag ${esc(x.scopeType||'personal')}">${esc(x.scopeName||scopeLabel(x.scopeType))}</span>
          ${esc(x.meta||'')}
        </div>
        <div class="pe-inbox-actions">
          <button type="button" data-inbox-open="${esc(x.type)}" data-inbox-id="${esc(x.id||'')}">開啟來源</button>
          ${x.type==='pending'?`<button type="button" data-inbox-done="${esc(x.id||'')}">✓ 完成</button>`:''}
        </div>
      </div>`).join(''):'<div class="pe-note">目前冇符合條件嘅未完成工作。</div>';

    saveInboxViewState(m);

    m.querySelectorAll('[data-inbox-chip]').forEach(btn=>{
      const key=btn.dataset.inboxChip;
      let active=false;
      if(key==='all')active=(statusFilter==='all'&&!scope);
      else if(key==='today'||key==='overdue')active=(statusFilter===key&&!scope);
      else active=(statusFilter==='all'&&scope===key);
      btn.classList.toggle('active',active);
    });

    scopeNameSel.onchange=()=>{
      scopeNameSel.dataset.lastValue=scopeNameSel.value;
      saveInboxViewState(m);
      renderInbox();
    };
  }

  function openInbox(){
    const m=ensureInboxModal();
    restoreInboxViewState(m);
    m.classList.add('open');
    safeRenderModule('Inbox',renderInbox,err=>{
      const out=m.querySelector('#pe-inbox-list');
      if(out)out.innerHTML=moduleErrorHtml('工作 Inbox 顯示錯誤',err);
    });
  }

  function ensurePendingModal(){
    let modal=document.getElementById('pe-pending-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-pending-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog">
      <h3>⏳ 待處理事項</h3>
      <p class="pe-note">記錄未完成工作及 deadline；到期／逾期項目會顯示喺月曆同今日工作台。</p>
      <div class="pe-grid">
        <div class="pe-field pe-full"><label>事項</label><input id="pe-pending-title" placeholder="例如：回覆家長、交報告"></div>
        <div class="pe-field"><label>Deadline</label><input id="pe-pending-date" type="date"></div>
        <div class="pe-field"><label>工作範圍</label><select id="pe-pending-scope-type"><option value="personal">個人</option><option value="class">班別</option><option value="grade">年級</option><option value="subject">科組</option><option value="school">全校</option><option value="other">其他</option></select></div>
        <div class="pe-field" id="pe-pending-scope-class-field" style="display:none"><label>班別</label><select id="pe-pending-scope-class"></select></div>
        <div class="pe-field" id="pe-pending-scope-custom-class-field" style="display:none"><label>其他班別</label><input id="pe-pending-scope-custom-class" placeholder="例如：4E／5B補課組"></div>
        <div class="pe-field" id="pe-pending-scope-grade-field" style="display:none"><label>年級</label><select id="pe-pending-scope-grade"><option value="P.1">P.1</option><option value="P.2">P.2</option><option value="P.3">P.3</option><option value="P.4">P.4</option><option value="P.5">P.5</option><option value="P.6">P.6</option></select></div>
        <div class="pe-field" id="pe-pending-scope-name-field" style="display:none"><label>範圍名稱</label><input id="pe-pending-scope-name" placeholder="例如：中文科／校務處"></div>
        <div class="pe-field"><label>優先級</label><select id="pe-pending-priority"><option value="high">高</option><option value="medium" selected>中</option><option value="low">低</option></select></div>
        <div class="pe-field"><label>重複</label><select id="pe-pending-repeat"><option value="none">不重複</option><option value="weekly">每週</option><option value="biweekly">隔週</option><option value="monthly">每月</option></select></div>
        <div class="pe-field"><label>提前提醒</label><select id="pe-pending-remind"><option value="0">到期日</option><option value="1" selected>1日前</option><option value="3">3日前</option><option value="7">7日前</option></select></div>
        <div class="pe-field pe-full" id="pe-pending-student-field" style="display:none">
          <label>學生</label>
          <div id="pe-pending-student-label" class="pe-note" style="margin:0;padding:8px 10px;border:1px solid #dde4ec;border-radius:10px;background:#f8fbff"></div>
        </div>
        <div class="pe-field pe-full"><label>備註（可留空）</label><textarea id="pe-pending-note"></textarea></div>
      </div>
      <div class="pe-actions"><button class="pe-btn primary" id="pe-pending-add">＋ 加入待辦</button></div>
      <div class="pe-stat-toolbar" style="margin-top:10px">
        <select id="pe-pending-filter"><option value="open">未完成</option><option value="done">已完成</option><option value="all">全部</option></select>
        <input id="pe-pending-search" placeholder="搜尋事項／備註">
      </div>
      <div id="pe-pending-list"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-pending-close">關閉</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-pending-close').addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-pending-scope-type').addEventListener('change',()=>refreshScopeEditor('pe-pending'));
    modal.querySelector('#pe-pending-scope-class').addEventListener('change',()=>refreshScopeEditor('pe-pending'));
    modal.querySelector('#pe-pending-add').addEventListener('click',addPendingItem);
    modal.querySelector('#pe-pending-filter').addEventListener('change',renderPendingList);
    modal.querySelector('#pe-pending-search').addEventListener('input',renderPendingList);
    return modal;
  }



  function pendingStudentText(item={}){
    if(!item.studentId && !item.studentName && !item.studentNo)return '';
    const parts=[];
    if(item.studentNo)parts.push(`班號 ${String(item.studentNo).padStart(2,'0')}`);
    if(item.studentName)parts.push(item.studentName);
    return parts.join('｜') || '已連結學生';
  }

  function renderPendingStudentLink(modalPrefix,item={}){
    const field=document.getElementById(`${modalPrefix}-student-field`);
    const label=document.getElementById(`${modalPrefix}-student-label`);
    if(!field||!label)return;
    const txt=pendingStudentText(item);
    field.style.display=txt?'':'none';
    label.textContent=txt?`👤 ${txt}（學生專屬待辦）`:'';
  }

  function openPendingPrefill(title='',date='',note='',meta={}){
    const m=ensurePendingModal();
    document.getElementById('pe-pending-date').value=date||hkToday();
    document.getElementById('pe-pending-title').value=title;
    document.getElementById('pe-pending-note').value=note;
    document.getElementById('pe-pending-repeat').value='none';
    document.getElementById('pe-pending-remind').value='1';
    m.dataset.prefillMeta=JSON.stringify(meta||{});
    m.dataset.studentId=String(meta.studentId||'');
    m.dataset.studentName=String(meta.studentName||'');
    m.dataset.studentNo=String(meta.studentNo||'');
    renderPendingStudentLink('pe-pending',meta);
    const preScope={type:meta.scopeType||(meta.className||meta.classId?'class':'personal'),name:meta.scopeName||meta.className||'',id:meta.scopeId||meta.classId||''};
    document.getElementById('pe-pending-scope-type').value=preScope.type;
    refreshScopeEditor('pe-pending',preScope);
    m.classList.add('open');
    renderPendingList();
  }

  function openPendingModal(date=''){
    const m=ensurePendingModal();
    document.getElementById('pe-pending-date').value=date||hkToday();
    document.getElementById('pe-pending-title').value='';
    document.getElementById('pe-pending-note').value='';
    document.getElementById('pe-pending-repeat').value='none';
    document.getElementById('pe-pending-remind').value='1';
    m.dataset.prefillMeta='';
    m.dataset.studentId='';
    m.dataset.studentName='';
    m.dataset.studentNo='';
    renderPendingStudentLink('pe-pending',{});
    document.getElementById('pe-pending-scope-type').value='personal';
    refreshScopeEditor('pe-pending',{type:'personal',name:'個人'});
    m.classList.add('open');
    renderPendingList();
  }

  async function addPendingItem(){
    const title=document.getElementById('pe-pending-title').value.trim();
    const dueDate=document.getElementById('pe-pending-date').value;
    const priority=document.getElementById('pe-pending-priority').value;
    const repeat=document.getElementById('pe-pending-repeat').value;
    const remindDays=Number(document.getElementById('pe-pending-remind').value||0);
    const note=document.getElementById('pe-pending-note').value.trim();
    if(!title||!dueDate){alert('請填寫事項及 deadline。');return}
    const manualScope=readScopeEditor('pe-pending');
    const scopeError=validateScope(manualScope);
    if(scopeError){alert(scopeError);return}
    let meta={};
    try{meta=JSON.parse(document.getElementById('pe-pending-modal')?.dataset.prefillMeta||'{}')}catch{}
    const rec={
      id:`todo_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      title,dueDate,priority,repeat,remindDays,note,
      scopeType:meta.scopeType||manualScope.scopeType,
      scopeName:meta.scopeName||meta.className||manualScope.scopeName,
      scopeId:meta.scopeId||meta.classId||manualScope.scopeId,
      classId:(meta.scopeType==='class'||meta.classId||manualScope.scopeType==='class')?(meta.classId||manualScope.scopeId||''):'',
      className:(meta.scopeType==='class'||meta.className||manualScope.scopeType==='class')?(meta.className||manualScope.scopeName||''):'',
      lessonId:meta.lessonId||'',
      homeworkId:meta.homeworkId||'',
      sourceType:meta.sourceType||'manual',
      studentId:meta.studentId||document.getElementById('pe-pending-modal')?.dataset.studentId||'',
      studentName:meta.studentName||document.getElementById('pe-pending-modal')?.dataset.studentName||'',
      studentNo:meta.studentNo||document.getElementById('pe-pending-modal')?.dataset.studentNo||'',
      completed:false,completedAt:'',
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    try{
      const pm=document.getElementById('pe-pending-modal');
      pm.dataset.prefillMeta='';
      pm.dataset.studentId='';
      pm.dataset.studentName='';
      pm.dataset.studentNo='';
      renderPendingStudentLink('pe-pending',{});
    }catch{}
    await dataServiceSavePending(rec);
    renderPendingList();
    renderDashboard();
  }

  function withPendingSyncTimeout(promise,ms=7000){
    return Promise.race([
      promise,
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('pending sync timeout')),ms))
    ]);
  }

  async function syncPendingSet(rec){
    if(!rec?.id)return;
    queuePendingOp({op:'set',id:rec.id,data:rec});

    if(state.firebaseReady&&state.user&&navigator.onLine){
      setSync('syncing');
      try{
        await withPendingSyncTimeout(pendingCollection().doc(rec.id).set(rec,{merge:true}));
        savePendingQueue(loadPendingQueue().filter(x=>!(x.op==='set'&&x.id===rec.id)));
        updateSyncDisplay();
      }catch(err){
        console.warn('[planner-enhancements] pending save kept in queue',err);
        updateSyncDisplay();
      }
    }else updateSyncDisplay();
  }

  async function togglePendingComplete(id){
    const item=state.pendingItems.find(x=>x.id===id);if(!item)return;
    const now=new Date().toISOString();

    if(!item.completed && item.repeat && item.repeat!=='none'){
      const history={...item,id:`${item.id}_done_${Date.now()}`,completed:true,completedAt:now,updatedAt:now,occurrenceOf:item.id,repeat:'none'};
      item.dueDate=nextRepeatDate(item.dueDate,item.repeat);
      item.completed=false;item.completedAt='';item.updatedAt=now;
      await dataServiceSavePending(history);
      await dataServiceSavePending(item);
      renderPendingList();renderDashboard();
      return;
    }

    item.completed=!item.completed;item.completedAt=item.completed?now:'';item.updatedAt=now;
    await dataServiceSavePending(item);
    renderPendingList();renderDashboard();
  }

  async function deletePendingItem(id,skipConfirm=false){
    const item=state.pendingItems.find(x=>x.id===id);
    if(!item)return;
    if(!skipConfirm && !confirm(`確定要刪除「${item.title||'這項待辦'}」？\n刪除後月曆及 Deadline 提醒都會同步移除。`))return;

    state.pendingItems=state.pendingItems.filter(x=>x.id!==id);
    saveLocalPending();
    renderPendingList();
    renderDashboard();

    queuePendingOp({op:'delete',id});

    if(state.firebaseReady&&state.user&&navigator.onLine){
      setSync('syncing');
      try{
        await withPendingSyncTimeout(pendingCollection().doc(id).delete());
        savePendingQueue(loadPendingQueue().filter(x=>!(x.op==='delete'&&x.id===id)));
        updateSyncDisplay();
      }catch(err){
        console.warn('[planner-enhancements] pending delete kept in queue',err);
        updateSyncDisplay();
      }
    }else updateSyncDisplay();
  }

  async function deletePendingViaDataService(id,skipConfirm=false){
    const item=state.pendingItems.find(x=>x.id===id);
    if(!item)return;
    if(!skipConfirm && !confirm(`確定要刪除「${item.title||'這項待辦'}」？\n刪除後月曆及 Deadline 提醒都會同步移除。`))return;
    await dataServiceRemovePending(id);
    renderPendingList();
    renderDashboard();
  }

  function renderPendingList(){
    const out=document.getElementById('pe-pending-list');if(!out)return;
    const mode=document.getElementById('pe-pending-filter')?.value||'open';
    const q=(document.getElementById('pe-pending-search')?.value||'').trim().toLowerCase();
    let arr=state.pendingItems.filter(x=>{
      if(mode==='open'&&x.completed)return false;
      if(mode==='done'&&!x.completed)return false;
      return !q||`${x.title||''} ${x.note||''} ${pendingScopeText(x)} ${x.studentName||''} ${x.studentNo||''}`.toLowerCase().includes(q);
    }).sort((a,b)=>a.completed!==b.completed?(a.completed?1:-1):(a.dueDate||'').localeCompare(b.dueDate||''));

    const open=state.pendingItems.filter(x=>!x.completed);
    const today=open.filter(x=>pendingStatus(x)==='today').length;
    const overdue=open.filter(x=>pendingStatus(x)==='overdue').length;
    out.innerHTML=`<div class="pe-pending-summary"><span class="pe-pending-badge">未完成 ${open.length}</span><span class="pe-pending-badge today">今日到期 ${today}</span><span class="pe-pending-badge overdue">已逾期 ${overdue}</span></div>`+
      (arr.length?arr.map(x=>{const st=pendingStatus(x);return `<div class="pe-pending-item ${st}"><div class="pe-pending-title">${x.completed?'✓ ':''}${esc(x.title)}</div><div class="pe-pending-meta"><span class="pe-scope-tag ${normalizedPendingScope(x).type}">${esc(pendingScopeText(x))}</span>${pendingStudentText(x)?` <span class="pe-scope-tag" style="background:#eef4ff;border-color:#c8d6ff;color:#3856a6">👤 ${esc(pendingStudentText(x))}</span>`:''} Deadline：${fmt(x.dueDate)}｜優先：${pendingPriorityLabel(x.priority)}｜${repeatLabel(x.repeat||'none')}｜提醒：${Number(x.remindDays??0)}日前${pendingReminderText(x)?`<br><span class="pe-reminder-soon">${pendingReminderText(x)}</span>`:''}${x.note?`<br>${esc(x.note)}`:''}</div><div class="pe-pending-actions"><button class="${x.completed?'':'primary'}" data-pending-toggle="${esc(x.id)}">${x.completed?'設為未完成':'✓ 完成'}</button><button data-pending-delete="${esc(x.id)}">刪除</button></div></div>`}).join(''):'<div class="pe-note">暫時未有符合條件的待處理事項。</div>');
    out.querySelectorAll('[data-pending-toggle]').forEach(b=>b.addEventListener('click',()=>togglePendingComplete(b.dataset.pendingToggle)));
    out.querySelectorAll('[data-pending-delete]').forEach(b=>b.addEventListener('click',()=>deletePendingViaDataService(b.dataset.pendingDelete)));
  }

  function urgentPendingItems(){
    return state.pendingItems.filter(x=>!x.completed&&['soon','today','overdue'].includes(pendingStatus(x))).sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));
  }


  function ensurePendingEditModal(){
    let modal=document.getElementById('pe-pending-edit-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-pending-edit-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog">
      <h3>✏️ 修改待處理事項</h3>
      <div class="pe-grid">
        <div class="pe-field pe-full"><label>事項</label><input id="pe-edit-pending-title"></div>
        <div class="pe-field"><label>Deadline</label><input id="pe-edit-pending-date" type="date"></div>
        <div class="pe-field"><label>工作範圍</label><select id="pe-edit-pending-scope-type"><option value="personal">個人</option><option value="class">班別</option><option value="grade">年級</option><option value="subject">科組</option><option value="school">全校</option><option value="other">其他</option></select></div>
        <div class="pe-field" id="pe-edit-pending-scope-class-field" style="display:none"><label>班別</label><select id="pe-edit-pending-scope-class"></select></div>
        <div class="pe-field" id="pe-edit-pending-scope-custom-class-field" style="display:none"><label>其他班別</label><input id="pe-edit-pending-scope-custom-class" placeholder="例如：4E／5B補課組"></div>
        <div class="pe-field" id="pe-edit-pending-scope-grade-field" style="display:none"><label>年級</label><select id="pe-edit-pending-scope-grade"><option value="P.1">P.1</option><option value="P.2">P.2</option><option value="P.3">P.3</option><option value="P.4">P.4</option><option value="P.5">P.5</option><option value="P.6">P.6</option></select></div>
        <div class="pe-field" id="pe-edit-pending-scope-name-field" style="display:none"><label>範圍名稱</label><input id="pe-edit-pending-scope-name" placeholder="例如：中文科／校務處"></div>
        <div class="pe-field"><label>優先級</label><select id="pe-edit-pending-priority"><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></div>
        <div class="pe-field"><label>重複</label><select id="pe-edit-pending-repeat"><option value="none">不重複</option><option value="weekly">每週</option><option value="biweekly">隔週</option><option value="monthly">每月</option></select></div>
        <div class="pe-field"><label>提前提醒</label><select id="pe-edit-pending-remind"><option value="0">到期日</option><option value="1">1日前</option><option value="3">3日前</option><option value="7">7日前</option></select></div>
        <div class="pe-field pe-full" id="pe-edit-pending-student-field" style="display:none">
          <label>學生</label>
          <div id="pe-edit-pending-student-label" class="pe-note" style="margin:0;padding:8px 10px;border:1px solid #dde4ec;border-radius:10px;background:#f8fbff"></div>
        </div>
        <div class="pe-field pe-full"><label>備註</label><textarea id="pe-edit-pending-note"></textarea></div>
      </div>
      <div class="pe-actions">
        <button class="pe-btn" id="pe-pending-plus1">＋1日</button>
        <button class="pe-btn" id="pe-pending-plus3">＋3日</button>
        <button class="pe-btn" id="pe-pending-nextweek">下星期</button>
      </div>
      <div class="pe-actions">
        <button class="pe-btn danger" id="pe-edit-pending-delete">刪除</button>
        <button class="pe-btn" id="pe-edit-pending-cancel">取消</button>
        <button class="pe-btn" id="pe-edit-pending-complete">✓ 完成今次</button>
        <button class="pe-btn primary" id="pe-edit-pending-save">儲存</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-edit-pending-cancel').addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-edit-pending-delete').addEventListener('click',async()=>{
      const id=modal.dataset.editId;
      const rec=state.pendingItems.find(x=>x.id===id);
      if(!rec)return;
      if(!confirm(`確定要刪除「${rec.title||'這項待辦'}」？\n刪除後月曆及 Deadline 提醒都會同步移除。`))return;
      closeModal(modal);
      await deletePendingViaDataService(id,true);
    });
    modal.querySelector('#pe-edit-pending-scope-type').addEventListener('change',()=>refreshScopeEditor('pe-edit-pending'));
    modal.querySelector('#pe-edit-pending-scope-class').addEventListener('change',()=>refreshScopeEditor('pe-edit-pending'));
    modal.querySelector('#pe-edit-pending-save').addEventListener('click',savePendingEdit);
    modal.querySelector('#pe-edit-pending-complete').addEventListener('click',async()=>{
      const id=modal.dataset.editId;closeModal(modal);await togglePendingComplete(id);
    });
    modal.querySelector('#pe-pending-plus1').addEventListener('click',()=>delayPendingEdit(1));
    modal.querySelector('#pe-pending-plus3').addEventListener('click',()=>delayPendingEdit(3));
    modal.querySelector('#pe-pending-nextweek').addEventListener('click',()=>delayPendingEdit(7));
    return modal;
  }

  function openPendingEdit(id){
    const rec=state.pendingItems.find(x=>x.id===id);if(!rec)return;
    const m=ensurePendingEditModal();m.dataset.editId=id;
    document.getElementById('pe-edit-pending-title').value=rec.title||'';
    document.getElementById('pe-edit-pending-date').value=rec.dueDate||'';
    document.getElementById('pe-edit-pending-priority').value=rec.priority||'medium';
    document.getElementById('pe-edit-pending-repeat').value=rec.repeat||'none';
    document.getElementById('pe-edit-pending-remind').value=String(rec.remindDays??0);
    document.getElementById('pe-edit-pending-note').value=rec.note||'';
    renderPendingStudentLink('pe-edit-pending',rec);
    const scope=normalizedPendingScope(rec);
    document.getElementById('pe-edit-pending-scope-type').value=scope.type;
    refreshScopeEditor('pe-edit-pending',scope);
    m.classList.add('open');
  }

  async function savePendingEdit(){
    const m=document.getElementById('pe-pending-edit-modal'),id=m?.dataset.editId;
    const rec=state.pendingItems.find(x=>x.id===id);if(!rec)return;
    const title=document.getElementById('pe-edit-pending-title').value.trim();
    const dueDate=document.getElementById('pe-edit-pending-date').value;
    if(!title||!dueDate){alert('請填寫事項及 deadline。');return}
    const scope=readScopeEditor('pe-edit-pending');
    const scopeError=validateScope(scope);
    if(scopeError){alert(scopeError);return}
    Object.assign(rec,{
      title,dueDate,
      priority:document.getElementById('pe-edit-pending-priority').value,
      repeat:document.getElementById('pe-edit-pending-repeat').value,
      remindDays:Number(document.getElementById('pe-edit-pending-remind').value||0),
      note:document.getElementById('pe-edit-pending-note').value.trim(),
      scopeType:scope.scopeType,
      scopeName:scope.scopeName,
      scopeId:scope.scopeId,
      classId:scope.scopeType==='class'?scope.scopeId:'',
      className:scope.scopeType==='class'?scope.scopeName:'',
      studentId:rec.studentId||'',
      studentName:rec.studentName||'',
      studentNo:rec.studentNo||'',
      updatedAt:new Date().toISOString()
    });
    await dataServiceSavePending(rec);
    renderPendingList();renderDashboard();closeModal(m);
  }

  async function delayPendingEdit(days){
    const m=document.getElementById('pe-pending-edit-modal'),id=m?.dataset.editId;
    const rec=state.pendingItems.find(x=>x.id===id);if(!rec)return;
    const base=document.getElementById('pe-edit-pending-date').value||rec.dueDate;
    const next=addDateDays(base,days);
    document.getElementById('pe-edit-pending-date').value=next;
    rec.dueDate=next;rec.updatedAt=new Date().toISOString();
    await dataServiceSavePending(rec);
    renderPendingList();renderDashboard();
  }

  function ensureDoneModal(){
    let modal=document.getElementById('pe-done-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-done-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog"><h3>✅ 今日完成檢查</h3><p class="pe-note">快速查看今日仲有冇需要處理的追收項目。活動／會議只作提示，不會自動標記完成。</p><div id="pe-done-content"></div><div class="pe-actions"><button class="pe-btn" id="pe-done-close">關閉</button></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-done-close').addEventListener('click',()=>closeModal(modal));
    return modal;
  }

  function openDoneCheck(){
    const modal=ensureDoneModal();
    const pending=state.submissions.filter(needsFollowup);
    const acts=todayActivities();
    const people=pending.reduce((n,r)=>n+(r.missing?.length||0),0);
    const out=document.getElementById('pe-done-content');
    let html='';
    if(!pending.length){
      html+=`<div class="pe-done-card good"><b>🎉 今日已清</b><div>目前沒有仍需追收的作業／回條。</div></div>`;
    }else{
      html+=`<div class="pe-done-card warn"><b>仲有 ${pending.length} 項追收未清・${people} 人次</b>${pending.slice(0,12).map(r=>`<div>${esc(r.className||'')}｜${esc(r.name||r.type||'項目')}：${esc((r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、'))}</div>`).join('')}</div>`;
    }
    if(acts.length){
      html+=`<div class="pe-done-card"><b>📅 今日活動提示・${acts.length} 項</b>${acts.slice(0,12).map(a=>`<div>${esc(a.category||'活動')}｜${esc(a.title||'')}</div>`).join('')}</div>`;
    }
    const urgent=urgentPendingItems();
    if(urgent.length)html+=`<div class="pe-done-card warn"><b>⏳ Deadline 提醒・${urgent.length} 項</b>${urgent.slice(0,12).map(x=>`<div>${pendingReminderText(x)}｜${esc(x.title||'')}</div>`).join('')}</div>`;
    out.innerHTML=`<div class="pe-done-summary">${html}</div>`;
    modal.classList.add('open');
  }


  function ensureActivityEditModal(){
    let modal=document.getElementById('pe-activity-edit-modal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-activity-edit-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog">
      <h3>✏️ 修改活動紀錄</h3>
      <div class="pe-grid">
        <div class="pe-field"><label>日期</label><input id="pe-edit-act-date" type="date"></div>
        <div class="pe-field"><label>活動類別</label><input id="pe-edit-act-category" list="pe-category-list"></div>
        <div class="pe-field pe-full"><label>活動名稱</label><input id="pe-edit-act-title"></div>
        <div class="pe-field pe-full"><label>備註</label><textarea id="pe-edit-act-note"></textarea></div>
      </div>
      <div class="pe-actions">
        <button class="pe-btn danger" id="pe-edit-act-delete">刪除</button>
        <button class="pe-btn" id="pe-edit-act-cancel">取消</button>
        <button class="pe-btn primary" id="pe-edit-act-save">儲存修改</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});
    modal.querySelector('#pe-edit-act-cancel').addEventListener('click',()=>closeModal(modal));
    modal.querySelector('#pe-edit-act-delete').addEventListener('click',async()=>{
      const id=modal.dataset.editId;
      const rec=state.activities.find(x=>x.id===id);
      if(!rec)return;
      if(!confirm(`確定要刪除「${rec.title||'這項活動'}」？\n刪除後月曆、統計及今日工作台都會同步移除。`))return;
      closeModal(modal);
      await deleteActivity(id,true);
    });
    modal.querySelector('#pe-edit-act-save').addEventListener('click',saveActivityEdit);
    return modal;
  }

  function openActivityEdit(id){
    const rec=state.activities.find(x=>x.id===id);
    if(!rec)return;
    const modal=ensureActivityEditModal();
    modal.dataset.editId=id;
    document.getElementById('pe-edit-act-date').value=rec.date||'';
    document.getElementById('pe-edit-act-category').value=rec.category||'';
    document.getElementById('pe-edit-act-title').value=rec.title||'';
    document.getElementById('pe-edit-act-note').value=rec.note||'';
    refreshCategoryList();
    modal.classList.add('open');
  }

  async function saveActivityEdit(){
    const modal=document.getElementById('pe-activity-edit-modal');
    const id=modal?.dataset.editId;
    const rec=state.activities.find(x=>x.id===id);
    if(!rec)return;

    const date=document.getElementById('pe-edit-act-date').value;
    const category=document.getElementById('pe-edit-act-category').value.trim();
    const title=document.getElementById('pe-edit-act-title').value.trim();
    const note=document.getElementById('pe-edit-act-note').value.trim();
    if(!date||!category||!title){alert('請填寫日期、活動類別及活動名稱。');return}

    Object.assign(rec,{date,category,title,note,updatedAt:new Date().toISOString()});
    saveLocalActivities();
    closeModal(modal);
    refreshCategoryList();
    renderStatsIfOpen();
    renderDashboard();
    renderCalendarActivityOverlay();

    const payload={date,category,title,note,updatedAt:rec.updatedAt};
    if(state.firebaseReady&&navigator.onLine){
      setSync('syncing');
      try{
        await activityCollection().doc(id).set(payload,{merge:true});
        saveActivityPending(loadActivityPending().filter(x=>x.id!==id));
        updateSyncDisplay();
      }catch{
        queueActivityPending({op:'set',id,data:payload});
      }
    }else queueActivityPending({op:'set',id,data:payload});
  }


  function activityCategoryCounts(){
    const map={};
    state.activities.forEach(a=>{
      const c=(a.category||'未分類').trim()||'未分類';
      map[c]=(map[c]||0)+1;
    });
    return map;
  }

  function ensureCategoryManager(){
    let m=document.getElementById('pe-category-manager-modal');
    if(m)return m;
    m=document.createElement('div');m.id='pe-category-manager-modal';m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🏷 活動類型管理</h3>
      <p class="pe-note">可以將舊類型改名，或者將兩個近似類型合併成同一個名稱。所有相關活動紀錄會一併更新。</p>
      <div class="pe-grid">
        <div class="pe-field"><label>原本類型</label><select id="pe-cat-from"></select></div>
        <div class="pe-field"><label>新名稱／合併到</label><input id="pe-cat-to" placeholder="例如：家長聯絡"></div>
      </div>
      <div class="pe-actions"><button class="pe-btn primary" id="pe-cat-merge">改名／合併</button></div>
      <div id="pe-category-manager-list" class="pe-category-manager-list"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-cat-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-cat-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-cat-merge').addEventListener('click',mergeActivityCategory);
    m.querySelector('#pe-cat-from').addEventListener('change',()=>{
      m.querySelector('#pe-cat-to').value=m.querySelector('#pe-cat-from').value;
    });
    return m;
  }

  function renderCategoryManager(){
    const m=ensureCategoryManager(),counts=activityCategoryCounts();
    const cats=Object.keys(counts).sort((a,b)=>a.localeCompare(b,'zh-HK'));
    const select=m.querySelector('#pe-cat-from'),current=select.value;
    select.innerHTML=cats.map(c=>`<option value="${esc(c)}">${esc(c)}（${counts[c]}）</option>`).join('');
    if(cats.includes(current))select.value=current;
    if(!m.querySelector('#pe-cat-to').value && select.value)m.querySelector('#pe-cat-to').value=select.value;
    m.querySelector('#pe-category-manager-list').innerHTML=cats.length?cats.map(c=>`<div class="pe-category-manager-row"><div><b>${esc(c)}</b><small>${counts[c]} 項活動紀錄</small></div><button class="pe-btn" data-cat-use="${esc(c)}">管理</button></div>`).join(''):'<div class="pe-note">暫時未有活動類型。</div>';
    m.querySelectorAll('[data-cat-use]').forEach(b=>b.addEventListener('click',()=>{
      select.value=b.dataset.catUse;
      m.querySelector('#pe-cat-to').value=b.dataset.catUse;
      m.querySelector('#pe-cat-to').focus();
    }));
  }

  function openCategoryManager(){
    ensureCategoryManager().classList.add('open');
    renderCategoryManager();
  }

  async function mergeActivityCategory(){
    const m=ensureCategoryManager(),from=m.querySelector('#pe-cat-from').value.trim(),to=m.querySelector('#pe-cat-to').value.trim();
    if(!from||!to)return alert('請選擇原本類型並輸入新名稱。');
    if(from===to)return alert('新名稱與原本類型相同，毋須修改。');

    const affected=state.activities.filter(a=>((a.category||'未分類').trim()||'未分類')===from);
    if(!affected.length)return;
    if(!confirm(`將「${from}」的 ${affected.length} 項紀錄全部改為「${to}」？`))return;

    const now=new Date().toISOString();
    affected.forEach(a=>{a.category=to;a.updatedAt=now});
    saveLocalActivities();
    refreshCategoryList();
    refreshStatsCategoryOptions();
    renderStatsIfOpen();
    renderCategoryManager();
    renderDashboard();

    for(const a of affected){
      const payload={category:to,updatedAt:now};
      if(state.firebaseReady&&navigator.onLine){
        try{await activityCollection().doc(a.id).set(payload,{merge:true})}
        catch{queueActivityPending({op:'set',id:a.id,data:payload})}
      }else queueActivityPending({op:'set',id:a.id,data:payload});
    }
    updateSyncDisplay();
  }

  function ensureStatsModal(){
    let modal=document.getElementById('pe-stats-modal');if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-stats-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog"><h3>📊 活動紀錄統計</h3><p class="pe-note">按類別檢視出現次數、日期，亦可直接為同一活動一次加入多個日期。</p><div class="pe-stat-quick-panel"><div class="pe-stat-quick-head"><b>⚡ 快速記錄同類活動</b><button type="button" id="pe-stat-quick-add">＋ 快速新增活動</button></div><small class="pe-note">例如同一項「家長面談」發生多日，可一次選好所有日期再儲存。</small></div><div class="pe-stat-toolbar"><select id="pe-stat-range"><option value="year">全學年</option><option value="term1">上學期</option><option value="term2">下學期</option><option value="month">本月</option></select><select id="pe-stat-category"><option value="">全部類型</option></select><input id="pe-stat-search" placeholder="搜尋類別／活動名稱"><div class="pe-stat-actions"><button id="pe-export-csv" title="匯出 CSV">CSV</button><button id="pe-print-stats" title="列印／儲存 PDF">PDF</button></div></div><div id="pe-stat-content"></div><div class="pe-actions"><button class="pe-btn" id="pe-manage-categories">管理活動類型</button><button class="pe-btn" id="pe-stat-close">關閉</button></div></div>`;
    document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});modal.querySelector('#pe-stat-close').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-stat-quick-add').addEventListener('click',()=>openActivityQuickModal());modal.querySelector('#pe-manage-categories').addEventListener('click',openCategoryManager);modal.querySelector('#pe-stat-range').addEventListener('change',()=>{refreshStatsCategoryOptions();renderStats()});modal.querySelector('#pe-stat-category').addEventListener('change',renderStats);modal.querySelector('#pe-stat-search').addEventListener('input',renderStats);modal.querySelector('#pe-export-csv').addEventListener('click',exportActivitiesCsv);modal.querySelector('#pe-print-stats').addEventListener('click',printActivityStats);return modal;
  }
  function schoolYearBounds(){const[y,m]=hkToday().split('-').map(Number),sy=m>=8?y:y-1;return{year:[`${sy}-08-01`,`${sy+1}-07-31`],term1:[`${sy}-08-01`,`${sy}-12-31`],term2:[`${sy+1}-01-01`,`${sy+1}-07-31`]}}
  function statsDateRange(){
    const range=document.getElementById('pe-stat-range')?.value||'year',b=schoolYearBounds();
    let start,end;
    if(range==='month'){
      const ym=hkToday().slice(0,7),[y,m]=ym.split('-').map(Number);
      start=`${ym}-01`;
      end=`${ym}-${String(new Date(y,m,0).getDate()).padStart(2,'0')}`;
    }else [start,end]=b[range]||b.year;
    return {start,end};
  }

  function activitiesInStatsDateRange(){
    const {start,end}=statsDateRange();
    return state.activities.filter(a=>a.date&&a.date>=start&&a.date<=end);
  }

  function refreshStatsCategoryOptions(){
    const select=document.getElementById('pe-stat-category');
    if(!select)return;
    const current=select.value;
    const counts={};
    activitiesInStatsDateRange().forEach(a=>{
      const cat=(a.category||'未分類').trim()||'未分類';
      counts[cat]=(counts[cat]||0)+1;
    });
    const cats=Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0],'zh-HK'));
    select.innerHTML=`<option value="">全部類型（${Object.values(counts).reduce((s,n)=>s+n,0)}）</option>`+
      cats.map(([cat,count])=>`<option value="${esc(cat)}">${esc(cat)}（${count}）</option>`).join('');
    if([...select.options].some(o=>o.value===current))select.value=current;
  }

  function filteredActivities(){
    const q=(document.getElementById('pe-stat-search')?.value||'').trim().toLowerCase();
    const cat=(document.getElementById('pe-stat-category')?.value||'').trim();
    return activitiesInStatsDateRange().filter(a=>{
      const aCat=(a.category||'未分類').trim()||'未分類';
      if(cat&&aCat!==cat)return false;
      return !q||`${a.category||''} ${a.title||''} ${a.note||''}`.toLowerCase().includes(q);
    });
  }
  function renderStats(){const out=document.getElementById('pe-stat-content');if(!out)return;const items=filteredActivities(),groups={};items.forEach(a=>(groups[(a.category||'未分類').trim()||'未分類']||=[]).push(a));const entries=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],'zh-HK'));out.innerHTML=entries.length?entries.map(([cat,arr])=>`<details class="pe-stat-group" open><summary><span>${esc(cat)}</span><span>${arr.length} 次</span></summary><div class="pe-stat-list">${arr.sort((a,b)=>a.date.localeCompare(b.date)).map(a=>`<div class="pe-stat-item"><b>${fmt(a.date)}</b><small><strong>${esc(a.title||'')}</strong>${a.note?`<br>${esc(a.note)}`:''}</small><span class="pe-stat-row-actions"><button data-repeat-activity="${esc(a.id||'')}">＋再記錄</button><button data-edit-activity="${esc(a.id||'')}">修改</button><button data-delete-activity="${esc(a.id||'')}">刪除</button></span></div>`).join('')}</div></details>`).join(''):'<div class="pe-note">這個範圍暫時未有活動紀錄。</div>';out.querySelectorAll('[data-repeat-activity]').forEach(b=>b.addEventListener('click',()=>{const a=state.activities.find(x=>x.id===b.dataset.repeatActivity);if(a)openActivityQuickModal({category:a.category,title:a.title,note:a.note})}));out.querySelectorAll('[data-edit-activity]').forEach(b=>b.addEventListener('click',()=>openActivityEdit(b.dataset.editActivity)));out.querySelectorAll('[data-delete-activity]').forEach(b=>b.addEventListener('click',()=>deleteActivity(b.dataset.deleteActivity)))}
  function openStatsModal(){ensureStatsModal().classList.add('open');refreshStatsCategoryOptions();renderStats()}
  function renderStatsIfOpen(){if(document.getElementById('pe-stats-modal')?.classList.contains('open')){refreshStatsCategoryOptions();renderStats()}}
  async function deleteActivity(id,skipConfirm=false){
    const rec=state.activities.find(x=>x.id===id);
    if(!rec)return;
    if(!skipConfirm && !confirm(`確定要刪除「${rec.title||'這項活動'}」？\n刪除後月曆、統計及今日工作台都會同步移除。`))return;

    state.activities=state.activities.filter(x=>x.id!==id);
    saveLocalActivities();
    refreshCategoryList();
    renderStatsIfOpen();
    renderDashboard();
    renderCalendarActivityOverlay();

    if(state.firebaseReady&&navigator.onLine){
      setSync('syncing');
      try{
        await activityCollection().doc(id).delete();
        saveActivityPending(loadActivityPending().filter(x=>x.id!==id));
        updateSyncDisplay();
      }catch{
        queueActivityPending({op:'delete',id});
      }
    }else queueActivityPending({op:'delete',id});
  }


  function cycleInfoForDate(date){
    const exact=window.__HK_JOURNAL_CYCLE_MAP?.[date];
    if(exact && Number(exact.day)>=1 && Number(exact.day)<=6){
      return {day:Number(exact.day),color:String(exact.color||'').toUpperCase()};
    }
    return null;
  }

  function filterCycleVariant(text='',color=''){
    const value=String(text||'').trim();
    if(!value)return '';
    const matches=[...value.matchAll(/[（(]([AB])[）)]/gi)];
    if(!matches.length)return value;

    const clean=s=>String(s||'').replace(/^[\s／/、;；]+|[\s／/、;；]+$/g,'').trim();
    const parts=[];
    const prefix=clean(value.slice(0,matches[0].index));
    if(prefix)parts.push(prefix);

    matches.forEach((match,idx)=>{
      if(match[1].toUpperCase()!==String(color||'').toUpperCase())return;
      const from=(match.index??0)+match[0].length;
      const to=idx+1<matches.length?matches[idx+1].index:value.length;
      const part=clean(value.slice(from,to));
      if(part)parts.push(part);
    });
    return parts.join('／');
  }

  function semesterWeekForDate(date){
    const upper=[
      "2026-08-30","2026-09-06","2026-09-13","2026-09-20","2026-09-27",
      "2026-10-04","2026-10-11","2026-10-18","2026-10-25","2026-11-01",
      "2026-11-08","2026-11-15","2026-11-22","2026-11-29","2026-12-06",
      "2026-12-13","2026-12-20","2026-12-27","2027-01-03","2027-01-10",
      "2027-01-17","2027-01-24"
    ];
    const lower=[
      "2027-01-31","2027-02-07","2027-02-14","2027-02-21","2027-02-28",
      "2027-03-07","2027-03-14","2027-03-21","2027-03-28","2027-04-04",
      "2027-04-11","2027-04-18","2027-04-25","2027-05-02","2027-05-09",
      "2027-05-16","2027-05-23","2027-05-30","2027-06-06","2027-06-13",
      "2027-06-20","2027-06-27","2027-07-04","2027-07-11"
    ];
    const starts=date<="2027-01-30"?upper:lower;
    let idx=-1;
    for(let i=starts.length-1;i>=0;i--){
      if(starts[i]<=date){idx=i;break}
    }
    if(idx<0)return null;
    const end=addDateDays(starts[idx],6);
    return date<=end?idx+1:null;
  }

  function filterOddEvenVariant(text='',week=null){
    const value=String(text||'').trim();
    const matches=[...value.matchAll(/[（(](單|雙|双)[）)]/g)];
    if(!value||!week||!matches.length)return value;

    const clean=s=>String(s||'').replace(/^[\s／/、;；]+|[\s／/、;；]+$/g,'').trim();
    const parts=[];
    const prefix=clean(value.slice(0,matches[0].index));
    if(prefix)parts.push(prefix);

    matches.forEach((match,idx)=>{
      const odd=match[1]==='單';
      if((week%2===1)!==odd)return;
      const from=(match.index??0)+match[0].length;
      const to=idx+1<matches.length?matches[idx+1].index:value.length;
      const part=clean(value.slice(from,to));
      if(part)parts.push(part);
    });
    return parts.join('／');
  }

  function timetableLessonForHomework(date,periodIndex){
    try{
      const exact=window.__HK_GET_JOURNAL_LESSON?.(date,periodIndex);
      if(typeof exact==='string')return exact.trim();
    }catch(e){
      console.warn('[planner-enhancements] exact journal lesson lookup',date,periodIndex,e);
    }
    return '';
  }

  function knownClassNames(){
    const names=new Set();
    try{
      const prefs=JSON.parse(localStorage.getItem('hk-school-class-student-counts-v1')||'{}');
      Object.keys(prefs||{}).forEach(x=>x&&names.add(String(x).trim().toUpperCase()));
    }catch{}
    (state.submissions||[]).forEach(r=>{
      const c=String(r?.className||'').trim().toUpperCase();
      if(c&&c!=='班別')names.add(c);
    });
    return [...names].filter(Boolean).sort((a,b)=>b.length-a.length);
  }

  function classFromTimetableLesson(text=''){
    const raw=String(text||'').trim();
    const upper=raw.toUpperCase();

    for(const cls of knownClassNames()){
      if(upper.includes(cls))return cls;
    }

    const m=upper.match(/([1-6])\s*([A-E])/);
    return m?`${m[1]}${m[2]}`:'';
  }

  function inferClassFromText(text=''){
    const m=String(text).toUpperCase().match(/\b([1-6][A-E])\b/);
    return m?m[1]:'';
  }


  function dateKeyLocal(d){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function startOfWeekHK(dateStr){
    const d=new Date(`${dateStr}T12:00:00`);
    const day=d.getDay();
    d.setDate(d.getDate()+(day===0?-6:1-day));
    return dateKeyLocal(d);
  }

  function monthRange(dateStr){
    const [y,m]=dateStr.split('-').map(Number);
    const first=new Date(y,m-1,1,12,0,0);
    const last=new Date(y,m,0,12,0,0);
    return [dateKeyLocal(first),dateKeyLocal(last)];
  }

  function academicTermRange(dateStr){
    if(dateStr<'2026-08-31')return ['2026-08-31','2027-01-30'];
    return dateStr<='2027-01-30'
      ? ['2026-08-31','2027-01-30']
      : ['2027-01-31','2027-07-14'];
  }

  function splitHomeworkItems(text=''){
    return String(text||'')
      .replace(/<br\s*\/?>/gi,'\n')
      .replace(/\\n/g,'\n')
      .split(/\r?\n+/)
      .map(x=>x.trim())
      .filter(Boolean);
  }

  function normalizeHomeworkText(text=''){
    return String(text||'')
      .toLowerCase()
      .replace(/^[\s\-–—•·●○▪▫◆◇★☆＊*✓✔☐☑]+/g,'')
      .replace(/^\(?\d{1,2}\)?[.)、．:\-]\s*/g,'')
      .replace(/^[a-z][.)、．:\-]\s*/i,'')
      .replace(/\s+/g,'')
      .replace(/[，。！？、；：,.!?;:（）()\[\]【】「」『』"'`]/g,'');
  }

  function similarityScore(a,b){
    a=normalizeHomeworkText(a);b=normalizeHomeworkText(b);
    if(!a||!b)return 0;
    if(a===b)return 1;

    const min=Math.min(a.length,b.length),max=Math.max(a.length,b.length);
    if(min>=3 && (a.includes(b)||b.includes(a)))return min/max;

    const bigrams=s=>{
      const arr=[];
      for(let i=0;i<s.length-1;i++)arr.push(s.slice(i,i+2));
      return arr;
    };
    const A=bigrams(a),B=bigrams(b);
    if(!A.length||!B.length)return 0;

    const counts=new Map();
    A.forEach(x=>counts.set(x,(counts.get(x)||0)+1));
    let inter=0;
    B.forEach(x=>{
      const c=counts.get(x)||0;
      if(c>0){inter++;counts.set(x,c-1)}
    });
    return (2*inter)/(A.length+B.length);
  }

  function findRecentDuplicates(row,allRows){
    const currentItems=splitHomeworkItems(row.text);
    if(!currentItems.length)return [];

    const sameClass=allRows
      .filter(x=>x!==row&&x.className===row.className&&x.date<row.date)
      .sort((a,b)=>b.date.localeCompare(a.date));

    const results=[];
    const seen=new Set();

    for(const item of currentItems){
      let best=null;
      for(const x of sameClass){
        const days=Math.round((new Date(`${row.date}T12:00:00`)-new Date(`${x.date}T12:00:00`))/86400000);
        if(days<0||days>21)continue;

        for(const prevItem of splitHomeworkItems(x.text)){
          const score=similarityScore(item,prevItem);
          const exact=normalizeHomeworkText(item)===normalizeHomeworkText(prevItem);
          if((exact || score>=0.76) && (!best || score>best.score)){
            best={current:item,previous:prevItem,row:x,score:exact?1:score};
          }
        }
      }
      if(best){
        const key=`${normalizeHomeworkText(best.current)}|${best.row.date}|${normalizeHomeworkText(best.previous)}`;
        if(!seen.has(key)){
          seen.add(key);
          results.push(best);
        }
      }
    }
    return results;
  }

  function matchingSubmission(row){
    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    const rowClass=String(row.className||'').trim().toUpperCase();
    const rowPeriod=`第${row.period}節`;
    const norm=s=>normalizeHomeworkText(String(s||''));

    const sourceParts=r=>{
      const raw=String(r.sourceKey||'');
      const p1=raw.indexOf('|');
      const p2=p1>=0?raw.indexOf('|',p1+1):-1;
      const p3=p2>=0?raw.indexOf('|',p2+1):-1;
      return {
        date:p1>=0?raw.slice(0,p1):'',
        subject:p1>=0&&p2>=0?raw.slice(p1+1,p2):'',
        period:p2>=0&&p3>=0?raw.slice(p2+1,p3):'',
        homework:p3>=0?raw.slice(p3+1):''
      };
    };

    // 1) Strong match: actual journal-source fields.
    let hit=subs.find(r=>{
      const parts=sourceParts(r);
      const date=String(r.issueDate||parts.date||'').slice(0,10);
      const period=String(r.sourcePeriod||parts.period||'').trim();
      const subject=String(r.sourceSubject||parts.subject||'').trim();
      const homework=parts.homework||r.name||'';

      if(date!==row.date)return false;
      if(period && period!==rowPeriod)return false;

      const className=String(r.className||'').trim().toUpperCase();
      if(className && className!=='班別' && rowClass && className!==rowClass)return false;

      if(norm(homework)===norm(row.text))return true;
      if(similarityScore(homework,row.text)>=0.72)return true;

      // If date+period are exact, subject is enough for legacy records whose name was edited later.
      return !!period && period===rowPeriod && (
        subject===row.subject ||
        similarityScore(subject,row.subject)>=0.8
      );
    });
    if(hit)return hit;

    // 2) Same date + same class + edited title/name still containing a homework line.
    hit=subs.find(r=>{
      const parts=sourceParts(r);
      const date=String(r.issueDate||parts.date||'').slice(0,10);
      if(date!==row.date)return false;

      const className=String(r.className||'').trim().toUpperCase();
      if(className && className!=='班別' && rowClass && className!==rowClass)return false;

      const candidates=[parts.homework,r.name,r.sourceSubject].filter(Boolean);
      return candidates.some(v=>{
        if(similarityScore(v,row.text)>=0.68)return true;
        const A=splitHomeworkItems(v),B=splitHomeworkItems(row.text);
        return A.some(a=>B.some(b=>normalizeHomeworkText(a)===normalizeHomeworkText(b)));
      });
    });

    return hit||null;
  }

  function submissionProgress(record){
    if(!record)return {state:'none',count:0,missing:0,submitted:0,pending:0,label:'未追收'};
    const count=Math.max(0,Number(record.studentCount)||0);
    const missing=[...new Set((Array.isArray(record.missing)?record.missing:[]).map(Number).filter(n=>n>0))];
    const submitted=[...new Set((Array.isArray(record.submitted)?record.submitted:[]).map(Number).filter(n=>n>0&&!missing.includes(n)))];
    const pending=Math.max(0,count-missing.length-submitted.length);
    if(missing.length)return {state:'missing',count,missing:missing.length,submitted:submitted.length,pending,label:`追收中・欠 ${missing.length} 人`};
    if(pending>0)return {state:'pending',count,missing:0,submitted:submitted.length,pending,label:`未處理 ${pending} 人`};
    if(count>0 && submitted.length>=count)return {state:'done',count,missing:0,submitted:submitted.length,pending:0,label:'已交齊'};
    // Safety fallback: an empty/invalid record must never be presented as complete.
    return {state:'pending',count,missing:0,submitted:submitted.length,pending:Math.max(1,pending),label:'未處理'};
  }

  function submissionCountsText(record){
    const p=submissionProgress(record);
    if(p.state==='none')return '未追收';
    return `已交 ${p.submitted}｜欠交 ${p.missing}｜未處理 ${p.pending}${p.state==='done'?'｜✓ 已交齊':''}`;
  }

  function submissionCountsHtml(record){
    const p=submissionProgress(record);
    if(p.state==='none')return '<span class="pe-submission-counts">未追收</span>';
    return `<span class="pe-submission-counts">
      <span class="submitted">已交 ${p.submitted}</span>
      <span class="sep">｜</span>
      <span class="missing">欠交 ${p.missing}</span>
      <span class="sep">｜</span>
      <span class="pending">未處理 ${p.pending}</span>
      ${p.state==='done'?'<span class="sep">｜</span><span class="done">✓ 已交齊</span>':''}
    </span>`;
  }

  function submissionStatusForHomework(row){
    const record=matchingSubmission(row);
    if(!record)return {type:'none',label:'未追收',record:null};
    const p=submissionProgress(record);
    if(p.state==='missing')return {type:'open',label:p.label,record};
    if(p.state==='pending')return {type:'pending',label:p.label,record};
    return {type:'done',label:'已交齊',record};
  }

  function homeworkHistoryRows(){
    const p=plannerState(),notes=p.lessonNotes||{},rows=[];
    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];

    for(const [key,val] of Object.entries(notes)){
      if(!val||typeof val!=='string'||!val.trim())continue;
      const m=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-h$/);
      if(!m)continue;

      const date=m[1],periodIndex=Number(m[2]),period=periodIndex+1,text=val.trim();
      if(!Number.isInteger(periodIndex)||periodIndex<0||periodIndex>8)continue;

      const linked=subs.find(r=>{
        if(!r?.sourceKey)return false;
        const bits=String(r.sourceKey).split('|');
        return bits[0]===date && bits[3]===text;
      });

      const timetableLesson=timetableLessonForHomework(date,periodIndex);
      const timetableClass=classFromTimetableLesson(timetableLesson);

      const sourceSubject=linked?.sourceSubject||'';
      const fallbackClass=((linked?.className && linked.className!=='班別')?String(linked.className).trim():'')
        ||inferClassFromText(sourceSubject)
        ||inferClassFromText(text)
        ||'';

      const className=timetableClass||fallbackClass||'未分類';

      rows.push({
        date,
        period,
        periodIndex,
        subject:timetableLesson||sourceSubject||'',
        className,
        text,
        tracked:!!linked,
        exactMatched:!!timetableLesson,
        unresolved:!timetableClass && !fallbackClass
      });
    }

    return rows.sort((a,b)=>b.date.localeCompare(a.date)||a.period-b.period);
  }



  function subjectFromLessonText(lesson='',className=''){
    let s=String(lesson||'').trim();
    const cls=String(className||'').trim();

    // Prefer removing the exact resolved class name first.
    if(cls){
      const escCls=cls.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      s=s.replace(new RegExp(`^${escCls}[\\s\\-–—:：]*`,'i'),'').trim();
    }

    // Fallback for timetable strings such as 4C視藝 / 3A 中文 / P.5B-Math.
    s=s.replace(/^(?:P\.?\s*)?[1-6]\s*[A-E]\s*[\-–—:：]?\s*/i,'').trim();

    return s||String(lesson||'').trim()||'未能辨認課堂';
  }







  function journalClassKey(lesson=''){
    const raw=String(lesson||'').trim();
    if(!raw)return '';

    const candidates=new Set();

    // Formal class profiles first.
    (state.classCore||[]).forEach(c=>{
      const name=String(c?.name||'').trim();
      if(name)candidates.add(name);
    });

    // Then existing known class list used elsewhere in the app.
    knownClassNames().forEach(name=>name&&candidates.add(String(name).trim()));

    const upper=raw.toUpperCase();
    const exact=[...candidates]
      .filter(Boolean)
      .sort((a,b)=>String(b).length-String(a).length)
      .find(name=>upper.includes(String(name).toUpperCase()));

    if(exact)return normalizeClassId(exact);

    // Legacy fallback only, for old data with no class profile yet.
    const m=upper.match(/(?:^|[^0-9A-Z])([1-6])\s*([A-E])(?:[^A-Z]|$)/)
      || upper.match(/^([1-6])\s*([A-E])/);
    return m?normalizeClassId(`${m[1]}${m[2]}`):'';
  }

  function journalDaySlots(date=''){
    try{
      const rows=window.__HK_GET_JOURNAL_DAY?.(date);
      if(Array.isArray(rows))return rows.filter(x=>x&&x.lesson);
    }catch(e){
      console.warn('[planner-enhancements] journal day lookup failed',date,e);
    }

    // Compatibility fallback: still call the journal's exact lesson resolver slot-by-slot.
    const rows=[];
    for(let periodIndex=0;periodIndex<9;periodIndex++){
      const lesson=timetableLessonForHomework(date,periodIndex);
      if(lesson)rows.push({date,periodIndex,period:periodIndex+1,lesson});
    }
    return rows;
  }


  function normalizeJournalSubjectKey(subject=''){
    return String(subject||'')
      .replace(/[（(]\s*[AB]\s*[)）]/gi,'')
      .replace(/\s+/g,'')
      .replace(/[\-–—:：／/]+/g,'')
      .trim()
      .toLowerCase();
  }

  function journalSubjectGroups(date=''){
    const groups=new Map();

    for(const slot of journalDaySlots(date)){
      const lesson=String(slot.lesson||'').trim();
      if(!lesson)continue;

      const className=classFromTimetableLesson(lesson)||'未分類';
      const classKey=journalClassKey(lesson)||normalizeClassId(className);
      const subjectName=subjectFromLessonText(lesson,className);
      const subjectKey=normalizeJournalSubjectKey(subjectName);
      const key=`${classKey}__${subjectKey}`;

      if(!groups.has(key)){
        groups.set(key,{
          key,date,className,classKey,subjectName,subjectKey,lesson,slots:[]
        });
      }

      groups.get(key).slots.push({...slot,className,subjectName});
    }

    return [...groups.values()]
      .map(g=>({...g,slots:g.slots.sort((a,b)=>a.periodIndex-b.periodIndex)}))
      .sort((a,b)=>(a.slots[0]?.periodIndex??99)-(b.slots[0]?.periodIndex??99));
  }

  function previousJournalSubjectGroup(date='',group=null){
    if(!group)return null;

    const cursor=new Date(`${date}T12:00:00`);

    // 只從之前日期開始；同一日 double lesson 永遠不會當作上一堂。
    for(let dayBack=1;dayBack<=180;dayBack++){
      cursor.setDate(cursor.getDate()-1);
      const d=dateKeyLocal(cursor);

      const hit=journalSubjectGroups(d).find(g=>
        g.classKey===group.classKey &&
        g.subjectKey===group.subjectKey
      );

      if(hit)return hit;
    }

    return null;
  }

  function workflowGroupData(date='',groupKey=''){
    const p=plannerState(),notes=p.lessonNotes||{};
    const groups=journalSubjectGroups(date);
    const group=groups.find(g=>g.key===groupKey)||groups[0]||null;

    if(!group){
      return {date,groups,group:null,previous:null,tracking:[]};
    }

    const currentSlots=group.slots.map(slot=>({
      ...slot,
      progress:String(notes[`${date}-${slot.periodIndex}-p`]||'').trim(),
      homework:String(notes[`${date}-${slot.periodIndex}-h`]||'').trim()
    }));

    const previousGroup=previousJournalSubjectGroup(date,group);
    const previous=previousGroup?{
      ...previousGroup,
      slots:previousGroup.slots.map(slot=>({
        ...slot,
        progress:String(notes[`${previousGroup.date}-${slot.periodIndex}-p`]||'').trim(),
        homework:String(notes[`${previousGroup.date}-${slot.periodIndex}-h`]||'').trim()
      }))
    }:null;

    const classId=classIdForName(group.className);

    const tracking=currentSlots.map(slot=>{
      const lessonId=`${date}-p${slot.periodIndex+1}-${group.classKey||'unknown'}`;
      const homeworkId=slot.homework?`${lessonId}-hw`:'';
      const row={
        date,
        period:slot.periodIndex+1,
        periodIndex:slot.periodIndex,
        className:group.className,
        subject:slot.lesson,
        text:slot.homework,
        lessonId,
        homeworkId,
        classId
      };
      return {
        periodIndex:slot.periodIndex,
        lessonId,
        homeworkId,
        status:slot.homework
          ? submissionStatusForHomework(row)
          : {type:'none',label:'沒有功課',record:null}
      };
    });

    return {
      date,
      groups,
      group:{...group,slots:currentSlots},
      previous,
      classId,
      tracking
    };
  }

  function lessonWorkflowData(date,periodIndex){
    const slot=journalDaySlots(date).find(x=>Number(x.periodIndex)===Number(periodIndex));
    const lesson=slot?.lesson||timetableLessonForHomework(date,periodIndex)||'';
    const className=classFromTimetableLesson(lesson)||'未分類';
    const classKey=journalClassKey(lesson)||normalizeClassId(className);
    const subjectName=subjectFromLessonText(lesson,className);
    const subjectKey=normalizeJournalSubjectKey(subjectName);
    const groupKey=`${classKey}__${subjectKey}`;
    return workflowGroupData(date,groupKey);
  }

  function ensureWorkflowModal(){
    let m=document.getElementById('pe-workflow-modal');
    if(m)return m;

    m=document.createElement('div');
    m.id='pe-workflow-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🧭 課堂工作流</h3>
      <p class="pe-note">按「當日實際出現的班別＋科目」整理；double lesson 會合併為同一個工作流，但每節進度／功課仍分開顯示。</p>

      <div class="pe-workflow-head">
        <div class="pe-field">
          <label>日期</label>
          <input id="pe-workflow-date" type="date">
        </div>
        <div class="pe-field">
          <label>目前班別</label>
          <input id="pe-workflow-class" disabled>
        </div>
      </div>

      <div id="pe-workflow-subjects" class="pe-workflow-periods"></div>
      <div id="pe-workflow-content"></div>

      <div class="pe-actions">
        <button class="pe-btn" id="pe-workflow-close">關閉</button>
      </div>
    </div>`;

    document.body.appendChild(m);

    m.dataset.groupKey='';
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-workflow-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-workflow-date').addEventListener('change',()=>{
      m.dataset.groupKey='';
      renderWorkflow();
    });

    return m;
  }

  function renderWorkflow(){
    const m=ensureWorkflowModal();
    const date=m.querySelector('#pe-workflow-date')?.value||hkToday();

    const groups=journalSubjectGroups(date);
    if(!groups.length){
      m.querySelector('#pe-workflow-class').value='';
      m.querySelector('#pe-workflow-subjects').innerHTML='<span class="pe-note">當日未有課堂。</span>';
      m.querySelector('#pe-workflow-content').innerHTML='<div class="pe-note">請選擇另一個上課日。</div>';
      return;
    }

    let groupKey=m.dataset.groupKey;
    if(!groups.some(g=>g.key===groupKey)){
      groupKey=groups[0].key;
      m.dataset.groupKey=groupKey;
    }

    const d=workflowGroupData(date,groupKey);
    const g=d.group;
    if(!g)return;

    m.querySelector('#pe-workflow-class').value=g.className;
    if(g.className&&g.className!=='未分類')setActiveClass(g.className);

    const subjectWrap=m.querySelector('#pe-workflow-subjects');
    subjectWrap.innerHTML=groups.map(x=>{
      const periods=x.slots.map(s=>s.periodIndex+1).join('、');
      return `<button type="button"
        class="${x.key===groupKey?'active':''}"
        data-workflow-group="${esc(x.key)}">
        ${esc(x.className)} ${esc(x.subjectName)}
        <small style="display:block;font-size:.72em;opacity:.72">第${esc(periods)}節</small>
      </button>`;
    }).join('');

    subjectWrap.querySelectorAll('[data-workflow-group]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        m.dataset.groupKey=btn.dataset.workflowGroup;
        renderWorkflow();
      });
    });

    const previous=d.previous;
    const previousDate=previous?.date?fmt(previous.date):'';

    const slotCard=(slot,prefix='')=>`
      <div class="pe-workflow-card ${prefix==='今堂'?'pe-workflow-primary':''}">
        <h4>${esc(prefix)}第${slot.periodIndex+1}節</h4>
        <div><b>進度：</b>${esc(slot.progress||'尚未填寫')}</div>
        <div style="margin-top:5px"><b>功課：</b>${esc(slot.homework||'沒有填寫功課')}</div>
      </div>`;

    const previousHtml=previous
      ? `
        <div class="pe-workflow-card">
          <h4>↩ 上一次 ${esc(g.className)} ${esc(g.subjectName)}・${esc(previousDate)}</h4>
          <div class="pe-note">當日相關節數：${previous.slots.map(s=>`第${s.periodIndex+1}節`).join('、')}</div>
        </div>
        ${previous.slots.map(slot=>slotCard(slot,'上次')).join('')}
      `
      : `<div class="pe-workflow-card"><h4>↩ 上一次同班同科</h4><div>未找到較早日期的同班同科課堂。</div></div>`;

    const currentHtml=`
      <div class="pe-workflow-card">
        <h4>📘 今日科目</h4>
        <div>${esc(g.className)}・${esc(g.subjectName)}</div>
        ${g.slots.length>1?`<div class="pe-note">Double lesson／同日多節：${g.slots.map(s=>`第${s.periodIndex+1}節`).join('、')}</div>`:''}
      </div>
      ${g.slots.map(slot=>slotCard(slot,'今堂')).join('')}
    `;

    const trackingHtml=g.slots.map(slot=>{
      const st=d.tracking.find(x=>x.periodIndex===slot.periodIndex)?.status;
      const record=st?.record||null;
      let label=st?.label||'沒有功課';
      if(record){
        const p=submissionProgress(record);
        label=p.state==='done'?'✓ 已交齊':submissionCountsText(record);
      }
      return `<div><b>第${slot.periodIndex+1}節：</b>${esc(label)}</div>`;
    }).join('');

    const content=m.querySelector('#pe-workflow-content');
    content.innerHTML=`
      <div class="pe-workflow-stack">
        ${previousHtml}
        ${currentHtml}
        <div class="pe-workflow-card">
          <h4>📋 今日追收狀態</h4>
          ${trackingHtml||'<div>沒有功課</div>'}
        </div>
      </div>

      <div class="pe-workflow-actions">
        <button class="pe-btn primary" id="pe-workflow-go-journal">開日誌</button>
        <button class="pe-btn" id="pe-workflow-add-todo">＋待辦</button>
      </div>`;

    content.querySelector('#pe-workflow-go-journal')?.addEventListener('click',()=>{
      const first=g.slots[0];
      closeModal(m);
      jumpToJournalSource({
        route:'journal',
        date,
        periodIndex:first?.periodIndex??0,
        noteType:'p'
      });
    });

    content.querySelector('#pe-workflow-add-todo')?.addEventListener('click',()=>{
      const periodText=g.slots.map(s=>`第${s.periodIndex+1}節`).join('、');
      const homeworkText=g.slots
        .map(s=>s.homework?`第${s.periodIndex+1}節：${s.homework}`:'')
        .filter(Boolean)
        .join('｜');

      closeModal(m);

      openPendingPrefill(
        `跟進 ${g.className} ${g.subjectName}`,
        date,
        `${periodText}${homeworkText?`｜${homeworkText}`:''}`,
        {
          scopeType:'class',
          scopeName:g.className,
          scopeId:d.classId,
          classId:d.classId,
          className:g.className,
          sourceType:'dailySubjectWorkflow',
          subjectName:g.subjectName
        }
      );
    });
  }

  function openWorkflow(date=hkToday(),periodIndex=0){
    const m=ensureWorkflowModal();
    m.querySelector('#pe-workflow-date').value=date;

    const slot=journalDaySlots(date).find(x=>Number(x.periodIndex)===Number(periodIndex));
    if(slot){
      const className=classFromTimetableLesson(slot.lesson)||'未分類';
      const classKey=journalClassKey(slot.lesson)||normalizeClassId(className);
      const subjectName=subjectFromLessonText(slot.lesson,className);
      const subjectKey=normalizeJournalSubjectKey(subjectName);
      m.dataset.groupKey=`${classKey}__${subjectKey}`;
    }else{
      m.dataset.groupKey='';
    }

    m.classList.add('open');
    renderWorkflow();
  }

  function ensureHomeworkHistoryModal(){
    let m=document.getElementById('pe-homework-history-modal');
    if(m)return m;
    m=document.createElement('div');m.id='pe-homework-history-modal';m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>📚 功課管理</h3>
      <p class="pe-note">列出教學日誌曾輸入過的「功課」。每一筆會直接呼叫主日誌本身同一個課堂解析器，以「日期＋原始節數索引」取得畫面真正顯示嘅課堂，再分類班別。無法對應嘅舊資料會獨立收起，唔再混入正常班別清單。</p>
      <div class="pe-homework-toolbar">
        <select id="pe-homework-class"><option value="">全部班別</option></select>
        <input id="pe-homework-search" placeholder="搜尋功課／科目">
      </div>
      <div class="pe-homework-periods">
        <button type="button" data-period="all" class="active">全部</button>
        <button type="button" data-period="week">本週</button>
        <button type="button" data-period="month">本月</button>
        <button type="button" data-period="term">本學期</button>
        <button type="button" data-period="custom">自訂</button>
      </div>
      <div id="pe-homework-custom-range" class="pe-homework-toolbar" style="display:none">
        <input type="date" id="pe-homework-from">
        <input type="date" id="pe-homework-to">
      </div>
      <div id="pe-homework-summary" class="pe-note"></div>
      <div id="pe-homework-list" class="pe-homework-list"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-homework-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-homework-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-homework-class').addEventListener('change',()=>{
      setActiveClass(m.querySelector('#pe-homework-class').value);
      renderHomeworkHistory();
    });
    m.querySelector('#pe-homework-search').addEventListener('input',renderHomeworkHistory);
    if(!m.dataset.period)m.dataset.period='all';
    m.querySelectorAll('[data-period]').forEach(btn=>btn.addEventListener('click',()=>{
      const next=btn.dataset.period||'all';
      m.dataset.period=next;
      m.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x.dataset.period===next));
      m.querySelector('#pe-homework-custom-range').style.display=next==='custom'?'grid':'none';
      renderHomeworkHistory();
    }));
    m.querySelector('#pe-homework-from').addEventListener('change',renderHomeworkHistory);
    m.querySelector('#pe-homework-to').addEventListener('change',renderHomeworkHistory);
    return m;
  }

  function renderHomeworkHistory(){
    const m=ensureHomeworkHistoryModal(),all=homeworkHistoryRows();
    const select=m.querySelector('#pe-homework-class');
    const current=select.value||getActiveClass();
    const normal=all.filter(x=>!x.unresolved);
    const unresolved=all.filter(x=>x.unresolved);
    const classes=[...new Set(normal.map(x=>x.className).filter(x=>x&&x!=='未分類'))].sort((a,b)=>a.localeCompare(b,'zh-HK'));

    select.innerHTML='<option value="">全部班別</option>'
      +classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    if(classes.includes(current))select.value=current;

    const cls=select.value;
    const q=(m.querySelector('#pe-homework-search').value||'').trim().toLowerCase();
    const period=m.dataset.period||'all';
    m.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x.dataset.period===period));
    m.querySelector('#pe-homework-custom-range').style.display=period==='custom'?'grid':'none';
    const today=hkToday();

    let from='',to='';
    if(period==='week'){from=startOfWeekHK(today);to=addDateDays(from,6)}
    else if(period==='month'){[from,to]=monthRange(today)}
    else if(period==='term'){[from,to]=academicTermRange(today)}
    else if(period==='custom'){from=m.querySelector('#pe-homework-from').value||'';to=m.querySelector('#pe-homework-to').value||''}

    let rows=normal.filter(x=>(!cls||x.className===cls)&&(!q||`${x.subject} ${x.text}`.toLowerCase().includes(q)));
    if(from)rows=rows.filter(x=>x.date>=from);
    if(to)rows=rows.filter(x=>x.date<=to);

    const periodLabel={all:'全部',week:'本週',month:'本月',term:'本學期',custom:'自訂'}[period]||'全部';
    m.querySelector('#pe-homework-summary').innerHTML=
      `篩選：<b>${periodLabel}</b>・已對應 <b>${rows.length}</b> 份功課${cls?`・${esc(cls)}`:''}`
      +(from&&to?`・${fmt(from)}–${fmt(to)}`:'')
      +(unresolved.length?`　<small>另有 ${unresolved.length} 筆舊資料無法對應課堂</small>`:'');

    const normalHtml=rows.length?rows.map(x=>{
      const status=submissionStatusForHomework(x);
      const dups=findRecentDuplicates(x,normal);
      return `
      <div class="pe-homework-item">
        <div class="top">
          <div>
            <b>${esc(x.className)}｜${fmt(x.date)}</b>
            <small>第${x.period}節${x.subject?`・${esc(x.subject)}`:''}</small>
          </div>
        </div>
        <p>${esc(x.text)}</p>
        <div class="pe-homework-status-row">
          <span class="label">追收：</span>
          <span class="pe-homework-status ${status.type}">${status.label}</span>
          ${status.record?`<button class="pe-homework-link" data-submission-id="${esc(status.record.id||'')}">查看追收</button>`:''}
        </div>
        ${dups.length?`<div class="pe-homework-dup">⚠ 發現 ${dups.length} 項近 21 日相似功課：<br>${dups.map(d=>`• ${esc(d.current)} → ${fmt(d.row.date)} 第${d.row.period}節：${esc(d.previous)}`).join('<br>')}</div>`:''}
      </div>`}).join(''):'<div class="pe-note">暫時未有符合條件的功課紀錄。</div>';

    const unresolvedHtml=unresolved.length?`
      <details class="pe-homework-unresolved">
        <summary>⚠ 無法對應舊紀錄（${unresolved.length}）</summary>
        <div class="pe-homework-list">
          ${unresolved.map(x=>`
            <div class="pe-homework-item">
              <div class="top">
                <div><b>${fmt(x.date)}</b><small>原記錄：第${x.period}節</small></div>
                <small>未能對到主日誌課堂</small>
              </div>
              <p>${esc(x.text)}</p>
            </div>`).join('')}
        </div>
      </details>`:'';

    m.querySelector('#pe-homework-list').innerHTML=normalHtml+unresolvedHtml;
    m.querySelectorAll('[data-submission-id]').forEach(btn=>btn.addEventListener('click',()=>{
      closeModal(m);
      window.__submissionTrackerAPI?.openRecord?.(btn.dataset.submissionId);
    }));
  }





  function ensureSettingsManager(){
    let m=document.getElementById('pe-settings-manager-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-settings-manager-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>⚙ 設定</h3>
      <p class="pe-note">集中放低頻管理功能，令「更多」選單保持簡潔。</p>
      <div class="pe-settings-grid">
        <button class="pe-btn" id="pe-settings-help">📖 使用教學</button>
        <button class="pe-btn" id="pe-settings-stats">📊 活動統計</button>
        <button class="pe-btn" id="pe-settings-tags">🏷 月曆標籤</button>
        <button class="pe-btn" id="pe-settings-categories">🏷 類型管理</button>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-settings-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-settings-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-settings-help').addEventListener('click',()=>{closeModal(m);openOnboarding()});
    m.querySelector('#pe-settings-stats').addEventListener('click',()=>{closeModal(m);openStatsModal()});
    m.querySelector('#pe-settings-tags').addEventListener('click',()=>{closeModal(m);openTagVisibilityModal()});
    m.querySelector('#pe-settings-categories').addEventListener('click',()=>{closeModal(m);openCategoryManager()});
    return m;
  }

  function openSettingsManager(){
    ensureSettingsManager().classList.add('open');
  }



  function studentProfileFromRefs(classRef='',studentRef=''){
    const classRec=(state.classCore||[]).find(c=>
      String(c.classId||c.id)===String(classRef) ||
      normalizeClassId(c.name)===normalizeClassId(classRef)
    );
    if(!classRec)return null;
    const normalized=normalizeClassProfile(classRec);
    const student=normalized.students.find(s=>
      String(s.studentId||s.id)===String(studentRef) ||
      s.name===String(studentRef) ||
      String(s.number)===String(studentRef)
    );
    if(!student)return null;
    return {classRec:normalized,student};
  }

  function studentMainSnapshot(classRef='',studentRef=''){
    const found=studentProfileFromRefs(classRef,studentRef);
    if(!found)return {classInfo:null,student:null,submissions:[],pending:[],classPending:[]};

    const {classRec,student}=found;
    const className=normalizeClassId(classRec.name);
    const studentNo=Number(student.number)||0;
    const submissions=(window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[])
      .filter(r=>normalizeClassId(r.className)===className)
      .map(r=>{
        const missing=Array.isArray(r.missing)?r.missing.map(Number):[];
        const submitted=Array.isArray(r.submitted)?r.submitted.map(Number):[];
        const status=missing.includes(studentNo)
          ? 'missing'
          : submitted.includes(studentNo)
            ? 'submitted'
            : 'pending';
        return {
          id:r.id,
          name:r.name||r.type||'追收項目',
          type:r.type||'',
          issueDate:r.issueDate||'',
          dueDate:r.dueDate||'',
          deadlineDate:r.deadlineDate||'',
          status
        };
      })
      .sort((a,b)=>String(b.dueDate||b.issueDate||'').localeCompare(String(a.dueDate||a.issueDate||'')))
      .slice(0,20);

    const pending=(state.pendingItems||[])
      .filter(x=>{
        if(x.completed)return false;
        if(x.studentId){
          return String(x.studentId)===String(student.studentId);
        }
        // Legacy fallback only for older student-linked records without studentId.
        if(x.sourceType==='studentProfile' && x.studentName && String(x.studentName).trim()===String(student.name).trim()){
          const s=normalizedPendingScope(x);
          return s.type!=='class' || normalizeClassId(s.name)===className;
        }
        if(x.sourceType==='studentProfile' && x.studentNo && Number(x.studentNo)===studentNo){
          const s=normalizedPendingScope(x);
          return s.type!=='class' || normalizeClassId(s.name)===className;
        }
        return false;
      })
      .map(x=>({
        id:x.id,
        title:x.title||'待辦',
        dueDate:x.dueDate||'',
        priority:x.priority||'medium',
        note:x.note||'',
        status:pendingStatus(x)
      }))
      .sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))
      .slice(0,20);

    const classPending=(state.pendingItems||[])
      .filter(x=>{
        if(x.completed||x.studentId||x.studentName||x.studentNo)return false;
        const s=normalizedPendingScope(x);
        return s.type==='class' &&
          (String(s.id)===String(classRec.classId) || normalizeClassId(s.name)===className);
      })
      .map(x=>({
        id:x.id,
        title:x.title||'班別待辦',
        dueDate:x.dueDate||'',
        priority:x.priority||'medium',
        note:x.note||'',
        status:pendingStatus(x)
      }))
      .sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))
      .slice(0,8);

    return {
      classInfo:{id:classRec.classId||classRec.id,name:classRec.name},
      student:{id:student.studentId||student.id,name:student.name,number:studentNo},
      submissions,
      pending,
      classPending
    };
  }

  window.__studentHubAPI={
    version:3,
    getStudentSnapshot:studentMainSnapshot,
    openSubmission:(recordId='')=>{
      if(!recordId)return;
      closeSeatScore();
      setTimeout(()=>window.__submissionTrackerAPI?.openRecord?.(recordId),40);
    },
    openPending:(pendingId='')=>{
      if(!pendingId)return;
      closeSeatScore();
      setTimeout(()=>openPendingEdit(pendingId),40);
    },
    newStudentPending:(classRef='',studentRef='',title='')=>{
      const found=studentProfileFromRefs(classRef,studentRef);
      if(!found)return;
      const {classRec,student}=found;
      closeSeatScore();
      setTimeout(()=>openPendingPrefill(
        title||'',
        hkToday(),
        '',
        {
          scopeType:'class',
          scopeName:classRec.name,
          scopeId:classRec.classId||classRec.id,
          className:classRec.name,
          classId:classRec.classId||classRec.id,
          studentId:student.studentId||student.id,
          studentName:student.name,
          studentNo:student.number,
          sourceType:'studentProfile'
        }
      ),40);
    }
  };

  const THEME_SYNC_PRESETS={
    '#347968':{name:'薄荷',accent:'#347968',secondary:'#4f8f7d',soft:'#dcefe6',soft2:'#eef7f3',text:'#244039',line:'#b7cfc5',bg:'#eef4f1'},
    '#376F9E':{name:'晴空',accent:'#376f9e',secondary:'#5487b3',soft:'#dcebf6',soft2:'#eef6fb',text:'#294f70',line:'#c6d9e7',bg:'#f2f7fb'},
    '#9A4F5C':{name:'莓果',accent:'#9a4f5c',secondary:'#b36a76',soft:'#f3dfe3',soft2:'#faeef0',text:'#713c45',line:'#e4c8ce',bg:'#fbf4f5'},
    '#715C96':{name:'紫藤',accent:'#715c96',secondary:'#8a76ad',soft:'#e8e0f2',soft2:'#f4f0f8',text:'#554570',line:'#d6cae3',bg:'#f7f4fb'},
    '#343A3B':{name:'黑白',accent:'#343a3b',secondary:'#555d5e',soft:'#eceeed',soft2:'#f5f6f6',text:'#343a3b',line:'#d7dbdc',bg:'#f5f6f6'},
    '#9B6A3F':{name:'布甸狗',accent:'#9b6a3f',secondary:'#a87446',soft:'#fff9ef',soft2:'#fffaf2',text:'#80542f',line:'#eadfce',bg:'#fffaf2'}
  };
  let lastThemeSyncSignature='';

  function currentMainTheme(){
    const main=document.querySelector('main');
    const rawAccent=String(main?.style?.getPropertyValue('--accent')||'').trim();
    const rawSoft=String(main?.style?.getPropertyValue('--soft')||'').trim();
    const key=rawAccent.toUpperCase();
    const preset=THEME_SYNC_PRESETS[key];
    if(preset)return {...preset};
    const accent=rawAccent||'#9b6a3f';
    const soft=rawSoft||'#fff9ef';
    return {name:'自訂',accent,secondary:accent,soft,soft2:soft,text:accent,line:soft,bg:soft};
  }

  function postThemeToSeat(theme){
    const frame=document.getElementById('pe-seat-score-frame');
    if(!frame?.contentWindow)return;
    try{frame.contentWindow.postMessage({type:'hk-theme-sync',theme},location.origin)}catch{}
  }

  function applyClassCoreTheme(theme){
    try{
      const accent=theme?.accent||'#9b6a3f';
      const soft=theme?.soft||'#fff9ef';
      const text=theme?.text||accent;

      const btn=document.getElementById('pe-class-core-add');
      if(btn){
        btn.style.setProperty('background',accent,'important');
        btn.style.setProperty('background-color',accent,'important');
        btn.style.setProperty('border-color',accent,'important');
        btn.style.setProperty('color','#fff','important');
      }

      document.querySelectorAll('#pe-class-core-list [data-class-id], #pe-class-core-list .active, .pe-class-chip.active, .pe-class-tab.active').forEach(el=>{
        const isActive =
          el.classList.contains('active') ||
          el.getAttribute('aria-selected')==='true' ||
          el.dataset.active==='true';
        if(!isActive)return;
        el.style.setProperty('background',accent,'important');
        el.style.setProperty('background-color',accent,'important');
        el.style.setProperty('border-color',accent,'important');
        el.style.setProperty('color','#fff','important');
      });
    }catch{}
  }

  function applySharedTheme(force=false){
    const theme=currentMainTheme();
    const sig=[theme.name,theme.accent,theme.soft].join('|');
    if(!force&&sig===lastThemeSyncSignature)return theme;
    lastThemeSyncSignature=sig;

    const root=document.documentElement;
    root.style.setProperty('--pe-theme-accent',theme.accent);
    root.style.setProperty('--pe-theme-secondary',theme.secondary||theme.accent);
    root.style.setProperty('--pe-theme-soft',theme.soft);
    root.style.setProperty('--pe-theme-soft2',theme.soft2||theme.soft);
    root.style.setProperty('--pe-theme-text',theme.text||theme.accent);
    root.style.setProperty('--pe-theme-line',theme.line||theme.soft);
    root.style.setProperty('--pe-theme-bg',theme.bg||theme.soft2||theme.soft);
    applyClassCoreTheme(theme);

    try{localStorage.setItem('hk-school-theme-sync-v1',JSON.stringify(theme))}catch{}
    try{window.__submissionThemeAPI?.applyTheme?.(theme)}catch(err){console.warn('[theme sync] submission',err)}
    postThemeToSeat(theme);
    window.dispatchEvent(new CustomEvent('hkThemeChanged',{detail:theme}));
    return theme;
  }

  function scheduleThemeSync(){
    [0,40,120,260].forEach(ms=>setTimeout(()=>applySharedTheme(ms===260),ms));
  }

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('.palette-row button'))scheduleThemeSync();
  },true);

  window.addEventListener('load',scheduleThemeSync,{once:true});
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',scheduleThemeSync,{once:true});
  }else{
    scheduleThemeSync();
  }

  function ensureSeatScoreModal(){
    let m=document.getElementById('pe-seat-score-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-seat-score-modal';
    m.className='pe-seat-score-modal';
    m.innerHTML=`<div class="pe-seat-score-shell">
      <div class="pe-seat-score-head">
        <div><b>🪑 座位／積分</b><small id="pe-seat-score-status">共用班級及學生資料</small></div>
        <button type="button" id="pe-seat-score-close">✕</button>
      </div>
      <iframe id="pe-seat-score-frame" title="座位及積分系統" src="seat-score-integrated.html?v=2820"></iframe>
    </div>`;
    document.body.appendChild(m);
    m.querySelector('#pe-seat-score-close').addEventListener('click',()=>closeSeatScore());
    return m;
  }

  function openSeatScore(className=''){
    if(className)setActiveClass(className);
    const m=ensureSeatScoreModal();
    m.classList.add('open');
    document.body.style.overflow='hidden';
    const frame=m.querySelector('#pe-seat-score-frame');
    try{
      frame?.contentWindow?.postMessage({type:'hk-class-core-sync'},location.origin);
      postThemeToSeat(applySharedTheme(true));
    }catch{}
  }

  function closeSeatScore(){
    document.getElementById('pe-seat-score-modal')?.classList.remove('open');
    document.body.style.overflow='';
  }

  function postSeatStudentProfile(className='',studentId=''){
    const m=ensureSeatScoreModal();
    const frame=m.querySelector('#pe-seat-score-frame');
    if(!frame||!studentId)return;
    try{
      frame.contentWindow?.postMessage({
        type:'hk-open-student-profile',
        className:className||getActiveClass()||'',
        studentId:String(studentId)
      },location.origin);
    }catch(err){
      console.warn('[phase2.2] open student profile',err);
    }
  }

  function openSeatStudentProfile(className='',studentId=''){
    if(!studentId)return;
    if(className)setActiveClass(className);
    const m=ensureSeatScoreModal();
    m.classList.add('open');
    document.body.style.overflow='hidden';
    m.dataset.pendingStudentId=String(studentId);
    m.dataset.pendingClassName=className||getActiveClass()||'';
    const frame=m.querySelector('#pe-seat-score-frame');

    const send=()=>{
      try{
        frame?.contentWindow?.postMessage({type:'hk-class-core-sync'},location.origin);
        postThemeToSeat(applySharedTheme(true));
      }catch{}
      setTimeout(()=>{
        if(m.dataset.pendingStudentId){
          postSeatStudentProfile(m.dataset.pendingClassName,m.dataset.pendingStudentId);
        }
      },120);
    };

    if(frame){
      if(frame.contentDocument?.readyState==='complete')send();
      else frame.addEventListener('load',send,{once:true});
    }
  }



  function ensureSeatIntegrationStyles(){
    if(document.getElementById('pe-seat-integration-styles'))return;
    const s=document.createElement('style');
    s.id='pe-seat-integration-styles';
    s.textContent=`
      .pe-seat-score-modal{display:none;position:fixed;inset:0;z-index:2147483450;background:#f4f7fb}
      .pe-seat-score-modal.open{display:block}
      .pe-seat-score-shell{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr;background:#f4f7fb}
      .pe-seat-score-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;background:#fff;border-bottom:1px solid #dde4ec;box-shadow:0 2px 8px #0000000d}
      .pe-seat-score-head>div{min-width:0;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
      .pe-seat-score-head b{font-size:15px}
      .pe-seat-score-head small{font-size:10px;opacity:.68}
      #pe-seat-score-close{border:1px solid #d9e0e8;background:#fff;border-radius:10px;width:36px;height:36px;font-size:18px;cursor:pointer}
      #pe-seat-score-frame{width:100%;height:100%;border:0;background:#fff}
      .pe-student-row{display:flex!important;align-items:center;justify-content:space-between;gap:8px}
      .pe-student-row-main{display:flex;align-items:center;gap:10px;min-width:0}
      .pe-student-row-main b{font-size:11px;opacity:.65;min-width:24px}
      .pe-student-row-main span{font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .pe-student-profile-btn{flex:0 0 auto;padding:5px 9px!important;font-size:10px!important}
      .pe-student-grid-note{margin:2px 0 8px!important;font-size:10px!important}
      .pe-student-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
      .pe-student-grid-item{display:flex;align-items:center;justify-content:space-between;gap:5px;border:1px solid #e1e6ed;border-radius:10px;background:#fff;padding:6px 6px 6px 8px;min-width:0}
      .pe-student-grid-text{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}
      .pe-student-grid-text b{font-size:10px;opacity:.62;flex:0 0 auto}
      .pe-student-grid-text span{font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .pe-student-profile-plus{flex:0 0 auto;width:25px;height:25px;border:1px solid #ccd6e2;background:#f7faff;border-radius:8px;font-size:16px;line-height:1;cursor:pointer;padding:0}
      .pe-student-profile-plus:active{transform:scale(.96)}
      @media(max-width:700px){
        .pe-student-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
        .pe-student-grid-item{padding:5px 5px 5px 7px}
        .pe-student-grid-text span{font-size:10px}
        .pe-student-profile-plus{width:24px;height:24px}
      }

      #pe-class-center-modal .pe-dialog{max-width:760px}
      #pe-class-center-modal .pe-v2-tabs{gap:5px;flex-wrap:wrap}
      #pe-class-center-modal .pe-v2-tabs button{padding:6px 9px;font-size:11px}
      #pe-class-center-modal .pe-class-card{padding:10px}
      #pe-class-center-modal .pe-class-overview-item{padding:7px 8px}
      @media(max-width:600px){
        #pe-class-center-modal .pe-dialog{width:calc(100vw - 16px);max-height:92vh;padding:10px}
        #pe-class-center-modal .pe-v2-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
        #pe-class-center-modal .pe-v2-tabs button{width:100%;padding:7px 5px}
      }
      #pe-idv1-registry label{color:var(--pe-theme-text,#684b38)}
      @media(max-width:600px){#pe-idv1-registry{grid-template-columns:1fr!important}}
      .pe-class-core-profile-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
      .pe-core-student-profile-btn{justify-content:flex-start!important;text-align:left!important;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      @media(max-width:600px){.pe-class-core-profile-list{grid-template-columns:1fr 1fr}}

      @media(max-width:700px){.pe-seat-score-head{padding:6px 8px}.pe-seat-score-head small{display:none}}
    `;
    document.head.appendChild(s);
  }
  ensureSeatIntegrationStyles();

  window.addEventListener('message',e=>{
    if(e.origin!==location.origin)return;
    if(e.data?.type==='hk-seat-ready'){
      postThemeToSeat(applySharedTheme(true));
      const m=document.getElementById('pe-seat-score-modal');
      if(m?.classList.contains('open')&&m.dataset.pendingStudentId){
        const sid=m.dataset.pendingStudentId;
        const cls=m.dataset.pendingClassName||getActiveClass()||'';
        setTimeout(()=>postSeatStudentProfile(cls,sid),80);
      }
    }
    if(e.data?.type==='hk-seat-student-profile-opened'){
      const m=document.getElementById('pe-seat-score-modal');
      if(m){
        m.dataset.pendingStudentId='';
        m.dataset.pendingClassName='';
      }
    }
    if(e.data?.type==='hk-seat-student-profile-closed'){
      const m=document.getElementById('pe-seat-score-modal');
      if(m){
        m.dataset.pendingStudentId='';
        m.dataset.pendingClassName='';
      }
    }
  });



  function ensureClassCenterModal(){
    let m=document.getElementById('pe-class-center-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-class-center-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🏫 班級中心 <small style="font-size:.62em;opacity:.55">v2.8.1</small></h3>
      <p class="pe-note">班別、學生、功課、追收、座位／積分集中喺同一個入口。 <span style="opacity:.55">UI 2.8.2</span></p>
      <div class="pe-v2-tabs">
        <button type="button" data-class-center-tab="overview" class="active">總覽</button>
        <button type="button" data-class-center-tab="students">學生</button>
        <button type="button" data-class-center-tab="homework">功課</button>
        <button type="button" data-class-center-tab="submission">追收</button>
        <button type="button" data-class-center-tab="seat">座位／積分</button>
      </div>
      <div id="pe-class-center-content"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-class-center-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.dataset.tab='overview';
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-class-center-close').addEventListener('click',()=>closeModal(m));
    m.querySelectorAll('[data-class-center-tab]').forEach(btn=>btn.addEventListener('click',()=>{
      m.dataset.tab=btn.dataset.classCenterTab;
      m.querySelectorAll('[data-class-center-tab]').forEach(x=>x.classList.toggle('active',x.dataset.classCenterTab===m.dataset.tab));
      safeRenderModule('Class Center',renderClassCenter,err=>{
      const out=m.querySelector('#pe-class-center-content');
      if(out)out.innerHTML=moduleErrorHtml('班級中心顯示錯誤',err);
    });
    }));
    return m;
  }

  function renderClassCenter(){
    const m=ensureClassCenterModal();
    const out=m.querySelector('#pe-class-center-content');
    const classes=classOverviewClasses();
    const active=getActiveClass();
    const tab=m.dataset.tab||'overview';

    out.innerHTML=`<div class="pe-grid">
      <div class="pe-field pe-full"><label>班別</label><select id="pe-class-center-class">
        <option value="">選擇班別</option>
        ${classes.map(c=>`<option value="${esc(c)}" ${normalizeClassId(active)===normalizeClassId(c)?'selected':''}>${esc(c)}</option>`).join('')}
      </select></div>
    </div><div id="pe-class-center-body"></div>`;

    const sel=out.querySelector('#pe-class-center-class');
    if(!sel.value&&classes[0])sel.value=classes[0];

    const renderBody=()=>{
      const cls=sel.value;
      const body=out.querySelector('#pe-class-center-body');
      if(!cls){body.innerHTML='<div class="pe-note">暫時未有班別資料。</div>';return}
      setActiveClass(cls);

      if(tab==='seat'){
        const rec=classProfileByName(cls);
        const count=Array.isArray(rec?.students)?rec.students.length:0;
        body.innerHTML=`<div class="pe-class-card">
          <h4>🪑 ${esc(cls)} 座位／積分</h4>
          <div class="pe-note">已連接班級核心資料：${count} 位學生。可直接進入座位、積分、出席、學生 Profile 及家校聯絡。</div>
          <div class="pe-actions"><button class="pe-btn primary" id="pe-class-center-open-seat">開啟座位／積分</button></div>
        </div>`;
        body.querySelector('#pe-class-center-open-seat')?.addEventListener('click',()=>{closeModal(m);openSeatScore(cls)});
        return;
      }

      if(tab==='students'){
        const rec=classProfileByName(cls);
        const normalized=rec?normalizeClassProfile(rec):null;
        const students=Array.isArray(normalized?.students)?normalized.students:[];
        body.innerHTML=`<div class="pe-class-card">
          <h4>👥 學生名單・${students.length} 人</h4>
          <div class="pe-note pe-student-grid-note">按學生右邊「＋」可開啟個人 Profile。</div>
          <div class="pe-student-grid">${students.length?students.map((s,i)=>`
            <div class="pe-student-grid-item">
              <div class="pe-student-grid-text">
                <b>${String(s.number||i+1).padStart(2,'0')}</b>
                <span>${esc(s.name||'')}</span>
              </div>
              <button type="button" class="pe-student-profile-plus" data-open-seat-student="${esc(s.studentId||s.id||'')}" aria-label="開啟 ${esc(s.name||'學生')} Profile">＋</button>
            </div>`).join(''):'<div class="pe-note">未建立學生名單</div>'}</div>
          <div class="pe-actions"><button class="pe-btn primary" id="pe-class-center-edit-students">管理學生</button></div>
        </div>`;
        body.querySelectorAll('[data-open-seat-student]').forEach(btn=>btn.addEventListener('click',()=>{
          const studentId=btn.dataset.openSeatStudent;
          closeModal(m);
          openSeatStudentProfile(cls,studentId);
        }));
        body.querySelector('#pe-class-center-edit-students')?.addEventListener('click',()=>{closeModal(m);openClassCore()});
        return;
      }

      if(tab==='homework'){
        const hw=homeworkHistoryRows().filter(x=>x.className===cls&&!x.unresolved).slice(0,12);
        body.innerHTML=`<div class="pe-class-card"><h4>📚 ${esc(cls)} 功課</h4>
          <div class="pe-class-overview-list">${hw.length?hw.map(x=>`<div class="pe-class-overview-item">${fmt(x.date)}・第${x.period}節<br>${esc(x.text)}</div>`).join(''):'<div class="pe-note">暫無功課紀錄</div>'}</div>
          <div class="pe-actions"><button class="pe-btn primary" id="pe-class-center-open-homework">開啟功課管理</button></div></div>`;
        body.querySelector('#pe-class-center-open-homework')?.addEventListener('click',()=>{closeModal(m);openHomeworkHistory()});
        return;
      }

      if(tab==='submission'){
        const subs=(window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[]).filter(r=>r.className===cls).slice(0,12);
        body.innerHTML=`<div class="pe-class-card"><h4>📋 ${esc(cls)} 追收</h4>
          <div class="pe-class-overview-list">${subs.length?subs.map(r=>`<div class="pe-class-overview-item">${r.dueDate?fmt(r.dueDate):''}<br>${esc(r.name||r.type||'項目')}<br>${submissionCountsHtml(r)}</div>`).join(''):'<div class="pe-note">暫無追收紀錄</div>'}</div>
          <div class="pe-actions"><button class="pe-btn primary" id="pe-class-center-open-submission">開啟作業／回條</button></div></div>`;
        body.querySelector('#pe-class-center-open-submission')?.addEventListener('click',()=>{closeModal(m);document.querySelector('.submission-launcher')?.click()});
        return;
      }

      const hw=homeworkHistoryRows().filter(x=>x.className===cls&&!x.unresolved).slice(0,5);
      const subs=(window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[]).filter(r=>r.className===cls&&submissionProgress(r).state!=='done').slice(0,5);
      const p=plannerState(),notes=p.lessonNotes||{},progress=[];
      for(const [key,val] of Object.entries(notes)){
        const mm=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-p$/);
        if(!mm||!val||typeof val!=='string')continue;
        const date=mm[1],periodIndex=Number(mm[2]);
        const lesson=timetableLessonForHomework(date,periodIndex);
        if(classFromTimetableLesson(lesson)!==cls)continue;
        progress.push({date,period:periodIndex+1,text:val});
      }
      progress.sort((a,b)=>b.date.localeCompare(a.date)||a.period-b.period);
      const todos=(state.pendingItems||[]).filter(x=>{
        if(x.completed)return false;
        const s=normalizedPendingScope(x);
        return s.type==='class'&&normalizeClassId(s.name)===normalizeClassId(cls);
      }).slice(0,5);

      body.innerHTML=`<div class="pe-class-overview-grid">
        <div class="pe-class-card"><h4>📚 最近功課</h4><div class="pe-class-overview-list">${hw.length?hw.map(x=>`<div class="pe-class-overview-item">${fmt(x.date)}・第${x.period}節<br>${esc(x.text)}</div>`).join(''):'<div class="pe-note">暫無紀錄</div>'}</div></div>
        <div class="pe-class-card"><h4>📋 未完成追收</h4><div class="pe-class-overview-list">${subs.length?subs.map(r=>`<div class="pe-class-overview-item">${r.dueDate?fmt(r.dueDate):''}<br>${esc(r.name||r.type||'項目')}<br>${submissionCountsHtml(r)}</div>`).join(''):'<div class="pe-note">暫無未完成追收</div>'}</div></div>
        <div class="pe-class-card"><h4>📝 最近教學進度</h4><div class="pe-class-overview-list">${progress.length?progress.slice(0,5).map(x=>`<div class="pe-class-overview-item">${fmt(x.date)}・第${x.period}節<br>${esc(x.text)}</div>`).join(''):'<div class="pe-note">暫無進度紀錄</div>'}</div></div>
        <div class="pe-class-card"><h4>⏳ 班別待辦</h4><div class="pe-class-overview-list">${todos.length?todos.map(x=>`<div class="pe-class-overview-item">${x.dueDate?fmt(x.dueDate):'未設日期'}<br>${esc(x.title||'')}</div>`).join(''):'<div class="pe-note">暫無相關待辦</div>'}</div></div>
      </div>`;
    };
    sel.addEventListener('change',renderBody);
    renderBody();
  }

  function openClassCenter(){
    const m=ensureClassCenterModal();
    m.classList.add('open');
    renderClassCenter();
  }


  function installSchoolDataService(){
    if(window.__schoolDataService?.version>=1)return window.__schoolDataService;

    const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
    const listeners=new Map();
    const on=(domain,fn)=>{
      const key=String(domain||'all');
      if(!listeners.has(key))listeners.set(key,new Set());
      listeners.get(key).add(fn);
      return ()=>listeners.get(key)?.delete(fn);
    };
    const emit=(domain,detail={})=>{
      [domain,'all'].forEach(key=>listeners.get(key)?.forEach(fn=>{try{fn(clone(detail))}catch(err){console.warn('[data service listener]',err)}}));
      try{window.dispatchEvent(new CustomEvent('schoolDataChanged',{detail:{domain,...clone(detail)}}))}catch{}
    };

    let profileAdapter=null;
    let seatAdapter=null;

    const svc={
      version:9,
      schemaVersion:1,
      getStatus:()=>({
        ready:true,
        schoolYear:currentSchoolYear(),
        online:navigator.onLine,
        signedIn:!!state.user,
        firebaseReady:!!state.firebaseReady,
        classCount:(state.classCore||[]).length,
        pendingCount:(state.pendingItems||[]).length,
        permanentStudentCount:Object.keys(syncIdentityV1FromClassCore().students||{}).length,
        enrollmentCount:Object.keys(syncIdentityV1FromClassCore().enrollments||{}).length,
        queuedWrites:totalPending(),
        syncState:state.sync||'connecting',
        writePaths:{classes:true,pending:true,submissions:true,profile:true,seat:true}
      }),
      snapshot:()=>({
        schoolYear:currentSchoolYear(),
        classes:(state.classCore||[]).map(c=>clone(normalizeClassProfile(c))),
        students:Object.values(syncIdentityV1FromClassCore().students||{}).map(clone),
        enrollments:Object.values(syncIdentityV1FromClassCore().enrollments||{}).map(clone),
        pending:(state.pendingItems||[]).map(clone),
        submissions:(window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[]).map(clone)
      }),
      classes:{
        list:()=> (state.classCore||[]).map(c=>clone(normalizeClassProfile(c))),
        getById:(id='')=>{const c=(state.classCore||[]).find(x=>String(x.classId||x.id)===String(id));return c?clone(normalizeClassProfile(c)):null},
        getByName:(name='')=>{const c=classProfileByName(name);return c?clone(normalizeClassProfile(c)):null},
        save:async rec=>{await syncClassProfile(clone(rec));return svc.classes.getById(rec?.classId||rec?.id||'')},
        remove:async id=>{await deleteClassProfile(id);return true}
      },
      students:{
        registry:()=>Object.values(syncIdentityV1FromClassCore().students||{}).map(clone),
        byClass:(classRef='')=>{
          const c=svc.classes.getById(classRef)||svc.classes.getByName(classRef);
          return c?(c.students||[]).map(clone):[];
        },
        get:(classRef='',studentRef='')=>svc.students.byClass(classRef).find(s=>String(s.studentId||s.id)===String(studentRef)||s.name===String(studentRef))||null
      },
      enrollments:{
        list:()=>Object.values(syncIdentityV1FromClassCore().enrollments||{}).map(clone),
        byStudent:(studentId='')=>identityStudentHistory(studentId).map(clone)
      },
      pending:{
        list:()=> (state.pendingItems||[]).map(clone),
        get:(id='')=>clone((state.pendingItems||[]).find(x=>String(x.id)===String(id))||null),
        save:async rec=>{
          if(!rec?.id)throw new Error('pending id required');
          const idx=state.pendingItems.findIndex(x=>String(x.id)===String(rec.id));
          const next={...clone(rec),updatedAt:new Date().toISOString()};
          if(idx>=0)state.pendingItems[idx]=next;else state.pendingItems.unshift(next);
          saveLocalPending();await syncPendingSet(next);return clone(next)
        },
        remove:async id=>{await deletePendingItem(id,true);return true}
      },
      submissions:{
        list:()=> (window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[]).map(clone),
        get:(id='')=>clone(window.__submissionTrackerAPI?.getById?.(id)||(state.submissions||[]).find(x=>String(x.id)===String(id))||null),
        save:async rec=>{
          const api=window.__submissionTrackerAPI;
          if(!api?.saveInternal)throw new Error('submission tracker not ready');
          const saved=await api.saveInternal(clone(rec));
          return clone(saved||rec)
        },
        remove:async id=>{
          const api=window.__submissionTrackerAPI;
          if(!api?.removeInternal)throw new Error('submission tracker not ready');
          await api.removeInternal(id);
          return true
        }
      },
      profile:{
        registerAdapter:adapter=>{
          if(!adapter||typeof adapter!=='object')throw new Error('profile adapter required');
          profileAdapter=adapter;
          emit('profile',{type:'adapter-ready'});
          return true
        },
        isReady:()=>!!profileAdapter,
        saveNote:async payload=>{
          if(!profileAdapter?.saveNote)throw new Error('profile adapter not ready');
          const result=await profileAdapter.saveNote(clone(payload||{}));
          emit('profile',{type:'note-save',studentId:payload?.studentId||''});
          return clone(result||payload)
        },
        saveParentContact:async payload=>{
          if(!profileAdapter?.saveParentContact)throw new Error('profile adapter not ready');
          const result=await profileAdapter.saveParentContact(clone(payload||{}));
          emit('profile',{type:'contact-save',studentId:payload?.studentId||''});
          return clone(result||payload)
        },
        saveEvent:async payload=>{
          if(!profileAdapter?.saveEvent)throw new Error('profile adapter not ready');
          const result=await profileAdapter.saveEvent(clone(payload||{}));
          emit('profile',{type:'event-save',studentId:payload?.studentId||''});
          return clone(result||payload)
        },
        removeParentContact:async payload=>{
          if(!profileAdapter?.removeParentContact)throw new Error('profile adapter not ready');
          const result=await profileAdapter.removeParentContact(clone(payload||{}));
          emit('profile',{type:'contact-delete',studentId:payload?.studentId||'',recordId:payload?.recordId||''});
          return clone(result||payload)
        },
        removeEvent:async payload=>{
          if(!profileAdapter?.removeEvent)throw new Error('profile adapter not ready');
          const result=await profileAdapter.removeEvent(clone(payload||{}));
          emit('profile',{type:'event-delete',studentId:payload?.studentId||'',recordId:payload?.recordId||''});
          return clone(result||payload)
        }
      },
      seat:{
        registerAdapter:adapter=>{
          if(!adapter||typeof adapter!=='object')throw new Error('seat adapter required');
          seatAdapter=adapter;
          emit('seat',{type:'adapter-ready'});
          return true
        },
        isReady:()=>!!seatAdapter,
        snapshot:()=>clone(seatAdapter?.snapshot?.()||null),
        commit:async meta=>{
          if(!seatAdapter?.commit)throw new Error('seat adapter not ready');
          const result=await seatAdapter.commit(clone(meta||{}));
          emit('seat',{type:'commit',reason:meta?.reason||'state-save',classId:meta?.classId||''});
          return clone(result||meta||{})
        }
      },
      subscribe:on,
      emit,
      crossModuleAudit:()=>clone(crossModuleDataAudit()),
      audit:()=>({identity:identityAudit(),crossModule:crossModuleDataAudit(),status:svc.getStatus()})
    };

    window.addEventListener('classCoreChanged',()=>emit('classes',{type:'external'}));
    window.addEventListener('identityV1Changed',()=>emit('identity',{type:'external'}));
    window.addEventListener('pendingItemsChanged',()=>emit('pending',{type:'external'}));
    window.addEventListener('submission-records-changed',e=>emit('submissions',{type:e.detail?.type||'external',id:e.detail?.id||''}));
    window.addEventListener('submission-pending-changed',()=>{
      updateSyncDisplay();
      setTimeout(updateSyncDisplay,0);
    });
    window.__schoolDataService=svc;
    try{window.dispatchEvent(new CustomEvent('schoolDataServiceReady',{detail:svc.getStatus()}))}catch{}
    return svc;
  }

  async function dataServiceSaveClass(rec){
    const svc=window.__schoolDataService;
    if(svc?.classes?.save){
      try{return await svc.classes.save(rec)}catch(err){console.warn('[data service] class save fallback',err)}
    }
    await syncClassProfile(rec);
    return rec;
  }

  async function dataServiceRemoveClass(id){
    const svc=window.__schoolDataService;
    if(svc?.classes?.remove){
      try{return await svc.classes.remove(id)}catch(err){console.warn('[data service] class remove fallback',err)}
    }
    await deleteClassProfile(id);
    return true;
  }

  async function dataServiceSavePending(rec){
    const svc=window.__schoolDataService;
    if(svc?.pending?.save){
      try{return await svc.pending.save(rec)}catch(err){console.warn('[data service] pending save fallback',err)}
    }
    const idx=state.pendingItems.findIndex(x=>String(x.id)===String(rec.id));
    if(idx>=0)state.pendingItems[idx]=rec;else state.pendingItems.unshift(rec);
    saveLocalPending();
    await syncPendingSet(rec);
    return rec;
  }

  async function dataServiceRemovePending(id){
    const svc=window.__schoolDataService;
    if(svc?.pending?.remove){
      try{return await svc.pending.remove(id)}catch(err){console.warn('[data service] pending remove fallback',err)}
    }
    await deletePendingItem(id,true);
    return true;
  }

  function installClassCoreApi(){
    window.__classCoreAPI={
      version:7,
      getClasses:()=>window.__schoolDataService.classes.list(),
      getClassById:(classId='')=>window.__schoolDataService.classes.getById(classId),
      getClassByName:(name='')=>window.__schoolDataService.classes.getByName(name),
      getStudents:(classRef='')=>window.__schoolDataService.students.byClass(classRef),
      getStudent:(classRef='',studentRef='')=>window.__schoolDataService.students.get(classRef,studentRef),
      classIdForName,
      studentIdFor:(classRef='',studentName='')=>{
        const s=window.__classCoreAPI.getStudents(classRef).find(x=>x.name===String(studentName));
        return s?.studentId||'';
      },
      getActiveClass:()=>getActiveClass(),
      setActiveClass:(name='')=>setActiveClass(name),
      getSchoolYear:()=>currentSchoolYear(),
      getStudentRegistry:()=>window.__schoolDataService.students.registry(),
      getEnrollments:(studentId='')=>studentId?window.__schoolDataService.enrollments.byStudent(studentId):window.__schoolDataService.enrollments.list(),
      audit:()=>identityAudit(),
      mergeStudentIds:(sourceId,targetId)=>({sourceId,targetId}),
      cleanupDuplicateEnrollments:()=>dedupeIdentityEnrollments(),
      cleanupTestEnrollments:(studentId)=>removeAllSafeTestEnrollments(studentId)
    };
  }

  installSchoolDataService();
  installClassCoreApi();
  

  function ensureIdentityManagerModal(){
    let m=document.getElementById('pe-identity-manager-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-identity-manager-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog" style="width:min(920px,calc(100vw - 24px))">
      <h3>👤 永久學生管理</h3>
      <p class="pe-note">正式歷史學生唔應該隨便刪除。測試／重複身份可以安全清理；如果測試班已刪除，可只刪該班 Enrollment，而保留真正 Student ID。</p>

      <div class="pe-class-card">
        <h4>🔗 合併重複學生</h4>
        <div class="pe-grid">
          <div class="pe-field"><label>重複／錯誤身份（來源）</label><select id="pe-idm-source"></select></div>
          <div class="pe-field"><label>真正身份（保留）</label><select id="pe-idm-target"></select></div>
        </div>
        <div id="pe-idm-merge-preview" class="pe-note"></div>
        <div class="pe-actions">
          <button class="pe-btn primary" id="pe-idm-merge">合併並保留目標 Student ID</button>
        </div>
      </div>

      <div class="pe-class-card" style="margin-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h4 style="margin:0">🧹 學生身份清理</h4>
          <button class="pe-btn" id="pe-idm-dedupe">清理重複 Enrollment</button>
        </div>
        <div id="pe-idm-list" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px"></div>
      </div>

      <div class="pe-actions"><button class="pe-btn" id="pe-idm-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-idm-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-idm-source').addEventListener('change',renderIdentityManagerPreview);
    m.querySelector('#pe-idm-target').addEventListener('change',renderIdentityManagerPreview);
    m.querySelector('#pe-idm-merge').addEventListener('click',mergeSelectedStudentIdentities);
    m.querySelector('#pe-idm-dedupe').addEventListener('click',()=>{
      const n=dedupeIdentityEnrollments();
      cleanupEmptyTestClassInstances();
      alert(n?`已清理 ${n} 個重複 Enrollment。`:'沒有發現可安全自動清理嘅重複 Enrollment。');
      renderIdentityManager();
      renderIdentityV1();
    });
    m.querySelector('#pe-idm-list').addEventListener('click',async e=>{
      const identityBtn=e.target.closest('[data-idm-delete]');
      if(identityBtn){
        await deleteSafeTestIdentity(identityBtn.dataset.idmDelete);
        return;
      }

      const cleanBtn=e.target.closest('[data-idm-clean-test]');
      if(cleanBtn){
        const sid=cleanBtn.dataset.idmCleanTest;
        if(!confirm('確定清除呢位學生所有「已刪除測試班」Enrollment？\n正式／現存班級紀錄唔會刪除。'))return;
        const n=removeAllSafeTestEnrollments(sid);
        alert(n?`已清除 ${n} 個測試班 Enrollment。`:'沒有可安全清除嘅測試班 Enrollment。');
        renderIdentityManager();
        renderIdentityV1();
        return;
      }

      const enrollmentBtn=e.target.closest('[data-idm-enrollment-delete]');
      if(enrollmentBtn){
        const sid=enrollmentBtn.dataset.studentId;
        const eid=enrollmentBtn.dataset.idmEnrollmentDelete;
        const store=loadIdentityV1();
        const rec=store.enrollments?.[eid];
        if(!rec)return;
        if(!confirm(`刪除「${rec.schoolYear}・${rec.className}・${String(rec.studentNo||'').padStart(2,'0')}號」呢一條測試 Enrollment？`))return;
        const result=removeSafeStudentEnrollment(sid,eid);
        if(!result.ok)alert(result.reason);
        renderIdentityManager();
        renderIdentityV1();
      }
    });
    return m;
  }

  function identityStudentLabel(s){
    if(!s)return '';
    const sid=String(s.studentId||'');
    const tail=sid.length>12?'…'+sid.slice(-10):sid;
    return `${s.currentName||'未命名學生'}｜${tail}`;
  }

  function renderIdentityManager(){
    const m=ensureIdentityManagerModal();
    dedupeIdentityEnrollments();
    const store=syncIdentityV1FromClassCore();
    const students=Object.values(store.students||{})
      .sort((a,b)=>String(a.currentName||'').localeCompare(String(b.currentName||''),'zh-HK'));

    const source=m.querySelector('#pe-idm-source');
    const target=m.querySelector('#pe-idm-target');
    const keepSource=source.value, keepTarget=target.value;
    const options='<option value="">請選擇</option>'+students.map(s=>
      `<option value="${esc(s.studentId)}">${esc(identityStudentLabel(s))}</option>`
    ).join('');
    source.innerHTML=options; target.innerHTML=options;
    if(students.some(s=>String(s.studentId)===keepSource))source.value=keepSource;
    if(students.some(s=>String(s.studentId)===keepTarget))target.value=keepTarget;

    const list=m.querySelector('#pe-idm-list');
    list.innerHTML=students.length?students.map(s=>{
      const usage=studentIdentityUsage(s.studentId);
      const hist=identityStudentHistory(s.studentId);
      const safeTestHist=hist.filter(h=>isSafeRemovableEnrollment(h));
      const liveText=usage.liveClasses.length?`目前班別：${usage.liveClasses.map(c=>c.name).join('、')}`:'目前冇班級使用';

      const historyHtml=hist.length?hist.map(h=>{
        const removable=isSafeRemovableEnrollment(h);
        const label=`${h.schoolYear}・${h.className}・${String(h.studentNo||'').padStart(2,'0')}號`;
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:4px">
          <small>${esc(label)}</small>
          ${removable?`<button class="pe-btn" style="padding:3px 7px;font-size:11px" data-idm-enrollment-delete="${esc(h.enrollmentId)}" data-student-id="${esc(s.studentId)}">刪除紀錄</button>`:''}
        </div>`;
      }).join(''):'<small style="display:block;margin-top:4px">沒有 Enrollment</small>';

      return `<div class="pe-class-card" style="margin:0;padding:9px">
        <b style="display:block">${esc(s.currentName||'未命名學生')}</b>
        <small style="display:block;opacity:.6;overflow-wrap:anywhere">${esc(s.studentId)}</small>
        <div style="margin-top:4px">${historyHtml}</div>
        <small style="display:block;margin-top:5px;opacity:.72">${esc(liveText)}</small>
        ${safeTestHist.length
          ?`<button class="pe-btn" data-idm-clean-test="${esc(s.studentId)}" style="margin-top:7px">清除全部測試班紀錄（${safeTestHist.length}）</button>`
          :''}
        ${usage.safeDelete
          ?`<button class="pe-btn" data-idm-delete="${esc(s.studentId)}" style="margin-top:7px">刪除測試／錯誤身份</button>`
          :`<small style="display:block;margin-top:6px;opacity:.55">正式／使用中身份：不可直接刪除 Student ID</small>`}
      </div>`;
    }).join(''):'<div class="pe-note">永久學生庫目前沒有資料。</div>';

    renderIdentityManagerPreview();
  }

  function renderIdentityManagerPreview(){
    const m=ensureIdentityManagerModal();
    const sourceId=m.querySelector('#pe-idm-source').value;
    const targetId=m.querySelector('#pe-idm-target').value;
    const out=m.querySelector('#pe-idm-merge-preview');
    if(!sourceId||!targetId){
      out.textContent='選擇來源同目標後，系統會顯示合併方向。';
      return;
    }
    if(sourceId===targetId){
      out.textContent='來源同目標唔可以係同一個 Student ID。';
      return;
    }
    const store=loadIdentityV1();
    const s=store.students[sourceId],t=store.students[targetId];
    out.textContent=`${s?.currentName||sourceId} → ${t?.currentName||targetId}；合併後保留目標 Student ID，來源 ID 會移除。`;
  }

  async function deleteSafeTestIdentity(studentId=''){
    const sid=String(studentId||'');
    const store=syncIdentityV1FromClassCore();
    const info=store.students[sid];
    if(!info)return;
    const usage=studentIdentityUsage(sid);
    if(!usage.safeDelete){
      alert('呢個身份仍然有正式／使用中班級關係，為免誤刪，系統唔允許直接刪除。可以改用「合併重複學生」。');
      return;
    }
    if(!confirm(`確定刪除測試／錯誤身份「${info.currentName||sid}」？\n只會刪除呢個 Student ID 同佢嘅測試 Enrollment；正式學生身份不受影響。`))return;
    Object.keys(store.enrollments||{}).forEach(id=>{
      if(String(store.enrollments[id]?.studentId)===sid)delete store.enrollments[id];
    });
    delete store.students[sid];
    saveIdentityV1();
    cleanupEmptyTestClassInstances();
    renderIdentityManager();
    renderIdentityV1();
  }

  async function mergeSelectedStudentIdentities(){
    const m=ensureIdentityManagerModal();
    const sourceId=String(m.querySelector('#pe-idm-source').value||'');
    const targetId=String(m.querySelector('#pe-idm-target').value||'');
    if(!sourceId||!targetId)return alert('請選擇來源同要保留嘅目標身份。');
    if(sourceId===targetId)return alert('來源同目標唔可以係同一個 Student ID。');

    let store=syncIdentityV1FromClassCore();
    const source=store.students[sourceId],target=store.students[targetId];
    if(!source||!target)return alert('找不到所選學生身份，請重新整理後再試。');

    const msg=[
      `將「${source.currentName||sourceId}」合併到「${target.currentName||targetId}」？`,
      '',
      `保留：${targetId}`,
      `移除：${sourceId}`,
      '',
      '來源身份嘅班級關係、Enrollment 同學生待辦會轉到保留身份。'
    ].join('\n');
    if(!confirm(msg))return;

    // 1) Live class rosters.
    const changed=[];
    for(let i=0;i<state.classCore.length;i++){
      let cls=normalizeClassProfile(state.classCore[i]);
      const hasSource=cls.students.some(s=>String(s.studentId||s.id)===sourceId);
      if(!hasSource)continue;
      const hasTarget=cls.students.some(s=>String(s.studentId||s.id)===targetId);
      if(hasTarget){
        cls.students=cls.students.filter(s=>String(s.studentId||s.id)!==sourceId);
      }else{
        cls.students=cls.students.map(s=>{
          if(String(s.studentId||s.id)!==sourceId)return s;
          return {...s,id:targetId,studentId:targetId,name:target.currentName||s.name};
        });
      }
      cls.updatedAt=new Date().toISOString();
      state.classCore[i]=cls;
      changed.push(cls);
    }
    saveClassCore();
    for(const cls of changed){
      try{await dataServiceSaveClass(cls)}catch{}
    }

    // 2) Student-linked pending items.
    const pendingChanged=[];
    state.pendingItems.forEach(item=>{
      if(String(item.studentId||'')!==sourceId)return;
      item.studentId=targetId;
      if(target.currentName)item.studentName=target.currentName;
      item.updatedAt=new Date().toISOString();
      pendingChanged.push({...item});
    });
    if(pendingChanged.length){
      for(const item of pendingChanged){
        try{await dataServiceSavePending(item)}catch{}
      }
    }

    // 3) Permanent registry aliases.
    store=loadIdentityV1();
    const latestTarget=store.students[targetId]||target;
    const latestSource=store.students[sourceId]||source;
    latestTarget.aliases=[...new Set([
      ...(Array.isArray(latestTarget.aliases)?latestTarget.aliases:[]),
      ...(Array.isArray(latestSource.aliases)?latestSource.aliases:[]),
      latestSource.currentName
    ].filter(Boolean))];
    latestTarget.firstSeenAt=[latestTarget.firstSeenAt,latestSource.firstSeenAt].filter(Boolean).sort()[0]||latestTarget.firstSeenAt;
    latestTarget.lastSeenAt=new Date().toISOString();
    store.students[targetId]=latestTarget;

    // 4) Enrollment transfer; deterministic target id also removes duplicate logical links.
    Object.entries({...store.enrollments}).forEach(([eid,e])=>{
      if(String(e.studentId)!==sourceId)return;
      const newId=enrollmentIdFor(normalizeSchoolYear(e.schoolYear),String(e.classId||''),targetId);
      if(!store.enrollments[newId]){
        store.enrollments[newId]={...e,enrollmentId:newId,studentId:targetId,updatedAt:new Date().toISOString()};
      }
      delete store.enrollments[eid];
    });
    delete store.students[sourceId];
    saveIdentityV1();
    dedupeIdentityEnrollments();
    cleanupEmptyTestClassInstances();
    syncIdentityV1FromClassCore();

    renderClassCoreList();
    renderClassCoreEditor();
    renderIdentityManager();
    renderIdentityV1();
    alert(`合併完成。已保留「${target.currentName||targetId}」嘅 Student ID。`);
  }

  function openIdentityManager(){
    const m=ensureIdentityManagerModal();
    m.classList.add('open');
    renderIdentityManager();
  }

  function ensureIdentityV1Modal(){
    let m=document.getElementById('pe-identity-v1-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-identity-v1-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog" style="width:min(900px,calc(100vw - 24px))">
      <h3>🧬 身份與跨學年資料 V1 <small style="font-size:.6em;opacity:.55">build 2.8.2</small></h3>
      <p class="pe-note">studentId 永久跟學生；classId 代表某一學年嘅班級實體。01／02 等暫時班號唔會進入永久學生庫；改成真實姓名後會沿用原 studentId 自動升格。</p>
      <div class="pe-grid">
        <div class="pe-field">
          <label>目前學年</label>
          <input id="pe-idv1-year" placeholder="2026/27">
        </div>
        <div class="pe-field">
          <label>歷史學生搜尋</label>
          <input id="pe-idv1-search" placeholder="姓名／Student ID">
        </div>
      </div>
      <div id="pe-idv1-kpis" class="pe-kpi-row"></div>
      <div class="pe-class-card">
        <h4>🩺 資料健康檢查</h4>
        <div id="pe-idv1-audit"></div>
        <div id="pe-v25-cross-audit" style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--pe-theme-line,#eadfce)"></div>
        <div class="pe-actions" style="justify-content:flex-start">
          <button class="pe-btn" id="pe-idv1-run-audit">重新檢查</button>
          <button class="pe-btn" id="pe-idv1-resync">同步現有班級到身份層</button>
          <button class="pe-btn" id="pe-idv1-manage-students">👤 永久學生管理</button>
        </div>
      </div>
      <div class="pe-class-card" style="margin-top:8px">
        <h4>🗃️ 歷史學生庫</h4>
        <div class="pe-grid">
          <div class="pe-field">
            <label>加入到目前班別</label>
            <select id="pe-idv1-target-class"></select>
          </div>
        </div>
        <div class="pe-note">只會顯示已有真實姓名嘅永久學生。可以將前年／以前教過嘅學生重新勾返；沿用原本 studentId，只新增今年嘅 enrollment。</div>
        <div id="pe-idv1-registry" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px"></div>
        <div class="pe-actions">
          <button class="pe-btn primary" id="pe-idv1-add-selected">＋ 將選取學生加入班別</button>
        </div>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-idv1-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-idv1-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-idv1-run-audit').addEventListener('click',renderIdentityV1);
    m.querySelector('#pe-idv1-resync').addEventListener('click',()=>{syncIdentityV1FromClassCore();renderIdentityV1()});
    m.querySelector('#pe-idv1-manage-students').addEventListener('click',openIdentityManager);
    m.querySelector('#pe-idv1-search').addEventListener('input',renderIdentityRegistry);
    m.querySelector('#pe-idv1-target-class').addEventListener('change',renderIdentityRegistry);
    m.querySelector('#pe-idv1-year').addEventListener('change',()=>{
      const store=loadIdentityV1();
      store.currentSchoolYear=normalizeSchoolYear(m.querySelector('#pe-idv1-year').value);
      saveIdentityV1();
      renderIdentityV1();
    });
    m.querySelector('#pe-idv1-add-selected').addEventListener('click',addSelectedHistoricalStudents);
    return m;
  }

  function activeIdentityClasses(){
    const year=currentSchoolYear();
    return (state.classCore||[]).map(normalizeClassProfile)
      .filter(c=>normalizeSchoolYear(c.schoolYear||year)===year&&!c.archived)
      .sort((a,b)=>a.name.localeCompare(b.name,'zh-HK'));
  }

  function renderIdentityRegistry(){
    const m=ensureIdentityV1Modal(),out=m.querySelector('#pe-idv1-registry');
    const q=String(m.querySelector('#pe-idv1-search').value||'').trim().toLowerCase();
    const classId=m.querySelector('#pe-idv1-target-class').value;
    const target=state.classCore.find(c=>String(c.classId||c.id)===String(classId));
    const existing=new Set((target?normalizeClassProfile(target).students:[]).map(s=>String(s.studentId||s.id)));
    const store=syncIdentityV1FromClassCore();
    const rows=Object.values(store.students||{})
      .filter(s=>!existing.has(String(s.studentId)))
      .filter(s=>!q||String(s.currentName||'').toLowerCase().includes(q)||String(s.studentId||'').toLowerCase().includes(q))
      .sort((a,b)=>String(a.currentName||'').localeCompare(String(b.currentName||''),'zh-HK'))
      .slice(0,120);

    out.innerHTML=rows.length?rows.map(s=>{
      const hist=identityStudentHistory(s.studentId);
      const latest=hist[0];
      const historyText=hist.slice(0,3).map(h=>`${h.schoolYear}・${h.className}・${String(h.studentNo||'').padStart(2,'0')}號`).join('｜');
      return `<label style="display:flex;align-items:flex-start;gap:7px;border:1px solid var(--pe-theme-line,#eadfce);border-radius:9px;background:#fff;padding:7px;margin:0">
        <input type="checkbox" data-idv1-student="${esc(s.studentId)}" style="margin-top:2px">
        <span style="min-width:0">
          <b style="display:block;font-size:10px">${esc(s.currentName||'未命名學生')}</b>
          <small style="display:block;font-size:7.5px;opacity:.65;overflow-wrap:anywhere">${esc(historyText||latest?.schoolYear||'歷史學生')}</small>
        </span>
      </label>`;
    }).join(''):'<div class="pe-note">沒有可加入嘅歷史學生。</div>';
  }

  async function addSelectedHistoricalStudents(){
    const m=ensureIdentityV1Modal();
    const classId=m.querySelector('#pe-idv1-target-class').value;
    if(!classId)return alert('請先選擇目標班別。');
    let rec=state.classCore.find(c=>String(c.classId||c.id)===String(classId));
    if(!rec)return alert('找不到目標班別。');
    rec=normalizeClassProfile(rec);
    const ids=[...m.querySelectorAll('[data-idv1-student]:checked')].map(x=>x.dataset.idv1Student).filter(Boolean);
    if(!ids.length)return alert('請先勾選學生。');

    const store=syncIdentityV1FromClassCore();
    const existing=new Set(rec.students.map(s=>String(s.studentId||s.id)));
    const currentYear=currentSchoolYear();
    const additions=[];
    for(const sid of ids){
      if(existing.has(sid))continue;
      const info=store.students[sid];
      if(!info)continue;
      const otherCurrent=Object.values(store.enrollments||{}).filter(e=>
        String(e.studentId)===sid &&
        normalizeSchoolYear(e.schoolYear)===currentYear &&
        String(e.classId)!==String(rec.classId) &&
        e.status==='active'
      );
      if(otherCurrent.length){
        const ok=confirm(`${info.currentName||sid} 喺 ${currentYear} 已經有其他班別 enrollment（${otherCurrent.map(x=>x.className).join('、')}）。仍然加入 ${rec.name}？`);
        if(!ok)continue;
      }
      additions.push({
        id:sid,
        studentId:sid,
        name:info.currentName||'',
        number:rec.students.length+additions.length+1
      });
    }
    if(!additions.length)return;
    rec.students=[...rec.students,...additions].map((s,i)=>({...s,number:i+1}));
    rec.updatedAt=new Date().toISOString();
    const idx=state.classCore.findIndex(c=>String(c.classId||c.id)===String(rec.classId));
    if(idx>=0)state.classCore[idx]=rec;
    await dataServiceSaveClass(rec);
    syncIdentityV1FromClassCore();
    renderClassCoreList();
    renderClassCoreEditor();
    renderIdentityV1();
  }

  function renderIdentityV1(){
    const m=ensureIdentityV1Modal();
    const store=syncIdentityV1FromClassCore();
    const audit=identityAudit();
    setTimeout(()=>{const el=document.getElementById('pe-data-service-status');if(el){const s=window.__schoolDataService?.getStatus?.();el.textContent=s?.ready?`🧩 V2 共用資料服務：✓ 已啟用｜寫入：班別 ✓・待辦 ✓・追收 ✓・Profile ✓・座位積分 ✓`:'🧩 V2 共用資料服務：未啟用'}},0);
    m.querySelector('#pe-idv1-year').value=currentSchoolYear();

    const classes=activeIdentityClasses();
    const sel=m.querySelector('#pe-idv1-target-class');
    const keep=sel.value;
    sel.innerHTML=classes.map(c=>`<option value="${esc(c.classId)}">${esc(c.name)}（${c.students.length}）</option>`).join('');
    if(classes.some(c=>String(c.classId)===keep))sel.value=keep;

    m.querySelector('#pe-idv1-kpis').innerHTML=`
      <div class="pe-kpi"><b>${audit.classes}</b><small>本學年班別</small></div>
      <div class="pe-kpi"><b>${audit.students}</b><small>永久學生</small></div>
      <div class="pe-kpi"><b>${audit.enrollments}</b><small>Enrollment</small></div>
      <div class="pe-kpi"><b>${audit.healthy?'✓':'!'}</b><small>${audit.healthy?'核心健康':'需檢查'}</small></div>`;

    const issues=[];
    if(audit.duplicateClassIds.length)issues.push(`重複 classId：${audit.duplicateClassIds.length}`);
    if(audit.duplicateCurrentStudents.length)issues.push(`同學年多班 studentId：${audit.duplicateCurrentStudents.length}`);
    if(audit.orphanPending.length)issues.push(`孤兒 student pending：${audit.orphanPending.length}`);
    if(audit.legacyPending.length)issues.push(`舊式姓名／班號 pending：${audit.legacyPending.length}`);
    if(audit.legacySubmissions.length)issues.push(`仍以班號追收嘅舊紀錄：${audit.legacySubmissions.length}`);
    if(audit.provisionalEnrollments)issues.push(`暫時班號名單：${audit.provisionalEnrollments}（不計入永久學生）`);

    m.querySelector('#pe-idv1-audit').innerHTML=`
      <div class="pe-note">${audit.healthy?'✅ 現有 classId / studentId 核心關係正常。<br><span id="pe-data-service-status">🧩 V2 共用資料服務：檢查中…</span>':'⚠️ 發現需要逐步整理嘅身份資料。'}</div>
      <div style="margin-top:6px;font-size:9px;line-height:1.6">${issues.length?issues.map(x=>`• ${esc(x)}`).join('<br>'):'• 未發現 duplicate ID 或孤兒 student link。'}</div>
      <div class="pe-note" style="margin-top:6px">Legacy 追收仍以班號運作屬兼容狀態，V1 不會強行改寫舊紀錄；之後 V2 資料服務再逐步轉成 ID-based link。</div>`;

    const cross=crossModuleDataAudit();
    const crossIssues=[];
    if(cross.pendingOrphans.length)crossIssues.push(`❗ Pending 孤兒 Student ID：${cross.pendingOrphans.length}`);
    if(cross.pendingClassMismatches.length)crossIssues.push(`❗ Pending 班別未配對：${cross.pendingClassMismatches.length}`);
    if(cross.seat.classMismatch)crossIssues.push('❗ 座位表目前班別搵唔返主系統班別');
    if(cross.seat.unknownStudentIds.length)crossIssues.push(`❗ 座位表有主系統不存在嘅 Student ID：${cross.seat.unknownStudentIds.length}`);
    if(cross.submissionClassMismatches.length)crossIssues.push(`⚠️ 追收未配對目前班別：${cross.submissionClassMismatches.length}`);
    if(cross.seat.missingSeatStudents.length)crossIssues.push(`⚠️ 主系統學生未出現在目前座位表：${cross.seat.missingSeatStudents.length}`);
    if(!cross.seat.ready)crossIssues.push('ℹ️ 座位表未開啟，今次未檢查座位資料');
    if(cross.queuedWrites)crossIssues.push(`ℹ️ 尚有待同步寫入：${cross.queuedWrites}`);

    const crossBox=m.querySelector('#pe-v25-cross-audit');
    if(crossBox)crossBox.innerHTML=`
      <div style="font-weight:900;font-size:10px;margin-bottom:5px">🔎 V2.5 跨模組一致性診斷</div>
      <div class="pe-note">${cross.healthy?'✅ 未發現會令資料斷鏈嘅跨模組問題。':'⚠️ 發現需要檢查嘅跨模組連結。'} <span style="opacity:.65">嚴重 ${cross.criticalCount}｜提示 ${cross.warningCount}</span></div>
      <div style="margin-top:6px;font-size:9px;line-height:1.65">${crossIssues.length?crossIssues.map(x=>`• ${esc(x)}`).join('<br>'):'• Pending、追收、座位表與主系統目前資料一致。'}</div>
      <div class="pe-note" style="margin-top:5px">本版只診斷，不會自動修改任何 ID、班別、追收或座位資料。</div>`;

    renderIdentityRegistry();
  }

  function openIdentityV1(){
    syncIdentityV1FromClassCore();
    const m=ensureIdentityV1Modal();
    renderIdentityV1();
    m.classList.add('open');
  }

  function ensureClassCoreModal(){
    let m=document.getElementById('pe-class-core-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-class-core-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🏫 班別／學生中心 <small style="font-size:.62em;opacity:.55">v2.8.1</small></h3>
      <p class="pe-note">呢份學生資料係座位表、積分、追收及學生紀錄嘅共用核心。每個班別及學生而家都有固定 ID；改名唔會令資料斷開。學生名單每行一位。</p>
      <div class="pe-class-core-grid">
        <div>
          <div class="pe-class-core-list" id="pe-class-core-list"></div>
          <div class="pe-actions" style="justify-content:stretch">
            <button class="pe-btn primary pe-add-class-theme" id="pe-class-core-add" style="width:100%">＋ 新增班別</button>
          </div>
        </div>
        <div class="pe-class-core-editor">
          <div class="pe-grid">
            <div class="pe-field"><label>班別</label><input id="pe-class-core-name" placeholder="例如：3C"></div>
            <div class="pe-field pe-full" id="pe-class-core-empty-roster">
              <label>建立學生名單</label>
              <div class="pe-actions" style="justify-content:flex-start;align-items:end;flex-wrap:wrap">
                <label style="display:flex;flex-direction:column;gap:4px;min-width:130px">
                  <span>全班人數</span>
                  <input id="pe-class-core-count" type="number" min="1" max="80" inputmode="numeric" placeholder="例如：30" style="width:120px">
                </label>
                <button type="button" class="pe-btn primary" id="pe-class-core-generate">🔢 產生班號名單</button>
              </div>
              <div class="pe-note">未有正式姓名都可以先建立 01、02、03… 暫時名單。</div>
            </div>
            <div class="pe-field pe-full" id="pe-class-core-existing-roster" style="display:none">
              <label>名單操作</label>
              <div class="pe-actions" style="justify-content:flex-start;flex-wrap:wrap">
                <button type="button" class="pe-btn" id="pe-class-core-rename-mode">✏️ 改姓名（保留資料）</button>
                <button type="button" class="pe-btn danger" id="pe-class-core-rebuild-mode">↻ 重建名單</button>
              </div>
            </div>
            <div class="pe-field pe-full"><div class="pe-note" id="pe-class-core-mode-note">先輸入全班人數，再按「產生班號名單」。</div></div>
            <div class="pe-field pe-full"><label>學生名單（每行一位，可一次過貼上）</label><textarea id="pe-class-core-students" placeholder="陳大文&#10;李小明&#10;張美玲"></textarea></div>
            <div class="pe-field pe-full" id="pe-class-core-profile-field">
              <label>學生 Profile 快捷</label>
              <div id="pe-class-core-profile-list" class="pe-class-core-profile-list"></div>
            </div>
          </div>
          <div class="pe-actions">
            <button class="pe-btn danger" id="pe-class-core-delete">刪除班別</button>
            <button class="pe-btn primary" id="pe-class-core-save">儲存</button>
          </div>
        </div>
      </div>
      <div class="pe-actions">
        <button class="pe-btn" id="pe-class-core-identity">🧬 身份資料 V1</button>
        <button class="pe-btn" id="pe-class-core-close">關閉</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    try{applyClassCoreTheme(currentMainTheme())}catch{}
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-class-core-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-class-core-identity').addEventListener('click',()=>openIdentityV1());
    m.querySelector('#pe-class-core-add').addEventListener('click',()=>{
      m.dataset.classId='';
      m.dataset.studentMode='rebuild';
      m.querySelector('#pe-class-core-name').value='';
      m.querySelector('#pe-class-core-students').value='';
      const countInput=m.querySelector('#pe-class-core-count');
      countInput.value='';
      countInput.disabled=false;
      countInput.readOnly=false;
      countInput.removeAttribute('disabled');
      countInput.removeAttribute('readonly');
      countInput.style.pointerEvents='auto';
      m.querySelector('#pe-class-core-empty-roster').style.display='block';
      m.querySelector('#pe-class-core-existing-roster').style.display='none';
      m.querySelector('#pe-class-core-mode-note').textContent='新增班別：先輸入全班人數，再按「🔢 產生班號名單」。';
      m.querySelector('#pe-class-core-name').focus();
      renderClassCoreList();
    });
    m.querySelector('#pe-class-core-count').addEventListener('input',()=>{
      const input=m.querySelector('#pe-class-core-count');
      const raw=parseInt(input.value,10)||0;
      if(raw<0)input.value='';
      else if(raw>80)input.value='80';
    });
    m.querySelector('#pe-class-core-students').addEventListener('input',()=>{
      const rec=state.classCore.find(x=>x.id===m.dataset.classId);
      const hasRoster=rec?normalizeClassProfile(rec).students.length>0:false;
      if(hasRoster)return;
      const text=m.querySelector('#pe-class-core-students').value;
      if(text.trim()){
        const count=parseStudentLinesOrdered(text).length;
        m.querySelector('#pe-class-core-count').value=count||'';
      }
    });
    m.querySelector('#pe-class-core-generate').addEventListener('click',()=>{
      const input=m.querySelector('#pe-class-core-count');
      const count=Math.max(0,Math.min(80,parseInt(input.value,10)||0));
      if(!count)return alert('請先輸入全班人數，例如 30。');
      const rec=state.classCore.find(x=>x.id===m.dataset.classId);
      const existingCount=rec?normalizeClassProfile(rec).students.length:0;
      if(existingCount>0)return alert('呢個班已經有學生名單；如要重新建立，請使用「重建名單」。');
      m.dataset.studentMode='rebuild';
      const nums=numberedPlaceholderNames(count);
      m.querySelector('#pe-class-core-students').value=nums.join('\n');
      m.querySelector('#pe-class-core-mode-note').textContent=`已產生 ${count} 個暫時班號（${nums[0]}–${nums[nums.length-1]}）。確認後按「儲存」。`;
      m.querySelector('#pe-class-core-students').focus();
    });
    m.querySelector('#pe-class-core-rename-mode').addEventListener('click',()=>{
      const rec=state.classCore.find(x=>x.id===m.dataset.classId);
      const n=rec?normalizeClassProfile(rec).students.length:0;
      if(!n)return alert('目前未有學生名單。請先輸入全班人數，再按「先用班號建立名單」。');
      m.dataset.studentMode='rename';
      m.querySelector('#pe-class-core-mode-note').textContent=`改姓名模式：一次過貼 ${n} 行姓名；必須保持人數及次序不變，studentId、座位、積分、待辦等資料會保留。`;
      m.querySelector('#pe-class-core-students').focus();
    });
    m.querySelector('#pe-class-core-rebuild-mode').addEventListener('click',()=>{
      m.dataset.studentMode='rebuild';
      m.querySelector('#pe-class-core-mode-note').textContent='重建名單模式：儲存時所有學生會重新產生 studentId；舊學生關聯資料不會套落新名單。';
      m.querySelector('#pe-class-core-students').focus();
    });
    m.querySelector('#pe-class-core-save').addEventListener('click',saveClassCoreEditor);
    m.querySelector('#pe-class-core-delete').addEventListener('click',async()=>{
      const id=m.dataset.classId;
      if(!id)return;
      const rec=state.classCore.find(x=>x.id===id);
      if(!rec)return;
      if(!confirm(`確定刪除班別「${rec.name}」？\n學生核心資料會被刪除，但現有功課／追收紀錄不會刪除。`))return;
      await dataServiceRemoveClass(id);
      m.dataset.classId='';
      renderClassCoreList();
      renderClassCoreEditor();
    });
    return m;
  }

  function parseStudentLines(text=''){
    return [...new Set(String(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];
  }

  function renderClassCoreList(){
    const m=ensureClassCoreModal(),out=m.querySelector('#pe-class-core-list');
    bootstrapClassCoreFromExisting();
    const arr=[...state.classCore].sort((a,b)=>String(a.name).localeCompare(String(b.name),'zh-HK'));
    out.innerHTML=arr.length?arr.map(c=>`
      <button type="button" data-class-core-id="${esc(c.id)}" class="${m.dataset.classId===c.id?'active':''}">
        ${esc(c.name)} <small>（${Array.isArray(c.students)?c.students.length:0}）</small>
      </button>`).join(''):'<div class="pe-note">尚未建立班別。</div>';
    out.querySelectorAll('[data-class-core-id]').forEach(btn=>btn.addEventListener('click',()=>{
      m.dataset.classId=btn.dataset.classCoreId;
      const rec=state.classCore.find(x=>x.id===m.dataset.classId);
      if(rec)setActiveClass(rec.name);
      renderClassCoreList();
      renderClassCoreEditor();
    }));
  
    try{applyClassCoreTheme(currentMainTheme())}catch{}
}

  function renderClassCoreEditor(){
    const m=ensureClassCoreModal();
    const rec=state.classCore.find(x=>x.id===m.dataset.classId);
    const normalized=rec?normalizeClassProfile(rec):null;
    const students=Array.isArray(normalized?.students)?normalized.students:[];
    m.querySelector('#pe-class-core-name').value=rec?.name||'';
    m.querySelector('#pe-class-core-students').value=students.map(studentName).join('\n');
    const hasRoster=students.length>0;
    const countInput=m.querySelector('#pe-class-core-count');
    const emptyPanel=m.querySelector('#pe-class-core-empty-roster');
    const existingPanel=m.querySelector('#pe-class-core-existing-roster');

    countInput.value=hasRoster?String(students.length):'';
    countInput.disabled=false;
    countInput.readOnly=false;
    countInput.removeAttribute('disabled');
    countInput.removeAttribute('readonly');
    countInput.style.pointerEvents='auto';

    emptyPanel.style.display=hasRoster?'none':'block';
    existingPanel.style.display=hasRoster?'block':'none';

    m.dataset.studentMode=hasRoster?'rename':'rebuild';
    m.querySelector('#pe-class-core-mode-note').textContent=hasRoster
      ? `現有 ${students.length} 人。改姓名可一次過貼 ${students.length} 行姓名，studentId 同學生資料會保留。`
      : '尚未建立學生名單：請先輸入全班人數，再按「🔢 產生班號名單」。';
    m.querySelector('#pe-class-core-delete').style.display=rec?'':'none';

    const profileList=m.querySelector('#pe-class-core-profile-list');
    const profileField=m.querySelector('#pe-class-core-profile-field');
    if(profileList&&profileField){
      profileField.style.display=rec?'':'none';
      profileList.innerHTML=students.length?students.map((s,i)=>`
        <button type="button" class="pe-btn pe-core-student-profile-btn" data-core-student-profile="${esc(s.studentId||s.id||'')}">
          ${String(s.number||i+1).padStart(2,'0')}　${esc(s.name||'')}　↗
        </button>`).join(''):'<div class="pe-note">未建立學生名單。</div>';

      profileList.querySelectorAll('[data-core-student-profile]').forEach(btn=>btn.addEventListener('click',()=>{
        const sid=btn.dataset.coreStudentProfile;
        const cls=normalized?.name||rec?.name||'';
        closeModal(m);
        openSeatStudentProfile(cls,sid);
      }));
    }
  
    try{applyClassCoreTheme(currentMainTheme())}catch{}
}

  async function saveClassCoreEditor(){
    const m=ensureClassCoreModal();
    const name=normalizeClassId(m.querySelector('#pe-class-core-name').value);
    const names=parseStudentLinesOrdered(m.querySelector('#pe-class-core-students').value);
    const mode=m.dataset.studentMode||'rename';
    if(!name)return alert('請輸入班別。');
    if(!names.length)return alert('請先建立或貼上學生名單。');

    let rec=state.classCore.find(x=>x.id===m.dataset.classId);
    if(!rec){
      const year=currentSchoolYear();
      const existing=state.classCore.find(x=>normalizeClassId(x.name)===name&&normalizeSchoolYear(x.schoolYear||year)===year&&!x.archived);
      if(existing)rec=existing;
    }

    if(!rec){
      const year=currentSchoolYear();
      const classId=newClassStableId(name,year);
      rec={
        id:classId,
        classId,
        schemaVersion:2,
        rosterVersion:1,
        schoolYear:year,
        archived:false,
        name,
        students:[],
        createdAt:new Date().toISOString()
      };
      state.classCore.push(rec);
    }else{
      rec=normalizeClassProfile(rec);
      const idx=state.classCore.findIndex(x=>x.id===rec.id);
      if(idx>=0)state.classCore[idx]=rec;
    }

    let students=[];
    const existingCount=normalizeClassProfile(rec).students.length;
    const isBrandNew=existingCount===0;

    if(isBrandNew){
      students=rebuildStudentsWithNewIds(rec,names);
      rec.rosterVersion=Number(rec.rosterVersion)||1;
    }else if(mode==='rename'){
      try{
        students=renameStudentsByPosition(rec,names);
      }catch(err){
        return alert(err?.message||'改姓名失敗。');
      }
    }else{
      if(!confirm(`確定重建「${name}」學生名單？\n\n所有學生會重新產生 studentId；原有座位、積分、學生專用待辦等舊學生資料不會套落新名單。`))return;
      students=rebuildStudentsWithNewIds(rec,names);
      rec.rosterVersion=(Number(rec.rosterVersion)||1)+1;
      rec.rosterResetAt=new Date().toISOString();
    }

    Object.assign(rec,{
      schemaVersion:2,
      classId:rec.classId||rec.id,
      schoolYear:rec.schoolYear||currentSchoolYear(),
      archived:false,
      name,
      students,
      updatedAt:new Date().toISOString()
    });

    m.dataset.classId=rec.id;
    setActiveClass(name);
    await dataServiceSaveClass(rec);
    renderClassCoreList();
    renderClassCoreEditor();
    renderClassOverview();
  }

  function openClassCore(){
    try{applyClassCoreTheme(currentMainTheme())}catch{}
    const m=ensureClassCoreModal();
    bootstrapClassCoreFromExisting();
    const active=getActiveClass();
    const preferred=classProfileByName(active);
    if(preferred)m.dataset.classId=preferred.id;
    else if(!m.dataset.classId && state.classCore[0])m.dataset.classId=state.classCore[0].id;
    renderClassCoreList();
    renderClassCoreEditor();
    m.classList.add('open');
  }

  function ensureClassOverviewModal(){
    let m=document.getElementById('pe-class-overview-modal');
    if(m)return m;
    m=document.createElement('div');m.id='pe-class-overview-modal';m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🏫 班別總覽</h3>
      <div class="pe-homework-toolbar">
        <select id="pe-class-overview-class"><option value="">選擇班別</option></select>
        <button class="pe-btn" id="pe-class-overview-refresh">更新</button>
      </div>
      <div id="pe-class-overview-grid" class="pe-class-overview-grid"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-class-overview-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-class-overview-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-class-overview-class').addEventListener('change',()=>{
      setActiveClass(m.querySelector('#pe-class-overview-class').value);
      renderClassOverview();
    });
    m.querySelector('#pe-class-overview-refresh').addEventListener('click',renderClassOverview);
    return m;
  }

  function classOverviewClasses(){
    const set=new Set();
    (state.classCore||[]).forEach(c=>c?.name&&set.add(c.name));
    homeworkHistoryRows().forEach(x=>x.className&&x.className!=='未分類'&&set.add(x.className));
    (state.submissions||[]).forEach(r=>r.className&&r.className!=='班別'&&set.add(r.className));
    return [...set].sort((a,b)=>a.localeCompare(b,'zh-HK'));
  }

  function renderClassOverview(){
    const m=ensureClassOverviewModal(),sel=m.querySelector('#pe-class-overview-class');
    const current=sel.value||getActiveClass();
    const classes=classOverviewClasses();
    sel.innerHTML='<option value="">選擇班別</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    if(classes.includes(current))sel.value=current;
    const cls=sel.value||classes[0]||'';
    if(!sel.value&&cls)sel.value=cls;

    const grid=m.querySelector('#pe-class-overview-grid');
    if(!cls){grid.innerHTML='<div class="pe-note">暫時未有班別資料。</div>';return}

    const hw=homeworkHistoryRows().filter(x=>x.className===cls&&!x.unresolved).slice(0,6);
    const subs=(window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[])
      .filter(r=>r.className===cls && Array.isArray(r.missing) && r.missing.length)
      .slice(0,6);

    const progress=[];
    const p=plannerState(),notes=p.lessonNotes||{};
    for(const [key,val] of Object.entries(notes)){
      const mm=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-p$/);
      if(!mm||!val||typeof val!=='string')continue;
      const date=mm[1],periodIndex=Number(mm[2]);
      const lesson=timetableLessonForHomework(date,periodIndex);
      if(classFromTimetableLesson(lesson)!==cls)continue;
      progress.push({date,period:periodIndex+1,text:val});
    }
    progress.sort((a,b)=>b.date.localeCompare(a.date)||a.period-b.period);

    const todos=(state.pendingItems||[]).filter(x=>{
      if(x.completed)return false;
      const s=normalizedPendingScope(x);
      if(s.type==='class')return normalizeClassId(s.name)===normalizeClassId(cls);
      if(!x.scopeType)return `${x.title||''} ${x.note||''}`.toUpperCase().includes(cls.toUpperCase());
      return false;
    }).slice(0,6);

    grid.innerHTML=`
      <div class="pe-class-card"><h4>📚 最近功課</h4><div class="pe-class-overview-list">${hw.length?hw.map(x=>`<div class="pe-class-overview-item">${fmt(x.date)}・第${x.period}節<br>${esc(x.text)}</div>`).join(''):'<div class="pe-note">暫無紀錄</div>'}</div></div>
      <div class="pe-class-card"><h4>📋 未完成追收</h4><div class="pe-class-overview-list">${subs.length?subs.map(r=>`<div class="pe-class-overview-item">${r.dueDate?fmt(r.dueDate):''}<br>${esc(r.name||r.type||'項目')}・欠 ${r.missing.length} 人</div>`).join(''):'<div class="pe-note">暫無未完成追收</div>'}</div></div>
      <div class="pe-class-card"><h4>📝 最近教學進度</h4><div class="pe-class-overview-list">${progress.length?progress.slice(0,6).map(x=>`<div class="pe-class-overview-item">${fmt(x.date)}・第${x.period}節<br>${esc(x.text)}</div>`).join(''):'<div class="pe-note">暫無進度紀錄</div>'}</div></div>
      <div class="pe-class-card"><h4>⏳ 班別相關待辦</h4><div class="pe-class-overview-list">${todos.length?todos.map(x=>`<div class="pe-class-overview-item">${x.dueDate?fmt(x.dueDate):'未設日期'}<br>${esc(x.title||'')}</div>`).join(''):'<div class="pe-note">暫無相關待辦</div>'}</div></div>`;
  }

  function openClassOverview(){
    const m=ensureClassOverviewModal();
    m.classList.add('open');
    renderClassOverview();
  }

  function openHomeworkHistory(){
    const m=ensureHomeworkHistoryModal();
    m.classList.add('open');
    renderHomeworkHistory();
  }

  function ensureSearchModal(){
    let m=document.getElementById('pe-search-modal');
    if(m)return m;

    m=document.createElement('div');
    m.id='pe-search-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🔎 全站搜尋</h3>
      <p class="pe-note">搜尋教學進度、功課、月曆記事、校曆活動、活動紀錄、追收紀錄及待處理事項。</p>
      <div class="pe-homework-toolbar">
        <input id="pe-global-query" type="search" placeholder="輸入關鍵字，例如：默書、家長、3C、工作紙">
        <button class="pe-btn" type="button" id="pe-search-clear">清除</button>
      </div>
      <div class="pe-search-hint">可按整張搜尋結果，或按「前往來源」直接跳返原本位置。</div>
      <div id="pe-search-results" class="pe-search-results">
        <div class="pe-note">輸入關鍵字開始搜尋。</div>
      </div>
      <div class="pe-actions">
        <button class="pe-btn" type="button" id="pe-search-close">關閉</button>
      </div>
    </div>`;

    document.body.appendChild(m);

    m.addEventListener('click',e=>{
      if(e.target===m)closeModal(m);
    });

    const input=m.querySelector('#pe-global-query');
    input.addEventListener('input',renderGlobalSearch);
    input.addEventListener('keydown',e=>{
      if(e.key==='Escape')closeModal(m);
    });

    m.querySelector('#pe-search-clear').addEventListener('click',()=>{
      input.value='';
      renderGlobalSearch();
      input.focus();
    });

    m.querySelector('#pe-search-close').addEventListener('click',()=>closeModal(m));

    return m;
  }

  function openJournalSearch(){
    const m=ensureSearchModal();
    if(!m)return;
    m.classList.add('open');
    const input=m.querySelector('#pe-global-query');
    input?.focus();
    renderGlobalSearch();
  }

  function currentVisibleSubjectMap(){
    const map={};
    document.querySelectorAll('.journal-table tbody tr').forEach(row=>{
      const subject=row.querySelector('.subject-cell')?.textContent?.trim();
      const ta=row.querySelector('textarea[aria-label*="進度"],textarea[aria-label*="功課"]');
      const label=ta?.getAttribute('aria-label')||'';
      const m=label.match(/第(\d+)節/);
      if(subject&&m)map[Number(m[1])-1]=subject;
    });
    return map;
  }

  function journalRows(){
    const data=readPlannerData(),notes=data.lessonNotes||{},subjects=currentVisibleSubjectMap(),rows=[];
    for(const[key,val]of Object.entries(notes)){
      if(!val||typeof val!=='string')continue;
      const m=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-(p|h)$/);
      if(!m)continue;
      const periodIndex=Number(m[2]);
      rows.push({
        kind:m[3]==='p'?'教學進度':'功課',
        date:m[1],
        periodIndex,
        noteType:m[3],
        title:`第${periodIndex+1}節${subjects[periodIndex]?`・${subjects[periodIndex]}`:''}`,
        text:val,
        route:'journal'
      });
    }
    return rows;
  }

  function globalSearchRows(){
    const p=readPlannerData(),rows=[...journalRows()];

    for(const[date,note]of Object.entries(p.calendarNotes||{})){
      if(String(note||'').trim())rows.push({
        kind:'月曆記事',date,title:'自行輸入',text:String(note),route:'calendar'
      });
    }

    const deleted=new Set(Array.isArray(p.deletedDefaultEventKeys)?p.deletedDefaultEventKeys:[]);
    const custom=Array.isArray(p.customCalendarEvents)?p.customCalendarEvents:[];
    [...DEFAULT_SCHOOL_EVENTS.filter(x=>!deleted.has(defaultEventKey(x))),...custom].forEach(a=>rows.push({
      kind:'校曆活動',
      date:a.start||a.date||'',
      title:a.title||a.name||'',
      text:[a.type,a.end].filter(Boolean).join(' '),
      route:'calendar'
    }));

    state.activities.forEach(a=>rows.push({
      kind:'活動紀錄',
      date:a.date||'',
      title:a.category||'',
      text:`${a.title||''} ${a.note||''}`,
      route:'activity',
      id:a.id||''
    }));

    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    subs.forEach(r=>rows.push({
      kind:'追收紀錄',
      date:r.issueDate||r.dueDate||'',
      title:`${r.className||''}｜${r.name||''}`,
      text:`${r.type||''} 欠交 ${(r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、')}`,
      route:'submission',
      id:r.id||''
    }));

    (state.pendingItems||[]).forEach(x=>rows.push({
      kind:'待處理事項',
      date:x.dueDate||'',
      title:x.title||'',
      text:[pendingScopeText(x),x.className,x.note,pendingPriorityLabel(x.priority),x.completed?'已完成':'未完成'].filter(Boolean).join(' '),
      route:'pending',
      id:x.id||''
    }));

    return rows;
  }

  function nativeSetInputValue(el,value){
    if(!el)return false;
    try{
      const proto=el instanceof HTMLInputElement?HTMLInputElement.prototype:HTMLElement.prototype;
      const desc=Object.getOwnPropertyDescriptor(proto,'value');
      if(desc?.set)desc.set.call(el,value);
      else el.value=value;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }catch{
      try{
        el.value=value;
        el.dispatchEvent(new Event('change',{bubbles:true}));
        return true;
      }catch{return false}
    }
  }

  function waitForElement(getter,timeout=2500){
    return new Promise(resolve=>{
      const started=Date.now();
      const tick=()=>{
        const el=typeof getter==='function'?getter():document.querySelector(getter);
        if(el)return resolve(el);
        if(Date.now()-started>=timeout)return resolve(null);
        setTimeout(tick,60);
      };
      tick();
    });
  }

  function flashSource(el){
    if(!el)return;
    el.classList.add('pe-source-flash');
    try{el.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'})}catch{el.scrollIntoView()}
    setTimeout(()=>el.classList.remove('pe-source-flash'),2200);
  }

  function mondayForDate(dateStr){
    const d=new Date(`${dateStr}T12:00:00`);
    const day=d.getDay();
    d.setDate(d.getDate()+(day===0?-6:1-day));
    return dateKeyLocal(d);
  }

  async function jumpToJournalSource(row){
    clickMainTab(['循環週教學日誌','教學日誌','日誌']);
    const weekInput=await waitForElement(()=>document.querySelector('.week-nav input[type="date"]'));
    if(weekInput)nativeSetInputValue(weekInput,mondayForDate(row.date));

    await new Promise(r=>setTimeout(r,220));
    const weekday=new Date(`${row.date}T12:00:00`).getDay();
    const dayIndex=weekday>=1&&weekday<=5?weekday-1:0;
    const day=await waitForElement(()=>document.querySelectorAll('.journal-day')[dayIndex]||null,2200);
    if(!day)return;

    let target=null;
    const wanted=`第${Number(row.periodIndex)+1}節`;
    const typeWord=row.noteType==='p'?'進度':'功課';
    target=[...day.querySelectorAll('textarea')].find(x=>{
      const a=x.getAttribute('aria-label')||'';
      return a.includes(wanted)&&a.includes(typeWord);
    })||[...day.querySelectorAll('textarea')].find(x=>(x.getAttribute('aria-label')||'').includes(wanted))||day;

    flashSource(target);
    if(target instanceof HTMLTextAreaElement)setTimeout(()=>target.focus({preventScroll:true}),280);
  }

  async function jumpToCalendarSource(row){
    clickMainTab(['校務月曆','月曆']);
    const monthInput=await waitForElement(()=>document.querySelector('.month-nav input[type="month"]'));
    if(monthInput&&row.date)nativeSetInputValue(monthInput,row.date.slice(0,7));

    await new Promise(r=>setTimeout(r,220));
    const cell=await waitForElement(()=>document.querySelector(`.cal-cell[data-date="${row.date}"]`),2500);
    flashSource(cell);
  }

  async function jumpToSearchSource(row){
    if(!row)return;
    closeModal(document.getElementById('pe-search-modal'));

    if(row.route==='journal')return jumpToJournalSource(row);
    if(row.route==='calendar')return jumpToCalendarSource(row);

    if(row.route==='activity'&&row.id){
      openActivityEdit(row.id);
      return;
    }

    if(row.route==='submission'&&row.id){
      window.__submissionTrackerAPI?.openRecord?.(row.id);
      return;
    }

    if(row.route==='pending'&&row.id){
      openPendingEdit(row.id);
      return;
    }
  }

  function renderGlobalSearch(){
    const out=document.getElementById('pe-search-results');
    if(!out)return;
    const q=(document.getElementById('pe-global-query')?.value||'').trim().toLowerCase();

    if(!q){
      state.searchResults=[];
      out.innerHTML='<div class="pe-note">輸入關鍵字開始搜尋。</div>';
      return;
    }

    const rows=globalSearchRows()
      .filter(r=>`${r.kind} ${r.date} ${r.title} ${r.text}`.toLowerCase().includes(q))
      .sort((a,b)=>(b.date||'').localeCompare(a.date||''))
      .slice(0,150);

    state.searchResults=rows;

    out.innerHTML=rows.length?rows.map((r,i)=>`
      <div class="pe-search-result" data-search-index="${i}" role="button" tabindex="0">
        <div class="top">
          <b>${esc(r.title||r.kind)}</b>
          <span>${esc(r.kind)}</span>
          <button class="jump" type="button" data-search-jump="${i}">前往來源</button>
        </div>
        <small>${r.date?`${esc(fmt(r.date))}・`:''}${esc(r.text||'')}</small>
      </div>`).join(''):'<div class="pe-note">找不到相符紀錄。</div>';

    const jump=i=>jumpToSearchSource(state.searchResults?.[Number(i)]);
    out.querySelectorAll('[data-search-jump]').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();
      jump(btn.dataset.searchJump);
    }));
    out.querySelectorAll('[data-search-index]').forEach(card=>{
      card.addEventListener('click',()=>jump(card.dataset.searchIndex));
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          jump(card.dataset.searchIndex);
        }
      });
    });
  }

  function findMainTabByKeywords(words){
    return [...document.querySelectorAll('.main-tabs button')].find(btn=>{
      const t=(btn.textContent||'').trim();
      return words.some(w=>t.includes(w));
    })||null;
  }

  function closeMobileMore(){
    document.getElementById('pe-mobile-more')?.classList.remove('open');
  }

  function toggleMobileMore(){
    const sheet=ensureMobileMore();
    const next=!sheet.classList.contains('open');
    if(next)sheet.classList.add('open');
    else sheet.classList.remove('open');
    return next;
  }

  function openSubmissionFromNav(){
    closeMobileMore();
    const api=window.__submissionTrackerAPI;
    if(api?.open){
      api.open();
      return true;
    }
    document.querySelector('.submission-launcher')?.click();
    return true;
  }

  function clickMainTab(words){
    const btn=findMainTabByKeywords(words);
    if(!btn)return false;
    btn.click();
    closeMobileMore();
    window.scrollTo({top:0,behavior:'smooth'});
    return true;
  }


  function ensureWorkspaceModal(){
    let m=document.getElementById('pe-workspace-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-workspace-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🧰 工作台</h3>
      <p class="pe-note">集中處理班級、課堂、功課、追收與待辦。</p>
      <div class="pe-kpi-row" id="pe-v2-kpis"></div>
      <div class="pe-class-overview-grid">
        <button class="pe-class-card" type="button" id="pe-v2-class-center"><h4>🏫 班級中心</h4><div class="pe-note">班級資料與學生入口集中。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-flow"><h4>🧭 課堂工作流</h4><div class="pe-note">一堂課集中睇上次進度、今堂功課及追收。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-inbox"><h4>📥 待處理／追收</h4><div class="pe-note">待辦、deadline、追收一次睇。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-homework"><h4>📚 功課管理</h4><div class="pe-note">查看功課紀錄及追收狀態。</div></button>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-v2-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-v2-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-v2-class-center').addEventListener('click',()=>{closeModal(m);openClassCenter()});
    m.querySelector('#pe-v2-flow').addEventListener('click',()=>{closeModal(m);openWorkflow()});
    m.querySelector('#pe-v2-inbox').addEventListener('click',()=>{closeModal(m);openInbox()});
    m.querySelector('#pe-v2-homework').addEventListener('click',()=>{closeModal(m);openHomeworkHistory()});
    return m;
  }

  function renderWorkspace(){
    const m=ensureWorkspaceModal();
    const inbox=unifiedInboxRows(),classes=state.classCore.length,students=state.classCore.reduce((n,c)=>n+(c.students?.length||0),0);
    const tracking=inbox.filter(x=>x.type==='submission').length,overdue=inbox.filter(x=>x.status==='overdue').length;
    m.querySelector('#pe-v2-kpis').innerHTML=`
      <div class="pe-kpi"><b>${classes}</b><small>班別</small></div>
      <div class="pe-kpi"><b>${students}</b><small>學生</small></div>
      <div class="pe-kpi"><b>${tracking}</b><small>追收中</small></div>
      <div class="pe-kpi"><b>${overdue}</b><small>逾期</small></div>`;
  }

  function openWorkspace(){
    bootstrapClassCoreFromExisting();
    getActiveClass();
    const m=ensureWorkspaceModal();
    renderWorkspace();
    m.classList.add('open');
  }





  const ONBOARDING_KEY='hk-school-onboarding-device-seen';
  const ONBOARDING_STEP_KEY='hk-school-onboarding-device-step';
  const ONBOARDING_STEPS=[
    {title:'由零開始：第一次設定',body:'呢個教學會當你第一次用系統，由登入、總課表、月曆、今日工作台、日誌、追收、班級中心一直去到座位／積分同學生 Profile。黃色高光框會標示真正要留意或撳嘅位置。',action:''},
    {title:'① 登入／建立帳戶',body:'右上角「登入／註冊」可以用 Google，亦可以用電郵＋密碼；未登入仍可以使用本機模式。',action:'login',actionLabel:'高光登入位置'},
    {title:'② 先設定總課表',body:'第一次使用先去「1. 總課表」。上方「教師及班級資料」以 2×2 顯示；課表可以手動輸入各 Day／A-B 週課節，亦可匯入 Word／PDF。',action:'master',actionLabel:'帶我去總課表'},
    {title:'③ 上載現有課表',body:'如果你已有學校課表，最方便係用「選擇 Word／PDF 課表」直接匯入。系統會先顯示辨認預覽，核對科目排列後先按確認匯入；PDF 通常會比複雜 Word 排版更容易辨認。',action:'masterUpload',actionLabel:'高光上載課表位置'},
    {title:'④ 月曆主畫面',body:'切去月曆後，先睇清楚月份、學校活動、假期、宗教活動同特別日。高光會框住目前真正顯示緊嘅月曆。',action:'calendar',actionLabel:'帶我去月曆'},
    {title:'⑤ 月曆點樣新增資料？',body:'月曆入面撳日期數字（例如 11）會開快捷新增。教學會直接高光真正可撳嘅日期數字，避免同整個日期格混淆。',action:'calendarCell',actionLabel:'高光可撳日期數字'},
    {title:'⑥ 日期快捷新增：揀邊一隻？',body:'一般記事＝普通文字備忘；活動紀錄＝需要分類／統計嘅活動；待處理事項＝有 deadline、要提醒或跟進嘅工作。呢一步只示範選單，唔會幫你新增資料。',action:'calendarQuick',actionLabel:'示範快捷新增選單'},
    {title:'⑦ 輸入後喺邊度睇返？',body:'一般記事會留喺該日期格文字區；活動紀錄同待處理事項會以月曆 tag／標籤顯示，而且活動／待辦亦會喺今日工作台或相關管理頁再出現。',action:'calendarViewBack',actionLabel:'返月曆睇日期格'},
    {title:'⑧ 今日工作台',body:'今日工作台只會喺「4. 今日課表」頁出現。今日課表保持手機闊度，可以上下捲動查看完整內容。教學會先切去今日課表，再打開工作台。',action:'today',actionLabel:'帶我去今日工作台'},
    {title:'⑨ 教學日誌：進度＋功課',body:'轉去「3. 循環週教學日誌」前，系統會先收起今日工作台。日誌會保持完整欄位顯示；每堂課嘅進度同功課都喺呢度填。',action:'journal',actionLabel:'帶我去教學日誌'},
    {title:'⑩ 日誌直接「＋追收」',body:'功課格右下角會有「＋追收」。填咗功課後，可以直接由呢粒掣建立追收；多行功課會分成獨立追收項目。',action:'journalFollowup',actionLabel:'高光日誌「＋追收」'},
    {title:'⑪ 功課管理入口喺邊？',body:'平時可以由「更多 → 工作台 → 功課管理」開啟。教學會直接打開工作台，再高光「📚 功課管理」卡，等你知道日後喺邊度搵返。',action:'homeworkEntry',actionLabel:'高光功課管理入口'},
    {title:'⑫ 功課／追收管理',body:'建立追收後，可以喺功課管理入面逐個班號標示未處理、已交或欠交。離開呢一步時，教學會自動關閉功課管理視窗。',action:'homework',actionLabel:'帶我去功課管理'},
    {title:'⑬ 班級中心入口喺邊？',body:'班級中心平時由目前裝置可見嘅「更多」入口打開。教學會先開啟正確嘅 More 選單，再高光「班級中心」。',action:'classCenterEntry',actionLabel:'顯示班級中心入口'},
    {title:'⑭ 班級中心各個 Tab',body:'班級中心入面有：總覽、學生、功課、追收、座位／積分。',action:'classCenterTabs',actionLabel:'打開班級中心並高光 Tabs'},
    {title:'⑮ 學生 Tab 同 Profile「＋」',body:'撳「學生」Tab 會見到格狀學生名單。每位學生右邊「＋」就係直接開該學生 Profile；離開呢一步時會自動關閉班級中心。',action:'classCenterStudents',actionLabel:'帶我去學生 Tab'},
    {title:'⑯ 座位／積分',body:'座位／積分嘅班別會跟主系統班別同步。',action:'seat',actionLabel:'帶我去座位／積分'},
    {title:'⑰ 座位表／積分有咩功能？',body:'座位模組下方主要分頁包括：今日＝課堂快捷總覽；學生＝學生資料；座位＝調位及座位限制；積分＝個人／小組加減分；紀錄＝查看操作及課堂事件；更多＝班別、設定、匯入匯出等工具。',action:'seatFeatures',actionLabel:'高光座位表功能分頁'},
    {title:'⑱ 雲端：寫入同讀取',body:'登入本身唔會自動將完整總課表上傳。完整總課表要喺帳戶選單按「備份到雲端」；另一部裝置登入同一帳戶後按「從雲端還原」。追收、待辦等支援 Firestore 同步嘅模組會另外顯示 ☁ 同步狀態。',action:'account',actionLabel:'高光帳戶／雲端入口'},
    {title:'完成：日常建議流程',body:'日常可以跟：今日工作台 → 上堂後填日誌 → 有欠交就按「＋追收」 → 需要睇學生就去班級中心／Profile。More／設定內可以隨時重播教學。',action:'today',actionLabel:'返今日工作台'}
  ];

  function ensureOnboardingStyles(){
    if(document.getElementById('pe-onboarding-styles'))return;
    const s=document.createElement('style');s.id='pe-onboarding-styles';s.textContent=`
      .pe-onboarding{display:none;position:fixed;inset:0;z-index:2147483645;background:#0007;align-items:center;justify-content:center;padding:16px}.pe-onboarding.open{display:flex}
      .pe-onboarding-card{width:min(510px,100%);background:#fff;border-radius:18px;box-shadow:0 18px 50px #0004;padding:16px}.pe-onboarding-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.pe-onboarding-head h3{margin:0;font-size:17px}.pe-onboarding-close{border:0;background:transparent;font-size:20px;cursor:pointer}.pe-onboarding-body{font-size:13px;line-height:1.6;color:#394150;min-height:110px}.pe-onboarding-progress{display:flex;gap:3px;margin:12px 0 8px}.pe-onboarding-dot{height:5px;flex:1;border-radius:99px;background:#dfe4ea}.pe-onboarding-dot.active{background:#5d77d7}.pe-onboarding-stepno{font-size:10px;opacity:.58;margin-bottom:10px}.pe-onboarding-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.pe-onboarding-actions .right{display:flex;gap:7px;margin-left:auto}.pe-onboarding-actions button{border:1px solid #d7dde5;background:#fff;border-radius:10px;padding:8px 11px;cursor:pointer}.pe-onboarding-actions button.primary{background:#5d77d7;color:#fff;border-color:#5d77d7}.pe-onboarding-action{width:100%;margin-top:3px!important;background:#f4f7ff!important;border-color:#bdc9ef!important;color:#3f58a5!important;font-weight:700}
      .pe-onboarding-resume{display:none;position:fixed;right:12px;bottom:76px;z-index:2147483644;border:0;border-radius:999px;padding:9px 13px;background:#5d77d7;color:#fff;box-shadow:0 5px 16px #0003;font-weight:700;cursor:pointer}.pe-onboarding-resume.show{display:block}
      .pe-onboarding-spotlight{display:none;position:fixed;z-index:2147483646;border:3px solid #ffd54f;border-radius:12px;pointer-events:none;box-shadow:0 0 0 9999px #0008,0 0 0 5px #fff9,0 6px 22px #0005;transition:left .16s ease,top .16s ease,width .16s ease,height .16s ease}.pe-onboarding-spotlight.show{display:block}.pe-onboarding-spotlight-label{position:absolute;left:0;top:calc(100% + 7px);background:#fff;color:#263238;border-radius:9px;padding:6px 9px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 3px 12px #0003}
      @media(max-width:600px){.pe-onboarding-card{padding:13px}.pe-onboarding-body{min-height:130px}.pe-onboarding-spotlight-label{max-width:250px;white-space:normal}}
      .pe-onboarding-spotlight.calendar-target .pe-onboarding-spotlight-label{
        width:180px;
        max-width:min(180px,calc(100vw - 24px));
        white-space:normal;
        line-height:1.45;
      }
      .pe-calendar-direct-highlight{
        position:relative!important;
        z-index:2147483646!important;
        outline:4px solid #ffd54f!important;
        outline-offset:3px!important;
        border-radius:8px!important;
        box-shadow:0 0 0 5px #fff9,0 5px 18px #0004!important;
      }
      .pe-calendar-direct-highlight.pe-calendar-date-highlight{
        border-radius:999px!important;
        outline-offset:4px!important;
      }`;
    document.head.appendChild(s);
  }
  function visibleElement(selector,root=document){const els=[...root.querySelectorAll(selector)];return els.find(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)>0&&r.width>0&&r.height>0})||null}
  function ensureSpotlight(){ensureOnboardingStyles();let s=document.getElementById('pe-onboarding-spotlight');if(!s){s=document.createElement('div');s.id='pe-onboarding-spotlight';s.className='pe-onboarding-spotlight';s.innerHTML='<div class="pe-onboarding-spotlight-label" id="pe-onboarding-spotlight-label">教學重點</div>';document.body.appendChild(s)}return s}
  function clearOnboardingSpotlight(){const s=ensureSpotlight();s.classList.remove('show','calendar-target');const l=s.querySelector('#pe-onboarding-spotlight-label');if(l){l.style.left='';l.style.right='';l.style.top='';l.style.bottom=''}document.querySelectorAll('.pe-calendar-direct-highlight').forEach(el=>el.classList.remove('pe-calendar-direct-highlight','pe-calendar-date-highlight'))}
  function spotlightElement(el,label='呢個位置'){if(!el)return false;try{el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'})}catch{};const place=()=>{if(!document.contains(el))return false;const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0)return false;const pad=6,s=ensureSpotlight();s.style.left=`${Math.max(4,r.left-pad)}px`;s.style.top=`${Math.max(4,r.top-pad)}px`;s.style.width=`${Math.min(window.innerWidth-8,Math.max(24,r.width+pad*2))}px`;s.style.height=`${Math.min(window.innerHeight-8,Math.max(24,r.height+pad*2))}px`;s.querySelector('#pe-onboarding-spotlight-label').textContent=label;s.classList.add('show');return true};setTimeout(place,260);setTimeout(place,520);return true}
  function spotlightRect(rect,label='呢個位置'){if(!rect)return false;const pad=4,s=ensureSpotlight(),vw=Math.max(1,window.innerWidth||document.documentElement.clientWidth||1),vh=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);const left=Math.max(4,rect.left-pad),top=Math.max(4,rect.top-pad),right=Math.min(vw-4,rect.right+pad),bottom=Math.min(vh-4,rect.bottom+pad);if(right<=left||bottom<=top)return false;s.style.left=`${left}px`;s.style.top=`${top}px`;s.style.width=`${Math.max(24,right-left)}px`;s.style.height=`${Math.max(24,bottom-top)}px`;s.querySelector('#pe-onboarding-spotlight-label').textContent=label;s.classList.add('show');return true}
  function findVisibleMainTab(words=[]){const c=[...document.querySelectorAll('button,[role="tab"]')].filter(el=>{const t=(el.textContent||'').trim();return words.some(w=>t===w||t.includes(w))});return c.find(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0})||findMainTabByKeywords(words)}
  function spotlightMainTab(words,label){return spotlightElement(findVisibleMainTab(words),label)}
  function closeTutorialPanelsBeforeNavigate(){document.getElementById('pe-dashboard')?.classList.remove('open');document.getElementById('pe-mobile-more')?.classList.remove('open');clearOnboardingSpotlight()}
  function closeAllHomeworkTutorialUI(){
    const ids=['pe-homework-modal','pe-workspace-modal'];
    ids.forEach(id=>{
      const m=document.getElementById(id);
      if(m)m.classList.remove('open','show');
    });
    // In case homework/tracking is surfaced through another visible modal/card.
    document.querySelectorAll('.pe-modal.open,.pe-modal.show').forEach(m=>{
      const text=(m.textContent||'');
      if(text.includes('功課管理')||text.includes('功課／追收')||text.includes('追收紀錄')){
        m.classList.remove('open','show');
      }
    });
  }

  function cleanupAfterTutorialStep(step={}){
    clearOnboardingSpotlight();

    const homeworkRelated=new Set([
      'homeworkEntry',
      'homework',
      'journalFollowup'
    ]);

    if(homeworkRelated.has(step.action)){
      closeAllHomeworkTutorialUI();
    }

    // Also close homework UI whenever the next flow is moving into class center / seat,
    // even if step numbering changes later.
    if(step.action==='classCenterEntry'||step.action==='classCenterTabs'||step.action==='classCenterStudents'){
      closeAllHomeworkTutorialUI();
    }

    if(step.action==='classCenterStudents'){
      closeTutorialModal('pe-class-center-modal');
    }

    if(step.action==='seatFeatures'){
      closeSeatScore();
    }
  }

  function ensureOnboarding(){ensureOnboardingStyles();let m=document.getElementById('pe-onboarding');if(m)return m;m=document.createElement('div');m.id='pe-onboarding';m.className='pe-onboarding';m.innerHTML=`<div class="pe-onboarding-card" role="dialog" aria-modal="true"><div class="pe-onboarding-head"><h3 id="pe-onboarding-title">使用教學</h3><button type="button" class="pe-onboarding-close" id="pe-onboarding-close">✕</button></div><div class="pe-onboarding-stepno" id="pe-onboarding-stepno"></div><div class="pe-onboarding-body" id="pe-onboarding-body"></div><button type="button" class="pe-onboarding-action" id="pe-onboarding-action" style="display:none"></button><div class="pe-onboarding-progress" id="pe-onboarding-progress"></div><div class="pe-onboarding-actions"><button type="button" id="pe-onboarding-skip">略過教學</button><div class="right"><button type="button" id="pe-onboarding-back">上一步</button><button type="button" class="primary" id="pe-onboarding-next">下一步</button></div></div></div>`;document.body.appendChild(m);let resume=document.getElementById('pe-onboarding-resume');if(!resume){resume=document.createElement('button');resume.id='pe-onboarding-resume';resume.className='pe-onboarding-resume';resume.type='button';resume.textContent='📖 繼續教學';document.body.appendChild(resume);resume.addEventListener('click',()=>{clearOnboardingSpotlight();resume.classList.remove('show');m.classList.add('open');renderOnboardingStep()})}m.dataset.step='0';const finish=()=>{try{localStorage.setItem(ONBOARDING_KEY,'1');localStorage.removeItem(ONBOARDING_STEP_KEY)}catch{};m.classList.remove('open');resume.classList.remove('show');clearOnboardingSpotlight()};m.querySelector('#pe-onboarding-close').addEventListener('click',finish);m.querySelector('#pe-onboarding-skip').addEventListener('click',finish);m.addEventListener('click',e=>{if(e.target===m)finish()});m.querySelector('#pe-onboarding-back').addEventListener('click',()=>{const current=Number(m.dataset.step||0);cleanupAfterTutorialStep(ONBOARDING_STEPS[current]||{});const i=Math.max(0,current-1);m.dataset.step=String(i);try{localStorage.setItem(ONBOARDING_STEP_KEY,String(i))}catch{};renderOnboardingStep()});m.querySelector('#pe-onboarding-next').addEventListener('click',()=>{const i=Number(m.dataset.step||0);cleanupAfterTutorialStep(ONBOARDING_STEPS[i]||{});if(i>=ONBOARDING_STEPS.length-1){finish();return}m.dataset.step=String(i+1);try{localStorage.setItem(ONBOARDING_STEP_KEY,String(i+1))}catch{};renderOnboardingStep()});m.querySelector('#pe-onboarding-action').addEventListener('click',()=>runOnboardingAction(ONBOARDING_STEPS[Number(m.dataset.step||0)]));return m}
  function onboardingHideAndResume(){const m=ensureOnboarding(),resume=document.getElementById('pe-onboarding-resume');m.classList.remove('open');resume?.classList.add('show');clearOnboardingSpotlight()}
  function firstVisibleCalendarCell(){const grid=visibleCalendarGrid();if(!grid)return null;const cells=[...grid.querySelectorAll('.cal-cell[data-date]')];const vh=window.innerHeight||document.documentElement.clientHeight||0;const visible=c=>{const r=c.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<vh};return cells.find(c=>c.dataset.date===hkToday()&&visible(c))||cells.find(visible)||cells[0]||null}
  function firstVisibleCalendarDateButton(){const cell=firstVisibleCalendarCell();return cell?.querySelector(':scope > b')||cell?.querySelector('b')||cell}
  function visibleCalendarBoundary(){const grid=visibleCalendarGrid();if(!grid)return null;return grid.closest('.calendar-layout')||grid}
  function calendarSpotlightElement(el,label='月曆重點',mode='center'){
    if(!el)return false;
    clearOnboardingSpotlight();
    try{el.scrollIntoView({behavior:'smooth',block:mode==='nearest'?'nearest':'center',inline:'nearest'})}catch{}
    const apply=()=>{
      if(!document.contains(el))return false;
      ensureSpotlight().classList.remove('show','calendar-target');
      document.querySelectorAll('.pe-calendar-direct-highlight').forEach(x=>x.classList.remove('pe-calendar-direct-highlight','pe-calendar-date-highlight'));
      el.classList.add('pe-calendar-direct-highlight');
      if(el.matches?.('.cal-cell > b,.cal-cell b'))el.classList.add('pe-calendar-date-highlight');
      el.setAttribute('data-tutorial-highlight',label);
      return true;
    };
    setTimeout(apply,220);
    setTimeout(apply,520);
    return true;
  }
  function closeTutorialModal(id){const m=document.getElementById(id);if(m)m.classList.remove('open','show')}
  function runOnboardingAction(step={}){onboardingHideAndResume();switch(step.action){
    case 'login':case 'account':{if(step.action==='account')closeSeatScore();const btn=[...document.querySelectorAll('button')].find(b=>{const t=(b.textContent||'').trim(),r=b.getBoundingClientRect(),cs=getComputedStyle(b);return (t==='登入／註冊'||b.classList.contains('account-button'))&&r.width>0&&r.height>0&&cs.display!=='none'});if(btn)spotlightElement(btn,step.action==='login'?'先撳呢度登入／註冊':'撳呢度開帳戶選單：備份／還原雲端');break}
    case 'master':closeTutorialPanelsBeforeNavigate();clickMainTab(['總課表','1. 總課表','1.總課表']);setTimeout(()=>spotlightMainTab(['總課表','1. 總課表','1.總課表'],'目前係「總課表」'),180);break;
    case 'masterUpload':closeTutorialPanelsBeforeNavigate();clickMainTab(['總課表','1. 總課表','1.總課表']);setTimeout(()=>{const upload=visibleElement('.upload-timetable');if(upload)spotlightElement(upload,'撳「選擇 Word／PDF 課表」上載現有課表');else spotlightElement(visibleElement('.workspace aside.panel'),'喺總課表設定區搵「選擇 Word／PDF 課表」')},300);break;
    case 'calendar':closeTutorialPanelsBeforeNavigate();clickMainTab(['月曆','2. 月曆','2.月曆','校務月曆']);setTimeout(()=>calendarSpotlightElement(visibleCalendarBoundary(),'月曆格＋右側備忘區', 'nearest'),360);break;
    case 'calendarCell':closeTutorialPanelsBeforeNavigate();clickMainTab(['月曆','2. 月曆','2.月曆','校務月曆']);setTimeout(()=>calendarSpotlightElement(firstVisibleCalendarDateButton(),'撳日期數字開快捷新增'),320);break;
    case 'calendarQuick':closeTutorialPanelsBeforeNavigate();clickMainTab(['月曆','2. 月曆','2.月曆','校務月曆']);setTimeout(()=>{const cell=firstVisibleCalendarCell(),date=cell?.dataset.date||hkToday();if(date)openDateQuickModal(date);setTimeout(()=>{const modal=document.getElementById('pe-date-quick-modal');spotlightElement(visibleElement('.pe-quick-grid',modal||document),'揀：一般記事／活動紀錄／待處理事項')},160)},280);break;
    case 'calendarViewBack':closeModal(document.getElementById('pe-date-quick-modal'));closeTutorialPanelsBeforeNavigate();clickMainTab(['月曆','2. 月曆','2.月曆','校務月曆']);setTimeout(()=>calendarSpotlightElement(firstVisibleCalendarCell(),'輸入後會喺呢個日期格睇返記事／tag'),300);break;
    case 'today':closeTutorialPanelsBeforeNavigate();clickMainTab(['今日課表','當日課表','今日']);setTimeout(()=>{const board=visibleElement('.today-board');if(board){renderDashboard();const panel=ensureDashboard();panel.classList.add('open');setTimeout(()=>spotlightElement(panel,'今日工作台：每日由呢度開始'),120)}else spotlightMainTab(['今日課表','當日課表','今日'],'先去「當日課表」先會出現今日工作台')},420);break;
    case 'journal':closeTutorialPanelsBeforeNavigate();clickMainTab(['教學日誌','日誌','3. 教學日誌','3.教學日誌']);setTimeout(()=>spotlightElement(visibleElement('.journal-table'),'教學日誌：填進度同功課'),320);break;
    case 'journalFollowup':closeTutorialPanelsBeforeNavigate();clickMainTab(['教學日誌','日誌','3. 教學日誌','3.教學日誌']);setTimeout(()=>{const findBtn=()=>visibleElement('.journal-followup-btn');let btn=findBtn();if(btn){spotlightElement(btn,'功課格右下「＋追收」');return}let tries=0;const timer=setInterval(()=>{btn=findBtn();tries++;if(btn||tries>=8){clearInterval(timer);if(btn)spotlightElement(btn,'功課格右下「＋追收」');else spotlightElement(visibleElement('.journal-table textarea[aria-label*="功課"]'),'填功課後，右下會出現「＋追收」')}},250)},320);break;
    case 'homeworkEntry':closeTutorialPanelsBeforeNavigate();openWorkspace();setTimeout(()=>spotlightElement(visibleElement('#pe-v2-homework',document.getElementById('pe-workspace-modal')||document),'More → 工作台 → 功課管理'),180);break;
    case 'homework':closeTutorialPanelsBeforeNavigate();closeTutorialModal('pe-workspace-modal');openHomeworkHistory();setTimeout(()=>spotlightElement(visibleElement('#pe-homework-modal .pe-dialog'),'功課管理／追收紀錄'),180);break;
    case 'classCenterEntry':{closeTutorialPanelsBeforeNavigate();closeAllHomeworkTutorialUI();const w=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);let moreTrigger=null;if(w<=700)moreTrigger=visibleElement('#pe-mobile-nav [data-mobile="more"]')||visibleElement('[data-mobile="more"]');else if(w<=1100)moreTrigger=visibleElement('#pe-ipad-rail [data-ipad="more"]')||visibleElement('[data-ipad="more"]');else moreTrigger=visibleElement('.pe-desktop-more-toggle');if(moreTrigger)moreTrigger.click();else ensureMobileMore().classList.add('open');setTimeout(()=>{const sheet=document.getElementById('pe-mobile-more');if(sheet&&!sheet.classList.contains('open'))sheet.classList.add('open');spotlightElement(visibleElement('#pe-more-class-center',sheet||document),'More → 班級 → 班級中心')},180);break}
    case 'classCenterTabs':closeTutorialPanelsBeforeNavigate();closeAllHomeworkTutorialUI();closeMobileMore();openClassCenter();setTimeout(()=>{const modal=document.getElementById('pe-class-center-modal');spotlightElement(visibleElement('.pe-v2-tabs',modal||document),'5 個 Tabs：總覽／學生／功課／追收／座位積分')},220);break;
    case 'classCenterStudents':closeTutorialPanelsBeforeNavigate();closeAllHomeworkTutorialUI();closeMobileMore();openClassCenter();setTimeout(()=>{const modal=document.getElementById('pe-class-center-modal'),tab=visibleElement('[data-class-center-tab="students"]',modal||document);tab?.click();setTimeout(()=>{const plus=visibleElement('.pe-student-profile-plus',modal||document);if(plus)spotlightElement(plus,'學生右邊「＋」＝開 Profile');else spotlightElement(tab,'先撳「學生」Tab')},220)},180);break;
    case 'seat':closeTutorialPanelsBeforeNavigate();closeAllHomeworkTutorialUI();closeTutorialModal('pe-class-center-modal');openSeatScore(getActiveClass());setTimeout(()=>spotlightElement(visibleElement('#pe-seat-score-modal .pe-seat-score-head'),'座位／積分：頂部可見目前班別同關閉掣'),260);break;
    case 'seatFeatures':closeTutorialPanelsBeforeNavigate();if(!document.getElementById('pe-seat-score-modal')?.classList.contains('open'))openSeatScore(getActiveClass());setTimeout(()=>{const frame=document.getElementById('pe-seat-score-frame');if(!frame)return;const r=frame.getBoundingClientRect();spotlightRect({left:r.left+8,top:Math.max(r.top,r.bottom-76),width:Math.max(40,r.width-16),height:64},'主要分頁：今日／學生／座位／積分／紀錄／更多')},320);break;
  }}
  function renderOnboardingStep(){const m=ensureOnboarding(),i=Math.max(0,Math.min(ONBOARDING_STEPS.length-1,Number(m.dataset.step||0))),step=ONBOARDING_STEPS[i];m.querySelector('#pe-onboarding-title').textContent=step.title;m.querySelector('#pe-onboarding-body').textContent=step.body;m.querySelector('#pe-onboarding-stepno').textContent=`步驟 ${i+1}／${ONBOARDING_STEPS.length}`;m.querySelector('#pe-onboarding-progress').innerHTML=ONBOARDING_STEPS.map((_,n)=>`<span class="pe-onboarding-dot ${n===i?'active':''}"></span>`).join('');m.querySelector('#pe-onboarding-back').style.visibility=i===0?'hidden':'visible';m.querySelector('#pe-onboarding-next').textContent=i===ONBOARDING_STEPS.length-1?'完成':'下一步';const action=m.querySelector('#pe-onboarding-action');if(step.action&&step.actionLabel){action.style.display='block';action.textContent=step.actionLabel}else{action.style.display='none';action.textContent=''}}
  function openOnboarding(){clearOnboardingSpotlight();const m=ensureOnboarding();m.dataset.step='0';try{localStorage.setItem(ONBOARDING_STEP_KEY,'0')}catch{};renderOnboardingStep();m.classList.add('open')}
  function hasDeviceSeenOnboarding(){
    try{
      if(localStorage.getItem(ONBOARDING_KEY)==='1')return true;

      // v2.4.9 stable completion marker.
      if(localStorage.getItem('hk-school-onboarding-device-done')==='1'){
        localStorage.setItem(ONBOARDING_KEY,'1');
        return true;
      }

      // Any older completed tutorial also counts as already seen on this device.
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(/^hk-school-onboarding-v\d+-done$/.test(k) && localStorage.getItem(k)==='1'){
          localStorage.setItem(ONBOARDING_KEY,'1');
          return true;
        }
      }
    }catch{}
    return false;
  }

  function maybeOpenOnboarding(){
    try{
      if(hasDeviceSeenOnboarding())return;

      // Critical rule: "shown once" means seen.
      // Write the device marker BEFORE opening the tutorial, so refresh/close/reload
      // during the tutorial will never trigger another automatic popup.
      localStorage.setItem(ONBOARDING_KEY,'1');

      const modal=ensureOnboarding();
      modal.dataset.step='0';
      localStorage.removeItem(ONBOARDING_STEP_KEY);

      setTimeout(()=>{
        // Re-check only that the modal still exists; don't undo the seen marker.
        renderOnboardingStep();
        modal.classList.add('open');
      },700);
    }catch{
      // If storage is unavailable, avoid repeatedly forcing the tutorial in this session.
      if(window.__HK_ONBOARDING_AUTO_SHOWN__)return;
      window.__HK_ONBOARDING_AUTO_SHOWN__=true;
      const modal=ensureOnboarding();
      modal.dataset.step='0';
      setTimeout(()=>{renderOnboardingStep();modal.classList.add('open')},700);
    }
  }

  

  /* v2.4.22 stable page layout engine
     Master + journal auto-fit; Today keeps original mobile responsive layout;
     Calendar keeps native responsive layout. */
  function resetMainPreviewFit(){
    const wrap=document.querySelector('.preview-wrap');
    if(!wrap)return null;
    wrap.style.height='';
    wrap.style.minHeight='';
    wrap.style.maxHeight='';
    wrap.style.overflow='';
    wrap.style.touchAction='pan-x pan-y pinch-zoom';

    document.querySelectorAll('.integrated-master,.journal-stack,.today-board,.calendar-paper').forEach(el=>{
      el.style.transform='';
      el.style.transformOrigin='';
      el.style.width='';
      el.style.minWidth='';
      el.style.maxWidth='';
      el.style.marginLeft='';
      el.style.marginRight='';
      el.dataset.fitScale='1';
    });
    document.querySelectorAll('.journal-day').forEach(day=>{
      day.style.width='';
      day.style.minWidth='';
      day.style.maxWidth='';
    });
    return wrap;
  }

  function fitElementIntoPreview(el,baseWidth,wrap,extraBottom=24){
    if(!el||!wrap)return;
    const viewport=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    if(viewport>900||window.matchMedia?.('print')?.matches)return;

    const available=Math.max(250,Math.min(viewport-12,(wrap.clientWidth||viewport)-12));
    el.style.width=baseWidth+'px';
    el.style.minWidth=baseWidth+'px';
    el.style.maxWidth=baseWidth+'px';
    el.style.transformOrigin='top left';

    const scale=Math.min(1,available/baseWidth);
    el.style.transform=`scale(${scale})`;
    el.style.marginLeft='0';
    el.style.marginRight='0';
    el.dataset.fitScale=String(scale);

    const naturalHeight=el.scrollHeight||Math.max(1,el.getBoundingClientRect().height/Math.max(scale,.01));
    const head=wrap.querySelector('.preview-head');
    const headH=head?head.getBoundingClientRect().height:0;
    wrap.style.height=(headH + naturalHeight*scale + extraBottom)+'px';
    wrap.style.overflow='hidden';
  }

  function fitCurrentMainPage(){
    const wrap=resetMainPreviewFit();
    if(!wrap)return;

    const viewport=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    if(viewport>900||window.matchMedia?.('print')?.matches)return;

    const master=document.querySelector('.integrated-master');
    if(master){
      fitElementIntoPreview(master,760,wrap,34);
      return;
    }

    const journal=document.querySelector('.journal-stack');
    if(journal){
      journal.querySelectorAll('.journal-day').forEach(day=>{
        day.style.width='760px';
        day.style.minWidth='760px';
        day.style.maxWidth='760px';
      });
      fitElementIntoPreview(journal,760,wrap,132);
      return;
    }

    const today=document.querySelector('.today-board');
    if(today){
      // Keep original phone-responsive Today layout.
      wrap.style.height='auto';
      wrap.style.overflow='visible';
      return;
    }

    const calendar=document.querySelector('.calendar-paper,.calendar-grid');
    if(calendar){
      // Calendar keeps native responsive layout.
      wrap.style.height='auto';
      wrap.style.overflow='visible';
    }
  }

  function scheduleMainPageFit(){
    [0,70,180,380,650].forEach(ms=>setTimeout(fitCurrentMainPage,ms));
  }

  window.addEventListener('resize',scheduleMainPageFit,{passive:true});
  window.addEventListener('orientationchange',scheduleMainPageFit,{passive:true});
  document.addEventListener('click',e=>{
    const t=e.target?.closest?.('button,[role="tab"]');
    if(!t)return;
    const txt=(t.textContent||'').trim();
    if(txt.includes('總課表')||txt.includes('今日')||txt.includes('月曆')||txt.includes('日誌')){
      scheduleMainPageFit();
    }
  },true);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',scheduleMainPageFit,{once:true});
  }else{
    scheduleMainPageFit();
  }

    // Auto-start check must run only after ONBOARDING_KEY and onboarding functions exist.
  maybeOpenOnboarding();

  function ensureMobileMore(){
    let sheet=document.getElementById('pe-mobile-more');
    if(sheet)return sheet;
    sheet=document.createElement('div');sheet.id='pe-mobile-more';sheet.className='pe-mobile-more';
    sheet.innerHTML=`
      <div class="pe-more-group"><b>今日</b>
        <button id="pe-more-dashboard">☀ 今日工作台</button>
        <button id="pe-more-inbox">📥 工作 Inbox</button>
      </div>
      <div class="pe-more-group"><b>班級</b>
        <button id="pe-more-class-center">🏫 班級中心</button>
        <button id="pe-more-workflow">🧭 課堂工作流</button>
        <button id="pe-more-seat">🪑 座位／積分</button>
      </div>
      <div class="pe-more-group"><b>管理</b>
        <button id="pe-more-workspace">🧰 工作台</button>
        <button id="pe-more-search">🔎 全站搜尋</button>
        <button id="pe-more-help">📖 使用教學</button>
        <button id="pe-more-settings">⚙ 設定與管理</button>
      </div>`;
    document.body.appendChild(sheet);
    sheet.querySelector('#pe-more-dashboard').addEventListener('click',()=>{
      closeMobileMore();const panel=ensureDashboard();panel.classList.add('open');renderDashboard();
    });
    sheet.querySelector('#pe-more-inbox').addEventListener('click',()=>{closeMobileMore();openInbox()});
    sheet.querySelector('#pe-more-class-center').addEventListener('click',()=>{closeMobileMore();openClassCenter()});
    sheet.querySelector('#pe-more-workflow').addEventListener('click',()=>{closeMobileMore();openWorkflow()});
    sheet.querySelector('#pe-more-seat').addEventListener('click',()=>{closeMobileMore();openSeatScore(getActiveClass())});
    sheet.querySelector('#pe-more-workspace').addEventListener('click',()=>{closeMobileMore();openWorkspace()});
    sheet.querySelector('#pe-more-search').addEventListener('click',()=>{closeMobileMore();openJournalSearch()});
    sheet.querySelector('#pe-more-help').addEventListener('click',()=>{closeMobileMore();openOnboarding()});
    sheet.querySelector('#pe-more-settings').addEventListener('click',()=>{closeMobileMore();openSettingsManager()});
    return sheet;
  }


  window.addEventListener('message',e=>{
    if(e.origin!==location.origin)return;
    const d=e.data||{};
    if(d.type==='hk-seat-ready'){
      const status=document.getElementById('pe-seat-score-status');
      if(status)status.textContent=d.className?`已連接：${d.className}・${d.studentCount||0} 人`:'已連接班級核心資料';
    }
    if(d.type==='hk-seat-active-class'&&d.className){
      setActiveClass(d.className);
    }
  });

  function closeIpadMore(){
    document.getElementById('pe-ipad-more-panel')?.classList.remove('open');
  }

  function ensureIpadMorePanel(){
    let panel=document.getElementById('pe-ipad-more-panel');
    if(panel)return panel;
    panel=document.createElement('div');
    panel.id='pe-ipad-more-panel';
    panel.className='pe-ipad-more-panel';
    panel.innerHTML=`
      <div class="pe-more-group"><b>今日</b>
        <button type="button" id="pe-ipad-more-dashboard">☀ 今日工作台</button>
        <button type="button" id="pe-ipad-more-inbox">📥 工作 Inbox</button>
      </div>
      <div class="pe-more-group"><b>班級</b>
        <button type="button" id="pe-ipad-more-class-center">🏫 班級中心</button>
        <button type="button" id="pe-ipad-more-workflow">🧭 課堂工作流</button>
        <button type="button" id="pe-ipad-more-seat">🪑 座位／積分</button>
      </div>
      <div class="pe-more-group"><b>管理</b>
        <button type="button" id="pe-ipad-more-workspace">🧰 工作台</button>
        <button type="button" id="pe-ipad-more-search">🔎 全站搜尋</button>
        <button type="button" id="pe-ipad-more-help">📖 使用教學</button>
        <button type="button" id="pe-ipad-more-settings">⚙ 設定與管理</button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector('#pe-ipad-more-dashboard').addEventListener('click',()=>{
      closeIpadMore();const p=ensureDashboard();p.classList.add('open');renderDashboard();
    });
    panel.querySelector('#pe-ipad-more-inbox').addEventListener('click',()=>{closeIpadMore();openInbox()});
    panel.querySelector('#pe-ipad-more-class-center').addEventListener('click',()=>{closeIpadMore();openClassCenter()});
    panel.querySelector('#pe-ipad-more-workflow').addEventListener('click',()=>{closeIpadMore();openWorkflow()});
    panel.querySelector('#pe-ipad-more-seat').addEventListener('click',()=>{closeIpadMore();openSeatScore(getActiveClass())});
    panel.querySelector('#pe-ipad-more-workspace').addEventListener('click',()=>{closeIpadMore();openWorkspace()});
    panel.querySelector('#pe-ipad-more-search').addEventListener('click',()=>{closeIpadMore();openJournalSearch()});
    panel.querySelector('#pe-ipad-more-help').addEventListener('click',()=>{closeIpadMore();openOnboarding()});
    panel.querySelector('#pe-ipad-more-settings').addEventListener('click',()=>{closeIpadMore();openSettingsManager()});
    return panel;
  }

  function toggleIpadMore(){
    const panel=ensureIpadMorePanel();
    const next=!panel.classList.contains('open');
    closeMobileMore();
    panel.classList.toggle('open',next);
    return next;
  }

  function detectStandaloneMode(){
    let standalone=false;
    try{
      standalone=!!window.matchMedia?.('(display-mode: standalone)')?.matches
        || window.navigator.standalone===true;
    }catch{
      standalone=window.navigator.standalone===true;
    }
    document.documentElement.classList.toggle('pe-standalone-mode',standalone);
    return standalone;
  }

  function detectIpadMode(){
    const ua=navigator.userAgent||'';
    const platform=navigator.platform||'';
    const touch=Number(navigator.maxTouchPoints||0);
    const isIPad=/iPad/i.test(ua)||(platform==='MacIntel'&&touch>1);
    document.documentElement.classList.toggle('pe-ipad-mode',isIPad);
    return isIPad;
  }
  detectIpadMode();
  window.addEventListener('resize',detectIpadMode,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(detectIpadMode,120),{passive:true});

  function ensureIpadRail(){
    let rail=document.getElementById('pe-ipad-rail');if(rail)return rail;
    rail=document.createElement('nav');
    rail.id='pe-ipad-rail';
    rail.className='pe-ipad-rail';
    rail.setAttribute('aria-label','iPad 快捷導覽');
    rail.innerHTML=`<button type="button" data-ipad="today"><span class="ico">☀</span>今日</button><button type="button" data-ipad="journal"><span class="ico">📝</span>日誌</button><button type="button" data-ipad="calendar"><span class="ico">📅</span>月曆</button><button type="button" data-ipad="submission"><span class="ico">📋</span>追收</button><button type="button" data-ipad="more"><span class="ico">•••</span>更多</button>`;
    document.body.appendChild(rail);

    rail.querySelector('[data-ipad="today"]').addEventListener('click',()=>clickMainTab(['今日課表','當日課表','今日']));
    rail.querySelector('[data-ipad="journal"]').addEventListener('click',()=>clickMainTab(['教學日誌','日誌']));
    rail.querySelector('[data-ipad="calendar"]').addEventListener('click',()=>clickMainTab(['月曆','月历']));
    rail.querySelector('[data-ipad="submission"]').addEventListener('click',openSubmissionFromNav);
    const ipadMoreBtn=rail.querySelector('[data-ipad="more"]');
    const openIpadMore=e=>{
      e?.preventDefault?.();
      e?.stopPropagation?.();
      toggleIpadMore();
    };
    ipadMoreBtn.addEventListener('click',openIpadMore);
    ipadMoreBtn.addEventListener('touchend',e=>{
      e.preventDefault();
      e.stopPropagation();
      toggleIpadMore();
    },{passive:false});
    return rail;
  }

  document.addEventListener('click',e=>{
    const panel=document.getElementById('pe-ipad-more-panel');
    if(!panel?.classList.contains('open'))return;
    if(e.target.closest('#pe-ipad-more-panel')||e.target.closest('[data-ipad="more"]'))return;
    closeIpadMore();
  },true);

  function updateIpadRailActive(){
    const rail=ensureIpadRail();
    rail.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    if(document.getElementById('submission-page')?.classList.contains('active')){
      rail.querySelector('[data-ipad="submission"]')?.classList.add('active');
      return;
    }
    if(isVisible(document.querySelector('.today-board'))){
      rail.querySelector('[data-ipad="today"]')?.classList.add('active');
    }else if(isVisible(document.querySelector('.journal-table'))){
      rail.querySelector('[data-ipad="journal"]')?.classList.add('active');
    }else if(isVisible(document.querySelector('.calendar-grid'))){
      rail.querySelector('[data-ipad="calendar"]')?.classList.add('active');
    }
  }

  function ensureDesktopMoreToggle(){
    let btn=document.getElementById('pe-desktop-more-toggle');
    if(btn)return btn;
    btn=document.createElement('button');
    btn.type='button';
    btn.id='pe-desktop-more-toggle';
    btn.className='pe-desktop-more-toggle';
    btn.textContent='••• 更多';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMobileMore()});
    document.body.appendChild(btn);
    return btn;
  }

  function ensureMobileNav(){
    let nav=document.getElementById('pe-mobile-nav');
    if(nav)return nav;
    nav=document.createElement('nav');nav.id='pe-mobile-nav';nav.className='pe-mobile-nav';nav.setAttribute('aria-label','手機快捷導覽');
    nav.innerHTML=`<button data-mobile-nav="today"><span class="ico">☀</span>今日</button><button data-mobile-nav="journal"><span class="ico">📝</span>日誌</button><button data-mobile-nav="calendar"><span class="ico">📅</span>月曆</button><button data-mobile-nav="submission"><span class="ico">📋</span>追收</button><button data-mobile-nav="more"><span class="ico">•••</span>更多</button>`;
    document.body.appendChild(nav);

    nav.querySelector('[data-mobile-nav="today"]').addEventListener('click',()=>clickMainTab(['今日課表','當日課表','今日']));
    nav.querySelector('[data-mobile-nav="journal"]').addEventListener('click',()=>clickMainTab(['教學日誌','日誌']));
    nav.querySelector('[data-mobile-nav="calendar"]').addEventListener('click',()=>clickMainTab(['月曆','月历']));
    nav.querySelector('[data-mobile-nav="submission"]').addEventListener('click',openSubmissionFromNav);
    nav.querySelector('[data-mobile-nav="more"]').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMobileMore()});

    document.addEventListener('click',e=>{
      const more=document.getElementById('pe-mobile-more');
      if(!more?.classList.contains('open'))return;
      if(
        e.target.closest('#pe-mobile-more')||
        e.target.closest('[data-mobile-nav="more"]')||
        e.target.closest('[data-ipad="more"]')||
        e.target.closest('#pe-desktop-more-toggle')
      )return;
      closeMobileMore();
    });
    return nav;
  }

  function ensureCorrectFloatingNav(){
    const standalone=detectStandaloneMode();
    const ipad=detectIpadMode();
    if(ipad){
      ensureIpadRail();
      document.getElementById('pe-mobile-nav')?.style.setProperty('display','none','important');
      document.getElementById('pe-desktop-more-toggle')?.style.setProperty('display','none','important');
      return;
    }
    if(standalone){
      ensureMobileNav();
      const nav=document.getElementById('pe-mobile-nav');
      nav?.style.setProperty('display','grid','important');
      document.getElementById('pe-ipad-rail')?.style.setProperty('display','none','important');
      document.getElementById('pe-desktop-more-toggle')?.style.setProperty('display','none','important');
    }
  }
  ensureCorrectFloatingNav();
  setTimeout(ensureCorrectFloatingNav,120);
  setTimeout(ensureCorrectFloatingNav,450);
  setTimeout(ensureCorrectFloatingNav,1100);
  window.addEventListener('pageshow',()=>setTimeout(ensureCorrectFloatingNav,60));
  window.addEventListener('resize',()=>setTimeout(ensureCorrectFloatingNav,80),{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(ensureCorrectFloatingNav,180),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')setTimeout(ensureCorrectFloatingNav,80);
  });
  try{
    window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change',()=>setTimeout(ensureCorrectFloatingNav,50));
  }catch{}

  function updateMobileNavActive(){
    const nav=ensureMobileNav();
    nav.querySelectorAll('[data-mobile-nav]').forEach(b=>b.classList.remove('active'));
    if(document.getElementById('submission-page')?.classList.contains('active')){
      nav.querySelector('[data-mobile-nav="submission"]')?.classList.add('active');return;
    }
    if(isVisible(document.querySelector('.today-board'))){
      nav.querySelector('[data-mobile-nav="today"]')?.classList.add('active');return;
    }
    if(isVisible(document.querySelector('.journal-table'))){
      nav.querySelector('[data-mobile-nav="journal"]')?.classList.add('active');return;
    }
    if(visibleCalendarGrid()){
      nav.querySelector('[data-mobile-nav="calendar"]')?.classList.add('active');
    }
  }



  function activeMainTabKey(){
    const active=[...document.querySelectorAll('.main-tabs button')].find(b=>b.classList.contains('active'));
    const text=(active?.textContent||'').trim();
    if(text.startsWith('1.')||text.includes('總課表'))return 'master';
    if(text.startsWith('2.')||text.includes('月曆'))return 'calendar';
    if(text.startsWith('3.')||text.includes('教學日誌')||text.includes('日誌'))return 'journal';
    if(text.startsWith('4.')||text.includes('今日課表'))return 'today';
    return '';
  }

  function applyCompactTabPanel(){
    const panel=document.querySelector('.workspace aside.panel');
    if(!panel)return;

    const tab=activeMainTabKey();
    if(!tab)return;

    const masterOnlyTitles=new Set([
      '教師及班級資料',
      '版面風格',
      '完整資料備份'
    ]);

    panel.querySelectorAll(':scope > section').forEach(section=>{
      const title=(section.querySelector('.section-title h2')?.textContent||'').trim();
      if(!masterOnlyTitles.has(title))return;
      section.style.setProperty('display',tab==='master'?'':'none','important');
      if(tab==='master')section.style.removeProperty('display');
    });

    // 「資料自動保存」屬於完整備份區域的附帶提示；其他頁一併收起。
    panel.querySelectorAll(':scope > .structure').forEach(el=>{
      const heading=(el.querySelector('b')?.textContent||'').trim();
      if(heading!=='資料自動保存')return;
      if(tab==='master')el.style.removeProperty('display');
      else el.style.setProperty('display','none','important');
    });

    panel.dataset.compactTab=tab;
  }

  function forceNavVisibility(){
    const mobile=ensureMobileNav();
    const ipad=ensureIpadRail();
    const desktop=ensureDesktopMoreToggle();

    const standalone=detectStandaloneMode();
    const isIpad=detectIpadMode();
    const w=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);

    // Root rule: installed PWA / real iPad modes win over viewport-width rules.
    // Do not let the legacy 1.8s UI tick hide the correct floating navigation.
    if(isIpad){
      mobile.style.setProperty('display','none','important');
      ipad.style.setProperty('display','grid','important');
      desktop.style.setProperty('display','none','important');
      document.body.style.removeProperty('padding-bottom');
    }else if(standalone){
      mobile.style.setProperty('display','grid','important');
      ipad.style.setProperty('display','none','important');
      desktop.style.setProperty('display','none','important');
      document.body.style.setProperty(
        'padding-bottom',
        'calc(96px + env(safe-area-inset-bottom, 0px))',
        'important'
      );
    }else if(w<=700){
      mobile.style.setProperty('display','grid','important');
      ipad.style.setProperty('display','none','important');
      desktop.style.setProperty('display','none','important');
      document.body.style.setProperty('padding-bottom','118px','important');
    }else if(w<=1100){
      mobile.style.setProperty('display','none','important');
      ipad.style.setProperty('display','grid','important');
      desktop.style.setProperty('display','none','important');
      document.body.style.removeProperty('padding-bottom');
    }else{
      mobile.style.setProperty('display','none','important');
      ipad.style.setProperty('display','none','important');
      desktop.style.setProperty('display','block','important');
      document.body.style.removeProperty('padding-bottom');
    }

    [mobile,ipad,desktop].forEach(el=>{
      el.style.setProperty('z-index','2147483000','important');
    });
  }

  function uiTick(){if(document.visibilityState!=='visible')return;forceNavVisibility();applyCompactTabPanel();renderDashboard();if(document.getElementById('pe-workspace-modal')?.classList.contains('open'))renderWorkspace();if(document.getElementById('pe-inbox-modal')?.classList.contains('open'))renderInbox();renderContextTools();renderCalendarActivityOverlay();updateMobileNavActive();updateIpadRailActive();updateSyncDisplay()}


  document.addEventListener('click',e=>{
    if(e.target.closest('.main-tabs button')){
      setTimeout(applyCompactTabPanel,0);
      setTimeout(applyCompactTabPanel,80);
    }
  },true);
  window.addEventListener('resize',()=>{renderCalendarActivityOverlay();forceNavVisibility()},{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(forceNavVisibility,120),{passive:true});
  window.addEventListener('scroll',()=>renderCalendarActivityOverlay(),{passive:true});
  window.addEventListener('submission-pending-changed',()=>updateSyncDisplay());
  window.addEventListener('firebase-auth-state',e=>{
    const user=e.detail?.user || null;
    if(user){
      state.firebaseReady=false;
      connectData().catch(err=>console.warn('[planner-enhancements] auth reconnect',err));
    }else{
      state.firebaseReady=false;
      updateSyncDisplay();
    }
  });
  window.addEventListener('firebase-bootstrap-error',()=>updateSyncDisplay());
  window.addEventListener('calendarDateQuickAdd',e=>openDateQuickModal(e.detail?.date));
  window.addEventListener('calendarActivityEditRequested',e=>openActivityEdit(e.detail?.id));
  window.addEventListener('calendarPendingEditRequested',e=>openPendingEdit(e.detail?.id));
  window.addEventListener('online',()=>{flushActivityPending();flushPendingQueue();window.__submissionTrackerAPI?.flushPending?.();if(!state.firebaseReady)connectData().catch(()=>{});setTimeout(updateSyncDisplay,300)});
  window.addEventListener('offline',()=>updateSyncDisplay());

  window.addEventListener('online',()=>renderStatusStack());
  window.addEventListener('offline',()=>setSync('offline'));


  ensureV220CompactStyles();

  function installCriticalDelegates(){
    if(document.documentElement.dataset.peCriticalDelegates==='1')return;
    document.documentElement.dataset.peCriticalDelegates='1';

    document.addEventListener('click',e=>{
      const t=e.target.closest('button');
      if(!t)return;

      if(t.id==='pe-more-workflow'||t.id==='pe-v2-flow'){
        e.preventDefault();
        closeMobileMore();
        safeOpenWorkflow();
        return;
      }

      if(t.id==='pe-more-inbox'||t.id==='pe-v2-inbox'||t.id==='pe-today-inbox'){
        e.preventDefault();
        closeMobileMore();
        safeOpenInbox();
        return;
      }
    },true);
  }

  function showInboxRenderError(err){
    console.error('[planner-enhancements] Inbox render failed',err);
    const m=ensureInboxModal();
    const out=m.querySelector('#pe-inbox-list');
    if(out)out.innerHTML='<div class="pe-note">Inbox 顯示發生錯誤，請重新整理頁面後再試。</div>';
  }

  function showWorkflowRenderError(err){
    console.error('[planner-enhancements] Workflow render failed',err);
    const m=ensureWorkflowModal();
    const out=m.querySelector('#pe-workflow-content');
    if(out)out.innerHTML='<div class="pe-note">課堂工作流顯示發生錯誤。日期及節數控制仍可使用；請重新整理頁面後再試。</div>';
  }

  function safeOpenWorkflow(date=hkToday(),periodIndex=0){
    safeRenderModule('Workflow',()=>openWorkflow(date,periodIndex),err=>{
      const m=ensureWorkflowModal();
      m.classList.add('open');
      const out=m.querySelector('#pe-workflow-content');
      if(out)out.innerHTML=moduleErrorHtml('課堂工作流顯示錯誤',err);
    });
  }

  function safeOpenInbox(){
    openInbox();
  }

  async function start(){
    addCss();
    installCriticalDelegates();
    ensureSyncPill();
    ensureStatusStack();
    renderStatusStack();
    installNetworkStatus();
    ensureDashboard();
    ensureContextTools();
    ensureActivityModal();
    ensureActivityEditModal();
    ensureStatsModal();
    ensureSearchModal();
    ensureDoneModal();
    ensurePendingModal();
    ensurePendingEditModal();
    ensureTagVisibilityModal();
    ensureDateQuickModal();
    ensureHomeworkHistoryModal();
    ensureClassOverviewModal();
    ensureCategoryManager();
    ensureSettingsManager();
    ensureClassCenterModal();
    ensureClassCoreModal();
    ensureInboxModal();
    ensureWorkflowModal();
    ensureWorkspaceModal();
    loadClassCore();
    getActiveClass();
    ensureMobileNav();
    ensureIpadRail();
    ensureDesktopMoreToggle();
    forceNavVisibility();
    applyCompactTabPanel();
    ensureMobileMore();
    ensureCalendarActivityLayer();
    installPwaUpdatePrompt();

    /* UI must remain available even when Firebase/Auth is slow. */
    uiTick();
    connectData().catch(err=>console.warn('[planner-enhancements] initial cloud connect',err));

    setTimeout(forceNavVisibility,250);
    setTimeout(forceNavVisibility,1200);
    setInterval(uiTick,1800);
    console.info(`[planner-enhancements] v${VERSION} ready`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
