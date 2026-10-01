香港教師教學日誌 v1.5.3

今次重新製作「活動紀錄顯示於月曆」：

- 完全取消 v1.5.1 / v1.5.2 的外層 overlay 定位方式。
- 原本 React 月曆會直接讀取活動紀錄 localStorage。
- 新增／刪除／Firestore 更新活動紀錄後，會通知 React 月曆即時重新 render。
- 活動標籤真正屬於該日期的 cal-cell，所以切月份、捲動、縮放、手機／iPad／電腦都會跟格移動。
- 標籤格式：類別｜活動名稱。
- 同一日最多直接顯示 2 項，其餘顯示「＋N 項」。

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
