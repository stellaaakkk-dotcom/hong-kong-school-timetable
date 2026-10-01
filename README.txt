穩定版 v1.0.2

今版以「不干擾原 React 課表」為首要目標：
- 不再把按鈕插入 .main-tabs
- 不再隱藏或修改 .workspace
- 完全移除 MutationObserver
- 暫時移除當日課表內嵌「今日追收」卡
- 改為右下角獨立「📋 作業／回條」浮動按鈕
- 撳開後顯示全頁 overlay，關閉後返回原課表
- Firestore 功能保留

GitHub：
1. index.html 覆蓋原檔
2. submission-module.js 覆蓋原檔
3. automate-bridge.js 不需修改

如果今版課表 tabs 回復正常，之後再以安全方式逐步加「教學日誌 → 加入追收」。
