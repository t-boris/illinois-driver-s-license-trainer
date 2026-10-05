import test from 'node:test'
import assert from 'node:assert/strict'
import { validateItem, validateSign } from './validate-item.mjs'
import { validateDir } from './validate-content.mjs'

const good = () => ({
  kind: 'question', id: 'q1', topic: 't1', pool: 'quiz', category: 'rule', sectionRef: 'Ch.2 p.10', manualVersion: '2026',
  review: { ru: { reviewer: 'A', date: '2026-10-01' }, en: { reviewer: 'A', date: '2026-10-01' } },
  text: { ru: 'в', en: 'q' },
  options: [
    { correct: true, text: { ru: 'а', en: 'a' }, explanation: { ru: 'а', en: 'a' } },
    { correct: false, text: { ru: 'б', en: 'b' }, explanation: { ru: 'б', en: 'b' } },
  ],
})

test('valid item passes', () => assert.deepEqual(validateItem(good()), []))
test('missing section ref fails', () => { const i = good(); delete i.sectionRef; assert.match(validateItem(i).join(), /section reference/) })
test('missing manual version fails', () => { const i = good(); delete i.manualVersion; assert.match(validateItem(i).join(), /manual version/) })
test('missing RU review fails', () => { const i = good(); delete i.review.ru; assert.match(validateItem(i).join(), /RU review/) })
test('missing EN review fails', () => { const i = good(); i.review.en.date = ''; assert.match(validateItem(i).join(), /EN review/) })
test('no mixed-language fallback', () => { const i = good(); delete i.options[0].text.ru; assert.match(validateItem(i).join(), /ru text/) })
test('sign image needs library reference', () => { const i = good(); i.image = { src: 'x', alt: { ru: 'а', en: 'a' }, sign: true }; assert.match(validateItem(i).join(), /signId/) })
test('missing topic fails', () => { const i = good(); delete i.topic; assert.match(validateItem(i).join(), /topic/) })
test('bad pool fails', () => { const i = good(); i.pool = 'x'; assert.match(validateItem(i).join(), /pool/) })

const sign = () => ({ id: 's1', designation: 'R1-1', source: { publication: 'SHS 2004', url: 'https://mutcd.fhwa.dot.gov/x.pdf', retrieved: '2026-10-04' }, file: 'r1-1.svg', alt: { ru: 'а', en: 'a' } })
test('valid sign passes', () => assert.deepEqual(validateSign(sign(), () => true), []))
test('sign without source fails', () => { const s = sign(); delete s.source; assert.match(validateSign(s, () => true).join(), /source/) })
test('sign without file fails', () => assert.match(validateSign(sign(), () => false).join(), /asset file/))
test('sign without designation fails', () => { const s = sign(); delete s.designation; assert.match(validateSign(s, () => true).join(), /designation/) })
test('missing category fails', () => { const i = good(); delete i.category; assert.match(validateItem(i).join(), /category/) })
test('draft needs no review records', () => { const i = good(); delete i.review; assert.deepEqual(validateItem(i, { draft: true }), []) })
test('draft must not carry review records', () => assert.match(validateItem(good(), { draft: true }).join(), /must not carry review/))

const term = () => ({ kind: 'term', id: 't1', topic: 'c', sectionRef: 'p1', manualVersion: '2026', review: good().review, term: { ru: 'а', en: 'a' }, definition: { ru: 'а', en: 'a' } })
test('valid term passes', () => assert.deepEqual(validateItem(term()), []))
test('term needs both languages', () => { const t = term(); delete t.term.ru; assert.match(validateItem(t).join(), /ru term/) })
const card = () => ({ kind: 'signcard', id: 'c1', topic: 'c', sectionRef: 'p1', manualVersion: '2026', review: good().review, signId: 'R1-1', category: 'regulatory', name: { ru: 'а', en: 'a' }, meaning: { ru: 'а', en: 'a' } })
test('valid sign card passes', () => assert.deepEqual(validateItem(card()), []))
test('sign card needs signId and category', () => { const c = card(); delete c.signId; c.category = 'x'; const e = validateItem(c).join(); assert.match(e, /signId/); assert.match(e, /category/) })
test('sign image needs no src', () => { const i = good(); i.image = { sign: true, signId: 'R1-1', alt: { ru: 'а', en: 'a' } }; assert.deepEqual(validateItem(i), []) })
test('non-sign image needs src', () => { const i = good(); i.image = { alt: { ru: 'а', en: 'a' } }; assert.match(validateItem(i).join(), /src/) })
test('Interstate Shield is excluded', () => { const s = sign(); s.designation = 'M1-1'; assert.match(validateSign(s, () => true).join(), /Interstate Shield/) })
test('missing content folder is an empty bank', () => assert.deepEqual(validateDir('/nonexistent/content'), { failures: [], stale: [] }))
