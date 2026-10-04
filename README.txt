香港教師教學日誌 v2.7.3 — Pending 離線修正＋雲端狀態整合
更新日期：2026-10-04

今版修正
========
1. Submission
- 保留 v2.7.2 已驗證成功的 queue-first 邏輯，不再改動。

2. Pending
- 改成 queue-first：
  本機先保存 → 立即加入 queue → Firestore 成功後才清 queue。
- save/delete 都用同一規則。
- Firestore 7 秒未完成，queue 保留。
- 同一 Pending ID 只保留最新一個操作。

3. 雲端狀態顯示
- 「待同步 X」直接整合到原本雲端狀態位置。
- 不再另外顯示一粒獨立同步提示。
- 顯示方式：
  ☁ 雲端：待同步 1
  ☁ 雲端：同步中
  ☁ 雲端：已連接
  ☁ 雲端：離線
  ☁ 雲端：未登入
- 「最後成功」時間保留。

驗證
====
A. Pending
1. 關閉網絡。
2. 新增／修改一項 Pending。
3. 原本雲端狀態位置應直接顯示「雲端：待同步 1」。
4. 同一項再改，仍應為 1。
5. 開回網絡，應變「同步中」→「已連接」。

B. Submission
1. 離線改同一份追收。
2. 雲端狀態位置應顯示「待同步 1」。
3. 上線後自動補傳並回「已連接」。

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
