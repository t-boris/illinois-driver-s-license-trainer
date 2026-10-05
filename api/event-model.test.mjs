import test from 'node:test'
import assert from 'node:assert/strict'
import { toCounter } from './event-model.ts'

test('answer maps to counter', () => assert.deepEqual(toCounter({ type: 'answer', topic: 'signs', question: 'q-1', correct: true }), { kind: 'answer_correct', topic: 'signs', item: 'q-1' }))
test('wrong answer', () => assert.equal(toCounter({ type: 'answer', topic: 't', question: 'q', correct: false }).kind, 'answer_wrong'))
test('view page', () => assert.deepEqual(toCounter({ type: 'view', page: 'home' }), { kind: 'view', topic: '', item: 'home' }))
test('simulation', () => assert.equal(toCounter({ type: 'simulation', passed: false }).kind, 'sim_failed'))
test('unknown page rejected', () => assert.equal(toCounter({ type: 'view', page: 'x' }), null))
test('extra identifying fields are ignored, bad ids rejected', () => assert.equal(toCounter({ type: 'answer', topic: 'a b', question: 'q', correct: true, userId: 'x' }), null))
test('garbage rejected', () => assert.equal(toCounter('x'), null))
test('book page view', () => assert.equal(toCounter({ type: 'view', page: 'book' }).item, 'book'))
