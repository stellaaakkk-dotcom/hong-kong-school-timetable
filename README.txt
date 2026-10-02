香港教師教學日誌 v2.1.7 — 日誌原生上一堂 Trace

今次不再按科目字眼、cycle、Day、節數規律推算上一堂。

做法：
1. index.html 由主日誌本身暴露 __HK_GET_JOURNAL_DAY(date)
2. 它逐格使用主日誌既有的 __HK_GET_JOURNAL_LESSON(date, periodIndex)
3. 工作流只讀「日誌實際課堂格」
4. 從今堂開始按時間向前逐格掃描
5. 唯一條件：同一班別
6. 第一個同班日誌格就是上一堂
7. 再直接讀該格 lessonNotes 的進度及功課

不再使用：
- 科目關鍵字
- 科目 recurrence
- Day / cycle 規律
- 固定節數配對
- 視藝／中文／常識特別規則

班別識別會優先使用正式 classProfiles / 已知班別名稱；
只有舊資料沒有 class profile 時才使用 legacy fallback。

Service Worker cache：v217
