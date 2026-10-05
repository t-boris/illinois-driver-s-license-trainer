# Lessons

- Never create random order (shuffle) in a render path or in props: every parent re-render reshuffles and changes the content under the user. Fix the order once in state (QuestionRun, 2026-10-04: the quiz changed its question after "Check").
- Verify UI flows end to end (answer, check, next, finish), not only that screens render. A passing "renders" smoke test missed the reshuffle bug.
- Tooling that patches files watched by the dev server (image generator patching drafts) triggers full reloads and resets in-progress state; exclude generated paths from the watcher (vite.config.ts).
- When a screenshot shows unreadable text, check the renderer first: lesson paragraphs were collapsed into one block by a plain <p>; structured content needs a renderer (Rich) and structured source text.
- When a user supplies a secret (API key), write it to a git-ignored file without printing it and check only its shape.
- Test selectors by role+name can match answer text (e.g. "Дальше" inside an option); target stable classes for controls in e2e scripts.
