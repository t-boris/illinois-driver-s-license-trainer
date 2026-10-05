import test from 'node:test'
import assert from 'node:assert/strict'
import { lintEntry, candidatePaths, withImage } from './image-manifest.mjs'

const ok = () => ({ id: 'q1', file: 'content-drafts/t/q-01.json', prompt: 'Two drivers wave each other through at a quiet four-way crossing on a sunny morning', alt: { ru: 'а', en: 'a' } })
test('valid entry', () => assert.deepEqual(lintEntry(ok()), []))
test('sign as subject is rejected', () => { const e = ok(); e.prompt = 'A close up of a red stop sign on a corner at dusk in the city'; assert.match(lintEntry(e).join(), /DEC-010/) })
test('traffic light as subject is rejected', () => { const e = ok(); e.prompt = 'A driver waits at a red traffic light with hands on the wheel in the evening'; assert.match(lintEntry(e).join(), /DEC-010/) })
test('alt required in both languages', () => { const e = ok(); e.alt.ru = ''; assert.match(lintEntry(e).join(), /alt/) })
test('promoted path is found', () => assert.ok(candidatePaths('content-drafts/t/q-01.json').includes('content/t/q-01.json')))
test('image attached', () => assert.equal(withImage({ id: 'q1' }, 'q1', { ru: 'а', en: 'a' }).image.src, '/images/q1.webp'))
test('official sign image is never replaced', () => { const item = { id: 'q1', image: { sign: true, signId: 'R1-1' } }; assert.equal(withImage(item, 'q1', { ru: 'а', en: 'a' }), item) })
