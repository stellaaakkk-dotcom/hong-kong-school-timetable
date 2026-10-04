香港教師教學日誌 v2.7.1 — V2.4.1 離線 Queue／重連修正
更新日期：2026-10-04

測試發現
========
v2.7.0 離線時可能出現：
- 追收 queue 已有變更，但「待同步」未即時刷新。
- Submission 在離線期間斷開 Firestore 後，重新上線只 flush、沒有重新 connect。
- cloud snapshot 可能在 queue 尚未成功上傳前覆蓋本機未同步版本。

今版修正
========
1. submission-pending-changed 只更新同步狀態，不再當作追收 record change。
2. 重新上線時：
   - Planner 如已斷線會先 connectData()。
   - Submission 會 ensureOnlineSync()，必要時重新 connectStorage()。
3. Activity／Pending／Submission 收到 cloud snapshot 時，會把仍在 queue 的本機操作疊回去：
   - set：本機未同步版本優先顯示。
   - delete：仍保持刪除，不會被雲端舊資料「復活」。
4. queue 一有變化，「待同步 X」會即時重算。

注意
====
目前頂部「待同步」代表 Activity／Pending／Submission 的自動雲端 queue。
座位／積分／Profile 目前仍以本機持久化為主，並不會因為這個數字而代表已自動上傳完整座位資料。

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
A. Pending
1. 離線。
2. 新增測試待辦。
3. 應立即見「待同步 1」。
4. 同一待辦再修改，仍應是 1，不應變 2。
5. 上線後應轉「同步中」→「已同步」。
6. 重開網站，待辦仍存在。

B. Submission
1. 離線。
2. 修改一項追收三態。
3. 應見待同步數增加。
4. 上線後自動重新連接並清 queue。
5. 重開網站，三態仍保留。
