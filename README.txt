香港教師教學日誌 v2.6.6 — 學生 Profile 底部安全空白修正
更新日期：2026-10-04

今版修正
========
學生 Profile 在手機畫面向下捲到底時，
最後幾項內容容易被底部浮動導覽／操作列遮住。

新增：
- Profile modal 底部額外安全空白。
- 支援 env(safe-area-inset-bottom)。
- 手機版會保留更大底部空間。
- 不改動 Profile 資料邏輯、Data Service、追收、待辦、座位或積分。

上載檔案
========
7 個執行檔：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供版本核對，可不必上載。

驗證
====
1. 開學生 Profile。
2. 捲到最底。
3. 「主系統待辦／座位積分待辦」最後內容應可完整捲高到浮台上方。
4. 底部應見到額外空白，而唔再貼住浮動導覽列。
