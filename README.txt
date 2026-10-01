香港教師教學日誌 v1.5.2 — 月曆活動標籤修正版

修正：
- v1.5.1 只用 document.querySelector('.calendar-grid')，有機會攞到隱藏／列印用月曆。
- v1.5.2 會從所有 .calendar-grid 中選取「目前真正可見」的一個。
- 月份優先直接讀畫面上的「選擇月份」input，不再只依賴 localStorage。
- 活動紀錄標籤位置改為月曆格內較下方位置，避開日期及循環週標示。
- 標籤加深少少，方便確認是否成功顯示。
- 同一日最多顯示 2 項，其餘以「＋N」顯示。

流程：
＋活動紀錄 → Firestore / 本機 → 月曆當日標籤 → 今日工作台 → 活動統計

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
