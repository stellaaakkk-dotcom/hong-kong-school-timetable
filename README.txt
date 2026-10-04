香港教師教學日誌 v2.6.8 — 座位主題＋Undo 修正
更新日期：2026-10-04

測試發現
========
v2.6.7 的座位／積分 Data Service 寫入測試完成，但有兩個 UI／歷史回歸：

1. 座位表一有改動，就由目前主題色變返舊藍色。
2. 按 Undo 後，剛才的操作紀錄直接消失，而不是顯示為已撤銷。

根源
====
1. renderClassSwitcher() 每次 renderAll() 都把 --accent 改為班別 classColor，
   舊預設為 #4A90E2，因此覆蓋主系統 shared theme。
2. undoLast() 直接還原操作前完整 state，
   操作後新增的 history 亦因此一併被刪走。

今版修正
========
主題：
- renderClassSwitcher 會優先讀 hk-school-seat-theme-v1。
- shared theme accent / primary 永遠優先於 legacy classColor。
- 班別顏色圓點仍可顯示原有 classColor，但不再控制整個座位表主題。

Undo：
- 資料仍會真正還原到操作前狀態。
- 該次操作新增的 history 不會消失。
- 紀錄會保留並標示「已撤銷」。
- 已撤銷紀錄稍為淡化及加刪除線，不再顯示再次撤銷按鈕。
- Undo 儲存仍經 Data Service 中央 save('undo')。

驗證
====
A. 主題
1. 主系統選紫藤／布甸狗等非藍色主題。
2. 開座位表。
3. 調位或加分。
4. 主題應保持不變，不再跳回藍色。

B. Undo
1. 對一位學生 +1。
2. 課堂紀錄應新增該筆。
3. 按 Undo。
4. 分數應還原。
5. 該筆紀錄仍存在，但顯示「已撤銷」，而不是消失。

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
