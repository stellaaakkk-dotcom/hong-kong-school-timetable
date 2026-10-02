香港教師教學日誌 v1.9.4

修正「全站搜尋按鈕冇反應」。

真正原因：
- openJournalSearch() 會呼叫 ensureSearchModal()
- 但 planner-enhancements.js 入面其實冇 ensureSearchModal() 定義
- 所以一按搜尋就 ReferenceError，表面上完全冇反應

v1.9.4：
- 新增完整 ensureSearchModal()
- 搜尋視窗包括：
  - 搜尋輸入
  - 清除
  - 關閉
  - 點背景關閉
  - Esc 關閉
- 輸入關鍵字即時 renderGlobalSearch()
- 保留 v1.9.3「前往來源」功能

Service Worker cache：v94
