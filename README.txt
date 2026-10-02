香港教師教學日誌 v2.2.7 — 追收三態硬修正版

修正 1：真正區分新三態資料
- 新追收紀錄加入 statusVersion: 2
- statusVersion 2：
  missing=[] + submitted=[] = 全班白色未處理
- 舊 statusVersion 1 才使用舊資料兼容規則

修正 2：紀錄列表不再誤寫「已交齊」
- 有欠交 → 欠交 N
- 無欠交但仍有白色 → 未處理 N
- 全班綠色 → 已交齊

修正 3：統計固定 4 欄
- 全班
- 已交
- 欠交
- 未處理

修正 4：欠交／已補交區固定 4 欄卡片
- 直接在 HTML 使用 4-column grid
- 不再依賴舊 .sub-missing-row 排版
- 每卡保留：班號／原因／備註／已補交
- 手機亦固定每行 4 卡

可視確認：
新增回條／作業標題旁會顯示「v2.2.7 三態」。

Service Worker cache：v227
