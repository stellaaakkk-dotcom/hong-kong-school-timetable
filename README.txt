香港教師教學日誌 v2.3.2 — Phase 2.1 學生待辦掛勾修正

問題：
v2.3.1 從學生 Profile 建立的主系統待辦雖然帶了班別 scope，
但主系統 UI 沒有顯示學生身份，造成待辦看似只屬於班別。

修正：
- 學生 Profile 新增待辦時，主系統新增視窗明確顯示：
  👤 班號 XX｜學生姓名（學生專屬待辦）
- 儲存 record 同時保存：
  classId / className
  studentId / studentName / studentNo
- 主系統待辦清單會同時顯示：
  班別 tag + 學生 tag
- 搜尋待辦可搜尋學生姓名／班號
- 編輯待辦時會再次顯示學生掛勾
- 編輯後明確保留 studentId / studentName / studentNo
- 學生 Profile 的「主系統待辦」只讀取真正相同 studentId 的待辦
- 舊 sourceType=studentProfile 且未有 studentId 的紀錄先用姓名／班號做兼容
- 全班待辦仍然獨立顯示為「班別待辦（全班）」

已確認正常的「主系統追收」邏輯不作修改。

版本：
planner-enhancements 2.3.2
seat integration 2.3.2
Service Worker v232
