香港教師教學日誌 v2.6.5 — V2.3.1 Profile 記錄刪除
更新日期：2026-10-04

測試結果
========
v2.6.4：
- 私人備註可保存並重開。
- 家校聯絡可保存並重開。
- 課堂事件可保存並重開。
問題：
- 家校聯絡記錄無法刪除。
- 課堂事件記錄無法刪除。

今版修正
========
1. 家校聯絡
   - 每筆 Profile 家校聯絡新增「刪除」。
   - 刪除經 School Data Service → Profile adapter。
   - 如紀錄由待辦建立，只解除 contactRecordId；原待辦保留。

2. 課堂事件
   - 學生 Profile 的「課堂事件」每筆新增「刪除紀錄」。
   - 刪除經 School Data Service → Profile adapter。
   - 如事件曾建立待辦，待辦保留，只刪事件歷史。
   - 加扣分、出勤等其他學生歷史不顯示此刪除按鈕。

3. 安全 fallback
   - Data Service／adapter 不可用時，仍會使用原本 localStorage 寫入層刪除。

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
A. 家校聯絡：新增測試聯絡 → 重開仍存在 → 刪除 → 重開應消失。
B. 課堂事件：新增測試事件紀錄 → Profile 見到 → 刪除紀錄 → 重開應消失。
C. 如事件／聯絡有相關待辦，刪除紀錄後待辦應仍存在。
