香港教師教學日誌 v2.7.2 — V2.4.2 Submission 離線 Queue 修正
更新日期：2026-10-04

測試結果
========
v2.7.1：
- Pending 離線同步正常。
- Submission 離線修改仍可能沒有「待同步」。
- 重新上線後 Submission 有機會未補傳。

根源
====
Firestore Web SDK 在某些 Android / Chrome 網絡狀況：
- navigator.onLine 仍可能是 true；
- 但實際 Firestore 已不可連線；
- .set() / .delete() 不一定立即 reject，而可能長時間 pending。

舊流程是：
先 Firestore → 失敗 catch → 才加入自訂 queue。

因此如果 Firestore promise 沒有 reject，
自訂 queue 就永遠不會收到這筆 Submission。

v2.7.2 修正
============
Submission 改為 queue-first：
1. 本機狀態先保存。
2. 每次 Submission save/delete 立即寫入自訂 queue。
3. 頂部「待同步 X」立即可計算到。
4. 如果在線，才嘗試 Firestore。
5. 只有 Firestore 明確成功後，才移除 queue。
6. Firestore 7 秒仍未完成，視為暫未同步，queue 保留。
7. 重新上線會立即 retry，並於 1.2 秒後再 retry 一次。

好處
====
- 不再依賴 navigator.onLine 判斷是否真的連到 Firestore。
- 即使 Android 網絡狀態判斷不準，Submission 都不會漏 queue。
- 同一 Submission ID 連續修改仍只保留最新一筆 queue。
- Pending 原本已成功的流程不改。

建議測試
========
A. Submission
1. 在線時先開一份現有追收。
2. 關閉網絡。
3. 將一位學生由未處理改成已交／欠交。
4. 頂部應出現「待同步 1」。
5. 同一份追收再改另一位學生，待同步仍應為 1。
6. 開回網絡。
7. 應先見同步中，最後變「已同步」。
8. 完全重開網站，再開該追收，剛才狀態應仍存在。

B. Pending
原本 v2.7.1 已成功，今版再快速確認一次即可。

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
