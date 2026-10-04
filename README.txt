香港教師教學日誌 v2.6.2 — V2.2 Submission／追收共用資料服務
更新日期：2026-10-04

今版目標
========
將 Submission／追收的實際寫入正式接入 School Data Service。
畫面、三態操作及既有 Firestore／離線同步流程不變。

已接入共用 Data Service
=======================
1. 追收紀錄新增
2. 追收紀錄修改
3. 學生三態更新：
   - 已交
   - 欠交
   - 未處理
4. Missing Meta／學生追收歷史更新
5. 追收紀錄刪除
6. 功課／教學日誌「＋追收」建立紀錄
7. Student Profile、Inbox 等可經同一 submissions 讀取介面取得最新資料

安全設計
========
- School Data Service 升級至 v3。
- Submission Tracker API 升級至 v2。
- Data Service 的 submission save/remove 會呼叫 Submission 模組原本的 raw persistence。
- 原本 localStorage、Firestore、offline queue 全部保留。
- 若 Data Service 尚未 ready 或寫入發生例外，Submission 模組會 fallback 回原本 raw 寫入。
- 不修改既有三態判斷規則。

上載檔案
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

驗證方法
========
1. 上載 7 個執行檔。
2. 身份資料頁應顯示：
   「V2 共用資料服務：✓ 已啟用｜寫入：班別 ✓・待辦 ✓・追收 ✓」
3. 建立一項測試追收。
4. 將至少三個學生分別設為：
   - 已交
   - 欠交
   - 未處理
5. 關閉再重新開啟追收頁，三態應保留。
6. 到學生 Profile／Inbox 確認相同追收狀態仍能讀到。
7. 刪除測試追收，確認列表及 Inbox 同步消失。

下一步
======
V2.3：座位／學生 Profile 寫入接入共用 Data Service。
建議先確認 V2.2 追收新增、三態、重開、刪除全部正常。
