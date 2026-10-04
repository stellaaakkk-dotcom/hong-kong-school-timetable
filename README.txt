香港教師教學日誌 v2.4.30 — 追收模組快取根因修正

真正原因：
- index.html 一直固定載入 submission-module-v227.js?v=227。
- 所以前幾版即使修改咗追收／布甸狗 UI 顏色，PWA 仍可能直接使用舊 v227 快取。
- planner-enhancements 每版都有新檔名，所以其他 planner 改動會生效；submission module 則唔一定。

修正：
1. 新實體追收模組：
   submission-module-v2430.js?v=2430
2. index.html 改為直接載入新檔名。
3. Service Worker 將 submission-module-v2430.js 加入 network-first live module。
4. PWA cache bump 至 v2430。
5. 保留目前想要嘅配色：
   主啡 #9b6a3f
   次／文字啡 #80542f
   柔和米白 #f8f1e6 / #faf7f2
6. 班級中心維持 v2.4.29 強制 v2.4.26 原本啡色設定。
