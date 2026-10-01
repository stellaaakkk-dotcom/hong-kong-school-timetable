Submission Tracker Integration v1.1.0

Upload to GitHub repo root:
1. Rename index_v110.html to index.html
2. Rename submission_module_v110.js to submission-module.js

Keep automate-bridge.js and all other files unchanged.

Includes:
- Stable floating 作業／回條 button
- Firestore sync
- 教學日誌功課欄「＋追收」
- Auto-fill date / subject / period / homework
- Duplicate prevention with「已加入 ✓」

Firestore:
users/{uid}/submissionRecords/{recordId}
