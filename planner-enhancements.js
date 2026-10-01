(() => {
  'use strict';

  const VERSION = '1.5.1';
  const ACTIVITY_LOCAL_KEY = 'hk-school-calendar-activity-logs-v1';
  const ACTIVITY_PENDING_KEY = 'hk-school-calendar-activity-pending-v1';
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

      .pe-context-tools{position:fixed;left:10px;bottom:12px;z-index:2147481400;display:none;gap:6px;flex-wrap:wrap;max-width:calc(100vw - 20px)}.pe-context-tools.show{display:flex}.pe-context-tools button{border:1px solid #d8c2a4;border-radius:999px;background:#fff8db;color:#80542f;padding:8px 10px;font-size:9px;font-weight:800;box-shadow:0 4px 13px #0002}

      .pe-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:#0005;align-items:center;justify-content:center;padding:14px;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif}.pe-modal.open{display:flex}
      .pe-dialog{width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid #e8d9c4;border-radius:16px;background:#fffdf8;color:#4a3428;box-shadow:0 15px 48px #0005;padding:14px}.pe-dialog h3{margin:0 0 5px;color:#80542f;font-size:15px}.pe-note{margin:0 0 10px;color:#857365;font-size:10px;line-height:1.45}.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pe-field label{display:block;margin:0 0 3px;color:#857365;font-size:10px;font-weight:700}.pe-field input,.pe-field select,.pe-field textarea{width:100%;border:1px solid #decdb9;border-radius:8px;background:#fff;color:#4a3428;padding:8px;font:600 11px inherit;box-sizing:border-box}.pe-field textarea{min-height:62px;resize:vertical}.pe-full{grid-column:1/-1}.pe-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}.pe-btn{border:1px solid #d9c2a4;border-radius:8px;background:#fff;color:#80542f;padding:7px 10px;font-size:10px;font-weight:800}.pe-btn.primary{background:#a86f3d;border-color:#a86f3d;color:#fff}.pe-btn.danger{color:#c64545}
      .pe-stat-toolbar{display:grid;grid-template-columns:1fr 1fr auto auto;gap:6px;margin:9px 0}.pe-stat-toolbar select,.pe-stat-toolbar input{width:100%;border:1px solid #decdb9;border-radius:8px;padding:7px;background:#fff;color:#4a3428;font-size:10px}.pe-stat-toolbar button{border:1px solid #d8c2a4;border-radius:8px;background:#fff8db;color:#80542f;padding:7px 8px;font-size:9px;font-weight:800}.pe-stat-group{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px;margin-top:7px}.pe-stat-group summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px;font-size:11px;font-weight:800;color:#80542f}.pe-stat-group summary::-webkit-details-marker{display:none}.pe-stat-list{margin-top:6px;border-top:1px dashed #eadfce;padding-top:5px}.pe-stat-item{display:grid;grid-template-columns:78px 1fr auto;gap:6px;align-items:start;padding:5px 0;border-bottom:1px solid #f1e9dd;font-size:9px}.pe-stat-item:last-child{border-bottom:0}.pe-stat-item b{color:#6d5545}.pe-stat-item small{color:#8b7768;line-height:1.4}.pe-stat-item button{border:0;background:transparent;color:#c64545;font-size:9px;font-weight:800;padding:2px}
      .pe-search-results{margin-top:9px;display:grid;gap:6px}.pe-search-result{border:1px solid #eadfce;border-radius:9px;background:#fff;padding:8px}.pe-search-result .top{display:flex;justify-content:space-between;gap:8px;align-items:center}.pe-search-result b{font-size:10px;color:#80542f}.pe-search-result span{font-size:9px;color:#5f4b3d;line-height:1.45}.pe-search-result small{display:block;margin-top:3px;font-size:8px;color:#998678}.pe-search-hint{font-size:9px;color:#8c7868;line-height:1.5;margin-top:6px}
      
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
        }
      }

@media(max-width:700px){.pe-sync-pill{top:84px;right:8px;bottom:auto}.pe-dashboard-toggle{right:8px;bottom:62px}.pe-dashboard{right:8px;bottom:102px;width:calc(100vw - 16px);max-height:65vh}.pe-context-tools{left:8px;bottom:8px}.pe-grid{grid-template-columns:1fr}.pe-full{grid-column:auto}.pe-stat-toolbar{grid-template-columns:1fr 1fr}.pe-stat-item{grid-template-columns:68px 1fr auto}}
      @media print{.pe-sync-pill,.pe-update-banner,.pe-dashboard-toggle,.pe-dashboard,.pe-context-tools,.pe-modal{display:none!important}}
      .pe-today-done-btn{width:100%;margin-top:7px;border:1px solid #c9a97f;border-radius:9px;background:#fff5d5;color:#80542f;padding:7px 9px;font-size:9px;font-weight:900}
      .pe-done-summary{display:grid;gap:7px;margin-top:8px}
      .pe-done-card{border:1px solid #eadfce;border-radius:10px;background:#fff;padding:8px}
      .pe-done-card.good{background:#f2f8ed;border-color:#c9dabd;color:#587148}
      .pe-done-card.warn{background:#fff4ef;border-color:#ebc7bc;color:#9b4f3d}
      .pe-done-card b{display:block;font-size:11px;margin-bottom:3px}
      .pe-done-card div{font-size:9px;line-height:1.5}
      .submission-launcher{display:none!important}
      .pe-context-tools{display:none!important}
      .pe-desktop-more-toggle{display:none}
      .pe-cal-activity-layer{position:fixed;inset:0;z-index:2147480500;pointer-events:none}
      .pe-cal-activity-chip{position:fixed;max-width:46%;border:1px solid #dfc494;border-radius:6px;background:#fff2c8;color:#7b542f;padding:2px 4px;font-size:7px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px #0001}
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

  function loadActivityPending(){try{const q=JSON.parse(localStorage.getItem(ACTIVITY_PENDING_KEY)||'[]');state.activityPending=Array.isArray(q)?q.length:0;return Array.isArray(q)?q:[]}catch{state.activityPending=0;return[]}}
  function saveActivityPending(q){try{localStorage.setItem(ACTIVITY_PENDING_KEY,JSON.stringify(q));state.activityPending=q.length}catch{}updateSyncDisplay()}
  function queueActivityPending(item){const q=loadActivityPending().filter(x=>x.id!==item.id);q.push(item);saveActivityPending(q)}
  function totalPending(){const sub=window.__submissionTrackerAPI?.getPendingCount?.()||0;return state.activityPending+sub}
  function updateSyncDisplay(){const n=totalPending();if(n>0){const p=ensureSyncPill();p.className='pe-sync-pill off';p.textContent=`⚠ 待同步 ${n}`;return}setSync(navigator.onLine?(state.firebaseReady?'ok':'connecting'):'offline')}
  async function flushActivityPending(){if(!navigator.onLine||!state.firebaseReady)return;let q=loadActivityPending(),remain=[];for(const item of q){try{if(item.op==='delete')await activityCollection().doc(item.id).delete();else await activityCollection().doc(item.id).set(item.data,{merge:true})}catch{remain.push(item)}}saveActivityPending(remain)}

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
    state.user=user; state.firebaseReady=true; loadActivityPending(); setSync('syncing'); await flushActivityPending();
    try{state.unsubSubmissions?.();}catch{} try{state.unsubActivities?.();}catch{}
    state.unsubSubmissions = subCollection().onSnapshot(snap=>{
      state.submissions=snap.docs.map(d=>({id:d.id,...d.data()})); setSync(navigator.onLine?'ok':'offline'); renderDashboard();
    },()=>setSync(navigator.onLine?'connecting':'offline'));
    state.unsubActivities = activityCollection().orderBy('date','desc').onSnapshot(snap=>{
      state.activities=snap.docs.map(d=>({id:d.id,...d.data()})); saveLocalActivities(); setSync(navigator.onLine?'ok':'offline'); renderDashboard(); renderStatsIfOpen(); refreshCategoryList(); renderCalendarActivityOverlay();
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

  function plannerState(){
    try { return JSON.parse(localStorage.getItem(PLANNER_LOCAL_KEY) || '{}') || {}; }
    catch { return {}; }
  }

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
    const active=board.querySelector('.today-item.active-now');
    const activeText=active ? active.textContent.replace(/\s+/g,' ').trim() : '';
    const total=follow.reduce((s,r)=>s+(r.missing?.length||0),0);

    const wasOpen=el.classList.contains('open');
    el.innerHTML=`
      <div class="pe-dash-head">
        <b>☀ 今日工作台</b>
        <div><small>${fmt(hkToday())}</small><button type="button" class="pe-dash-close" id="pe-close-dashboard">✕ 收起</button></div>
      </div>
      <div class="pe-dash-section"><div class="pe-dash-title">而家</div>${activeText?`<div class="pe-dash-row">${esc(activeText)}</div>`:'<div class="pe-dash-empty">目前未偵測到進行中的課節。</div>'}</div>
      <div class="pe-dash-section"><div class="pe-dash-title">📋 今日追收${follow.length?`・${total} 人次`:''}</div>${follow.length?follow.slice(0,5).map(r=>`<div class="pe-dash-row">${esc(r.className||'')}｜${esc(r.name||r.type||'項目')}：${esc((r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、'))}</div>`).join(''):'<div class="pe-dash-empty">今日沒有需要追收。</div>'}</div>
      <div class="pe-dash-section"><div class="pe-dash-title">📅 今日活動</div>${acts.length?acts.slice(0,8).map(a=>`<div class="pe-dash-row">${esc(a.category||'活動')}｜${esc(a.title||'')}</div>`).join(''):'<div class="pe-dash-empty">今日月曆沒有已顯示的活動／記事。</div>'}</div>
      <div class="pe-dash-actions"><button type="button" id="pe-open-sub">查看追收</button><button type="button" class="primary" id="pe-add-today-act">＋今日活動</button></div>
      <button type="button" class="pe-today-done-btn" id="pe-today-done">✅ 今日完成檢查</button>`;

    el.querySelector('#pe-close-dashboard')?.addEventListener('click',()=>el.classList.remove('open'));
    el.querySelector('#pe-open-sub')?.addEventListener('click',()=>document.querySelector('.submission-launcher')?.click());
    el.querySelector('#pe-add-today-act')?.addEventListener('click',()=>openActivityModal(hkToday()));
    el.querySelector('#pe-today-done')?.addEventListener('click',openDoneCheck);

    if(wasOpen) el.classList.add('open');
  }

  function ensureCalendarActivityLayer(){
    let layer=document.getElementById('pe-cal-activity-layer');
    if(!layer){layer=document.createElement('div');layer.id='pe-cal-activity-layer';layer.className='pe-cal-activity-layer';document.body.appendChild(layer)}
    return layer;
  }

  function renderCalendarActivityOverlay(){
    const layer=ensureCalendarActivityLayer();
    const grid=document.querySelector('.calendar-grid');
    if(!grid||!isVisible(grid)){layer.innerHTML='';return}

    const p=plannerState();
    const month=p.month||'';
    if(!/^\d{4}-\d{2}$/.test(month)){layer.innerHTML='';return}

    const cells=[...grid.querySelectorAll('.cal-cell:not(.empty)')];
    const byDate={};
    state.activities.forEach(a=>{if(a.date&&(byDate[a.date]||=[]))byDate[a.date].push(a)});

    const chips=[];
    for(const cell of cells){
      const dayText=cell.querySelector(':scope > b')?.textContent?.trim();
      const day=Number(dayText);
      if(!day)continue;
      const date=`${month}-${String(day).padStart(2,'0')}`;
      const items=byDate[date]||[];
      if(!items.length)continue;
      const r=cell.getBoundingClientRect();
      const visible=items.slice(0,2);
      visible.forEach((a,idx)=>{
        chips.push({
          text:`紀錄｜${a.category||'活動'}：${a.title||''}`,
          left:r.left+Math.max(30,r.width*0.46),
          top:r.top+5+idx*14,
          width:Math.max(55,r.width*0.50),
          more:false
        });
      });
      if(items.length>2){
        chips.push({text:`＋${items.length-2}`,left:r.right-26,top:r.top+33,width:22,more:true});
      }
    }

    layer.innerHTML=chips.map(c=>`<div class="pe-cal-activity-chip${c.more?' more':''}" style="left:${Math.round(c.left)}px;top:${Math.round(c.top)}px;width:${Math.round(c.width)}px">${esc(c.text)}</div>`).join('');
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
    out.innerHTML=`<div class="pe-done-summary">${html}</div>`;
    modal.classList.add('open');
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
  async function deleteActivity(id){const r=state.activities.find(x=>x.id===id);if(!r||!confirm(`刪除「${r.title}」？`))return;state.activities=state.activities.filter(x=>x.id!==id);saveLocalActivities();renderStats();renderDashboard();renderCalendarActivityOverlay();if(state.firebaseReady&&navigator.onLine){setSync('syncing');try{await activityCollection().doc(id).delete();saveActivityPending(loadActivityPending().filter(x=>!(x.op==='delete'&&x.id===id)));updateSyncDisplay()}catch{queueActivityPending({op:'delete',id})}}else queueActivityPending({op:'delete',id})}

  function csvCell(v){return `"${String(v??'').replace(/"/g,'""')}"`}
  function exportActivitiesCsv(){const rows=filteredActivities().sort((a,b)=>a.date.localeCompare(b.date));const csv=['日期,活動類別,活動名稱,備註',...rows.map(a=>[a.date,a.category,a.title,a.note].map(csvCell).join(','))].join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`活動紀錄_${hkToday()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function printActivityStats(){const items=filteredActivities().sort((a,b)=>a.date.localeCompare(b.date));const w=window.open('','_blank');if(!w){alert('瀏覽器阻擋咗列印視窗，請允許彈出視窗後再試。');return}w.document.write(`<!doctype html><meta charset="utf-8"><title>活動紀錄統計</title><style>body{font-family:Arial,"Microsoft JhengHei",sans-serif;padding:24px;color:#333}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:7px;font-size:12px;text-align:left}th{background:#f3eee7}</style><h1>活動紀錄統計</h1><p>匯出日期：${fmt(hkToday())}</p><table><thead><tr><th>日期</th><th>類別</th><th>活動</th><th>備註</th></tr></thead><tbody>${items.map(a=>`<tr><td>${esc(fmt(a.date))}</td><td>${esc(a.category)}</td><td>${esc(a.title)}</td><td>${esc(a.note||'')}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()<\/script>`);w.document.close()}

  function readPlannerData(){try{return JSON.parse(localStorage.getItem(PLANNER_LOCAL_KEY)||'{}')}catch{return{}}}
  function ensureSearchModal(){
    let modal=document.getElementById('pe-search-modal');if(modal)return modal;
    modal=document.createElement('div');modal.id='pe-search-modal';modal.className='pe-modal';
    modal.innerHTML=`<div class="pe-dialog pe-global-search"><h3>🔎 全站搜尋</h3><p class="pe-note">一次搜尋教學日誌／功課、月曆記事、校曆活動、活動紀錄及追收紀錄。</p><div class="pe-grid"><div class="pe-field pe-full"><label>關鍵字</label><input id="pe-global-query" placeholder="例如：作文／家長會／3A／詞語改正"></div></div><div id="pe-search-results" class="pe-search-results"></div><div class="pe-actions"><button class="pe-btn" id="pe-search-close">關閉</button></div></div>`;
    document.body.appendChild(modal);modal.addEventListener('click',ev=>{if(ev.target===modal)closeModal(modal)});modal.querySelector('#pe-search-close').addEventListener('click',()=>closeModal(modal));modal.querySelector('#pe-global-query').addEventListener('input',renderGlobalSearch);return modal;
  }
  function openJournalSearch(){const m=ensureSearchModal();m.classList.add('open');document.getElementById('pe-global-query').focus();renderGlobalSearch()}
  function currentVisibleSubjectMap(){const map={};document.querySelectorAll('.journal-table tbody tr').forEach(row=>{const subject=row.querySelector('.subject-cell')?.textContent?.trim();const ta=row.querySelector('textarea[aria-label*="進度"],textarea[aria-label*="功課"]');const label=ta?.getAttribute('aria-label')||'';const m=label.match(/第(\d+)節/);if(subject&&m)map[Number(m[1])-1]=subject});return map}
  function journalRows(){const data=readPlannerData(),notes=data.lessonNotes||{},subjects=currentVisibleSubjectMap(),rows=[];for(const[key,val]of Object.entries(notes)){if(!val||typeof val!=='string')continue;const m=key.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-(p|h)$/);if(!m)continue;rows.push({kind:m[3]==='p'?'教學進度':'功課',date:m[1],title:`第${Number(m[2])+1}節${subjects[Number(m[2])]?`・${subjects[Number(m[2])]}`:''}`,text:val})}return rows}
  function globalSearchRows(){
    const p=readPlannerData(),rows=[...journalRows()];
    for(const[date,note]of Object.entries(p.calendarNotes||{}))if(String(note||'').trim())rows.push({kind:'月曆記事',date,title:'自行輸入',text:String(note)});
    const deleted=new Set(Array.isArray(p.deletedDefaultEventKeys)?p.deletedDefaultEventKeys:[]),custom=Array.isArray(p.customCalendarEvents)?p.customCalendarEvents:[];
    [...DEFAULT_SCHOOL_EVENTS.filter(x=>!deleted.has(defaultEventKey(x))),...custom].forEach(a=>rows.push({kind:'校曆活動',date:a.start||a.date||'',title:a.title||a.name||'',text:[a.type,a.end].filter(Boolean).join(' ')}));
    state.activities.forEach(a=>rows.push({kind:'活動紀錄',date:a.date||'',title:a.category||'',text:`${a.title||''} ${a.note||''}`}));
    const subs=window.__submissionTrackerAPI?.getRecords?.()||state.submissions||[];
    subs.forEach(r=>rows.push({kind:'追收紀錄',date:r.issueDate||r.dueDate||'',title:`${r.className||''}｜${r.name||''}`,text:`${r.type||''} 欠交 ${(r.missing||[]).map(n=>String(n).padStart(2,'0')).join('、')}`}));
    return rows;
  }
  function renderGlobalSearch(){const out=document.getElementById('pe-search-results');if(!out)return;const q=(document.getElementById('pe-global-query')?.value||'').trim().toLowerCase();if(!q){out.innerHTML='<div class="pe-note">輸入關鍵字開始搜尋。</div>';return}const rows=globalSearchRows().filter(r=>`${r.kind} ${r.date} ${r.title} ${r.text}`.toLowerCase().includes(q)).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,150);out.innerHTML=rows.length?rows.map(r=>`<div class="pe-search-result"><div class="top"><b>${esc(r.title||r.kind)}</b><span>${esc(r.kind)}</span></div><small>${r.date?`${esc(fmt(r.date))}・`:''}${esc(r.text||'')}</small></div>`).join(''):'<div class="pe-note">找不到相符紀錄。</div>'}


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

  function ensureMobileMore(){
    let sheet=document.getElementById('pe-mobile-more');
    if(sheet)return sheet;
    sheet=document.createElement('div');sheet.id='pe-mobile-more';sheet.className='pe-mobile-more';
    sheet.innerHTML=`<button id="pe-more-dashboard">☀ 今日工作台</button><button id="pe-more-done">✅ 今日完成</button><button id="pe-more-search">🔎 全站搜尋</button><button id="pe-more-stats">📊 活動統計</button><button id="pe-more-activity">＋ 活動紀錄</button><button id="pe-more-submission">📋 作業／回條</button>`;
    document.body.appendChild(sheet);
    sheet.querySelector('#pe-more-dashboard').addEventListener('click',()=>{
      closeMobileMore();
      const panel=ensureDashboard();
      panel.classList.add('open');
      renderDashboard();
    });
    sheet.querySelector('#pe-more-done').addEventListener('click',()=>{closeMobileMore();openDoneCheck()});
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
    if(isVisible(document.querySelector('.calendar-grid'))){
      nav.querySelector('[data-mobile-nav="calendar"]')?.classList.add('active');
    }
  }

  function uiTick(){if(document.visibilityState!=='visible')return;renderDashboard();renderContextTools();renderCalendarActivityOverlay();updateMobileNavActive();updateIpadRailActive();updateSyncDisplay()}


  window.addEventListener('resize',()=>renderCalendarActivityOverlay(),{passive:true});
  window.addEventListener('scroll',()=>renderCalendarActivityOverlay(),{passive:true});
  window.addEventListener('submission-pending-changed',()=>updateSyncDisplay());
  window.addEventListener('online',()=>{flushActivityPending();window.__submissionTrackerAPI?.flushPending?.();setTimeout(updateSyncDisplay,300)});
  window.addEventListener('offline',()=>updateSyncDisplay());

  async function start(){
    addCss();ensureSyncPill();installNetworkStatus();ensureDashboard();ensureContextTools();ensureActivityModal();ensureStatsModal();ensureSearchModal();ensureDoneModal();ensureMobileNav();ensureIpadRail();ensureDesktopMoreToggle();ensureMobileMore();ensureCalendarActivityLayer();installPwaUpdatePrompt();await connectData();uiTick();
    setInterval(uiTick,1800);
    console.info(`[planner-enhancements] v${VERSION} ready`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
