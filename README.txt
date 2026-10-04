香港教師教學日誌 v2.6.9 — 清理已撤銷紀錄
更新日期：2026-10-04

今版新增
========
課堂紀錄頁新增「清理已撤銷」功能。

規則
====
- 正常有效紀錄不能用這個功能刪除。
- 只有已標示「已撤銷」的紀錄會被清理。
- 清理前會顯示確認訊息。
- 只刪歷史顯示，不會再改動分數、座位、分組或其他資料。
- 清理後會經共用 Data Service 中央 save('clear-undone-history') 保存。

介面
====
「清理已撤銷」按鈕會顯示數量，例如：
清理已撤銷（3）

當沒有已撤銷紀錄時，按鈕會自動停用。

部署
====
7 個執行檔：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供版本核對，可不必上載。

驗證
====
1. 先做一個 +1。
2. Undo，該紀錄變成「已撤銷」。
3. 課堂紀錄頁按「清理已撤銷（1）」。
4. 該紀錄消失。
5. 學生分數應保持 Undo 後的數值，不會再次改變。
