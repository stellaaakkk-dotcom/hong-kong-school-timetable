香港教師教學日誌 v1.7.1

安全性修訂：刪除前確認

1. 月曆活動 tag
- 撳 tag → 編輯視窗新增「刪除」
- 按刪除後會彈確認視窗
- 確認後才會刪除
- 月曆、活動統計、今日工作台、Firestore 一併更新

2. 活動統計
- 原本「刪除」不再一按即刪
- 現在會先彈確認視窗
- 確認後才真正刪除

3. 待處理事項 tag
- 編輯視窗新增「刪除」
- 同樣需要確認
- 月曆及 Deadline 提醒同步移除

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
