香港教師教學日誌 v2.4.32 — Theme Sync Phase 1

目標：
主畫面揀色後，共用主題同步到：
- 班級中心
- 今日工作台／planner enhancement UI
- 作業／回條追收系統
- 座位／積分系統

支援 6 套主題：
薄荷、晴空、莓果、紫藤、黑白、布甸狗。

實作：
1. 主系統仍以 React main 的 --accent / --soft 為唯一主題來源。
2. planner 讀取目前主題並建立共用 Theme Token：
   accent / secondary / soft / soft2 / text / line / bg
3. 追收系統：
   window.__submissionThemeAPI.applyTheme(theme)
   重新注入其既有 CSS，不改功能。
4. 座位／積分 iframe：
   parent 以 postMessage({type:'hk-theme-sync', theme}) 傳送。
   iframe 將 accent / accent2 / line / bg 套入原有 CSS variables。
5. 主畫面每次按 palette 圓點都即時同步。
6. 開啟座位表、座位 iframe ready、開學生 Profile 時亦會再同步一次。
7. 本機保存 hk-school-theme-sync-v1 / hk-school-seat-theme-v1，重開時可先使用上次主題。

布甸狗沿用已確認成功：
#9B6A3F / #A87446 / #80542F / #FFF9EF

Phase 1 只統一配色，不改各模組版面、按鈕位置或功能。
