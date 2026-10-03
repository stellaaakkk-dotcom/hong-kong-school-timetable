香港教師教學日誌 v2.4.11 — 教學模式重開仍彈出的根本修正

真正原因：
- 舊版在 ONBOARDING_KEY 宣告之前就呼叫 maybeOpenOnboarding()。
- 因為 const 尚未初始化，第一次檢查會拋出 ReferenceError。
- catch fallback 會直接打開教學，因此每次重開網站都會彈出。

修正：
- 移除過早的 maybeOpenOnboarding() 呼叫。
- 改為等 ONBOARDING_KEY、ONBOARDING_STEP_KEY、所有 onboarding functions 都完成初始化後，先執行 maybeOpenOnboarding()。
- 保留 device seen 邏輯：
  hk-school-onboarding-device-seen = 1
- 第一次自動顯示前即寫入 seen。
- 之後同一個 origin/device 重開網站，不會再自動彈。
- More／設定 → 使用教學仍可手動重播。

注意：
- 如果手動清除網站資料 / localStorage，系統會視為首次使用。
