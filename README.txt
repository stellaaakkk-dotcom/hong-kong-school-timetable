香港教師教學日誌 v2.5.6 — V1 收尾版
更新日期：2026-10-04

本版重點
========
1. 修正「班別／學生中心」內「＋ 新增班別」按鈕仍固定顯示紫色的問題。
2. 按鈕改為跟共享主題 token：
   - 布甸狗 → 啡色
   - 薄荷 → 綠色
   - 晴空 → 藍色
   - 莓果 → 莓紅
   - 紫藤 → 紫色
   - 黑白 → 深灰
3. 保留 v2.5.5 已完成的：
   - 永久 Student ID
   - 跨學年 Enrollment
   - placeholder 學生清洗
   - 重複 Student ID 合併
   - 測試班／已刪班級 Enrollment 清理
   - PWA 自動版本更新
4. 此版可視為 Identity V1 收尾版。

需要上載的檔案
==============
共 7 個執行檔：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

另外：
- README.txt 只供你查看版本及更新內容，不需要上載到網站亦可。

驗證方法
========
1. 上載／覆蓋以上 7 個執行檔。
2. 直接用原網址開網站，不需要手動加 ?v=。
3. 「班別／學生中心」應顯示 v2.5.6。
4. 「＋ 新增班別」按鈕應跟目前主題配色。
5. 切換其他主題後，此按鈕亦應同步轉色。

版本狀態
========
Identity & Cross-year Data V1：完成／收尾
下一階段：V2 共用資料服務
