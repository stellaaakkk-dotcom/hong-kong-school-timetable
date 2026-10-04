香港教師教學日誌 v2.6.0 — V2 共用資料服務基礎層
更新日期：2026-10-04

本版目的
========
開始 V2，但保持 v2.5.8 畫面及日常操作不變。

新增
====
1. 新增 window.__schoolDataService 共用資料服務。
2. 統一提供：
   - classes
   - students
   - enrollments
   - pending
   - submissions
3. 提供 snapshot / audit / subscribe / getStatus。
4. Class Core API 的讀取開始改由 Data Service 提供，作為第一批遷移。
5. 現有寫入流程仍保留原函式，Data Service 只包裝及協調，降低 regression 風險。
6. 身份資料 V1 健康檢查會顯示：
   🧩 V2 共用資料服務：✓ 已啟用

部署
====
共 7 個執行檔：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供核對版本，不必上載。

測試
====
1. 班別／學生中心顯示 v2.6.0。
2. 原有班別、學生名單、Profile、追收、待辦正常。
3. 身份資料 V1 健康檢查顯示「V2 共用資料服務：✓ 已啟用」。
4. 切班、開學生 Profile、查看追收應與 v2.5.8 相同。

V2 後續
=======
下一小步會將更多寫入流程逐步轉到 Data Service，而唔會一次過重寫。
