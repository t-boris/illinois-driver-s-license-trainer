import { validateItem } from '../../scripts/validate-item.mjs'
import { EXAM } from './config'
import type { Item, Topic, Question, Lesson, Term, SignCard, SignAsset } from './types'

const deployed = import.meta.glob('../../content/**/*.json', { eager: true, import: 'default' })
// Fixtures exist only for local development and are never bundled into production.
const fixtures = import.meta.env.DEV ? import.meta.glob('../../content-fixtures/*.json', { eager: true, import: 'default' }) : {}

// Dev-only review aid: VITE_SHOW_DRAFTS=1 npm run dev loads the unreviewed AI drafts so the owner can read them in the real UI.
const drafts = import.meta.env.DEV && import.meta.env.VITE_SHOW_DRAFTS ? import.meta.glob('../../content-drafts/**/*.json', { eager: true, import: 'default' }) : {}

// Defence in depth: unreviewed content is never shown (REQ-003), even if the build gate is bypassed.
const reviewed = Object.values(deployed).filter((i) => validateItem(i).length === 0)
const items = [...reviewed, ...Object.values(fixtures), ...Object.values(drafts)] as Item[]

export const topics: Topic[] = (() => {
  const map = new Map<string, Topic>()
  for (const it of items) {
    if (it.kind !== 'lesson' && it.kind !== 'question') continue
    const t = map.get(it.topic) ?? { id: it.topic, title: { ru: it.topic, en: it.topic }, questions: [] }
    if (it.kind === 'lesson') { t.lesson = it as Lesson; t.title = (it as Lesson).title }
    else t.questions.push(it as Question)
    map.set(it.topic, t)
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id))
})()

export const terms: Term[] = items.filter((i): i is Term => i.kind === 'term')
export const signCards: SignCard[] = items.filter((i): i is SignCard => i.kind === 'signcard')

// Official sign library (DEC-010): the only source of sign imagery.
const signMeta = import.meta.glob('../../signs/*.json', { eager: true, import: 'default' }) as Record<string, { id: string; designation: string; alt: SignAsset['alt'] }>
const signFiles = import.meta.glob('../../signs/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const signAssets: Record<string, SignAsset> = Object.fromEntries(
  Object.entries(signMeta).map(([path, m]) => [m.id, { id: m.id, designation: m.designation, alt: m.alt, url: signFiles[path.replace(/\.json$/, '.svg')] }]),
)

export const examPool = (): Question[] => topics.flatMap((t) => t.questions.filter((q) => q.pool === 'exam'))
export const quizPool = (id: string): Question[] => topics.find((t) => t.id === id)?.questions.filter((q) => q.pool === 'quiz') ?? []
export const examDraw = (): Question[] => {
  const pool = examPool()
  const pick = (c: 'sign' | 'rule', n: number) => pool.filter((q) => q.category === c).sort(() => Math.random() - 0.5).slice(0, n)
  return [...pick('sign', EXAM.signs), ...pick('rule', EXAM.rules)].sort(() => Math.random() - 0.5)
}
