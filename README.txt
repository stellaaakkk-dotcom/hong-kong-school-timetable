香港教師教學日誌整合版 v1.2.0

新增：
1. 全站第 6 款配色：「布甸狗」
   主色：焦糖啡 #B67A45
   柔和色：奶油黃 #FFF1B8

2. 今日課表：
   - 顯示「📋 今日追收」
   - 只列已到繳交／追收日期而仍有欠交學生的項目
   - 「查看全部」會打開完整作業／回條頁

3. 月曆：
   - 「＋活動紀錄」：日期／活動類別／活動名稱／備註
   - 類別會自動重用
   - 「📊 活動統計」：本月／上學期／下學期／全學年
   - 按類別顯示次數及日期，可展開查看詳情
   - Firestore：users/{uid}/calendarActivityLogs/{recordId}

4. 保留 v1.1.0：
   - 作業／回條 Firestore
   - 教學日誌功課「＋追收」

穩定性：
- 不向 React 原生 main-tabs 插入新 tab
- 不使用 MutationObserver
- 今日追收卡及活動工具均放在 React root 外層
- 以低頻掃描讀取目前頁面狀態

GitHub：
將 index.html、submission-module.js、planner-enhancements.js 上載到 repo 根目錄並覆蓋同名檔案。
automate-bridge.js 不需修改。
Firestore rules 目前 users/{userId}/** 可沿用。
