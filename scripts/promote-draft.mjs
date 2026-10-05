// Promote reviewed drafts into content/ (DEC-013, DEC-021).
// Run ONLY after a real review. The reviewer names you pass are recorded as the RU and EN review
// records (reviewer + date) and the files move from content-drafts/ to content/ for a pull request.
// Usage: node scripts/promote-draft.mjs <draft dir or file>... --reviewer-ru "Name" --reviewer-en "Name" [--date YYYY-MM-DD]
import { mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { validateItem } from './validate-item.mjs'

const args = process.argv.slice(2)
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const reviewerRu = opt('--reviewer-ru'), reviewerEn = opt('--reviewer-en')
const date = opt('--date') || new Date().toISOString().slice(0, 10)
const targets = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!reviewerRu || !reviewerEn || !targets.length) {
  console.error('Usage: promote-draft.mjs <draft dir|file>... --reviewer-ru "Name" --reviewer-en "Name" [--date YYYY-MM-DD]')
  process.exit(2)
}
const files = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((n) => files(join(p, n))) : p.endsWith('.json') ? [p] : [])
let moved = 0
for (const t of targets) {
  for (const f of files(t)) {
    const item = JSON.parse(readFileSync(f, 'utf8'))
    item.review = { ru: { reviewer: reviewerRu, date }, en: { reviewer: reviewerEn, date } }
    const errors = validateItem(item)
    if (errors.length) { console.error(`skip ${f}: ${errors.join('; ')}`); continue }
    const dest = join('content', relative('content-drafts', f))
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, JSON.stringify(item, null, 2) + '\n')
    renameSync(f, `${f}.promoted`) // keep a trace; delete after the PR is merged
    moved++
  }
}
console.log(`Promoted ${moved} item(s) to content/ — open a pull request for review.`)
