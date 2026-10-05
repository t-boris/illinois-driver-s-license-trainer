import { TOPIC_THRESHOLD } from './config'
import type { Topic } from './types'

export interface Sim { date: string; correct: number; total: number; passed: boolean; perTopic: Record<string, [number, number]> }
export interface Progress { answers: Record<string, Record<string, boolean>>; sims: Sim[] }
const KEY = 'ildl.progress.v1'
const empty = (): Progress => ({ answers: {}, sims: [] })

export function load(): Progress {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...empty(), ...JSON.parse(raw) } } catch { /* storage unavailable */ }
  return empty()
}
export function save(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* ignore */ } }
export function reset() { try { localStorage.removeItem(KEY) } catch { /* ignore */ } return empty() }

export function topicStats(p: Progress, t: Topic) {
  const a = p.answers[t.id] ?? {}
  const answered = Object.keys(a).length
  const correct = Object.values(a).filter(Boolean).length
  const need = Math.min(TOPIC_THRESHOLD.minAnswered, t.questions.filter((q) => q.pool === 'quiz').length)
  const met = answered >= need && need > 0 && correct / answered >= TOPIC_THRESHOLD.minAccuracy
  return { answered, correct, met }
}

export function readiness(p: Progress, topics: Topic[]) {
  const weak = topics.filter((t) => !topicStats(p, t).met).map((t) => t.id)
  const simPassed = p.sims.some((s) => s.passed)
  return { ready: topics.length > 0 && weak.length === 0 && simPassed, weak, simPassed }
}
