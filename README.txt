香港教師教學日誌 v2.6.1 — V2.1 共用資料服務第一批寫入
更新日期：2026-10-04

今版目標
========
將 v2.6.0 只讀／基礎 Data Service，正式接入第一批「實際寫入流程」。
畫面及日常操作不變，先換底層資料通道。

已改經 School Data Service 的寫入
=================================
1. 班別／學生
   - 新增班別／建立學生名單
   - 修改班名／學生姓名
   - 重建名單
   - 刪除班別
   - 歷史學生加入另一班
   - 合併 Student ID 時的班級更新

2. Pending／待辦
   - 新增待辦
   - 修改待辦
   - 延後 Deadline
   - 完成／取消完成
   - 重複待辦完成後產生下一次
   - 刪除待辦
   - 合併 Student ID 時轉移學生待辦

安全設計
========
- Data Service v2。
- 原本 syncClassProfile / syncPendingSet / deletePendingItem 等底層同步仍保留。
- 如果 Data Service 寫入發生例外，會 fallback 到原本寫入流程。
- 本版暫時未改 Submission／追收、座位／積分寫入，避免一次過更動太多。

驗證
====
1. 上載 7 個執行檔。
2. 身份資料頁應顯示：
   「V2 共用資料服務：✓ 已啟用｜寫入：班別 ✓・待辦 ✓」
3. 建議做以下低風險測試：
   - 將一個學生姓名加一個小改動，再改返原名，確認可以儲存。
   - 新增一項測試待辦，修改 Deadline，標記完成，再刪除。
4. 原有班級、Student ID、Enrollment、追收資料應維持不變。

部署檔案
========
網站執行檔 7 個：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供版本核對，可不必上載。

下一步
======
V2.2：將 Submission／追收資料接入共用 Data Service。
確認 V2.1 寫入穩定後先進行。
