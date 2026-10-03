香港教師教學日誌 v2.4.13 — 總課表真正縮窄修正

v2.4.12 問題：
- 教學日誌已縮窄，但總課表冇縮。
- 原因：總課表實際 React DOM 係：
  .preview-wrap > .paper.integrated-master
  並不存在 .master-stack wrapper。
- 上一版 CSS 針對 .master-stack > .paper，所以總課表完全冇套到縮放。

v2.4.13 修正：
- 直接針對 .integrated-master。
- 手機／iPad 按裝置寬度縮放整張總課表。
- 保留原本 760px 文件比例，欄位唔會被硬壓變形。
- 教學日誌維持上一版縮放。
- 教師／班級設定區維持緊湊版。
- 保留 browser 雙指 pinch zoom。
- 列印恢復 zoom 1。
