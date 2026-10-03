香港教師教學日誌 v2.4.14 — 總課表 JS 實際縮放修正

之前 v2.4.12 / v2.4.13：
- 用 CSS zoom / media query 嘗試縮總課表。
- 某些瀏覽器 / PWA / 實際 DOM 尺寸下沒有生效。

v2.4.14：
- 不再依賴 CSS zoom 縮總課表。
- JS 直接量度目前 viewport / preview-wrap 可用寬度。
- 總課表固定用 760px 文件比例，再計算：
  scale = availableWidth / 760
- 使用 transform: scale(...) 真正縮整張總課表。
- 手機 / iPad 都按實際可用寬度自動計算。
- resize / 旋轉螢幕 / 切換主要頁面時會重新計算。
- 不使用 document-wide MutationObserver。
- 會補償 transform 後的容器高度，避免下方留大量空白。
- >900px 桌面及列印會恢復原生尺寸。

教學日誌：
- 保留 v2.4.12 已成功的 responsive 顯示，不作更改。
