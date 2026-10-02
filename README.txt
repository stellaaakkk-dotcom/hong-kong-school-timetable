香港教師教學日誌 v1.9.2

今次針對 v1.9.1 三個仍未解決問題作實際修正。

1. 本週／本月／本學期篩選
真正 bug：
- startOfWeekHK() / monthRange() 呼叫了不存在的 cnDate()
- 所以 preset filter 一按就 JavaScript error，畫面保留原本「全部」
- 自訂日期完全不使用 cnDate()，所以只有自訂正常

v1.9.2：
- 新增 dateKeyLocal()
- 本週／本月全部改用 dateKeyLocal()
- 本學期沿用固定學期範圍
- 摘要位置會明確顯示「篩選：本週／本月／本學期」，方便確認

2. 追收狀態
- 狀態由右上角移到功課內容下方獨立一行，手機不會被長科目文字壓走
- 每一份功課必定顯示：
  追收：未追收／追收中／已交齊
- 比對真正使用：
  issueDate
  sourcePeriod
  sourceSubject
  sourceKey
  className
  homework/name
- sourceKey 不再用 split('|') 硬拆，而是只拆前三個 separator，保留完整 multiline homework

3. 重複功課
- 一個 box 先按真正換行逐項拆開
- 同時支援儲存成 \n 或 <br> 的舊內容
- 每行先清走：
  1. / 1、 / 1) / • / - / * 等列表符號
- 再逐項與同班過去21日所有功課行比較
- exact match 一定提示
- 相似度門檻調整至 0.76
- 一格有3項功課，可獨立提示其中1、2或3項重複

其他 v1.9.0 / v1.8.x 功能不變。
Service Worker cache：v92
