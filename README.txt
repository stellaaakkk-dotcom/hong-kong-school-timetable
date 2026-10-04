香港教師教學日誌 v2.4.25

A. 月曆教學高光
- 月曆步驟不再使用 fixed 浮動高光框去估座標。
- 改為直接在「真實 DOM 元素」本身加黃色 outline。
- 月曆主畫面：直接 outline calendar-layout。
- 日期快捷新增：直接 outline 真正可點擊的日期數字。
- 輸入後查看：直接 outline 該日期格。
- 因為 outline 跟元素本身一起縮放/移動，所以不受 mobile responsive、scroll 或 transform 座標偏差影響。
- 離開教學步驟會自動移除 outline。

B. 追收三態 bug
統一使用 submissionProgress(record)：
- 欠交 > 0：追收中・欠 N 人
- 欠交 = 0，但尚有未處理：未處理 N 人
- 只有全班全部標記為已交：已交齊
- 空/異常紀錄亦不會誤顯示「已交齊」。

已套用位置：
- 功課追收狀態
- 每日科目工作流
- 班級中心 → 追收
- 班級中心 → 總覽 → 未完成追收
