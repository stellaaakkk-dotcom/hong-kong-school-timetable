香港教師教學日誌 v2.4.33

修正 1：Theme Sync 甩色
- 每日科目工作流：科目／班別選擇 active 按鈕改跟主題 accent。
- 工作流未選按鈕亦改跟主題 soft / text / line。
- 待處理／追收：全部／今日／逾期／個人／班別等 active chip 改跟主題 accent。
- 座位／積分底部浮台：active tab 不再用獨立 --primary 藍色，統一用 --accent。
- 座位模組 applyParentTheme 同時設定 --primary，兼容仍使用舊變數的元件。
- 座位模組 soft button / 小組分數藍色亦改跟主題。

修正 2：待處理中心漏「未處理功課」
舊邏輯：
- 只有 missing.length > 0 的 submission record 才加入待處理／追收。
- 因此「欠交 0，但仍有未處理學生」完全不顯示。

新邏輯：
- 使用統一 submissionProgress(record) 三態。
- 只要不是已交齊，就加入待處理／追收。
- 同時顯示：
  已交 X｜欠交 Y｜未處理 Z
- 已交齊的紀錄不顯示。
- 例如全班 25 人、未開始處理：
  已交 0｜欠交 0｜未處理 25

其他功能及資料結構不改。
