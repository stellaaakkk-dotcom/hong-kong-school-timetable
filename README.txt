香港教師教學日誌 v2.3.6 — 學生 Profile 握手式導航修正

v2.3.5 問題：
- 為避免 Profile 關閉後重開，主系統太早清除 pending studentId。
- 座位模組可能未完成班級／學生同步就收到 studentId。
- 結果只開座位表主頁，Profile 沒有彈出。

v2.3.6：
- 改成 parent/iframe 握手式導航。
- 主系統保留 pending studentId，直到座位模組真正回覆「Profile 已開啟」。
- 座位模組收到指令後：
  1. 先同步 class core
  2. 切換指定班別
  3. 找指定 stable studentId
  4. 若尚未找到，最多重試 8 次，每次 120ms
  5. 真正開啟 Profile 後才回傳 hk-seat-student-profile-opened
- 主系統收到 opened 才清除 pending navigation。
- 關閉 Profile 會取消所有重試，確保不會自動重開。

其他 v2.3.5 關閉修正保留。
