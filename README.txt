香港教師教學日誌 v2.0.4 — 修正「其他班別／自行輸入」無法選擇

原因：
v2.0.3 在班別下拉選單 change 後會重建 options，
而 __custom__ 被當成沒有選擇，所以立即 fallback 到最近使用的正式班別。

修正：
- 選擇「其他班別／自行輸入」後保持 __custom__ 狀態
- 即時顯示「其他班別」文字輸入欄
- refresh 時不會再跳回 active class
- 已輸入的自訂班別文字會保留
- 新增待辦及修改待辦兩邊同時修正
- 自訂班別仍然只寫入 scopeName，不加入正式 classProfiles

Service Worker cache：v204
