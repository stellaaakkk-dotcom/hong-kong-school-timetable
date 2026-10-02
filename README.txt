香港教師教學日誌 v1.8.1

修正／更新：

1. 「更多」真正分組
今日：
- 今日工作台
- 今日完成
- 待處理事項

記錄：
- 功課紀錄
- 作業／回條
- 活動紀錄
- 活動統計

工具：
- 全站搜尋
- 月曆標籤
- 類型管理

2. 功課紀錄按「該堂課班別」分類
- 不再用整份日誌共用的 className 去分。
- 每筆功課會用「日期＋第幾節」對返原本課表。
- 由 daySubjects / ninthSubjects 取得當堂課文字。
- 從課堂文字抽取班別，例如 3A / 3B / 3C。
- 班別判斷優先次序：
  課表該堂班別 → 追收紀錄班別 → 追收來源科目 → 功課文字 → 未分類
- 因此三班共用同一份日誌都可以分開查看。

保留：
- v1.8.0 今日工作台摘要化
- 常用班別／學生人數記憶
- 活動類型管理
- Firebase bootstrap
- 浮動地台修復

部署請覆蓋：
index.html
firebase-bootstrap.js
planner-enhancements.js
submission-module.js
sw.js

Service Worker cache：v81
