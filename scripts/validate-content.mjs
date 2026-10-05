// Build-time content gate (DEC-008, REQ-003, REQ-006).
// Every file under content/ must carry a manual section reference, the manual
// version/date it was verified against, and RU and EN review records.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CURRENT_MANUAL_VERSION = process.env.MANUAL_VERSION || '2026'
export { validateItem }

import { validateItem, validateSign } from './validate-item.mjs'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (name.endsWith('.json')) out.push(p)
  }
  return out
}

export function validateDir(dir, signsDir = join(dirname(dir), 'signs'), { draft = false } = {}) {
  const failures = []
  const stale = []
  const signIds = new Set()
  if (existsSync(signsDir)) {
    for (const file of walk(signsDir)) {
      try {
        const sign = JSON.parse(readFileSync(file, 'utf8'))
        const errors = validateSign(sign, (f) => existsSync(join(dirname(file), f)))
        if (errors.length) failures.push({ file, errors })
        else signIds.add(sign.id)
      } catch (e) {
        failures.push({ file, errors: [`invalid JSON: ${e.message}`] })
      }
    }
  }
  for (const file of walk(dir)) {
    let item
    try {
      item = JSON.parse(readFileSync(file, 'utf8'))
    } catch (e) {
      failures.push({ file, errors: [`invalid JSON: ${e.message}`] })
      continue
    }
    const errors = validateItem(item, { draft })
    const refId = item.kind === 'signcard' ? item.signId : item.image?.sign ? item.image.signId : null
    if (isStrId(refId) && !signIds.has(refId)) errors.push(`signId "${refId}" is not in the sign library`)
    if (errors.length) failures.push({ file, errors })
    else if (item.manualVersion !== CURRENT_MANUAL_VERSION) stale.push(file)
  }
  return { failures, stale }
}

const isStrId = (v) => typeof v === 'string' && v !== ''

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const draft = process.argv.includes('--draft')
  const dir = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'content'
  const { failures, stale } = validateDir(dir, join(dirname(dir), 'signs'), { draft })
  for (const f of stale) console.warn(`re-check: ${f} verified against an older manual version`)
  if (failures.length) {
    for (const f of failures) console.error(`${f.file}:\n  - ${f.errors.join('\n  - ')}`)
    console.error(`Content validation failed: ${failures.length} item(s).`)
    process.exit(1)
  }
  console.log('Content validation passed.')
}
