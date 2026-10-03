香港教師教學日誌 v2.4.18 — 快取根因修正版

真正原因：
- v2.4.16 / v2.4.17 的輸入框及底部修正主要寫在 index.html。
- PWA / Service Worker 可繼續使用舊 index.html，所以手機看起來完全沒有變化。
- v2.4.14 的總課表縮放會成功，是因為它寫在有新檔名的 planner-enhancements-v2414.js。

今次：
1. 教師／班級 input 修正搬入 planner-enhancements-v2418.js 動態 stylesheet。
   - 不依賴 index.html 新 class。
   - 直接用結構 selector：panel 第一個 section。
   - 手機高度固定 38px。
   - 手機寬約 165–175px；平板約 210px。
2. 底部安全位亦搬入 versioned planner JS。
   - body / workspace / preview-wrap / today-board / planner-page 真正加 padding-bottom。
   - 不再用 body::after。
3. 移除 index.html 內 v2.4.17 重複 responsive style，避免兩套規則互相打架。
4. 總課表 JS 縮放保留。
