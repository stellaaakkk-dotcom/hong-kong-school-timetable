香港教師教學日誌 v2.0.8 — v2.0.7 Regression 修正版

1. 課堂工作流修正
根因：
- v2.0.7 引用未定義 previousHomework，開啟即 JS error
- period / periodIndex dataset 名稱不一致

修正：
- previous 資料直接帶 periodIndex + homework
- periodIndex 統一使用 m.dataset.periodIndex
- 日期切換／節數切換恢復
- 上次進度／上次功課正常讀取
- 追收狀態使用 submissionStatusForHomework 的 label / record
- 開日誌／追收／＋待辦按鈕保留

2. 工作 Inbox 修正
快速 chips 補齊：
- 全部
- 今日
- 逾期
- 個人
- 班別
- 年級
- 科組
- 全校
- 其他

3. 手動下拉篩選不再被 chip 鎖住
- 手動選「年級／科組／其他」時，自動把 quick filter 重設為「全部」
- 因此所有 scopeType 都可正常篩選
- 班別仍可再按具體班名篩選

Service Worker cache：v208
