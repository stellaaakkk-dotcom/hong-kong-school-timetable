香港教師教學日誌 v2.6.7 — V2.3.2 座位／積分共用 Data Service
更新日期：2026-10-04

今版目標
========
將座位表模組的中央儲存入口接入 School Data Service。
不逐個功能重寫，而是統一由中央 save() 經 Data Service → Seat adapter → 原本 localStorage。

涵蓋
====
- 學生座位移動／互換
- 整組位置移動
- 學生個人積分
- 小組積分
- 全組／全班加分
- Undo／撤銷
- 清本課分／清全部分
- 出勤及課堂封存
- 5人組／第8組／座位設定等所有原本經 save() 保存的座位模組狀態

安全設計
========
- School Data Service 升級至 v5。
- 新增 seat adapter。
- 原本 saveManager/localStorage 完整保留。
- Data Service 或 adapter 未 ready／出錯時，自動 fallback 到 saveRaw()。
- Profile、追收、Pending、Class 的已驗證流程不改。
- 無更改 Student ID／Class ID 映射。

身份資料頁
==========
應顯示：
V2 共用資料服務：✓ 已啟用｜寫入：班別 ✓・待辦 ✓・追收 ✓・Profile ✓・座位積分 ✓

建議測試
========
1. 調一位學生去另一座位，重開座位表位置仍正確。
2. 對一位學生 +1，重開後個人分數保留。
3. 對一組 +1，重開後小組分保留。
4. 做一次 Undo，重開後撤銷結果仍保留。
5. Profile 備註／家校聯絡／課堂事件仍正常，避免中央 save 改動造成回歸。

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
