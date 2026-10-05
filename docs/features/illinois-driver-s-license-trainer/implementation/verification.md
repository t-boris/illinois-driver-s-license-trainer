# Verification of the implementation against the specification

Checked on 2026-10-04 against: overview.md, discussion.md, questions Q-001..Q-007 (answered), decisions DEC-001..DEC-028 (accepted), findings F-001..F-006 (resolved), requirements REQ-001..REQ-010, references SRC-001/SRC-002, plan I-1..I-9. Method: unit tests (39), the build gate on valid and invalid content, Playwright flows in WebKit (iPhone 13 emulation and desktop), a Chromium-based browser, and the live deployment. "Owner" marks what only the owner can do.

| Req | Result | Evidence / what is open |
|---|---|---|
| REQ-001 Bilingual UI/content | Met | UI strings are typed per language; the gate requires RU and EN for every item and image alt. Switch is in the header on every screen; switching mid-quiz keeps the answered state (flow test). "Show in English" shows only in Russian and stacks above the answer controls; image and options stay visible. |
| REQ-002 Responsive | Met except Firefox | No horizontal overflow at 360px on all 11 screens in RU and EN; all links/buttons at least 44px; desktop uses a 3-column hub. Safari engine (WebKit) and Chromium pass. Firefox could not be launched in the sandbox and real iOS/Android devices were not tested (owner). |
| REQ-003 Exam preparation | Met in the app (drafts published as labelled beta, DEC-031); human review open | Lesson → quiz → simulation; per-option explanations; completion tick; topics = chapters 3-12 (DEC-016); simulation draws 15 sign + 20 rule questions, pass 80% (92 Ill. Adm. Code 1030.80); bank covers the exam pools and every topic quiz (`npm run bank`); content stored as files with section reference, manual version, RU/EN review records enforced by the build gate; stale manual versions are listed by the gate; language note and no English-only claim. Open (owner): no item has review records yet; the drafts are published only as a labelled beta (DEC-031) until promoted to `content/`. |
| REQ-004 Tone | Met in the app; human copy review open | Encouraging hint on wrong answers (amber, never red); celebrations on topic completion, readiness and passed simulation (topic celebration flow-tested); no streaks/badges/trophies; scans for shaming wording and English-only claims clean; RU explanations carry the English term. Open (owner): human tone review of the copy. |
| REQ-005 Image-rich content | Met in beta; owner image review open | Sign images: 29 official FHWA assets with source metadata, visual check, gate-enforced, Interstate Shield excluded; public-domain status recorded (SRC-002). Scene images: 145 generated with the OpenAI image API (every lesson and every question without an official sign image), bilingual alt text, WebP about 65 KB each, cached and served with cache headers; reviewed on contact sheets and 34 regenerated after stray AI-drawn boards and signals were found (DEC-029). Open (owner): your own look at the images. |
| REQ-006 Vercel | Met | Production build deploys from the repo; HTTPS URL https://illinois-license-trainer.vercel.app; the build runs the gate; missing section reference or review record fails the build (unit tests and CLI on invalid fixtures); an empty or complete bank passes. Preview deployments work, but the preview environment lacks VITE_ANALYTICS_URL (only production has it). |
| REQ-007 Progress and readiness | Met | Per-topic progress, weak topics, readiness only when every topic meets the threshold and a simulation is passed (flow test); persists across reload; device-local notice and an explicit reset (flow-tested). |
| REQ-008 Analytics | Met | /api/event stores aggregate counters in Neon (day, kind, topic, item, count), no identifiers, no cookies, no banner; privacy note RU/EN; failures are dropped silently; verified live (204 / 400 / 405 and stored counts). Maintainers read the counters with SQL; there is no dashboard. Test rows (topic "test") exist and can be deleted by the owner. |
| REQ-009 Exam scheduling | Met | Bilingual "Book your exam" page with official links and steps (from the SOS Appointments page); no booking in the app. |
| REQ-010 Separate sections | Met | Learn, Signs, Terms, Practice, Exam simulation and Book your exam are separate entries on the home screen; Signs and Terms do not affect readiness. |

## Decisions applied
DEC-001..DEC-028 are reflected in the code, the content workflow and the deployment; DEC-017 was amended by DEC-019 (pass mark verified), DEC-024 by DEC-025 (assistant sets DATABASE_URL), DEC-023 by DEC-027 (OpenAI image API).

## Open items that need the owner
1. Review the drafts in content-drafts/ and promote them with `scripts/promote-draft.mjs` (adds the RU/EN review records).
2. Look at the generated scene images (reviewed and corrected once, DEC-029).
3. Firefox and real-device checks; the Chrome "Dangerous site" warning on the vercel.app address (report submitted to Google, DEC-030).
4. Optional: delete the test counters (topic "test") from Neon.

## Spec records re-read for this verification (2026-10-04)
- Questions Q-001..Q-007: all `answered`, each resolved by DEC-001..DEC-006 (Q-002 and Q-005 by DEC-002).
- Findings F-001..F-006: all `resolved` (F-001 by DEC-007, F-003 by DEC-008, F-004 by DEC-009, F-005 by DEC-010; F-002 and F-006 resolved in place and applied to REQ-004 and the overview).
- Decisions DEC-001..DEC-029: all `accepted`. Requirements REQ-001..REQ-010: all `approved`.
- discussion.md: every owner answer during implementation is recorded (entries 1-10), each pointing to its decision (DEC-011..DEC-029).
- Defects reported by the owner during implementation (unreadable lessons, quiz changing its question) are fixed, not specification changes; lessons are in tasks/lessons.md.

## Live check of the beta deployment (2026-10-04, WebKit iPhone 13 emulation)
https://illinois-license-trainer.vercel.app: beta banner; progress bar with 10 topics plus the exam; exam tile enabled; Learn lists 10 topics; a lesson shows its illustration, 7 section headings, 28 bullets and a Draft tag; Signs 29; Terms 77; the chapter 12 quiz runs 8 distinct questions to the end; the exam starts at 35 questions; /api/event returns 204; no console errors. Unit tests: 41 passing; the strict gate on content/ and the draft gate on content-drafts/ both pass; the bank report has no FAIL line.
