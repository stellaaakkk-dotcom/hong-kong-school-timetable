香港教師教學日誌 v1.8.3

功課紀錄修正：真正 1:1 跟主日誌畫面。

核心改動：
- 主日誌新增 window.__HK_GET_JOURNAL_LESSON(date, periodIndex)
- 呢個 resolver 直接使用主日誌本身 F3() 同一套資料／函式：
  Sw / D / R / b3 / ya / M1 / S3
- 功課紀錄不再自己重建 A/B、單雙週、第9節邏輯。
- lessonNotes key 本身是 0-based：
  YYYY-MM-DD-0-h = 第1節
  ...
  YYYY-MM-DD-8-h = 第9節
- 查課堂時保留原始 periodIndex，顯示時才 +1。

未分類處理：
- 先從真正日誌課堂抽班別。
- 再 fallback 追收紀錄／文字。
- 真係無法對應的舊資料，放入：
  「⚠ 無法對應舊紀錄」
  預設收起，不再混入正常班別清單。

其他 v1.8.2 功能全部保留。

部署請覆蓋：
index.html
firebase-bootstrap.js
planner-enhancements.js
submission-module.js
sw.js

Service Worker cache：v83
