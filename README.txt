香港教師教學日誌 v2.2.8 — 第三步：Stable Class ID + Student ID

底層班級資料 schema 升級至 v2。

班別：
- id / classId 為固定識別碼
- 修改班名時 classId 不變
- 新班別建立一次 ID 後持續沿用

學生：
- 每位學生由純文字改成：
  {
    id,
    studentId,
    name,
    number
  }
- 舊純文字學生名單會自動遷移並補 studentId
- 遷移 ID 使用穩定雜湊，避免本機／雲端同一批舊資料產生不同 ID
- 重新排序：優先按姓名保留原 ID
- 同長度名單修改姓名：同位置會保留原 studentId
- 真正新增學生才會建立新 studentId

相容：
- UI 繼續只顯示姓名，不要求老師處理 ID
- 舊 classProfiles 自動遷移
- Firestore snapshot 讀到舊 schema 時會自動轉 v2 並回寫
- v2.2.7 追收三態完全保留

新增共用 API：
window.__classCoreAPI

包括：
- getClasses()
- getClassById()
- getClassByName()
- getStudents()
- getStudent()
- classIdForName()
- studentIdFor()

用途：
之後座位表、積分、功課追收可以共用同一組 classId / studentId。

Service Worker cache：v228
