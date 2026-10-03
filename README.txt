香港教師教學日誌 v2.4.16

1. 教師／班級資料打字框
- 今次唔再用泛用 .panel label input selector。
- 直接喺 React markup 為四個欄位加 class：
  identity-school
  identity-class
  identity-teacher
  identity-term
- 手機：約 150–165px
- iPad／平板：約 200px
- 所以唔會再被其他 input CSS 撐返滿闊。

2. 浮動地台遮住底部
- 手機 body 底部安全位增加至約 118px + safe-area。
- workspace 額外加 92px 底部 padding。
- 課表／月曆／日誌／今日課表主要內容再加底部 margin。
- 捲到最底時，最後一行內容應該可以完整移到浮動導覽列上方。
- iPad 亦加少量底部空白。

3. 保留
- v2.4.14 總課表 JS 自動縮放。
- 教學日誌 responsive 縮放。
- 教學模式同一裝置只自動顯示一次。
