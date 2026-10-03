香港教師教學日誌 v2.3.0 — 座位／積分整合 Phase 1

基線：v2.2.8 + seat_score_v59_integration_ready_compact

已整合：
- More → 班級 → 座位／積分
- 班級中心新增「座位／積分」tab
- 教師工作台新增座位／積分入口
- 座位系統以全頁 iframe 模組方式開啟，避免干擾主 React UI

資料整合：
- 主系統 classCore v2 為班級／學生 source of truth
- classId 直接成為座位系統班級 key
- studentId 直接成為座位系統學生 id
- 第一次同步會按舊 id／姓名／班號配對舊座位學生
- 舊 student id → stable studentId 時，會同步搬移：
  - 待辦 studentId
  - 家校聯絡 studentId
  - 學生私人備註
  - 不可同組配對
  - 出席紀錄 presentIds / absentIds
  - 歷史紀錄 payload 內學生 id

保留：
- 座位／移動／互換
- 積分
- 出席
- 學生 Profile
- 家校聯絡
- 課堂事件（只紀錄，不直接加減分）
- 座位模組原本 localStorage 歷史資料

目前 Phase 1 未做：
- 主系統追收直接寫入學生 Profile timeline
- 座位模組 todo 與主系統 Pending 完全雙向同步
- 座位／積分資料搬入 Firestore

Service Worker cache：v230
