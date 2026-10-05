// Question-bank sufficiency report (DEC-009, REQ-003): can the bank fill a 35-question simulation
// (15 sign + 20 rule questions) and a separate quiz per topic without overlap?
// Usage: node scripts/bank-report.mjs [dir]   (default: content)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const EXAM = { signs: 15, rules: 20 }
const MIN_QUIZ = 5
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : n.endsWith('.json') ? [join(d, n)] : []))
const dir = process.argv[2] || 'content'
const items = walk(dir).map((f) => JSON.parse(readFileSync(f, 'utf8')))
const qs = items.filter((i) => i.kind === 'question')
const count = (f) => qs.filter(f).length
const topics = [...new Set(items.filter((i) => i.kind === 'lesson' || i.kind === 'question').map((i) => i.topic))].sort()
let ok = true
const line = (label, have, need) => { const pass = have >= need; ok &&= pass; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}: ${have} / ${need}`) }
line('exam pool, sign questions', count((q) => q.pool === 'exam' && q.category === 'sign'), EXAM.signs)
line('exam pool, rule questions', count((q) => q.pool === 'exam' && q.category === 'rule'), EXAM.rules)
for (const t of topics) {
  const lesson = items.some((i) => i.kind === 'lesson' && i.topic === t)
  ok &&= lesson
  line(`${t} quiz questions${lesson ? '' : ' (NO LESSON)'}`, count((q) => q.topic === t && q.pool === 'quiz'), MIN_QUIZ)
}
console.log(`terms: ${items.filter((i) => i.kind === 'term').length}, sign cards: ${items.filter((i) => i.kind === 'signcard').length}`)
process.exit(ok ? 0 : 1)
