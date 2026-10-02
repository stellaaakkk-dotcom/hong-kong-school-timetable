香港教師教學日誌 v2.0.2 — 待辦工作範圍模型

新增正式工作範圍：
- 個人 personal
- 班別 class
- 年級 grade
- 科組 subject
- 全校 school
- 其他 other

手動新增／修改待辦都可以設定範圍。
課堂工作流建立的待辦會自動標示為班別範圍，並保留 classId / lessonId / homeworkId。

舊待辦兼容：
- 有 classId/className/lessonId 的舊資料 → 視為班別
- 其他舊待辦 → 視為個人
- 不強制改寫舊資料

統一 Inbox：
- 新增「工作範圍」篩選
- 預設顯示全部範圍
- 只有選「班別」時才啟用班別篩選
- 全校／年級／科組／個人工作不會再被班別篩選誤藏

班別總覽：
- 新資料只收 scopeType=class 且班別吻合的待辦
- 舊資料保留文字 fallback

搜尋：
- 可搜尋「全校」「中文科」「P.3」等工作範圍

Service Worker cache：v202
