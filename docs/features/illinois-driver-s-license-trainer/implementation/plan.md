---
type: plan
feature: illinois-driver-s-license-trainer
title: Illinois Driver's License Trainer — v1 implementation
issues:
  - id: I-1
    title: "Verify external facts: Illinois test composition, test languages, MUTCD/SHS public-domain status"
    summary: Research-only issue that must close before content authoring and the content schema are finalised. Verify on the official Illinois SOS page the written test's question count, rules/signs mix, pass threshold and the list of languages in which the test can be taken; confirm the public-domain status of the FHWA MUTCD / Standard Highway Signs files. Record each result as an external fact in the project documentation (docs/) with source URL and date, and derive from them the per-topic minimum bank size and the exam simulation parameters used by later issues.
    requirements: [REQ-003, REQ-005]
    decisions: [DEC-002, DEC-007, DEC-009, DEC-010]
  - id: I-2
    title: Project scaffold, responsive app shell and Vercel deployment pipeline
    summary: Create the web application repository structure (framework is the implementer's choice, static-first to match no-backend DEC-004), a responsive app shell usable at 360px and desktop widths with touch-friendly controls, a global RU/EN language switch wired to an i18n layer for UI strings, and automatic Vercel production and preview deployments over HTTPS. Includes a placeholder build command hook where the content validation step (next issue) will be inserted, and browser-compatibility checks for Safari iOS, Chrome and Firefox.
    requirements: [REQ-001, REQ-002, REQ-006]
    decisions: [DEC-004, DEC-005]
  - id: I-3
    title: Content schema, repository content store and build-time validation gate
    summary: "Define the structured file format and schema for lessons, questions, answer options and explanations stored in the repository, with mandatory metadata: Rules of the Road section reference, manual version/date verified against, Russian review record and English review record (reviewer, date), image references and sign-asset source. Implement a validation script that fails the build when any item lacks the section reference, manual version/date or either review record, wire it into the Vercel build command so both production and preview deployments are blocked, and provide a report listing items whose stored manual version differs from the current one. Both languages are required per item (no mixed-language fallbacks)."
    requirements: [REQ-001, REQ-003, REQ-006]
    decisions: [DEC-001, DEC-008, DEC-009]
  - id: I-4
    title: Official road-sign asset library and image pipeline
    summary: Assemble a sign and traffic-signal asset library from the official FHWA MUTCD / SHS files plus Illinois-specific official sources, with per-asset metadata recording source publication and sign designation; make this library the only source of sign imagery in the app. Set up the image pipeline for AI-generated scene/character/decorative imagery (compositing official sign assets where a sign appears), bilingual alt text, and size optimisation for mobile networks. Validation rejects sign assets without a recorded source.
    requirements: [REQ-005]
    decisions: [DEC-010]
  - id: I-5
    title: "Learning content authoring: topics, lessons and bilingual question bank"
    summary: Derive the v1 topic list from the Rules of the Road table of contents (all chapters examined on the written test, including road signs), then author and review in RU and EN an illustrated lesson per topic and a question bank sized per the verified exam composition (enough to fill the topic's share of a simulation plus a separate non-overlapping topic quiz). Every question has an explanation per answer option, an English term bridge in Russian explanations, a section reference and both review records; content is merged only via pull requests reviewed by the product owner or a designated reviewer. This is the main v1 effort and is tracked separately from app code.
    requirements: [REQ-001, REQ-003, REQ-004, REQ-005]
    decisions: [DEC-001, DEC-002, DEC-003, DEC-007, DEC-009, DEC-010]
  - id: I-6
    title: Lesson, topic quiz and exam simulation screens
    summary: "Build the core learning flow: topic list, illustrated lesson view, topic quiz with per-option explanations and encouraging wrong-answer hints, and a full exam simulation that draws across all topics using the verified question count, rules/signs mix and pass threshold, shows pass/fail with per-topic breakdown, and never repeats topic-quiz questions. On every question screen in Russian a collapsible 'Show in English' control reveals the original English question and options without hiding the image or answer controls on phones; the control is absent or inert in English. Includes the bilingual informational note that the written test is offered in several languages."
    requirements: [REQ-001, REQ-002, REQ-003, REQ-004]
    decisions: [DEC-002, DEC-003, DEC-005, DEC-007]
  - id: I-7
    title: Local progress storage, readiness indicator and milestone celebrations
    summary: Implement device-local progress persistence (per-topic results, simulation history) that survives reload and browser restart and is unaffected by language switching. Home screen shows per-topic progress, weak topics and the readiness state ('ready' only when every topic meets the correct-answer threshold AND at least one simulation is passed; otherwise lists what remains). Includes the device-local notice and an explicit reset action, plus encouraging celebration messages/animations in the active language on topic completion, reaching readiness and passing a simulation — with no persistent badges, streaks or trophies.
    requirements: [REQ-001, REQ-004, REQ-007]
    decisions: [DEC-002, DEC-004]
  - id: I-8
    title: Anonymous aggregated analytics and bilingual privacy note
    summary: Add cookie-less, identifier-free analytics events for topic/page views, per-question and per-topic correct/incorrect counts and simulation pass/fail outcomes, delivered to an aggregation endpoint (provider is the implementer's choice, must support no persistent user identifier) so content maintainers can see weak questions in aggregate. Events are dropped silently if the endpoint is unavailable. Write and link a short privacy note in RU and EN listing collected data categories; no consent banner is shown.
    requirements: [REQ-008]
    decisions: [DEC-004, DEC-006]
  - id: I-9
    title: Tone and copy review pass across both languages
    summary: Final cross-cutting review of all UI strings, hints, celebrations and explanations for a consistent light, friendly, adult-oriented voice aimed at Russian-speaking adult immigrants in Illinois; verify full RU/EN parity (no screen or message exists in one language only), that no copy shames or penalises mistakes, and that Russian explanations present the corresponding English exam term. Produces a reviewed copy inventory and fixes; also a QA pass of REQ-002 acceptance criteria on real devices.
    requirements: [REQ-001, REQ-002, REQ-004]
    decisions: [DEC-003, DEC-005, DEC-007]
updated: 2026-10-05
---

# Implementation plan — Illinois Driver's License Trainer

## I-1: Verify external facts: Illinois test composition, test languages, MUTCD/SHS public-domain status

Research-only issue that must close before content authoring and the content schema are finalised. Verify on the official Illinois SOS page the written test's question count, rules/signs mix, pass threshold and the list of languages in which the test can be taken; confirm the public-domain status of the FHWA MUTCD / Standard Highway Signs files. Record each result as an external fact in the project documentation (docs/) with source URL and date, and derive from them the per-topic minimum bank size and the exam simulation parameters used by later issues.

Requirements: REQ-003, REQ-005
Decisions: DEC-002, DEC-007, DEC-009, DEC-010

## I-2: Project scaffold, responsive app shell and Vercel deployment pipeline

Create the web application repository structure (framework is the implementer's choice, static-first to match no-backend DEC-004), a responsive app shell usable at 360px and desktop widths with touch-friendly controls, a global RU/EN language switch wired to an i18n layer for UI strings, and automatic Vercel production and preview deployments over HTTPS. Includes a placeholder build command hook where the content validation step (next issue) will be inserted, and browser-compatibility checks for Safari iOS, Chrome and Firefox.

Requirements: REQ-001, REQ-002, REQ-006
Decisions: DEC-004, DEC-005

## I-3: Content schema, repository content store and build-time validation gate

Define the structured file format and schema for lessons, questions, answer options and explanations stored in the repository, with mandatory metadata: Rules of the Road section reference, manual version/date verified against, Russian review record and English review record (reviewer, date), image references and sign-asset source. Implement a validation script that fails the build when any item lacks the section reference, manual version/date or either review record, wire it into the Vercel build command so both production and preview deployments are blocked, and provide a report listing items whose stored manual version differs from the current one. Both languages are required per item (no mixed-language fallbacks).

Requirements: REQ-001, REQ-003, REQ-006
Decisions: DEC-001, DEC-008, DEC-009

## I-4: Official road-sign asset library and image pipeline

Assemble a sign and traffic-signal asset library from the official FHWA MUTCD / SHS files plus Illinois-specific official sources, with per-asset metadata recording source publication and sign designation; make this library the only source of sign imagery in the app. Set up the image pipeline for AI-generated scene/character/decorative imagery (compositing official sign assets where a sign appears), bilingual alt text, and size optimisation for mobile networks. Validation rejects sign assets without a recorded source.

Requirements: REQ-005
Decisions: DEC-010

## I-5: Learning content authoring: topics, lessons and bilingual question bank

Derive the v1 topic list from the Rules of the Road table of contents (all chapters examined on the written test, including road signs), then author and review in RU and EN an illustrated lesson per topic and a question bank sized per the verified exam composition (enough to fill the topic's share of a simulation plus a separate non-overlapping topic quiz). Every question has an explanation per answer option, an English term bridge in Russian explanations, a section reference and both review records; content is merged only via pull requests reviewed by the product owner or a designated reviewer. This is the main v1 effort and is tracked separately from app code.

Requirements: REQ-001, REQ-003, REQ-004, REQ-005
Decisions: DEC-001, DEC-002, DEC-003, DEC-007, DEC-009, DEC-010

## I-6: Lesson, topic quiz and exam simulation screens

Build the core learning flow: topic list, illustrated lesson view, topic quiz with per-option explanations and encouraging wrong-answer hints, and a full exam simulation that draws across all topics using the verified question count, rules/signs mix and pass threshold, shows pass/fail with per-topic breakdown, and never repeats topic-quiz questions. On every question screen in Russian a collapsible 'Show in English' control reveals the original English question and options without hiding the image or answer controls on phones; the control is absent or inert in English. Includes the bilingual informational note that the written test is offered in several languages.

Requirements: REQ-001, REQ-002, REQ-003, REQ-004
Decisions: DEC-002, DEC-003, DEC-005, DEC-007

## I-7: Local progress storage, readiness indicator and milestone celebrations

Implement device-local progress persistence (per-topic results, simulation history) that survives reload and browser restart and is unaffected by language switching. Home screen shows per-topic progress, weak topics and the readiness state ('ready' only when every topic meets the correct-answer threshold AND at least one simulation is passed; otherwise lists what remains). Includes the device-local notice and an explicit reset action, plus encouraging celebration messages/animations in the active language on topic completion, reaching readiness and passing a simulation — with no persistent badges, streaks or trophies.

Requirements: REQ-001, REQ-004, REQ-007
Decisions: DEC-002, DEC-004

## I-8: Anonymous aggregated analytics and bilingual privacy note

Add cookie-less, identifier-free analytics events for topic/page views, per-question and per-topic correct/incorrect counts and simulation pass/fail outcomes, delivered to an aggregation endpoint (provider is the implementer's choice, must support no persistent user identifier) so content maintainers can see weak questions in aggregate. Events are dropped silently if the endpoint is unavailable. Write and link a short privacy note in RU and EN listing collected data categories; no consent banner is shown.

Requirements: REQ-008
Decisions: DEC-004, DEC-006

## I-9: Tone and copy review pass across both languages

Final cross-cutting review of all UI strings, hints, celebrations and explanations for a consistent light, friendly, adult-oriented voice aimed at Russian-speaking adult immigrants in Illinois; verify full RU/EN parity (no screen or message exists in one language only), that no copy shames or penalises mistakes, and that Russian explanations present the corresponding English exam term. Produces a reviewed copy inventory and fixes; also a QA pass of REQ-002 acceptance criteria on real devices.

Requirements: REQ-001, REQ-002, REQ-004
Decisions: DEC-003, DEC-005, DEC-007
