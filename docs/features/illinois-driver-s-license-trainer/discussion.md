# Discussion — Illinois Driver's License Trainer

### Answer to Q-001 · 2026-10-05

Откуда берётся учебный контент (вопросы, правила, объяснения)?

A. Составить вопросы вручную/с помощью ИИ строго по официальному Illinois Rules of the Road, с ручной проверкой.

### Answer to Q-002 · 2026-10-05

Как выглядит основной путь обучения пользователя?

B. Уроки по темам (с картинками) → квиз по теме → симуляция экзамена, с прогрессом по темам.

### Answer to Q-003 · 2026-10-05

Кто основная аудитория первой версии?

A. Русскоязычные взрослые иммигранты в Иллинойсе, сдающие на права впервые или переоформляющие.

### Answer to Q-004 · 2026-10-05

Нужны ли пользователям аккаунты и сохранение прогресса между устройствами?

A. Без аккаунтов: прогресс хранится только в браузере устройства.

### Answer to Q-005 · 2026-10-05

Что считать «максимально подготовленным» — какой измеримый критерий готовности показывать пользователю?

B. Покрытие тем: по каждой теме достигнуть порога правильных ответов + сдать симуляцию.

### Answer to Q-006 · 2026-10-05

Как русскоязычный пользователь должен видеть английские формулировки — ведь на реальном экзамене они, скорее всего, будут на английском (пре

B. Переключатель языка + в квизах и симуляции кнопка «показать на английском» (оригинал вопроса рядом с переводом).

### Answer to Q-007 · 2026-10-05

Нужна ли в v1 анонимная аналитика использования (какие темы проходят, где ошибаются чаще всего)?

B. Анонимная агрегированная аналитика без cookie-согласий (просмотры страниц, результаты по темам без идентификации пользователя).

### AI updated the requirements · 2026-10-05

DEC-001, DEC-002, DEC-003, DEC-004, DEC-005, DEC-006 written into REQ-003, REQ-004.

### AI updated the requirements · 2026-10-05

DEC-007, DEC-008, DEC-009, DEC-010, F-002, F-006 written into REQ-003, REQ-004, REQ-005, REQ-006, the overview.

### Answers during implementation · 2026-10-04

Stack: Vite + React + TypeScript (DEC-011). Test languages: owner verifies on the official SOS page, assistant records (DEC-012). Content bank: AI drafts, owner or designee reviews (DEC-013).

### Answers during implementation (2) · 2026-10-04

Sign assets: crop official FHWA drawings and strip annotations (DEC-014). Analytics: own Vercel function writing aggregate counters to Neon (DEC-015). The owner supplied dsd_ds9.pdf (Review Course workbook); it confirms 35 questions = 15 signs + 20 rules (SRC-002) but is not the full manual and gives no pass mark or languages.

### Answers during implementation (3) · 2026-10-04

Topics: chapters 3-12 of the 2026 manual, excluding 1, 2 and 13 (DEC-016). Pass mark 28/35 and the neutral language note stay provisional (DEC-017). Neon project may be created (DEC-018).

### Answers during implementation (4) · 2026-10-04

Owner: "Find the documentation yourself", "You can open browser". The assistant verified the pass mark and the language rules in 92 Ill. Adm. Code 1030.80 (DEC-019, SRC-002).

### Answers during implementation (5) · 2026-10-04

Owner: "Include links and instructions for scheduling the exam". Recorded as DEC-020 and REQ-009: informational page with official links; in-app booking stays out of scope.

### Answers during implementation (6) · 2026-10-04

Owner: the app should have separate sections — learning, tests, signs, terms and the rest — so it is a real learning application, not only tests and exams. Recorded as DEC-022 and REQ-010.

### Answers during implementation (7) · 2026-10-04

Images: the owner supplies the generator and key (DEC-023). Commit and deploy to Vercel approved (DEC-024).

### Answers during implementation (8) · 2026-10-04

DATABASE_URL: the assistant sets it (DEC-025). Push main to GitHub approved (DEC-026). Image generator: OpenAI image API (DEC-027).

### Answers during implementation (9) · 2026-10-04

Owner: make the app more attractive and modern; then "terrible UI" (screenshot of an unbroken lesson text). Recorded as DEC-028.

### Answers during implementation (10) · 2026-10-04

Owner: "Where are the images?", "The key is in my clipboard", "I hope that you'll cache images" — recorded as DEC-029 (images generated once and cached; key kept in a git-ignored file). Owner asked for the new version to be deployed now and for the Vercel URL: deployed to https://illinois-license-trainer.vercel.app (DEC-024). Owner reported the quiz as not working: a defect (questions were reshuffled on every re-render), fixed and covered by an end-to-end check; no specification change.
