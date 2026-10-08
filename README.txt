香港教師教學日誌 v2.8.4 — 不再追收根源修正
更新日期：2026-10-08

根因
====
v2.8.3 已在本機 record 加入：
- followupArchived
- followupArchivedAt

但 upsertRecordRaw() 寫入 Firestore 的 cloudData 漏咗呢兩個欄位。
因此：
1. 本機按「不再追收」後一度成功；
2. Firestore snapshot 回來；
3. 雲端紀錄沒有 archive 欄位；
4. normalize 後 archive 變回 false；
5. 項目重新出現在進行中。

v2.8.4 修正
============
1. followupArchived / followupArchivedAt 正式寫入 Firestore。
2. 每筆「今日追收」及「進行中」記錄都有自己嘅「不再追收」按鈕。
3. 按鈕直接使用 record ID，不再依賴 activeId。
4. 封存後：
   - 不出現在今日追收
   - 不出現在進行中
   - 收入「追收歷史 > 不再追收」
   - 保留欠交學生、原因、備註、日期
   - 可重新追收

舊 v2.8.2 個人「不再追收」
===========================
不刪資料，亦唔放棄處理。
v2.8.4 將舊 collectionStatus='closed' 視為普通欠交重新納入追收。
舊 metadata / studentHistory 仍保留作歷史紀錄，但不再控制畫面。
之後統一使用「整項不再追收」。

保留功能
========
- 今日／班別／狀態／類別篩選
- 個別學生「未能追收」
- 活動統計快速新增
- 版本顯示／更新提示
- PWA 浮台、iPad More、離線同步、V2.5 診斷

部署：7 個執行檔 + README.txt。
