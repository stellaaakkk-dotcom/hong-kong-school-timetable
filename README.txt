香港教師教學日誌 v2.4.19 — 四頁統一 Fit-to-screen

1. 教師及班級資料
- 改為真正 2 x 2：學校名稱＋任教班別 / 教師姓名＋學年及學期。
- 每個 input 正常 38px 高，兩欄平均分配寬度。

2. 修正切頁殘留高度
- v2.4.14 起總課表曾直接寫入 preview-wrap inline height。
- 切去月曆／日誌／今日課表時舊高度未清除，會造成截斷或大段空白。
- v2.4.19 每次 fit 先清除 preview-wrap height/overflow 及舊 transform。

3. 統一 fit-to-screen
- 總課表：760px 文件比例 -> 按實際畫面縮放。
- 日誌：整個 journal-stack（完整一星期）一起縮放，四欄都可完整看到。
- 今日課表：720px 設計比例 -> 按畫面縮放。
- 月曆：保留原本 responsive layout，只清走上一頁殘留高度。

4. 底部空白
- 移除 body + workspace + preview-wrap 三層累加 padding。
- 手機只保留一層約 108px dock 安全距離。
- 總課表／月曆尾部不再有幾百 px 多餘空白。
