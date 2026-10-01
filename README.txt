香港教師教學日誌 v1.3.0

新增：
1. PWA 新版本提示
   - 偵測 service worker 更新
   - 顯示「有新版本 → 立即更新」

2. Firestore 同步狀態
   - ⟳ 連接中／同步中
   - ☁ 已同步
   - ⚠ 離線暫存

3. 今日工作台
   - 目前進行課節（由今日課表讀取）
   - 今日追收
   - 今日活動紀錄
   - 快捷查看追收／新增今日活動

4. 教學日誌搜尋
   - 搜尋日期、教學進度、功課
   - 目前載入週亦可配合科目名稱搜尋
   - 最多顯示 100 筆結果

5. 活動紀錄匯出
   - 活動統計可匯出 CSV
   - 可列印／另存 PDF

保留：
- 布甸狗全站配色
- 作業／回條 Firestore
- 教學日誌「＋追收」
- 月曆活動紀錄與統計

穩定性：
- 不修改 React 原生 main-tabs
- 不使用 MutationObserver
- enhancement UI 全部掛在 React root 外層

GitHub：
覆蓋／上載以下三個檔案到 repo 根目錄：
- index.html
- submission-module.js
- planner-enhancements.js

automate-bridge.js、sw.js、Firestore rules 暫時毋須修改。
