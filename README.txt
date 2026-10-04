香港教師教學日誌 v2.5.2 — Identity V1.1 Compatibility Hard Bust

目的：
修正「已上載 v2.5.1，但身份資料畫面仍然顯示 v2.5.0 舊內容」。

根因：
如果舊 index.html 仍被使用，它會繼續要求：
- planner-enhancements-v2500.js
- submission-module-v2500.js
- seat-score-integrated-v2500.html

以前新 ZIP 只新增新 physical filename，舊 physical filename 不會被覆蓋，
所以 stale index 仍可成功載入真正舊程式。

v2.5.2：
1. 新 physical files：
   planner-enhancements-v2520.js
   submission-module-v2520.js
   seat-score-integrated-v2520.html
2. 同時將 v2500、v2510 compatibility physical files 覆蓋成 v2.5.2 最新程式。
3. 因此就算瀏覽器暫時仍使用 v2500 / v2510 index reference，都會取得最新程式。
4. Identity modal 標題新增可見：
   build 2.5.2
   用嚟立即確認實際載入版本。
5. 保留 V1.1 規則：
   - 01/02/03 placeholder 不進永久 Student Registry
   - 舊 placeholder registry 自動清理
   - enrollment 保留 provisional=true
   - 真實姓名沿用同一 studentId 升格

更新後驗證：
- 身份與跨學年資料 V1 標題右邊應見 build 2.5.2
- 「永久學生」應只計真實姓名學生
- 歷史學生庫不應再出現純 01/02/03 placeholder
