香港教師教學日誌 v2.8.1 — 追收「未能追收」狀態
更新日期：2026-10-08

修正內容
========
欠交學生原本只有「已補交」處理。

現在每位欠交學生提供兩個處理選項：
- 已補交
- 未能追收

「未能追收」的行為
==================
1. 學生仍然保留在欠交名單，不會當成已交。
2. 欠交卡會顯示「已標記：未能追收」。
3. 欠交摘要會額外顯示「未能追收 X 人」。
4. 再按一次「未能追收」可取消標記，恢復一般待追收狀態。
5. 之後按「已補交」，會自動清除「未能追收」標記。
6. 會在 studentHistory 留下 unable-to-collect / resume-followup 紀錄。

資料結構
========
沿用 existing missingMeta，只新增：
- collectionStatus: "unable"
- unableAt: ISO datetime

不改現有 missing / submitted / pending 三態邏輯。

其他
====
沿用 v2.8.0：
- 活動統計快速新增
- 版本顯示／新版提示
- PWA 浮台修正
- iPad More
- 離線同步
- V2.5 診斷

部署
====
7 個執行檔 + README.txt。
