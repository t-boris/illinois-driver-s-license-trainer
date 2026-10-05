// Pure mapping from a client event to an aggregate counter key. Anything unexpected is rejected.
export interface CounterKey { kind: string; topic: string; item: string }
const ID = /^[a-z0-9][a-z0-9._-]{0,63}$/i
const PAGES = new Set(['home', 'lesson', 'quiz', 'exam', 'privacy', 'book', 'learn', 'practice', 'signs', 'terms'])

export function toCounter(body: unknown): CounterKey | null {
  if (typeof body !== 'object' || body === null) return null
  const e = body as Record<string, unknown>
  if (e.type === 'view' && typeof e.page === 'string' && PAGES.has(e.page)) {
    const topic = typeof e.topic === 'string' && ID.test(e.topic) ? e.topic : ''
    return { kind: 'view', topic, item: e.page }
  }
  if (e.type === 'answer' && typeof e.topic === 'string' && ID.test(e.topic) && typeof e.question === 'string' && ID.test(e.question) && typeof e.correct === 'boolean')
    return { kind: e.correct ? 'answer_correct' : 'answer_wrong', topic: e.topic, item: e.question }
  if (e.type === 'simulation' && typeof e.passed === 'boolean') return { kind: e.passed ? 'sim_passed' : 'sim_failed', topic: '', item: '' }
  return null
}
