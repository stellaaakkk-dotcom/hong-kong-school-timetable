(() => {
  'use strict';

  const VERSION = '2.0.4';
  const ACTIVITY_LOCAL_KEY = 'hk-school-calendar-activity-logs-v1';
  const ACTIVITY_PENDING_KEY = 'hk-school-calendar-activity-pending-v1';
  const PENDING_LOCAL_KEY = 'hk-school-pending-items-v1';
  const PENDING_QUEUE_KEY = 'hk-school-pending-items-queue-v1';
  const CAL_TAG_VIS_KEY = 'hk-school-calendar-tag-visibility-v1';
  const PLANNER_LOCAL_KEY = 'hk-school-planner-v3';
  const CLASS_CORE_LOCAL_KEY = 'hk-school-class-core-v2';
  const CLASS_CORE_QUEUE_KEY = 'hk-school-class-core-queue-v2';
  const ACTIVE_CLASS_KEY = 'hk-school-active-class-v2';
  const state = {
    user: null,
    submissions: [],
    activities: [],
    pendingItems: [],
    classCore: [],
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
      .pe-update-banner.show{display:flex;align-items:center;gap:9px}.pe-update-banner b{font-size:11px}.pe-update-banner span{font-size:9px;color:#806c5c;flex:1}.pe-update-banner button{border:0;border-radius:8px;background:#a86f3d;color:#fff;padding:6px 9px;font-size:9px;font-weight:800}

      .pe-dashboard-toggle{display:none;position:fixed;right:12px;bottom:62px;z-index:2147481350;border:1px solid #d8c2a4;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 11px;font:800 10px "Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif;box-shadow:0 4px 13px #0002}
      .pe-dashboard-toggle.show{display:block}
      .pe-dashboard{display:none;position:fixed;right:12px;bottom:104px;z-index:2147481300;width:min(390px,calc(100vw - 24px));max-height:68vh;overflow:auto;border:1px solid #e9d5ac;border-radius:15px;background:#fffaf0;color:#594537;padding:10px 11px;box-shadow:0 8px 26px #0003;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}
      .pe-dashboard.open{display:block}.pe-dash-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}.pe-dash-head b{font-size:12px;color:#80542f}.pe-dash-head small{font-size:8px;color:#8c7767}.pe-dash-close{margin-left:5px;border:1px solid #d8c2a4;border-radius:999px;background:#fff;color:#80542f;padding:3px 6px;font-size:8px;font-weight:800}.pe-dash-section{border-top:1px dashed #e3d3bf;padding-top:6px;margin-top:6px}.pe-dash-title{font-size:9px;font-weight:900;color:#8a5c32;margin-bottom:4px}.pe-dash-row{font-size:9px;line-height:1.55;color:#6e5848;overflow-wrap:anywhere}.pe-dash-empty{font-size:9px;color:#998678}.pe-dash-actions{display:flex;gap:5px;margin-top:7px}.pe-dash-actions button{flex:1;border:1px solid #d8c2a4;border-radius:8px;background:#fff;color:#80542f;padding:5px 6px;font-size:8px;font-weight:800}.pe-dash-actions button.primary{background:#a86f3d;color:#fff;border-color:#a86f3d}
      .pe-dash-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
      .pe-dash-card{border:1px solid #e4d3b9;border-radius:10px;background:#fff;padding:7px;cursor:pointer}
      .pe-dash-card b{display:block;font-size:15px;color:#7b5332;line-height:1.1}
      .pe-dash-card span{display:block;margin-top:2px;font-size:8px;color:#8c7767;font-weight:800}
      .pe-dash-card.warn{background:#fff7ef;border-color:#e8c7ad}
      .pe-dash-card.danger{background:#fff1ef;border-color:#e5bab4}
      .pe-dash-detail{display:none;margin-top:7px;border-top:1px dashed #e3d3bf;padding-top:6px}
      .pe-dash-detail.open{display:block}
      .pe-homework-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}
      .pe-homework-toolbar select,.pe-homework-toolbar input{width:100%;border:1px solid #decdb9;border-radius:8px;background:#fff;padding:7px;font-size:10px}
      .pe-homework-list{display:grid;gap:6px}
      .pe-homework-item{border:1px solid #eadfce;border-radius:9px;background:#fff;padding:8px}
      .pe-homework-item .top{display:flex;justify-content:space-between;gap:8px}
      .pe-homework-item b{font-size:10px;color:#80542f}.pe-homework-item small{font-size:8px;color:#8d796a}
      .pe-homework-item p{margin:4px 0 0;font-size:9px;line-height:1.45;color:#5f4b3d;white-space:pre-wrap}.pe-homework-unresolved{margin-top:9px;border:1px solid #ead9c4;border-radius:9px;background:#fffaf1;padding:7px}.pe-homework-unresolved>summary{cursor:pointer;font-size:9px;font-weight:850;color:#936b4d}.pe-homework-unresolved[open]>summary{margin-bottom:6px}
      .pe-homework-periods{display:flex;flex-wrap:wrap;gap:4px;margin:7px 0}
      .pe-homework-periods button{border:1px solid #e5d5bf;border-radius:999px;background:#fffaf0;color:#7d5b42;padding:5px 8px;font-size:8px;font-weight:800}
      .pe-homework-periods button.active{background:#b67a45;color:#fff;border-color:#b67a45}
      .pe-homework-status{display:inline-flex;align-items:center;border-radius:999px;padding:3px 6px;font-size:7.5px;font-weight:850;margin-left:4px}
      .pe-homework-status.none{background:#f3eee8;color:#76695e}
      .pe-homework-status.open{background:#fff2d8;color:#9a641f}
      .pe-homework-status.done{background:#edf7ef;color:#4c7b55}
      .pe-homework-dup{margin-top:5px;padding:5px 6px;border:1px solid #f0d4ae;border-radius:7px;background:#fff8e8;color:#8a5f2d;font-size:8px;line-height:1.35}
      .pe-homework-link{margin-left:4px;border:0;background:transparent;color:#8a5f2d;text-decoration:underline;font-size:7.5px;font-weight:850;cursor:pointer}
      .pe-homework-status-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:5px;padding-top:5px;border-top:1px dashed #eee1d0}
      .pe-homework-status-row .label{font-size:7.5px;color:#8b7768;font-weight:800}

      .pe-class-overview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .pe-class-card{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px}
      .pe-class-card h4{margin:0 0 6px;color:#80542f;font-size:10px}
      .pe-class-overview-list{display:grid;gap:5px}
      .pe-class-overview-item{padding:6px;border-radius:8px;background:#fff9ef;border:1px solid #efe1ce;font-size:8.5px;line-height:1.4}
      .pe-v2-tabs{display:flex;gap:5px;flex-wrap:wrap;margin:7px 0 9px}
      .pe-v2-tabs button{border:1px solid #ddcbb4;border-radius:999px;background:#fff9ea;color:#76533b;padding:5px 9px;font-size:8px;font-weight:850}
      .pe-v2-tabs button.active{background:#9b6a3f;color:#fff;border-color:#9b6a3f}
      .pe-class-core-grid{display:grid;grid-template-columns:180px 1fr;gap:8px;min-height:330px}
      .pe-class-core-list{border:1px solid #eadfce;border-radius:10px;padding:6px;background:#fffaf2;display:grid;align-content:start;gap:4px}
      .pe-class-core-list button{border:1px solid #ead9c4;border-radius:8px;background:#fff;color:#72513a;padding:7px 8px;text-align:left;font-size:8.5px;font-weight:800}
      .pe-class-core-list button.active{background:#a87446;color:#fff;border-color:#a87446}
      .pe-class-core-editor{border:1px solid #eadfce;border-radius:10px;padding:9px;background:#fff}
      .pe-class-core-editor textarea{min-height:210px}
      .pe-kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:7px 0}
      .pe-kpi{border:1px solid #eadfce;border-radius:9px;background:#fffaf2;padding:7px;text-align:center}
      .pe-kpi b{display:block;font-size:14px;color:#80542f}.pe-kpi small{font-size:7.5px;color:#8c7868}
      .pe-inbox-toolbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:7px 0}.pe-scope-tag{display:inline-block;margin-right:4px;border:1px solid #ddcbb4;border-radius:999px;background:#fff7e8;color:#79543b;padding:2px 6px;font-size:7px;font-weight:850}.pe-scope-tag.school{background:#eef4ff;border-color:#cad8ef;color:#4d6484}.pe-scope-tag.subject{background:#f4efff;border-color:#d8ccef;color:#695589}.pe-scope-tag.grade{background:#eef8ef;border-color:#c8dec9;color:#547255}.pe-scope-tag.personal{background:#f5f5f5;border-color:#dddddd;color:#666}
      .pe-inbox-list{display:grid;gap:6px}
      .pe-inbox-item{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px}
      .pe-inbox-item.overdue{background:#fff6f4;border-color:#e9c3bb}
      .pe-inbox-item.today{background:#fffaf0;border-color:#e4ca86}
      .pe-inbox-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .pe-inbox-top b{font-size:9.5px;color:#684b38}.pe-inbox-top small{font-size:7.5px;color:#8b7768}
      .pe-inbox-meta{margin-top:3px;font-size:8px;color:#806d60;line-height:1.4}
      .pe-inbox-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
      .pe-inbox-actions button{border:1px solid #ddcbb4;border-radius:7px;background:#fff8e8;color:#775239;padding:4px 7px;font-size:7.5px;font-weight:850}
      .pe-workflow-head{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .pe-workflow-periods{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:8px 0}
      .pe-workflow-periods button{border:1px solid #e1d2bf;border-radius:8px;background:#fff9ed;color:#77543c;padding:6px 4px;font-size:8px;font-weight:850}
      .pe-workflow-periods button.active{background:#a16e42;color:#fff;border-color:#a16e42}
      .pe-workflow-card{border:1px solid #eadfce;border-radius:11px;background:#fff;padding:9px}
      .pe-workflow-card h4{margin:0 0 6px;font-size:10px;color:#7a5539}
      .pe-workflow-block{padding:7px;border-radius:8px;background:#fff9ef;border:1px solid #efe2d0;margin-top:5px;font-size:8.5px;line-height:1.45}
      .pe-workflow-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:8px}
      .pe-workflow-actions button{border:1px solid #d9c3a7;border-radius:8px;background:#fff8e7;color:#79533a;padding:7px 5px;font-size:8px;font-weight:850}
      .pe-workflow-actions button.primary{background:#9e6b3f;color:#fff;border-color:#9e6b3f}
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
      @media(max-width:700px){.pe-status-stack{top:84px;right:8px}}
@media(max-width:700px){.pe-class-overview-grid{grid-template-columns:1fr}}

      .pe-category-manager-list{display:grid;gap:6px;margin-top:8px}
      .pe-category-manager-row{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center;border:1px solid #eadfce;border-radius:9px;background:#fff;padding:8px}
      .pe-category-manager-row b{font-size:10px;color:#80542f}.pe-category-manager-row small{display:block;font-size:8px;color:#8c7868;margin-top:2px}
      @media(max-width:700px){.pe-dash-summary,.pe-homework-toolbar{grid-template-columns:1fr 1fr}.pe-category-manager-row{grid-template-columns:1fr}}


      .pe-context-tools{position:fixed;left:10px;bottom:12px;z-index:2147481400;display:none;gap:6px;flex-wrap:wrap;max-width:calc(100vw - 20px)}.pe-context-tools.show{display:flex}.pe-context-tools button{border:1px solid #d8c2a4;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 10px;font-size:9px;font-weight:800;box-shadow:0 4px 13px #0002}

      .pe-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:#0005;align-items:center;justify-content:center;padding:14px;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}.pe-modal.open{display:flex}
      .pe-dialog{width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid #e8d9c4;border-radius:16px;background:#fffdf8;color:#4a3428;box-shadow:0 15px 48px #0005;padding:14px}.pe-dialog h3{margin:0 0 5px;color:#80542f;font-size:15px}.pe-note{margin:0 0 10px;color:#857365;font-size:10px;line-height:1.45}.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pe-field label{display:block;margin:0 0 3px;color:#857365;font-size:10px;font-weight:700}.pe-field input,.pe-field select,.pe-field textarea{width:100%;border:1px solid #decdb9;border-radius:8px;background:#fff;color:#4a3428;padding:8px;font:600 11px inherit;box-sizing:border-box}.pe-field textarea{min-height:62px;resize:vertical}.pe-full{grid-column:1/-1}.pe-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}.pe-btn{border:1px solid #d9c2a4;border-radius:8px;background:#fff;color:#80542f;padding:7px 10px;font-size:10px;font-weight:800}.pe-btn.primary{background:#a86f3d;border-color:#a86f3d;color:#fff}.pe-btn.danger{color:#c64545}
      .pe-stat-toolbar{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;margin:9px 0}.pe-stat-actions{display:grid;grid-template-columns:repeat(2,auto);gap:4px;align-items:stretch}.pe-stat-actions button{min-width:44px;padding:7px 8px}.pe-stat-toolbar select,.pe-stat-toolbar input{width:100%;border:1px solid #decdb9;border-radius:8px;padding:7px;background:#fff;color:#4a3428;font-size:10px}.pe-stat-toolbar button{border:1px solid #d8c2a4;border-radius:8px;background:#fff8db;color:#80542f;padding:7px 8px;font-size:9px;font-weight:800}.pe-stat-group{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px;margin-top:7px}.pe-stat-group summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800;color:#80542f}.pe-stat-group summary::-webkit-details-marker{display:none}.pe-stat-list{margin-top:6px;border-top:1px dashed #eadfce;padding-top:5px}.pe-stat-item{display:grid;grid-template-columns:78px 1fr auto;gap:6px;align-items:start;padding:5px 0;border-bottom:1px solid #f1e9dd;font-size:9px}.pe-stat-item:last-child{border-bottom:0}.pe-stat-item b{color:#6d5545}.pe-stat-item small{color:#8b7768;line-height:1.4}.pe-stat-item button{border:0;background:transparent;color:#c64545;font-size:9px;font-weight:800;padding:2px}.pe-stat-row-actions{display:flex;gap:2px;justify-content:flex-end;align-items:center}.pe-stat-row-actions button:first-child{color:#7b5b3d}
      .pe-search-results{margin-top:9px;display:grid;gap:6px}.pe-search-result{border:1px solid #eadfce;border-radius:9px;background:#fff;padding:8px}.pe-search-result .top{display:flex;justify-content:space-between;gap:8px;align-items:center}.pe-search-result b{font-size:10px;color:#80542f}.pe-search-result span{font-size:9px;color:#5f4b3d;line-height:1.45}.pe-search-result small{display:block;margin-top:3px;font-size:8px;color:#998678}.pe-search-hint{font-size:9px;color:#8c7868;line-height:1.5;margin-top:6px}
      .pe-search-result{cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
      .pe-search-result:hover{box-shadow:0 3px 10px #5c3d2418;transform:translateY(-1px)}
      .pe-search-result .jump{margin-left:auto;border:1px solid #ddc9ad;border-radius:999px;background:#fff8e8;color:#80542f;padding:3px 7px;font-size:7.5px;font-weight:900;white-space:nowrap}
      .pe-source-flash{outline:3px solid #e7b75d!important;outline-offset:3px!important;box-shadow:0 0 0 7px #fff1b899!important;transition:box-shadow .2s ease}

      
      @media(min-width:701px){
        .pe-desktop-more-toggle{
          display:block;position:fixed;right:14px;bottom:14px;z-index:2147482500;
          border:1px solid #d8c2a4;border-radius:999px;background:#fff8db;color:#80542f;
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
        }.pe-more-group{display:grid;gap:4px;padding:7px 0;border-bottom:1px solid #eadfce}.pe-more-group:last-child{border-bottom:0}.pe-more-group>b{padding:1px 8px 3px;font-size:8px;color:#a17b5d;letter-spacing:.08em}.pe-more-group button{width:100%}
      }

@media(max-width:700px){.pe-sync-pill{top:84px;right:8px;bottom:auto}.pe-dashboard-toggle{right:8px;bottom:62px}.pe-dashboard{right:8px;bottom:102px;width:calc(100vw - 16px);max-height:65vh}.pe-context-tools{left:8px;bottom:8px}.pe-grid{grid-template-columns:1fr}.pe-full{grid-column:auto}.pe-stat-toolbar{grid-template-columns:1fr}.pe-stat-item{grid-template-columns:68px 1fr auto}}
      @media print{.pe-sync-pill,.pe-update-banner,.pe-dashboard-toggle,.pe-dashboard,.pe-context-tools,.pe-modal{display:none!important}}
      .pe-today-done-btn{width:100%;margin-top:7px;border:1px solid #c9a97f;border-radius:9px;background:#fff5d5;color:#80542f;padding:7px 9px;font-size:9px;font-weight:900}
      .pe-done-summary{display:grid;gap:7px;margin-top:8px}
      .pe-done-card{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px}
      .pe-done-card.good{background:#f2f8ed;border-color:#c9dabd;color:#587148}
      .pe-done-card.warn{background:#fff4ef;border-color:#ebc7bc;color:#9b4f3d}
      .pe-done-card b{display:block;font-size:11px;margin-bottom:3px}
      .pe-done-card div{font-size:9px;line-height:1.5}
      .pe-pending-summary{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}
      .pe-pending-badge{border:1px solid #decdb9;border-radius:999px;background:#fff8e6;color:#76533b;padding:4px 7px;font-size:8px;font-weight:800}
      .pe-pending-badge.today{background:#fff5d5;border-color:#e0c27b;color:#8a641f}
      .pe-pending-badge.overdue{background:#fff0ef;border-color:#e7b8b3;color:#a94438}
      .pe-pending-item{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px;margin-top:7px}
      .pe-pending-item.today{background:#fffaf0;border-color:#e0c27b}
      .pe-pending-item.overdue{background:#fff7f6;border-color:#e7b8b3}
      .pe-pending-title{font-size:10px;font-weight:900;color:#684b38}
      .pe-pending-meta{font-size:8px;color:#8b7768;margin-top:3px;line-height:1.4}
      .pe-pending-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
      .pe-pending-actions button{border:1px solid #dccab4;border-radius:7px;background:#fff;color:#76533b;padding:4px 6px;font-size:8px;font-weight:800}
      .pe-pending-actions button.primary{background:#a86f3d;color:#fff;border-color:#a86f3d}
      .pe-quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}
      .pe-quick-grid button{min-height:62px;border:1px solid #decdb9;border-radius:11px;background:#fff9e8;color:#76533b;font-size:10px;font-weight:900;padding:8px 5px}
      .pe-quick-grid button span{display:block;font-size:18px;margin-bottom:3px}
      .pe-tag-toggle-list{display:grid;gap:8px;margin-top:10px}
      .pe-tag-toggle-list label{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #eadfce;border-radius:10px;background:#fff;padding:9px 10px;font-size:10px;font-weight:800;color:#684b38}
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
      @media(min-width:701px) and (max-width:1100px){
        .pe-desktop-more-toggle{display:none!important}
        .pe-ipad-rail{display:grid;position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:2147482500;gap:6px;padding:6px;border:1px solid #ddd0bd;border-radius:16px;background:#fffdf8ee;backdrop-filter:blur(12px);box-shadow:0 8px 26px #0002}
        .pe-ipad-rail button{width:58px;min-height:52px;border:0;border-radius:10px;background:transparent;color:#705642;font-size:9px;font-weight:850;line-height:1.15}
        .pe-ipad-rail .ico{display:block;font-size:17px;margin-bottom:2px}
        .pe-ipad-rail button.active{background:#fff0bc;color:#7d532f}
        .pe-mobile-more{right:78px!important;bottom:auto!important;top:50%!important;transform:translateY(-50%);width:330px!important}
        .pe-dialog{width:min(820px,calc(100vw - 120px))}
        #submission-page .sub-wrap{max-width:920px;padding-right:66px}
        .sub-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
      }
      @media(max-width:700px){
        body{padding-bottom:70px!important}
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

      @media print{.pe-mobile-nav,.pe-mobile-more{display:none!important}}


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
        border:1px solid #eadfce!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 2px 6px #5c3d240d!important;
      }
      .pe-more-group:last-child{border-bottom:1px solid #eadfce!important}
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
        border:1px solid #ead9c4!important;
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

  function renderStatusStack(){
    const el=ensureStatusStack();
    const [cls,label]=cloudStatusMeta();
    let last='';
    try{last=localStorage.getItem(LAST_CLOUD_OK_KEY)||''}catch{}
    el.innerHTML=`
      <div class="pe-status-chip cache">💾 ${cacheStatusText()}</div>
      <div class="pe-status-chip cloud ${cls}">☁ ${label}${last?` <small>最後成功：${fmtClock(last)}</small>`:''}</div>`;
  }

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

  function loadActivityPending(){try{const q=JSON.parse(localStorage.getItem(ACTIVITY_PENDING_KEY)||'[]');state.activityPending=Array.isArray(q)?q.length:0;return Array.isArray(q)?q:[]}catch{state.activityPending=0;return[]}}
  function saveActivityPending(q){try{localStorage.setItem(ACTIVITY_PENDING_KEY,JSON.stringify(q));state.activityPending=q.length}catch{}updateSyncDisplay()}
  function queueActivityPending(item){const q=loadActivityPending().filter(x=>x.id!==item.id);q.push(item);saveActivityPending(q)}
  function totalPending(){const sub=window.__submissionTrackerAPI?.getPendingCount?.()||0;return state.activityPending+(state.pendingQueueCount||0)+sub}
  function updateSyncDisplay(){
    const n=totalPending();
    if(n>0){
      const p=ensureSyncPill();
      p.className='pe-sync-pill off';
      p.textContent=`⚠ 待同步 ${n}`;
      return;
    }
    if(!navigator.onLine){setSync('offline');return}
    if(window.__firebaseBootstrapError){setSync('error');return}
    if(window.__firebaseAuthResolved && !window.__firebaseAuthUser){setSync('signedout');return}
    setSync(state.firebaseReady?'ok':'connecting');
  }
  async function flushActivityPending(){if(!navigator.onLine||!state.firebaseReady)return;let q=loadActivityPending(),remain=[];for(const item of q){try{if(item.op==='delete')await activityCollection().doc(item.id).delete();else await activityCollection().doc(item.id).set(item.data,{merge:true})}catch{remain.push(item)}}saveActivityPending(remain)}

  function loadPendingQueue(){
    try{
      const q=JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY)||'[]');
      state.pendingQueueCount=Array.isArray(q)?q.length:0;
      return Array.isArray(q)?q:[];
    }catch{state.pendingQueueCount=0;return[]}
  }
  function savePendingQueue(q){
    try{
      localStorage.setItem(PENDING_QUEUE_KEY,JSON.stringify(q));
      state.pendingQueueCount=q.length;
    }catch{}
    updateSyncDisplay();
  }
  function queuePendingOp(item){
    const q=loadPendingQueue().filter(x=>x.id!==item.id);
    q.push(item);
    savePendingQueue(q);
  }
  async function flushPendingQueue(){
    if(!navigator.onLine||!state.firebaseReady||!state.user)return;
    const col=pendingCollection(),q=loadPendingQueue(),remain=[];
    for(const item of q){
      try{
        if(item.op==='delete')await col.doc(item.id).delete();
        else await col.doc(item.id).set(item.data,{merge:true});
      }catch{remain.push(item)}
    }
    savePendingQueue(remain);
  }

  function ensureSyncPill() {
    let el = document.getElementById('pe-sync-pill');
    if (!el) { el = document.createElement('div'); el.id='pe-sync-pill'; document.body.appendChild(el); }
    return el;
  }

  function installNetworkStatus() {
    const refresh = async () => {if(navigator.onLine&&state.firebaseReady){await flushActivityPending();await flushPendingQueue();updateSyncDisplay()}else setSync(navigator.onLine?'connecting':'offline')};
    window.addEventListener('online', refresh);
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

  function classProfileByName(name=''){
    const cls=normalizeClassId(name);
    return state.classCore.find(x=>normalizeClassId(x.name)===cls)||null;
  }

  function classIdForName(name=''){
    return classProfileByName(name)?.id||'';
  }

  function normalizeClassId(name=''){
    return String(name||'').trim().toUpperCase().replace(/\s+/g,'');
  }

  function loadClassCore(){
    try{
      const x=JSON.parse(localStorage.getItem(CLASS_CORE_LOCAL_KEY)||'[]');
      state.classCore=Array.isArray(x)?x:[];
    }catch{state.classCore=[]}
    bootstrapClassCoreFromExisting();
  }

  function saveClassCore(){
    try{localStorage.setItem(CLASS_CORE_LOCAL_KEY,JSON.stringify(state.classCore))}catch{}
    try{window.dispatchEvent(new CustomEvent('classCoreChanged',{detail:state.classCore.map(x=>({...x}))}))}catch{}
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
      if(!state.classCore.some(c=>normalizeClassId(c.name)===name)){
        state.classCore.push({
          id:`class_${name.toLowerCase()}`,
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
    saveClassCore();
    if(!state.firebaseReady||!state.user||!navigator.onLine)return;
    try{
      await classCoreCollection().doc(rec.id).set(rec,{merge:true});
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
        state.activities=snap.docs.map(d=>({id:d.id,...d.data()}));
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
        state.pendingItems=snap.docs.map(d=>({id:d.id,...d.data()}));
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
          state.classCore=cloud;
          saveClassCore();
        }else{
          bootstrapClassCoreFromExisting();
        }
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

    const follow=state.submissions.filter(needsFollowup);
    const acts=todayActivities();
    const urgent=urgentPendingItems();
    const active=board.querySelector('.today-item.active-now');
    const activeText=active ? active.textContent.replace(/\s+/g,' ').trim() : '';
    const followPeople=follow.reduce((s,r)=>s+(r.missing?.length||0),0);
    const overdue=urgent.filter(x=>pendingStatus(x)==='overdue').length;
    const dueToday=urgent.filter(x=>pendingStatus(x)==='today').length;
    const soon=urgent.filter(x=>pendingStatus(x)==='soon').length;
    const uncleared=follow.length + urgent.length;

    const wasOpen=el.classList.contains('open');
    const openDetail=el.dataset.openDetail||'';

    el.innerHTML=`
      <div class="pe-dash-head">
        <b>☀ 今日工作台</b>
        <div><small>${fmt(hkToday())}</small><button type="button" class="pe-dash-close" id="pe-close-dashboard">✕ 收起</button></div>
      </div>
      ${activeText?`<div class="pe-dash-row" style="margin-bottom:7px"><b style="color:#80542f">而家：</b>${esc(activeText)}</div>`:''}

      <div class="pe-dash-summary">
        <div class="pe-dash-card ${follow.length?'warn':''}" data-dash-card="follow"><b>${follow.length}</b><span>📋 追收項目・${followPeople} 人次</span></div>
        <div class="pe-dash-card ${overdue?'danger':(dueToday?'warn':'')}" data-dash-card="deadline"><b>${urgent.length}</b><span>⏳ Deadline・今日 ${dueToday}／逾期 ${overdue}${soon?`／將到 ${soon}`:''}</span></div>
        <div class="pe-dash-card" data-dash-card="activity"><b>${acts.length}</b><span>📅 今日活動</span></div>
        <div class="pe-dash-card ${uncleared?'warn':''}" data-dash-card="done"><b>${uncleared}</b><span>✅ 尚待處理</span></div>
      </div>

      <div class="pe-dash-detail ${openDetail==='follow'?'open':''}" data-dash-detail="follow">
        ${follow.length?follow.slice(0,8).map(r=>`<div class="pe-dash-row">${esc(r.className||'')}｜${esc(r.name||r.type||'項目')}：${esc((r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、'))}</div>`).join(''):'<div class="pe-dash-empty">今日沒有需要追收。</div>'}
      </div>

      <div class="pe-dash-detail ${openDetail==='deadline'?'open':''}" data-dash-detail="deadline">
        ${urgent.length?urgent.slice(0,8).map(x=>`<div class="pe-dash-row">${pendingReminderText(x)}｜${esc(x.title||'')}</div>`).join(''):'<div class="pe-dash-empty">今日沒有 deadline 提醒。</div>'}
      </div>

      <div class="pe-dash-detail ${openDetail==='activity'?'open':''}" data-dash-detail="activity">
        ${acts.length?acts.slice(0,10).map(a=>`<div class="pe-dash-row">${esc(a.category||'活動')}｜${esc(a.title||'')}</div>`).join(''):'<div class="pe-dash-empty">今日沒有活動／記事。</div>'}
      </div>

      <div class="pe-dash-detail ${openDetail==='done'?'open':''}" data-dash-detail="done">
        ${uncleared?`<div class="pe-dash-row">追收 ${follow.length} 項；Deadline 提醒 ${urgent.length} 項。</div>`:'<div class="pe-dash-empty">🎉 今日暫時已清。</div>'}
      </div>

      <div class="pe-dash-actions">
        <button type="button" id="pe-open-sub">查看追收</button>
        <button type="button" id="pe-open-homework">功課紀錄</button>
        <button type="button" class="primary" id="pe-add-today-act">＋今日活動</button>
      </div>
      <button type="button" class="pe-today-done-btn" id="pe-today-done">✅ 今日完成檢查</button>`;

    el.querySelector('#pe-close-dashboard')?.addEventListener('click',()=>el.classList.remove('open'));
    el.querySelector('#pe-open-sub')?.addEventListener('click',()=>document.querySelector('.submission-launcher')?.click());
    el.querySelector('#pe-open-homework')?.addEventListener('click',openHomeworkHistory);
    el.querySelector('#pe-add-today-act')?.addEventListener('click',()=>openActivityModal(hkToday()));
    el.querySelector('#pe-today-done')?.addEventListener('click',openDoneCheck);

    el.querySelectorAll('[data-dash-card]').forEach(card=>card.addEventListener('click',()=>{
      const key=card.dataset.dashCard;
      el.dataset.openDetail=el.dataset.openDetail===key?'':key;
      renderDashboard();
      el.classList.add('open');
    }));

    if(wasOpen) el.classList.add('open');
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
    let type=String(item.scopeType||'').trim();
    let name=String(item.scopeName||'').trim();
    let id=String(item.scopeId||'').trim();
    if(!type){
      if(item.classId||item.className||item.lessonId||item.sourceType==='lessonWorkflow'){
        type='class'; name=String(item.className||'').trim(); id=String(item.classId||'').trim();
      }else{
        type='personal'; name='個人';
      }
    }
    if(type==='class'){
      name=name||String(item.className||'').trim();
      id=id||String(item.classId||'').trim()||classIdForName(name);
    }else if(type==='school') name=name||'全校';
    else if(type==='personal') name=name||'個人';
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
      rows.push({
        kind:'待辦',
        type:'pending',
        id:x.id,
        date:x.dueDate||'',
        className:normalizedPendingScope(x).type==='class'?(normalizedPendingScope(x).name||x.className||''):'',
        scopeType:normalizedPendingScope(x).type,
        scopeName:normalizedPendingScope(x).name,
        title:x.title||'待辦',
        meta:[pendingScopeText(x),pendingReminderText(x),`優先：${pendingPriorityLabel(x.priority)}`].filter(Boolean).join('・'),
        status:st
      });
    });

    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    subs.filter(r=>Array.isArray(r.missing)&&r.missing.length).forEach(r=>{
      const date=r.dueDate||r.deadlineDate||r.issueDate||'';
      const st=date<today?'overdue':date===today?'today':'upcoming';
      rows.push({
        kind:'追收',
        type:'submission',
        id:r.id,
        date,
        className:r.className||'',
        scopeType:'class',
        scopeName:r.className||'',
        title:r.name||r.type||'追收項目',
        meta:`班別・${r.className||''}・欠 ${r.missing.length} 人`,
        status:st
      });
    });

    return rows.sort((a,b)=>{
      const rank={overdue:0,today:1,soon:2,upcoming:3};
      return (rank[a.status]??9)-(rank[b.status]??9)||(a.date||'9999').localeCompare(b.date||'9999');
    });
  }

  function ensureInboxModal(){
    let m=document.getElementById('pe-inbox-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-inbox-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>📥 統一 Inbox</h3>
      <p class="pe-note">將未完成待辦、deadline 同功課追收集中處理。可按工作範圍、班別或類型篩選。</p>
      <div class="pe-inbox-toolbar">
        <select id="pe-inbox-scope"><option value="">全部範圍</option><option value="personal">個人</option><option value="class">班別</option><option value="grade">年級</option><option value="subject">科組</option><option value="school">全校</option><option value="other">其他</option></select>
        <select id="pe-inbox-class"><option value="">全部班別</option></select>
        <select id="pe-inbox-type"><option value="">全部類型</option><option value="pending">待辦／Deadline</option><option value="submission">功課追收</option></select>
      </div>
      <div id="pe-inbox-summary" class="pe-note"></div>
      <div id="pe-inbox-list" class="pe-inbox-list"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-inbox-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-inbox-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-inbox-scope').addEventListener('change',renderInbox);
    m.querySelector('#pe-inbox-type').addEventListener('change',renderInbox);
    return m;
  }

  function renderInbox(){
    const m=ensureInboxModal(),all=unifiedInboxRows();
    const scope=m.querySelector('#pe-inbox-scope').value;
    const sel=m.querySelector('#pe-inbox-class');
    const classes=[...new Set(all.filter(x=>x.scopeType==='class').map(x=>normalizeClassId(x.className||x.scopeName)).filter(Boolean))].sort();

    const previous=sel.dataset.lastClass||getActiveClass()||'';
    sel.innerHTML='<option value="">全部班別</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    sel.disabled=scope!=='class';

    if(scope==='class'){
      const desired=normalizeClassId(previous);
      if(classes.includes(desired))sel.value=desired;
    }else{
      sel.value='';
    }

    const cls=sel.value,type=m.querySelector('#pe-inbox-type').value;
    const rows=all.filter(x=>{
      if(scope && x.scopeType!==scope)return false;
      if(scope==='class' && cls && normalizeClassId(x.className)!==cls)return false;
      if(type && x.type!==type)return false;
      return true;
    });

    const overdue=rows.filter(x=>x.status==='overdue').length;
    const today=rows.filter(x=>x.status==='today').length;
    m.querySelector('#pe-inbox-summary').innerHTML=`共 <b>${rows.length}</b> 項・逾期 <b>${overdue}</b>・今日 <b>${today}</b>`;

    m.querySelector('#pe-inbox-list').innerHTML=rows.length?rows.map(x=>`
      <div class="pe-inbox-item ${x.status}">
        <div class="pe-inbox-top"><b>${esc(x.kind)}｜${esc(x.title)}</b><small>${x.date?fmt(x.date):'未設日期'}</small></div>
        <div class="pe-inbox-meta"><span class="pe-scope-tag ${esc(x.scopeType||'personal')}">${esc(x.scopeName||scopeLabel(x.scopeType))}</span> ${esc(x.meta||'')}</div>
        <div class="pe-inbox-actions">
          <button type="button" data-inbox-open="${esc(x.type)}" data-inbox-id="${esc(x.id||'')}">開啟來源</button>
          ${x.type==='pending'?`<button type="button" data-inbox-done="${esc(x.id||'')}">✓ 完成</button>`:''}
        </div>
      </div>`).join(''):'<div class="pe-note">目前冇符合條件嘅未完成工作。</div>';

    sel.onchange=()=>{
      sel.dataset.lastClass=sel.value;
      if(sel.value)setActiveClass(sel.value);
      renderInbox();
    };

    m.querySelectorAll('[data-inbox-open]').forEach(btn=>btn.addEventListener('click',()=>{
      const type=btn.dataset.inboxOpen,id=btn.dataset.inboxId;
      closeModal(m);
      if(type==='submission')window.__submissionTrackerAPI?.openRecord?.(id);
      else if(type==='pending')openPendingEdit(id);
    }));
    m.querySelectorAll('[data-inbox-done]').forEach(btn=>btn.addEventListener('click',async()=>{
      await togglePendingComplete(btn.dataset.inboxDone);
      renderInbox();
    }));
  }

  function openInbox(){
    const m=ensureInboxModal();
    m.classList.add('open');
    renderInbox();
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


  function openPendingPrefill(title='',date='',note='',meta={}){
    const m=ensurePendingModal();
    document.getElementById('pe-pending-date').value=date||hkToday();
    document.getElementById('pe-pending-title').value=title;
    document.getElementById('pe-pending-note').value=note;
    document.getElementById('pe-pending-repeat').value='none';
    document.getElementById('pe-pending-remind').value='1';
    m.dataset.prefillMeta=JSON.stringify(meta||{});
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
      completed:false,completedAt:'',
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    try{document.getElementById('pe-pending-modal').dataset.prefillMeta=''}catch{}
    state.pendingItems.unshift(rec);saveLocalPending();renderPendingList();renderDashboard();

    if(state.firebaseReady&&navigator.onLine){
      setSync('syncing');
      try{await pendingCollection().doc(rec.id).set(rec);savePendingQueue(loadPendingQueue().filter(x=>x.id!==rec.id));updateSyncDisplay()}
      catch{queuePendingOp({op:'set',id:rec.id,data:rec})}
    }else queuePendingOp({op:'set',id:rec.id,data:rec});
  }

  async function syncPendingSet(rec){
    if(state.firebaseReady&&navigator.onLine){
      setSync('syncing');
      try{
        await pendingCollection().doc(rec.id).set(rec,{merge:true});
        savePendingQueue(loadPendingQueue().filter(x=>x.id!==rec.id));
        updateSyncDisplay();
      }catch{queuePendingOp({op:'set',id:rec.id,data:rec})}
    }else queuePendingOp({op:'set',id:rec.id,data:rec});
  }

  async function togglePendingComplete(id){
    const item=state.pendingItems.find(x=>x.id===id);if(!item)return;
    const now=new Date().toISOString();

    if(!item.completed && item.repeat && item.repeat!=='none'){
      const history={...item,id:`${item.id}_done_${Date.now()}`,completed:true,completedAt:now,updatedAt:now,occurrenceOf:item.id,repeat:'none'};
      item.dueDate=nextRepeatDate(item.dueDate,item.repeat);
      item.completed=false;item.completedAt='';item.updatedAt=now;
      state.pendingItems.unshift(history);
      saveLocalPending();renderPendingList();renderDashboard();
      await syncPendingSet(history);
      await syncPendingSet(item);
      return;
    }

    item.completed=!item.completed;item.completedAt=item.completed?now:'';item.updatedAt=now;
    saveLocalPending();renderPendingList();renderDashboard();
    await syncPendingSet(item);
  }

  async function deletePendingItem(id,skipConfirm=false){
    const item=state.pendingItems.find(x=>x.id===id);
    if(!item)return;
    if(!skipConfirm && !confirm(`確定要刪除「${item.title||'這項待辦'}」？\n刪除後月曆及 Deadline 提醒都會同步移除。`))return;

    state.pendingItems=state.pendingItems.filter(x=>x.id!==id);
    saveLocalPending();
    renderPendingList();
    renderDashboard();

    if(state.firebaseReady&&navigator.onLine){
      setSync('syncing');
      try{
        await pendingCollection().doc(id).delete();
        savePendingQueue(loadPendingQueue().filter(x=>x.id!==id));
        updateSyncDisplay();
      }catch{
        queuePendingOp({op:'delete',id});
      }
    }else queuePendingOp({op:'delete',id});
  }

  function renderPendingList(){
    const out=document.getElementById('pe-pending-list');if(!out)return;
    const mode=document.getElementById('pe-pending-filter')?.value||'open';
    const q=(document.getElementById('pe-pending-search')?.value||'').trim().toLowerCase();
    let arr=state.pendingItems.filter(x=>{
      if(mode==='open'&&x.completed)return false;
      if(mode==='done'&&!x.completed)return false;
      return !q||`${x.title||''} ${x.note||''} ${pendingScopeText(x)}`.toLowerCase().includes(q);
    }).sort((a,b)=>a.completed!==b.completed?(a.completed?1:-1):(a.dueDate||'').localeCompare(b.dueDate||''));

    const open=state.pendingItems.filter(x=>!x.completed);
    const today=open.filter(x=>pendingStatus(x)==='today').length;
    const overdue=open.filter(x=>pendingStatus(x)==='overdue').length;
    out.innerHTML=`<div class="pe-pending-summary"><span class="pe-pending-badge">未完成 ${open.length}</span><span class="pe-pending-badge today">今日到期 ${today}</span><span class="pe-pending-badge overdue">已逾期 ${overdue}</span></div>`+
      (arr.length?arr.map(x=>{const st=pendingStatus(x);return `<div class="pe-pending-item ${st}"><div class="pe-pending-title">${x.completed?'✓ ':''}${esc(x.title)}</div><div class="pe-pending-meta"><span class="pe-scope-tag ${normalizedPendingScope(x).type}">${esc(pendingScopeText(x))}</span> Deadline：${fmt(x.dueDate)}｜優先：${pendingPriorityLabel(x.priority)}｜${repeatLabel(x.repeat||'none')}｜提醒：${Number(x.remindDays??0)}日前${pendingReminderText(x)?`<br><span class="pe-reminder-soon">${pendingReminderText(x)}</span>`:''}${x.note?`<br>${esc(x.note)}`:''}</div><div class="pe-pending-actions"><button class="${x.completed?'':'primary'}" data-pending-toggle="${esc(x.id)}">${x.completed?'設為未完成':'✓ 完成'}</button><button data-pending-delete="${esc(x.id)}">刪除</button></div></div>`}).join(''):'<div class="pe-note">暫時未有符合條件的待處理事項。</div>');
    out.querySelectorAll('[data-pending-toggle]').forEach(b=>b.addEventListener('click',()=>togglePendingComplete(b.dataset.pendingToggle)));
    out.querySelectorAll('[data-pending-delete]').forEach(b=>b.addEventListener('click',()=>deletePendingItem(b.dataset.pendingDelete)));
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
      await deletePendingItem(id,true);
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
      updatedAt:new Date().toISOString()
    });
    saveLocalPending();renderPendingList();renderDashboard();closeModal(m);
    await syncPendingSet(rec);
  }

  async function delayPendingEdit(days){
    const m=document.getElementById('pe-pending-edit-modal'),id=m?.dataset.editId;
    const rec=state.pendingItems.find(x=>x.id===id);if(!rec)return;
    const base=document.getElementById('pe-edit-pending-date').value||rec.dueDate;
    const next=addDateDays(base,days);
    document.getElementById('pe-edit-pending-date').value=next;
    rec.dueDate=next;rec.updatedAt=new Date().toISOString();
    saveLocalPending();renderPendingList();renderDashboard();
    await syncPendingSet(rec);
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
    modal.innerHTML=`<div class="pe-dialog"><h3>📊 活動紀錄統計</h3><p class="pe-note">按類別檢視出現次數、日期，亦可匯出 CSV 或列印／另存 PDF。</p><div class="pe-stat-toolbar"><select id="pe-stat-range"><option value="year">全學年</option><option value="term1">上學期</option><option value="term2">下學期</option><option value="month">本月</option></select><select id="pe-stat-category"><option value="">全部類型</option></select><input id="pe-stat-search" placeholder="搜尋類別／活動名稱"><div class="pe-stat-actions"><button id="pe-export-csv" title="匯出 CSV">CSV</button><button id="pe-print-stats" title="列印／儲存 PDF">PDF</button></div></div><div id="pe-stat-content"></div><div class="pe-actions"><button class="pe-btn" id="pe-manage-categories">管理活動類型</button><button class="pe-btn" id="pe-stat-close">關閉</button></div></div>`;
    document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal)});modal.querySelector('#pe-stat-close').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-manage-categories').addEventListener('click',openCategoryManager);modal.querySelector('#pe-stat-range').addEventListener('change',()=>{refreshStatsCategoryOptions();renderStats()});modal.querySelector('#pe-stat-category').addEventListener('change',renderStats);modal.querySelector('#pe-stat-search').addEventListener('input',renderStats);modal.querySelector('#pe-export-csv').addEventListener('click',exportActivitiesCsv);modal.querySelector('#pe-print-stats').addEventListener('click',printActivityStats);return modal;
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
  function renderStats(){const out=document.getElementById('pe-stat-content');if(!out)return;const items=filteredActivities(),groups={};items.forEach(a=>(groups[(a.category||'未分類').trim()||'未分類']||=[]).push(a));const entries=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],'zh-HK'));out.innerHTML=entries.length?entries.map(([cat,arr])=>`<details class="pe-stat-group" open><summary><span>${esc(cat)}</span><span>${arr.length} 次</span></summary><div class="pe-stat-list">${arr.sort((a,b)=>a.date.localeCompare(b.date)).map(a=>`<div class="pe-stat-item"><b>${fmt(a.date)}</b><small><strong>${esc(a.title||'')}</strong>${a.note?`<br>${esc(a.note)}`:''}</small><span class="pe-stat-row-actions"><button data-edit-activity="${esc(a.id||'')}">修改</button><button data-delete-activity="${esc(a.id||'')}">刪除</button></span></div>`).join('')}</div></details>`).join(''):'<div class="pe-note">這個範圍暫時未有活動紀錄。</div>';out.querySelectorAll('[data-edit-activity]').forEach(b=>b.addEventListener('click',()=>openActivityEdit(b.dataset.editActivity)));out.querySelectorAll('[data-delete-activity]').forEach(b=>b.addEventListener('click',()=>deleteActivity(b.dataset.deleteActivity)))}
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

  function submissionStatusForHomework(row){
    const record=matchingSubmission(row);
    if(!record)return {type:'none',label:'未追收',record:null};
    const missing=Array.isArray(record.missing)?record.missing:[];
    return missing.length
      ? {type:'open',label:'追收中',record}
      : {type:'done',label:'已交齊',record};
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


  function lessonWorkflowData(date,periodIndex){
    const p=plannerState(),lesson=timetableLessonForHomework(date,periodIndex);
    const className=classFromTimetableLesson(lesson)||'未分類';
    const progress=String(p.lessonNotes?.[`${date}-${periodIndex}-p`]||'').trim();
    const homework=String(p.lessonNotes?.[`${date}-${periodIndex}-h`]||'').trim();

    const prev=[];
    for(const [key,val] of Object.entries(p.lessonNotes||{})){
      const m=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-p$/);
      if(!m||!val||m[1]>=date)continue;
      const pi=Number(m[2]);
      const l=timetableLessonForHomework(m[1],pi);
      if(classFromTimetableLesson(l)!==className)continue;
      prev.push({date:m[1],period:pi+1,text:String(val)});
    }
    prev.sort((a,b)=>b.date.localeCompare(a.date)||b.period-a.period);

    const classId=classIdForName(className);
    const lessonId=`${date}-p${periodIndex+1}-${normalizeClassId(className)||'unknown'}`;
    const homeworkId=homework?`${lessonId}-hw`:'';
    const hwRow={date,period:periodIndex+1,periodIndex,className,subject:lesson,text:homework,lessonId,homeworkId,classId};
    const tracking=homework?submissionStatusForHomework(hwRow):{type:'none',label:'未追收',record:null};

    return {date,periodIndex,period:periodIndex+1,lesson,className,classId,lessonId,homeworkId,progress,homework,previous:prev[0]||null,tracking};
  }

  function ensureWorkflowModal(){
    let m=document.getElementById('pe-workflow-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-workflow-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🧭 課堂工作流</h3>
      <p class="pe-note">以「一堂課」為中心，集中睇上次進度、今堂紀錄、功課及追收。</p>
      <div class="pe-workflow-head">
        <div class="pe-field"><label>日期</label><input id="pe-workflow-date" type="date"></div>
        <div class="pe-field"><label>班別</label><input id="pe-workflow-class" disabled></div>
      </div>
      <div id="pe-workflow-periods" class="pe-workflow-periods"></div>
      <div id="pe-workflow-content"></div>
      <div class="pe-actions"><button class="pe-btn" id="pe-workflow-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.dataset.period='0';
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-workflow-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-workflow-date').addEventListener('change',renderWorkflow);
    return m;
  }

  function renderWorkflow(){
    const m=ensureWorkflowModal(),date=m.querySelector('#pe-workflow-date').value||hkToday();
    let periodIndex=Number(m.dataset.period||0);

    const buttons=[];
    for(let i=0;i<9;i++){
      const lesson=timetableLessonForHomework(date,i);
      if(!lesson)continue;
      buttons.push({i,lesson});
    }
    if(!buttons.some(x=>x.i===periodIndex) && buttons[0])periodIndex=buttons[0].i;
    m.dataset.period=String(periodIndex);

    const periods=m.querySelector('#pe-workflow-periods');
    periods.innerHTML=buttons.length?buttons.map(x=>`
      <button type="button" data-workflow-period="${x.i}" class="${x.i===periodIndex?'active':''}">
        第${x.i+1}節<br><small>${esc(x.lesson)}</small>
      </button>`).join(''):'<div class="pe-note">呢日冇可識別課堂。</div>';

    periods.querySelectorAll('[data-workflow-period]').forEach(btn=>btn.addEventListener('click',()=>{
      m.dataset.period=btn.dataset.workflowPeriod;
      renderWorkflow();
    }));

    const d=lessonWorkflowData(date,periodIndex);
    m.querySelector('#pe-workflow-class').value=d.className;
    if(d.className&&d.className!=='未分類')setActiveClass(d.className);

    const content=m.querySelector('#pe-workflow-content');
    content.innerHTML=`
      <div class="pe-workflow-card">
        <h4>${esc(d.lesson||`第${d.period}節`)}</h4>
        <div class="pe-workflow-block"><b>↩ 上次進度</b><br>${d.previous?`${fmt(d.previous.date)}・${esc(d.previous.text)}`:'未有上一筆同班進度'}</div>
        <div class="pe-workflow-block"><b>📝 今堂進度</b><br>${d.progress?esc(d.progress):'尚未填寫'}</div>
        <div class="pe-workflow-block"><b>📚 功課</b><br>${d.homework?esc(d.homework):'尚未填寫'}${d.homework?`<br><span class="pe-homework-status ${d.tracking.type}">追收：${d.tracking.label}</span>`:''}</div>
        <div class="pe-workflow-actions">
          <button type="button" class="primary" id="pe-workflow-journal">前往日誌</button>
          <button type="button" id="pe-workflow-track" ${d.homework?'':'disabled'}>${d.tracking.record?'查看追收':'建立／查看追收'}</button>
          <button type="button" id="pe-workflow-todo">＋ 加待辦</button>
        </div>
      </div>`;

    content.querySelector('#pe-workflow-journal')?.addEventListener('click',()=>{
      closeModal(m);
      jumpToJournalSource({route:'journal',date,periodIndex,noteType:'p'});
    });

    content.querySelector('#pe-workflow-track')?.addEventListener('click',()=>{
      if(d.tracking.record){
        closeModal(m);
        window.__submissionTrackerAPI?.openRecord?.(d.tracking.record.id);
      }else{
        closeModal(m);
        jumpToJournalSource({route:'journal',date,periodIndex,noteType:'h'});
      }
    });

    content.querySelector('#pe-workflow-todo')?.addEventListener('click',()=>{
      closeModal(m);
      openPendingPrefill(
        `跟進 ${d.className} 第${d.period}節`,
        date,
        `${d.lesson}${d.homework?`｜功課：${d.homework}`:''}`,
        {
          scopeType:'class',
          scopeName:d.className,
          scopeId:d.classId,
          classId:d.classId,
          className:d.className,
          lessonId:d.lessonId,
          homeworkId:d.homeworkId,
          sourceType:'lessonWorkflow'
        }
      );
    });
  }

  function openWorkflow(date=hkToday(),periodIndex=0){
    const m=ensureWorkflowModal();
    m.querySelector('#pe-workflow-date').value=date;
    m.dataset.period=String(periodIndex);
    m.classList.add('open');
    renderWorkflow();
  }

  function ensureHomeworkHistoryModal(){
    let m=document.getElementById('pe-homework-history-modal');
    if(m)return m;
    m=document.createElement('div');m.id='pe-homework-history-modal';m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>📚 功課紀錄</h3>
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



  function ensureClassCoreModal(){
    let m=document.getElementById('pe-class-core-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='pe-class-core-modal';
    m.className='pe-modal';
    m.innerHTML=`<div class="pe-dialog">
      <h3>🏫 班別／學生中心</h3>
      <p class="pe-note">呢份學生資料會成為之後座位表、積分、追收及學生紀錄的共用核心。學生名單每行一位。</p>
      <div class="pe-class-core-grid">
        <div>
          <div class="pe-class-core-list" id="pe-class-core-list"></div>
          <div class="pe-actions" style="justify-content:stretch">
            <button class="pe-btn primary" id="pe-class-core-add" style="width:100%">＋ 新增班別</button>
          </div>
        </div>
        <div class="pe-class-core-editor">
          <div class="pe-grid">
            <div class="pe-field"><label>班別</label><input id="pe-class-core-name" placeholder="例如：3C"></div>
            <div class="pe-field"><label>學生人數</label><input id="pe-class-core-count" disabled></div>
            <div class="pe-field pe-full"><label>學生名單（每行一位）</label><textarea id="pe-class-core-students" placeholder="陳大文&#10;李小明&#10;張美玲"></textarea></div>
          </div>
          <div class="pe-actions">
            <button class="pe-btn danger" id="pe-class-core-delete">刪除班別</button>
            <button class="pe-btn primary" id="pe-class-core-save">儲存</button>
          </div>
        </div>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-class-core-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-class-core-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-class-core-add').addEventListener('click',()=>{
      m.dataset.classId='';
      m.querySelector('#pe-class-core-name').value='';
      m.querySelector('#pe-class-core-students').value='';
      m.querySelector('#pe-class-core-count').value='0';
      m.querySelector('#pe-class-core-name').focus();
      renderClassCoreList();
    });
    m.querySelector('#pe-class-core-students').addEventListener('input',()=>{
      m.querySelector('#pe-class-core-count').value=parseStudentLines(m.querySelector('#pe-class-core-students').value).length;
    });
    m.querySelector('#pe-class-core-save').addEventListener('click',saveClassCoreEditor);
    m.querySelector('#pe-class-core-delete').addEventListener('click',async()=>{
      const id=m.dataset.classId;
      if(!id)return;
      const rec=state.classCore.find(x=>x.id===id);
      if(!rec)return;
      if(!confirm(`確定刪除班別「${rec.name}」？\n學生核心資料會被刪除，但現有功課／追收紀錄不會刪除。`))return;
      await deleteClassProfile(id);
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
  }

  function renderClassCoreEditor(){
    const m=ensureClassCoreModal();
    const rec=state.classCore.find(x=>x.id===m.dataset.classId);
    m.querySelector('#pe-class-core-name').value=rec?.name||'';
    m.querySelector('#pe-class-core-students').value=(rec?.students||[]).join('\n');
    m.querySelector('#pe-class-core-count').value=(rec?.students||[]).length;
    m.querySelector('#pe-class-core-delete').style.display=rec?'':'none';
  }

  async function saveClassCoreEditor(){
    const m=ensureClassCoreModal();
    const name=normalizeClassId(m.querySelector('#pe-class-core-name').value);
    const students=parseStudentLines(m.querySelector('#pe-class-core-students').value);
    if(!name)return alert('請輸入班別。');

    let rec=state.classCore.find(x=>x.id===m.dataset.classId);
    if(!rec){
      const existing=state.classCore.find(x=>normalizeClassId(x.name)===name);
      if(existing)rec=existing;
    }
    if(!rec){
      rec={id:`class_${name.toLowerCase().replace(/[^a-z0-9]/g,'_')}_${Date.now().toString(36)}`,createdAt:new Date().toISOString()};
      state.classCore.push(rec);
    }
    Object.assign(rec,{name,students,updatedAt:new Date().toISOString()});
    m.dataset.classId=rec.id;
    setActiveClass(name);
    await syncClassProfile(rec);
    renderClassCoreList();
    renderClassCoreEditor();
    renderClassOverview();
  }

  function openClassCore(){
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
      <h3>🧰 教師工作台 v2</h3>
      <p class="pe-note">由「班別／學生」做核心，將課堂、功課、追收同待辦串成同一個工作流。</p>
      <div class="pe-kpi-row" id="pe-v2-kpis"></div>
      <div class="pe-class-overview-grid">
        <button class="pe-class-card" type="button" id="pe-v2-class"><h4>🏫 班別／學生中心</h4><div class="pe-note">管理共用班別及學生名單；座位表／積分會沿用。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-flow"><h4>🧭 課堂工作流</h4><div class="pe-note">一堂課集中睇上次進度、今堂功課及追收。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-inbox"><h4>📥 統一 Inbox</h4><div class="pe-note">待辦、deadline、追收集中處理。</div></button>
        <button class="pe-class-card" type="button" id="pe-v2-overview"><h4>📊 班別總覽</h4><div class="pe-note">沿用現有班別總覽，快速回顧功課及進度。</div></button>
      </div>
      <div class="pe-actions"><button class="pe-btn" id="pe-v2-close">關閉</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeModal(m)});
    m.querySelector('#pe-v2-close').addEventListener('click',()=>closeModal(m));
    m.querySelector('#pe-v2-class').addEventListener('click',()=>{closeModal(m);openClassCore()});
    m.querySelector('#pe-v2-flow').addEventListener('click',()=>{closeModal(m);openWorkflow()});
    m.querySelector('#pe-v2-inbox').addEventListener('click',()=>{closeModal(m);openInbox()});
    m.querySelector('#pe-v2-overview').addEventListener('click',()=>{closeModal(m);openClassOverview()});
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

  function ensureMobileMore(){
    let sheet=document.getElementById('pe-mobile-more');
    if(sheet)return sheet;
    sheet=document.createElement('div');sheet.id='pe-mobile-more';sheet.className='pe-mobile-more';
    sheet.innerHTML=`
      <div class="pe-more-group"><b>工作台</b>
        <button id="pe-more-workspace">🧰 教師工作台 v2</button>
        <button id="pe-more-workflow">🧭 課堂流程</button>
        <button id="pe-more-inbox">📥 統一 Inbox</button>
        <button id="pe-more-dashboard">☀ 今日工作台</button>
        <button id="pe-more-done">✅ 今日完成</button>
        <button id="pe-more-pending">⏳ 待處理事項</button>
      </div>
      <div class="pe-more-group"><b>記錄</b>
        <button id="pe-more-homework">📚 功課紀錄</button>
        <button id="pe-more-class-core">👥 班別／學生</button>
        <button id="pe-more-class-overview">🏫 班別總覽</button>
        <button id="pe-more-submission">📋 作業／回條</button>
        <button id="pe-more-activity">＋ 活動紀錄</button>
        <button id="pe-more-stats">📊 活動統計</button>
      </div>
      <div class="pe-more-group"><b>工具</b>
        <button id="pe-more-search">🔎 全站搜尋</button>
        <button id="pe-more-tags">🏷 月曆標籤</button>
        <button id="pe-more-categories">🏷 類型管理</button>
      </div>`;
    document.body.appendChild(sheet);
    sheet.querySelector('#pe-more-workspace').addEventListener('click',()=>{closeMobileMore();openWorkspace()});
    sheet.querySelector('#pe-more-workflow').addEventListener('click',()=>{closeMobileMore();openWorkflow()});
    sheet.querySelector('#pe-more-inbox').addEventListener('click',()=>{closeMobileMore();openInbox()});
    sheet.querySelector('#pe-more-class-core').addEventListener('click',()=>{closeMobileMore();openClassCore()});
    sheet.querySelector('#pe-more-dashboard').addEventListener('click',()=>{
      closeMobileMore();
      const panel=ensureDashboard();
      panel.classList.add('open');
      renderDashboard();
    });
    sheet.querySelector('#pe-more-done').addEventListener('click',()=>{closeMobileMore();openDoneCheck()});
    sheet.querySelector('#pe-more-pending').addEventListener('click',()=>{closeMobileMore();openPendingModal()});
    sheet.querySelector('#pe-more-homework').addEventListener('click',()=>{closeMobileMore();openHomeworkHistory()});
    sheet.querySelector('#pe-more-class-overview').addEventListener('click',()=>{closeMobileMore();openClassOverview()});
    sheet.querySelector('#pe-more-categories').addEventListener('click',()=>{closeMobileMore();openCategoryManager()});
    sheet.querySelector('#pe-more-tags').addEventListener('click',()=>{closeMobileMore();openTagVisibilityModal()});
    sheet.querySelector('#pe-more-search').addEventListener('click',()=>{closeMobileMore();openJournalSearch()});
    sheet.querySelector('#pe-more-stats').addEventListener('click',()=>{closeMobileMore();openStatsModal()});
    sheet.querySelector('#pe-more-activity').addEventListener('click',()=>{closeMobileMore();openActivityModal(hkToday())});
    sheet.querySelector('#pe-more-submission').addEventListener('click',()=>{
      closeMobileMore();
      document.querySelector('.submission-launcher')?.click();
    });
    return sheet;
  }


  function ensureIpadRail(){
    let rail=document.getElementById('pe-ipad-rail');if(rail)return rail;
    rail=document.createElement('nav');rail.id='pe-ipad-rail';rail.className='pe-ipad-rail';rail.innerHTML=`<button data-ipad="today"><span class="ico">☀</span>今日</button><button data-ipad="journal"><span class="ico">📝</span>日誌</button><button data-ipad="calendar"><span class="ico">📅</span>月曆</button><button data-ipad="more"><span class="ico">•••</span>更多</button>`;document.body.appendChild(rail);
    rail.querySelector('[data-ipad="today"]').addEventListener('click',()=>clickMainTab(['今日課表','當日課表','今日']));
    rail.querySelector('[data-ipad="journal"]').addEventListener('click',()=>clickMainTab(['教學日誌','日誌']));
    rail.querySelector('[data-ipad="calendar"]').addEventListener('click',()=>clickMainTab(['月曆','月历']));
    rail.querySelector('[data-ipad="more"]').addEventListener('click',()=>ensureMobileMore().classList.toggle('open'));
    return rail;
  }
  function updateIpadRailActive(){const rail=ensureIpadRail();rail.querySelectorAll('button').forEach(b=>b.classList.remove('active'));if(isVisible(document.querySelector('.today-board')))rail.querySelector('[data-ipad="today"]')?.classList.add('active');else if(isVisible(document.querySelector('.journal-table')))rail.querySelector('[data-ipad="journal"]')?.classList.add('active');else if(isVisible(document.querySelector('.calendar-grid')))rail.querySelector('[data-ipad="calendar"]')?.classList.add('active')}

  function ensureDesktopMoreToggle(){
    let btn=document.getElementById('pe-desktop-more-toggle');
    if(btn)return btn;
    btn=document.createElement('button');
    btn.type='button';
    btn.id='pe-desktop-more-toggle';
    btn.className='pe-desktop-more-toggle';
    btn.textContent='••• 更多';
    btn.addEventListener('click',()=>ensureMobileMore().classList.toggle('open'));
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
    nav.querySelector('[data-mobile-nav="submission"]').addEventListener('click',()=>{closeMobileMore();document.querySelector('.submission-launcher')?.click()});
    nav.querySelector('[data-mobile-nav="more"]').addEventListener('click',()=>ensureMobileMore().classList.toggle('open'));

    document.addEventListener('click',e=>{
      const more=document.getElementById('pe-mobile-more');
      if(!more?.classList.contains('open'))return;
      if(e.target.closest('#pe-mobile-more')||e.target.closest('[data-mobile-nav="more"]'))return;
      closeMobileMore();
    });
    return nav;
  }

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
    const w=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    const mobile=ensureMobileNav();
    const ipad=ensureIpadRail();
    const desktop=ensureDesktopMoreToggle();

    // Inline !important intentionally overrides all historical CSS collisions.
    if(w<=700){
      mobile.style.setProperty('display','grid','important');
      ipad.style.setProperty('display','none','important');
      desktop.style.setProperty('display','none','important');
      document.body.style.setProperty('padding-bottom','70px','important');
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

    // Safety: keep the active nav above the app even if another stylesheet changes stacking.
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

  async function start(){
    addCss();
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
