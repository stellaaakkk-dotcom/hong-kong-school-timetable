香港教師教學日誌 v2.7.5 — iPad 浮台 More＋追收熱修
更新日期：2026-10-05

今版只修導覽，不處理 V2.5 診斷內容。

問題 1：iPad「更多」撳唔到
=========================
根因：
舊版「點選 More 選單外面就關閉」的全頁 click handler，
只豁免手機 More 按鈕，沒有豁免 iPad More。
所以 iPad More 有機會打開後，在同一個 click 立即被關閉，
視覺上就似「撳唔到」。

修正：
- 外部點擊判斷加入 [data-ipad="more"]。
- Desktop More 亦加入豁免。
- iPad More 改用獨立 toggleMobileMore()。
- More click 加 preventDefault + stopPropagation。
- 提高 iPad rail / More sheet z-index。
- 強制 pointer-events:auto / touch-action:manipulation。

問題 2：iPad 浮台沒有追收
========================
iPad rail 現在為：
☀ 今日
📝 日誌
📅 月曆
📋 追收
••• 更多

「追收」會直接呼叫現有 Submission Tracker API，
不建立第二套追收介面。

手機版
======
手機原本已有「追收」快捷掣；今版改為同樣走 direct Submission API，
行為與 iPad 一致。

V2.5
====
v2.7.4 的跨模組診斷功能原封保留，今版沒有修改診斷邏輯或資料。

部署
====
7 個執行檔：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供版本核對，可不必上載。

驗證
====
iPad：
1. 撳「更多」→ 選單應保持開啟，不會閃一下即關。
2. 再撳「更多」→ 可正常收起。
3. 撳「📋 追收」→ 直接開追收頁。
4. 追收頁開啟時，「追收」應顯示 active 狀態。
5. 今日／日誌／月曆仍可正常切換。
