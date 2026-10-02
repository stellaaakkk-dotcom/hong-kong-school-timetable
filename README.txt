香港教師教學日誌 v2.0.9 — 關鍵操作事件加固版

重點：
- 課堂工作流／工作 Inbox 改用 document-level event delegation 作保險
- 不再完全依賴 More menu 建立時的 click handler
- openWorkflow / openInbox 先顯示 modal，再 render
- render 出錯時顯示可見錯誤提示，不再「完全無反應」
- Inbox chips、scope、type、class change 使用事件委派，重新 render 後仍有效
- v2.0.8 scope / custom class / class center 功能全部保留

Service Worker cache: v209
