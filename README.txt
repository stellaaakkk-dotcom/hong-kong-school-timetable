香港教師教學日誌 v2.3.5 — 直開學生 Profile 關閉修正

修正內容：
- 主系統直開學生 Profile 的 pending studentId 改成一次性使用。
- 成功送出開啟指令後立即清除，避免 Profile 關閉後被外層再次自動打開。
- hk-seat-ready 先消耗 pending 導航，再排程開啟，避免重複訊息。
- 學生 Profile 關閉時會回報主系統 hk-seat-student-profile-closed，外層同步清除任何殘留導航。
- Profile ✕ 改為 type=button，並 preventDefault / stopPropagation。
- 點 Profile 背景亦可正常關閉。
- 關閉 Profile 後仍留在座位／積分主畫面；外層右上角 ✕ 才返回主系統。

版本：
planner-enhancements 2.3.5
seat integration 2.3.5
Service Worker v235
