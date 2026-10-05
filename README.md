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
