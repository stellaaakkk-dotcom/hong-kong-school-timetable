香港教師教學日誌 v2.4.29 — 啡色主題強制覆蓋修正版

今次不再只改原本色值，而係將最終主題 override 寫入
planner-enhancements-v2429.js 最後一層動態 stylesheet，並使用 !important。

標準色：
- 主啡：#9b6a3f
- 次啡：#a87446
- 標題／文字啡：#80542f
- 柔和米白：#fff9ef / #fffaf2

班級中心：
- 回復 v2.4.26 原本啡色層次。
- active tab = #9b6a3f
- active class = #a87446

主畫面 Pompompurin UI：
- 主按鈕、active 導覽、主要 action 統一 #9b6a3f。
- 比舊偏橙深少少，但唔會似 v2.4.27 咁深。
- 背景維持柔和米白。

原因：
- v2.4.28 原本色值雖然有改，但部分較後／較高 specificity CSS 仍然覆蓋。
- v2.4.29 用 versioned planner JS 最後層 override，避免被舊 CSS 蓋返。
