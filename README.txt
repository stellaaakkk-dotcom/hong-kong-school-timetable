香港教師教學日誌 v2.7.9 — PWA 浮台根源修正
更新日期：2026-10-08

真正根因
========
v2.7.8 已能辨認 standalone PWA，
但舊有 forceNavVisibility() 每 1.8 秒會由 uiTick() 再執行一次。

舊函數只按 viewport width：
- <=700：手機浮台
- 701–1100：iPad 浮台
- >1100：桌面 More

而且用 inline !important。
因此 PWA standalone / iPad mode 的 CSS 即使成功顯示浮台，
之後仍會被 forceNavVisibility() 強制覆蓋／隱藏。

v2.7.9 修正
============
forceNavVisibility() 改成優先順序：

1. 真正 iPad
   → 強制右側 5 粒浮台

2. standalone PWA（Android／iPhone）
   → 強制底部 5 粒浮台

3. 普通瀏覽器
   → 最後先依 viewport width 決定

因此 uiTick 每 1.8 秒再執行都唔會將 PWA 浮台收走。

PWA 手機
========
☀ 今日｜📝 日誌｜📅 月曆｜📋 追收｜••• 更多

iPad
====
右側同樣保留 5 粒。

其他功能
========
同步、Submission、Pending、iPad More、V2.5 診斷全部保留。

部署
====
7 個執行檔 + README.txt。
