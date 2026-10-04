香港教師教學日誌 v2.5.1 — 成熟整合 V1.1
永久學生庫清洗＋真實學生升格規則

修正：
1. 01 / 02 / 03... 純班號 placeholder 不再加入永久 Student Registry。
2. v2.5.0 已誤加入永久 Registry 的純班號學生會自動清除。
3. placeholder enrollment 仍保留在班級關係層，標示 provisional=true。
4. 因此：
   - 班級 roster 不會被刪
   - studentId 不會改
   - 座位／積分／追收連結不會受影響
5. 當 01 改成「陳小明」：
   - 沿用原本 studentId
   - 自動加入永久 Student Registry
   - 從嗰一刻開始可以作為歷史學生跨學年重用
6. Audit 將「暫時班號名單」獨立列出，但不計入永久學生數。
7. Audit 判斷 orphan student link 時仍會承認 provisional roster studentId，避免誤報。

測試預期：
- 原本「永久學生 80」若 80 位全部仍是 01/02/03 placeholder，更新後應變成 0。
- Enrollment 仍然保留。
- 歷史學生庫不再列出一堆「01」。
- 將任一 placeholder 改成真實姓名並儲存後，永久學生數會增加 1，且 studentId 不變。
