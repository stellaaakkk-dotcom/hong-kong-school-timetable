香港教師教學日誌 v2.1.0

課堂工作流
- 新增「📘 今堂課堂／科目」
- 直接顯示 timetable resolver 的課堂名稱，例如中文、常識、數學等
- 保留上次進度、上次功課、今堂進度、今堂功課、追收狀態

工作 Inbox
- 完全移除舊 quickFilter
- 改成單一狀態模型：
  1. statusFilter：全部／今日／逾期
  2. scope：個人／班別／年級／科組／全校／其他
  3. type：待辦／追收
- chips 與下拉選單控制同一份狀態，不再互相覆蓋
- 班別 scope 才會啟用具體班別下拉
- 年級／科組／其他等均可獨立篩選

Service Worker cache：v210
