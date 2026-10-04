香港教師教學日誌 v2.4.31 — 主畫面布甸狗 Palette 重新定義

真正修改位置：
index.html 內 React palette C1

舊：
pudding = #B67A45 / #FFF1B8

新：
pudding = #9B6A3F / #FFF9EF

原因：
- 主畫面「版面風格 → 揀顏色」係 React 內部 C1 palette 直接生成。
- 之前只改 planner/submission UI 顏色，所以 palette 圓點本身一直冇變。
- 今次直接替換原本 pudding palette 定義。

保留 key = pudding：
- 已保存選擇「布甸狗」嘅用戶設定仍然有效。
- 不需要重新揀一次先套用新色。

另外：
- planner/submission/seat 亦 bump 到 v2431，避免 PWA 快取混用。
