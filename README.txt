修復版 v1.0.1

修正：
- 移除會造成 DOM 無限重畫的 MutationObserver 行為
- 只在作業／回條 tab 或今日追收卡被主程式移除時才補回
- 今日追收內容沒有改變時不再重寫 DOM
- tab 切換改用單一 delegated click listener，避免重複綁定事件

上載：
1. 用本包 index.html 覆蓋 GitHub repo 根目錄的 index.html
2. 用本包 submission-module.js 覆蓋舊版 submission-module.js
3. automate-bridge.js 不需修改
4. Firestore rules 不需修改

如 GitHub Pages / PWA 仍顯示舊版，請重新整理或清除網站快取後再測試。
