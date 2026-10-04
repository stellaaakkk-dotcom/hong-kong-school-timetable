香港教師教學日誌 v2.5.7 — V1 最終配色修正版
更新日期：2026-10-04

本版修正
========
1. 修正「班別／學生中心 → ＋ 新增班別」按鈕仍維持紫色。
2. v2.5.6 只透過 CSS theme token 覆蓋，在實際班級中心樣式層仍可能被其他規則蓋過。
3. v2.5.7 改為：
   - 每次共享主題同步時，直接把當前 theme accent 寫入「＋ 新增班別」按鈕；
   - 班級中心首次建立時亦立即套用；
   - 使用 !important inline style，避免其他舊 CSS 規則蓋過。
4. 切換布甸狗／薄荷／晴空／莓果／紫藤／黑白時，按鈕應即時同步。

上載檔案
========
網站執行檔共 7 個：
- index.html
- planner-enhancements.js
- submission-module.js
- seat-score-integrated.html
- firebase-bootstrap.js
- sw.js
- version.json

README.txt 只供版本核對，不必上載。

驗證
====
1. 上載／覆蓋 7 個執行檔。
2. 班別／學生中心應顯示 v2.5.7。
3. 布甸狗主題下「＋ 新增班別」應為同系啡色，不再紫色。
4. 切換另一主題，再打開班別／學生中心，按鈕應跟主題轉色。

V1 狀態
=======
此修正通過後，Identity / Cross-year Data V1 可正式收尾。
