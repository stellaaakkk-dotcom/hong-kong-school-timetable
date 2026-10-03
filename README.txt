香港教師教學日誌 v2.3.1 — Integration Phase 2：學生資料互通

基於已確認穩定的 v2.3.0 Phase 1。

學生 Profile 新增：
1. 主系統追收
- 按 classId + studentId 找學生
- 用穩定 student.number 對應追收記錄的班號
- 只列目前該學生「欠交」項目
- 可按「開啟追收」返回主系統追收詳情

2. 主系統待辦
- 支援 studentId / studentName / studentNo 明確綁定
- 顯示學生專屬待辦
- 另列「班別待辦（全班）」並清楚標示，不當成學生個人待辦
- 可從學生 Profile 按「＋ 新增」直接建立主系統待辦
- 新建待辦會保存 studentId / studentName / studentNo
- 可按「開啟待辦」返回主系統修改

3. 原座位系統待辦
- 改名為「座位／積分待辦」
- 不搬資料、不複製資料，避免雙邊重複

資料原則：
- 主系統仍然是追收／Pending 的唯一來源
- 座位模組只讀取主系統資料及呼叫主系統入口
- 家校聯絡暫時仍由座位模組管理
- Phase 1 的座位、積分、出席、Profile、家校聯絡資料保持原狀

版本：
- planner-enhancements 2.3.1
- seat integration 2.3.1
- Service Worker v231
