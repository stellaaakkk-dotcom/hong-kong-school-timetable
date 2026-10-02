香港教師教學日誌 v2.0.1 — 整合細節完善

本版不加入座位表，集中完善 v2.0 底層整合。

1. 跨模組保留所選班別
新增 active class：
localStorage: hk-school-active-class-v2

以下模組會盡量沿用同一班：
- 班別／學生中心
- 班別總覽
- 功課紀錄
- 統一 Inbox
- 課堂工作流

例：
在班別中心選 3C → 開功課紀錄／Inbox／班別總覽時優先維持 3C。

2. 正式關聯欄位
課堂工作流會建立：
- classId
- className
- lessonId
- homeworkId

lessonId 格式：
YYYY-MM-DD-p{節數}-{班別}

例：
2026-10-05-p3-3C

homeworkId：
{lessonId}-hw

3. 由課堂工作流建立待辦
現在會自動把以下 metadata 寫入 pendingItems：
- classId
- className
- lessonId
- homeworkId
- sourceType = lessonWorkflow

所以之後：
Inbox／搜尋／班別中心不再只靠文字估班別。

4. 統一 Inbox
- 待辦優先使用正式 className metadata
- 舊待辦仍會 fallback 文字辨認
- 新舊資料可以共存

5. 搜尋
- 待處理事項搜尋內容加入 className
- 更容易用班別搜尋

架構仍然保留：
- 不新增 React tab
- 不替換 workspace
- v2.0 班別核心／課堂工作流／Inbox
- v1.9.x 搜尋、功課、雲端狀態等全部保留

之後等座位表穩定：
v2.1 再直接接 classProfiles。

Service Worker cache：v201
