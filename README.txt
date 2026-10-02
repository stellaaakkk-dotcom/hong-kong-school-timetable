香港教師教學日誌 v2.1.9 — 加固＋Inbox 狀態記憶

1. Inbox 狀態記憶
會保存並回復：
- 時間 filter：全部／今日／逾期
- 工作範圍：個人／班別／年級／科組／全校／其他
- 具體班別
- 年級／科組／其他第二層名稱
- 類型：待辦／追收

localStorage：
hk-school-inbox-view-state-v1

2. 統一錯誤保護
新增 safeRenderModule：
- 工作 Inbox
- 課堂工作流
- 班級中心（如該版本有）
- 今日工作台部分入口

若單一模組 render 失敗：
- 顯示錯誤區塊
- console 保留錯誤
- 其他模組繼續可用
- 避免「撳咗完全冇反應」

3. v2.1.8 每日科目工作流核心保持不變。

Service Worker cache：v219
