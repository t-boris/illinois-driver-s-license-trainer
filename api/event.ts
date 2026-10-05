import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { toCounter } from './event-model'

// Receives anonymous events and bumps an aggregate counter. Nothing about the caller is read or stored.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  let body: unknown = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { return res.status(400).end() } }
  const c = toCounter(body)
  if (!c) return res.status(400).end()
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`INSERT INTO event_counters (day, kind, topic, item, count)
      VALUES (CURRENT_DATE, ${c.kind}, ${c.topic}, ${c.item}, 1)
      ON CONFLICT (day, kind, topic, item) DO UPDATE SET count = event_counters.count + 1`
    res.status(204).end()
  } catch {
    res.status(204).end() // never surface failures to the learner
  }
}
