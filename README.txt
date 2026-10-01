香港教師教學日誌 v1.5.4 — 月曆活動紀錄三重同步修正版

今版不再只依賴單一同步路徑。

月曆取得活動紀錄會同時使用：
1. 即時 CustomEvent：新增／刪除活動時直接把完整活動陣列傳給 React 月曆。
2. localStorage：hk-school-calendar-activity-logs-v1 作離線 fallback。
3. Firestore：Firebase 載入及登入完成後，月曆元件自己直接監聽 users/{uid}/calendarActivityLogs。

即使 Firebase 載入較慢，元件會每 500ms 嘗試連接，成功後停止輪詢。

活動標籤仍然由 React 月曆直接 render 在 cal-cell 內：
類別｜活動名稱
同日最多顯示 2 項，其餘顯示 ＋N 項。

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
