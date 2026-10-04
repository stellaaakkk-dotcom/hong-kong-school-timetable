香港教師教學日誌 v2.6.4 — V2.3 學生 Profile 寫入共用 Data Service
更新日期：2026-10-04

今版目標
========
將座位模組入面最常用的學生 Profile 寫入，正式經 School Data Service。
先處理三類低風險資料，座位／積分本身暫時保持原流程。

已接入共用 Data Service
=======================
1. 學生私人備註
2. 家校聯絡紀錄
3. 課堂事件紀錄

架構
====
學生 Profile 操作
→ Parent School Data Service
→ Seat/Profile adapter
→ 原本座位模組可靠的 localStorage 儲存

安全設計
========
- School Data Service 升級至 v4。
- 座位模組載入後會註冊 Profile adapter。
- Data Service 未 ready、adapter 未 ready或呼叫失敗時，會 fallback 回原本寫入函數。
- 不搬走／刪除現有 seat localStorage。
- 不修改座位、積分、Undo、分組邏輯。
- Submission、Pending、Class Data Service 維持 v2.6.3 已驗證流程。

身份資料頁狀態
==============
應顯示：
「V2 共用資料服務：✓ 已啟用｜寫入：班別 ✓・待辦 ✓・追收 ✓・Profile ✓」

建議測試
========
A. 學生私人備註
- 座位表 → 學生 Profile
- 新增／修改私人備註
- 關閉 Profile 再重開，確認仍存在

B. 家校聯絡
- 同一學生新增一筆簡短測試聯絡
- 儲存後 Profile 應立即見到
- 關閉再重開仍存在

C. 課堂事件
- 選一個課堂事件
- 點一位學生記錄
- 學生 Profile → 歷史應見到該事件
- 課堂事件仍不加減分

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
V2.3.1：確認以上三類 Profile 寫入穩定後，再接座位／積分資料寫入。
