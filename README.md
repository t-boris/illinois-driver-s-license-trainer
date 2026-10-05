# Illinois Driver's License Trainer

A bilingual (Russian/English) web application that prepares users for the Illinois driver's license written knowledge test. It works equally on phones and desktops, uses an upbeat, playful tone and a large amount of (generated) imagery, and aims to get the user as ready as possible for the real exam. Hosted on Vercel.

## Problem

People preparing for the Illinois written driving test — in particular Russian speakers who may not be fully comfortable with English-only materials — face dry official manuals and uninspiring quiz sites. There is no fun, visual, mobile-friendly bilingual trainer that systematically brings them to exam readiness.

## Scope

IN (v1): Russian/English UI and content with language switching; responsive web app (mobile + desktop); study content covering Illinois rules of the road and road signs; practice/quiz mode and an exam-simulation mode modelled on the real Illinois test; playful, positive tone, illustrations/images throughout; deployment on Vercel.
OUT (v1, inferred — to be confirmed): road (driving) test preparation, DMV appointment booking, other US states, paid plans/monetisation, native mobile apps, offline mode, social features.

## Specification

The confirmed brief, decisions and requirements are in [`docs/features/illinois-driver-s-license-trainer/`](docs/features/illinois-driver-s-license-trainer/overview.md). Open this folder in MarkView to continue them.

### Requirements

- REQ-001 Bilingual UI and content (RU/EN)
- REQ-002 Responsive mobile and desktop experience
- REQ-003 Exam preparation covering the Illinois written test
- REQ-004 Playful, positive tone
- REQ-005 Image-rich content
- REQ-006 Deployed on Vercel
- REQ-007 Per-topic progress and readiness indicator (local, no accounts)
- REQ-008 Anonymous aggregated usage analytics with privacy note

## Development

```
npm install
npm run dev                         # app with reviewed content only (content/)
VITE_SHOW_DRAFTS=1 npm run dev      # also loads unreviewed AI drafts (content-drafts/) for review; dev only
npm test                            # unit tests (content gate, analytics event model)
npm run validate                    # build gate: every item in content/ and signs/ must be complete and reviewed
npm run bank                        # question-bank coverage report (use: node scripts/bank-report.mjs content-drafts)
npm run build                       # runs the gate, then type-checks and builds (this is the Vercel build command)
```

### Content workflow (DEC-013, DEC-021)

1. AI drafts live in `content-drafts/<topic>/` with no review records.
2. The owner or a designee reads them in the app (`VITE_SHOW_DRAFTS=1`), checks them against the Rules of the Road in RU and EN, then runs
   `node scripts/promote-draft.mjs content-drafts/<topic> --reviewer-ru "Name" --reviewer-en "Name"` and opens a pull request. Run it only after a real review.
3. The build gate fails if anything in `content/` lacks a section reference, manual version, RU/EN review record, or a sign-library source.

### Sign library (DEC-010, DEC-014)

`signs/<designation>.svg` + `.json` are extracted from the official FHWA Standard Highway Signs PDFs with `scripts/build-signs.py` and `scripts/extract-sign.py`; every asset records its source sheet and a visual check.

### Analytics (DEC-015)

`api/event.ts` stores aggregate counters in Neon (`db/schema.sql`). Set `DATABASE_URL` in Vercel and `VITE_ANALYTICS_URL=/api/event` for the build to enable it; without them events are dropped silently.
