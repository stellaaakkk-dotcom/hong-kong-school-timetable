香港教師教學日誌 v2.5.3 — V1.2 PWA／版本更新硬化

目的
- 直接開原本網址亦應自動取得最新版本。
- 不再依賴使用者手動加 ?v=xxxx。

新增
1. version.json
   - 最新 build：2.5.3
   - 每次檢查使用 ?ts=時間戳 + cache:no-store。

2. index.html Freshness Guard
   - 首次載入檢查版本。
   - pageshow / BFCache 返回時再檢查。
   - App 從背景回到前景時再檢查。
   - 發現目前 build 落後會自動 location.replace 到帶 v 參數版本。
   - 用 sessionStorage 防止 reload loop。

3. Service Worker
   - cache：hk-teacher-journal-pwa-v2530
   - version.json 永遠 network-only。
   - navigation fetch 使用 cache:no-store。
   - 新版 planner/submission/seat 維持 network-first。
   - 建議 registration 使用 updateViaCache:'none'（若原 index 有標準 register 句式會自動替換）。

4. Compatibility physical files
   - v2500 / v2510 / v2520 舊 physical filename 亦覆蓋為最新程式。
   - 即使舊 index 暫時出現，都會盡量取得 v2.5.3 邏輯。

驗證
A. 上載全部檔案。
B. 關閉目前 tab。
C. 直接用原本網址打開，不加 ?v=。
D. 「班別／學生中心 → 身份資料 V1」應顯示 build 2.5.3。
E. 如果將來再部署新版本，只需更新 version.json build，舊畫面會自動偵測並跳到新版本。
