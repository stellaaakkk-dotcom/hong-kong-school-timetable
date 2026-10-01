香港教師教學日誌 v1.6.0

新增：⏳ 待處理事項 + Deadline 提醒

待處理事項：
- 事項名稱
- Deadline
- 優先級：高／中／低
- 備註
- 完成／設回未完成
- 刪除
- 篩選：未完成／已完成／全部
- 搜尋事項／備註

月曆 Deadline：
- future deadline：待辦｜事項
- 今日到期：今日｜事項
- 已逾期未完成：逾期｜事項
- 已完成後會從月曆提醒消失

其他整合：
- 「更多」新增 ⏳ 待處理事項
- 今日工作台新增 Deadline 提醒
- 今日完成檢查亦會顯示今日到期／逾期事項
- 待辦資料同步到 Firestore：
  users/{uid}/pendingItems/{id}
- 離線／同步失敗會加入待同步數量，恢復網絡後自動重試

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
