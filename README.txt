香港教師教學日誌 v2.3.3 — Phase 2.2 主系統直開學生 Profile

基於已確認成功的 v2.3.2。

新增：
- 班級中心 → 學生：
  每位學生右邊新增「Profile」按鈕。
- 按 Profile 會：
  1. 使用該班 classId / 班名切換座位模組班別
  2. 使用固定 studentId 定位學生
  3. 直接打開座位／積分內的學生 Profile
- 不再需要先開座位表、再手動找學生。

Profile 內容仍然集中在同一頁：
- 出席
- 積分／課堂紀錄
- 教師私人備註
- 家校聯絡
- 主系統追收
- 主系統學生專屬待辦
- 座位／積分待辦

資料原則：
- 不複製家校聯絡或學生紀錄到主系統。
- 只用 stable classId / studentId 做直接導航。
- 原資料來源及儲存方式不變，降低整合風險。

版本：
- planner-enhancements 2.3.3
- seat integration 2.3.3
- Service Worker v233
