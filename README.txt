香港教師教學日誌 v2.4.6 — 功課管理教學視窗統一關閉修正

問題：
- Step 12 功課管理完成後仍然留住。
- 後面另一個同功課／追收有關的流程亦可能留下相同視窗。

修正：
- 新增 closeAllHomeworkTutorialUI()。
- 離開任何 homeworkEntry / homework / journalFollowup 步驟時，都會統一關閉：
  - #pe-homework-modal
  - #pe-workspace-modal
  - 其他可見而內容包含「功課管理／功課／追收／追收紀錄」的教學 modal
- 進入班級中心入口、班級中心 Tabs、學生 Tab、座位／積分前亦會再做一次防漏關閉。
- 不再依賴固定 Step 編號，所以將來插入／刪除教學步驟都唔會再令 cleanup 失效。

核心資料與功能不變。
