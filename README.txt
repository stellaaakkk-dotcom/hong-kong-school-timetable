香港教師教學日誌 v2.4.10 — 教學模式同一裝置只自動顯示一次

修正邏輯：
- 舊版：完成／略過／關閉教學後先標記已完成。
- 新版：第一次準備「自動顯示」教學時，立即寫入 device seen 標記。
- 因此即使：
  • 教學未完成就關閉 App
  • 中途 refresh
  • 中途離開頁面
  下一次打開都不會再自動彈出。

裝置標記：
hk-school-onboarding-device-seen = 1

兼容：
- v2.4.9 的 hk-school-onboarding-device-done = 1 會自動轉為 seen。
- 舊版 hk-school-onboarding-v*-done = 1 亦會視為已睇過。

手動教學：
- More／設定 → 使用教學仍然可以隨時手動重播。
- 手動重播不會令之後再次自動彈出。

如果瀏覽器／PWA 主動清除網站儲存資料，裝置標記亦會一併被清除，屆時會被視為首次使用。
