香港教師教學日誌 v1.5.1

新增：活動紀錄同步顯示回月曆
- 「＋活動紀錄」新增後，會按日期顯示在當月月曆格
- 顯示格式：紀錄｜類別：活動名稱
- 同一日最多先顯示 2 項，更多以「＋N」提示
- 月曆自行輸入 textarea 保持原有操作
- 活動紀錄仍同步 Firestore、今日工作台及活動統計
- 刪除活動紀錄後，月曆標籤會同步消失

穩定性：
- 活動標籤使用 React root 外層 overlay，不直接插入 .cal-cell 子節點
- 不使用 MutationObserver

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
