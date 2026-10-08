香港教師教學日誌 v2.8.0 — 活動快速新增＋版本更新提示
更新日期：2026-10-08

一、活動統計快速新增
====================
活動統計視窗新增「＋快速新增活動」。
同一活動可一次選多個日期，按一次「一次過加入」後：
- 每個日期建立獨立活動紀錄
- 月曆 tag 自動更新
- 活動統計自動更新
- 離線時沿用活動 queue，稍後同步

每一項既有活動亦新增「＋再記錄」：
- 自動帶入活動類別
- 自動帶入活動名稱
- 自動帶入備註
- 只需選新日期

二、版本顯示
============
右上角現有雲端狀態列直接顯示 v2.8.0。
按版本號可手動檢查 version.json。

有新版時顯示：
「✨ 偵測到新版 vX.X.X（目前 v2.8.0）」
並提供「立即重新載入」及「稍後」。

由 v2.8.0 起不再在偵測到新版時靜默強制跳頁，避免 PWA 使用途中突然重新載入。

三、保留穩定功能
================
沿用 v2.7.9：
- Android / iPhone PWA 底部 5 粒浮台
- iPad 右側 5 粒浮台及專用 More
- Pending / Submission offline queue
- V2.5 跨模組診斷

部署
====
上載 7 個執行檔：
index.html
planner-enhancements.js
submission-module.js
seat-score-integrated.html
firebase-bootstrap.js
sw.js
version.json

README.txt 只作版本說明，不需上載網站。
