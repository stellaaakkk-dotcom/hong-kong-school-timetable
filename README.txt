香港教師教學日誌 v2.5.0 — 成熟整合 V1：身份與跨學年資料層

原則
- 不重新產生現有 classId / studentId。
- studentId 永久跟學生。
- classId 代表某一學年班級實體。
- Enrollment 儲存某學生在某學年、某班、某班號的關係。

新增
1. Identity V1 Local Store
   hk-school-identity-v1
   - currentSchoolYear
   - permanent students registry
   - classInstances
   - enrollments

2. School Year
   - 自動推斷目前學年，例如 2026/27。
   - 新班別會帶 schoolYear。
   - 新 classId 加入學年資訊。
   - 同一個「3B」下學年可以建立新 classId，不會被舊 3B 吞掉。

3. Historical Student Registry
   - 現有學生自動加入永久學生庫。
   - 保存 aliases / firstSeen / lastSeen。
   - 「班別／學生中心 → 🧬 身份資料 V1」可搜尋歷史學生。
   - 可將前年／以前教過的學生勾回目前班別。
   - 沿用原本 studentId，只新增今年 enrollment。

4. Enrollment
   - schoolYear + classId + studentId + studentNo。
   - 班號每年可以不同，不寫死在永久 Student。
   - 同一 studentId 的歷史班別可以追溯。

5. Identity Audit
   - duplicate classId
   - 同一學年同 studentId 出現在多個班別
   - orphan student-linked pending
   - legacy 姓名／班號 pending
   - legacy number-only submission records

6. Class Core API v3
   新增：
   - getSchoolYear()
   - getStudentRegistry()
   - getEnrollments(studentId)
   - audit()

兼容
- 舊班級／學生資料會補 metadata，但 ID 原封不動。
- 舊追收紀錄不強行改寫，以免破壞歷史資料。
- Theme Sync / 座位 / 追收 / Profile 現有功能保留。

目前 V1 身份 store 先採 local persistence。
跨裝置身份 registry 的 Firestore service layer 留待 V2 共用資料服務處理，避免 V1 同時改太多同步架構。
