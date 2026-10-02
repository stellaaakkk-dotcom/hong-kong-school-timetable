香港教師教學日誌 v1.7.2 — 穩定性修正版

修正 1：浮動地台／更多入口消失
- 修正 CSS 後段把 desktop More 再次 display:none 的衝突。
- 手機 ≤700px：固定底部導覽一定顯示。
- iPad 701–1100px：右側快捷列一定顯示。
- 電腦 >1100px：右下角「••• 更多」一定顯示。

修正 2：雲端一直停在「連接中」
- 原本第一次 Firebase/Auth 未 ready 就會停止，不會再試。
- 現在第一次未成功會自動每隔約 2.5–3 秒重試。
- snapshot 連線失敗亦會自動重新連接。
- 網絡恢復後會主動重新連 Firebase。
- 待辦 Firestore listener 亦加入 unsubscribe，避免重新連線後重複 listener。

修正 3：UI 不再等雲端
- 浮動地台／iPad 快捷列／電腦 More 會先顯示。
- Firebase 慢或暫時離線，不會令操作介面一齊消失。

沒有新增其他功能；v1.7.1 功能全部保留。

GitHub 請覆蓋：
index.html
planner-enhancements.js
sw.js

submission-module.js 無功能修改。
