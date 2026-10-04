香港教師教學日誌 v2.6.3 — V2.2.1 學生 Profile 追收三態修正
更新日期：2026-10-04

測試發現
========
v2.6.2 的追收 Data Service 寫入／刪除正常：
- 欠交可以在學生 Profile 顯示及開啟來源。
- 刪除主系統追收後，學生 Profile 欠交記錄會同步消失。

但學生 Profile 舊顯示層仍然只保留「欠交」紀錄，所以：
- 已交沒有顯示
- 未處理沒有顯示

今版修正
========
1. Student Hub 不再只篩選 missing。
2. 每位學生的「主系統追收」會按班號計算並顯示：
   - 已交
   - 欠交
   - 未處理
3. 三態均可按「開啟來源」回到同一追收紀錄。
4. 刪除來源追收後，三態紀錄都會從學生 Profile 消失。
5. 不改動原本 Submission 三態資料結構或 Firestore 寫入。

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
2. 建立／沿用一項測試追收。
3. 將三位學生分別設為：
   - 已交
   - 欠交
   - 未處理
4. 到座位表 → 三位學生 Profile → 主系統追收。
5. 三位應分別顯示相應狀態，並可「開啟來源」。
6. 刪除測試追收後，三位 Profile 的相關紀錄應全部消失。

狀態
====
通過後，V2.2 Submission／追收接入可視為完成。
下一步：V2.3 座位／學生 Profile 寫入接入共用 Data Service。
