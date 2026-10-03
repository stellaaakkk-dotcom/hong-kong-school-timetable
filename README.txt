香港教師教學日誌 v2.3.9 — 班別權威同步 + 強制 cache bust

修正 1：座位表出現主系統沒有的班別（例如 3A）
- 主系統班別清單改為唯一權威來源。
- 每次 syncFromParent：
  - 先同步主系統現有班別
  - 座位模組內不在主系統的舊班別，會移出 active classes
  - 舊資料不直接刪除，而是保留到 manager.archivedClasses（隱藏 archive）
- 因此 class switcher / class manager 不再顯示幽靈班。
- 在整合模式下，座位模組班別管理不再提供新增／改名／刪除，只保留顏色；班別改由主系統管理。

修正 2：v2.3.8 學生格狀 UI 未出現
- v2.3.8 檔案內已包含 4欄／3欄學生 grid，問題較可能來自 PWA / browser 舊資源。
- v2.3.9 改用新實體檔名：
  planner-enhancements-v239.js
  seat-score-integrated-v239.html
- index.html 直接引用新檔名，不只靠 ?v= 查詢參數。
- Service Worker cache bump 至 v239，並將新檔名列為 network-first。
- 班級中心標題顯示 v2.3.9；說明尾亦顯示 UI 2.3.9，方便確認新 UI 已載入。

學生格狀版：
- 闊畫面 4 位／行
- 窄畫面 3 位／行
- 每格：班號 + 姓名 + ＋
- ＋ 直接開 Profile
