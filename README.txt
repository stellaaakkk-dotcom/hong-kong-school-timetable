香港教師教學日誌 v2.7.0 — V2.4 同步／離線層整理
更新日期：2026-10-04

今版定位
========
不新增教學功能，專門整理 V2 已接通的資料同步底層。

改善 1：避免重複資料事件
========================
- Class、Pending、Submission 之前可能同一個寫入由 Data Service 主動 emit，
  同時底層事件再 emit 一次。
- 今版改為由底層真正資料變更事件作唯一來源。
- 減少學生 Profile、Inbox、班別中心等重複 refresh 的機會。
- Submission pending queue 數量改變不再假裝成「追收紀錄已改變」。

改善 2：離線 Queue 去重
=======================
- Activity、Pending、Submission queue 統一使用：
  同一 record ID 只保留最新一個操作。
- 例如：
  offline 時先修改一項資料，再刪除同一項資料，
  queue 最後只保留 delete。
- 舊 queue 載入時亦會自動清理重複項。

改善 3：避免重複 Flush
======================
- Activity、Pending、Submission 都加入 flush lock。
- 網絡重連、登入事件、手動操作同時觸發時，
  同一 queue 不會同時開兩個 flush。
- 可減少重複 Firestore writes 及狀態跳動。

改善 4：同步狀態統一
====================
新增 schoolSyncStatusChanged：
- ok
- syncing
- pending
- offline
- connecting
- signedout
- error

Data Service status 亦新增：
- queuedWrites
- syncState

改善 5：重新上線
================
重新上線時會依次嘗試：
1. Activity queue
2. Pending queue
3. Submission queue
4. 再重新計算同步狀態

既有功能
========
- 班別／學生
- Pending
- Submission
- Profile
- 座位／積分
全部保留原本 Data Service 路徑及 fallback。
本版不修改 Student ID／Class ID／Firestore schema。

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

建議測試
========
1. 正常在線：
   - 改一個 Pending／追收／座位資料。
   - 不應出現重複畫面刷新或重複紀錄。

2. 離線：
   - 關閉網絡。
   - 新增或修改一個 Pending／追收。
   - 頂部應顯示「待同步 X」或離線狀態。

3. 重新上線：
   - 開回網絡。
   - queue 應自動同步。
   - 最後回到「已同步」。

4. 同一筆資料離線時連續修改數次：
   - 待同步數不應因同一 record 不斷累加。
