香港教師教學日誌 v1.3.3 — 快取修正版

今次主要修正「已上載新版，但網站仍執行舊版 JS」：

1. index.html
   - submission-module.js?v=110
   - planner-enhancements.js?v=133
   用版本參數強制瀏覽器／PWA 當成新檔案下載。

2. sw.js
   - Cache 版本由 v38 → v39
   - planner-enhancements.js / submission-module.js / automate-bridge.js
     改成 network-first（有網絡時優先取最新版）
   - 其他靜態檔仍保留 cache-first
   - 導航仍保留 network-first + offline fallback

3. planner-enhancements.js v1.3.3
   - 保留 v1.3.2 功能：
     • 今日工作台預設收起
     • 「☀ 今日工作台」按鈕
     • 「✕ 收起」
     • 月曆 calendarNotes 自行輸入記事同步到今日活動
     • 備課／預設活動／宗教活動／班主任課／自訂活動／活動紀錄整合

GitHub 今次請覆蓋 4 個檔案：
- index.html
- submission-module.js
- planner-enhancements.js
- sw.js

重要：
今次 sw.js 必須一齊上載，先可以根治之後再食舊版 JS cache 的問題。
