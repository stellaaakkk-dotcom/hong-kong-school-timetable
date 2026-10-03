香港教師教學日誌 v2.4.9

1. 學生人數輸入
- 「未建立名單」改成獨立建立區。
- 一定顯示可輸入的「全班人數」＋「產生班號名單」。
- 強制移除 disabled / readonly，恢復 pointer events。
- 班別 record 已存在但學生 = 0，仍然可以輸入人數。
- 輸入 30 → 自動產生 01–30 → 儲存。
- 有學生後才切換成「改姓名／重建名單」。

2. 教學模式只自動出現一次
- 固定使用 hk-school-onboarding-device-done。
- 版本更新不會再因 key 改名而重新彈出。
- 任何舊版 hk-school-onboarding-v*-done = 1 都會自動遷移為已完成。
- More／設定 → 使用教學仍可手動重播。
