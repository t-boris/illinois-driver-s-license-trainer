# Plan — Illinois Driver's License Trainer v1

Source: docs/features/illinois-driver-s-license-trainer/implementation/plan.md (I-1..I-9).
Status: waiting for approval of open questions below. No code written yet.

## Records checked
Q-001..Q-007 (all answered), DEC-001..DEC-010 (all accepted), F-001..F-006 (all resolved), discussion.md, REQ-001..REQ-008, SRC-001, plan.md.

## Open items (not covered by any record)
- [x] Framework: Vite + React + TS (DEC-011)
- [x] Reviews: AI drafts, owner attests (DEC-013)
- [x] Test languages: rule found, no official list; neutral note reworded (DEC-019)
- [x] 35 questions = 15 signs + 20 rules confirmed by official workbook p.4
- [x] Pass mark 80% (28/35) and language rules verified from 92 Ill. Adm. Code 1030.80 (DEC-019)
- [x] Topic list: chapters 3-12 (DEC-016)

## Work items
- [x] I-1 external facts recorded in references/SRC-002.md
- [x] I-2 scaffold, responsive shell, RU/EN switch, vercel.json (device QA on Safari iOS/Firefox pending, I-9)
- [x] I-3 schema + build gate + runtime filter + tests (9 passing); report of stale manual versions printed by gate
- [~] I-4 sign gate + scripts/extract-sign.py + first asset R1-1 (STOP) done (DEC-014); remaining signs are extracted per the topic/question list
- [ ] I-5 Content authoring (needs reviewers)
- [x] I-6 lesson / quiz / exam screens, Show in English, per-option explanations, per-topic breakdown (verified in browser with dev fixtures)
- [x] I-7 local progress, readiness, reset, device-local notice, celebration toasts (verified: persists across reload)
- [~] I-8 client events, privacy note, api/event.ts + db/schema.sql + tests done (DEC-015); Neon project NOT created (needs owner go-ahead), VITE_ANALYTICS_URL/DATABASE_URL unset
- [ ] I-9 Copy/tone review + device QA

## Blocked / not done
- I-1: owner verifies official SOS facts (DEC-012); EXAM params in src/lib/config.ts are provisional
- I-4: official FHWA MUTCD/SHS sign library needs asset download + curation
- I-5: content drafting + owner review (DEC-013)
- I-8: analytics provider choice (open question to owner)
- I-9: copy review and real-device QA

## Added during implementation
- [x] REQ-009 / DEC-020: 'Book your exam' page with official links (verified in browser, RU)
- [x] DEC-018: Neon project illinois-license-trainer (steep-sea-81061069, aws-us-east-2) created, schema applied; owner must add DATABASE_URL to Vercel and set VITE_ANALYTICS_URL=/api/event
- [ ] I-5: draft unreviewed question bank/lessons for chapters 3-12 (DEC-016) — not started
- [ ] I-4: extract remaining signs as the bank needs them
- [ ] I-9: copy review, real-device QA (Safari iOS, Firefox)
- [ ] Vercel project link + first deployment; commit

## Content drafting status (DEC-013, DEC-016, DEC-021, DEC-022)
- [x] Drafts in content-drafts/ (unreviewed, no review records): ch03, ch04, ch05, ch06, ch07, ch08, ch10, ch11, ch12 lessons + questions; 77 glossary terms
- [x] Independent fact-check against the manual for all of the above (fixes applied in place)
- [x] ch09 signs drafted (lesson, 30 cards, 22 questions); 30 official signs extracted into signs/ and visually checked on a contact sheet; fact-check agent running
- [ ] Owner review: run scripts/promote-draft.mjs after reviewing (adds RU/EN review records, moves to content/)
- [x] REQ-010 UI sections: Learn, Signs, Terms, Practice, Exam, Book (verified with fixtures)

## Open
- [ ] REQ-005: most questions/lessons still have no image — needs an AI image generator (not chosen in the spec: overview 'Dependencies') — ask owner
- [ ] Owner review + promote (content/ is empty, production bank empty until then)
- [x] Safari engine: WebKit (iPhone 13 emulation + desktop) via Playwright, 12 flows each (hub, RU/EN, signs, terms search, quiz with Show in English, sign quiz image, exam 35 q, book links, privacy, progress persistence) all pass, no console errors
- [ ] Firefox: headless launch fails in this sandbox, so Firefox is unverified; real iOS/Android devices not tested

## Deployment (DEC-024)
- [x] Vercel project illinois-license-trainer linked; production deployed: https://illinois-license-trainer.vercel.app (HTTPS, 200; empty bank, gate working)
- [x] api/event verified live: 204 good event, 400 bad, 405 GET (no DATABASE_URL yet => counters not stored)
- [ ] Owner: add DATABASE_URL (Neon project steep-sea-81061069) in Vercel; preview env var VITE_ANALYTICS_URL not set (only production)
- [ ] Owner: choose/provide AI image generator (DEC-023)
- [ ] Owner: review drafts and run scripts/promote-draft.mjs, then PR
- Not pushed to GitHub; Vercel is connected to t-boris/illinois-driver-s-license-trainer (pushes will auto-deploy)

## Images (DEC-027) — pipeline ready, generation waits for the owner's OPENAI_API_KEY
- [x] images/manifest-a.json (81) + manifest-b.json (64): scene prompts + bilingual alt for every lesson and every question without an official sign image; no signs/signals as subject (lint-enforced); spoiler-prone prompts neutralised
- [x] scripts/generate-images.mjs (OpenAI image API, WebP, patches content items), --dry-run verified (145 would generate)
- [ ] Owner: export OPENAI_API_KEY and run `node scripts/generate-images.mjs --limit 5` (cost check), then without --limit; review images (esp. ch04 school zone/railroad, ch10) for stray signs
