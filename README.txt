香港教師教學日誌 v2.4.17

修正 1：教師／班級資料輸入框高度
- 上一版誤將「縮短」理解為縮窄 width。
- 今次直接強制四個 input 高度：
  height/min-height/max-height = 38px
- 學校名稱、任教班別、教師姓名、學年及學期全部變回正常單行文字框。
- 手機 width 約 165–180px；iPad 約 210px。

修正 2：全站底部浮動地台安全位
- 不再逐頁加 margin/padding。
- 改用 body::after 全站共用 spacer。
- 手機：150px + safe-area-inset-bottom。
- iPad：72px。
- 今日課表／月曆／總課表／日誌全部都會有同一個底部可捲空白位。
- 浮動導覽列不再遮最後內容。
- 列印時 spacer 自動隱藏。

保留：
- v2.4.14 總課表 JS 自動縮放。
- 日誌 responsive 顯示。
