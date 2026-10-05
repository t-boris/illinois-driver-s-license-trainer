// Generate scene illustrations with the OpenAI image API and attach them to content items (DEC-027).
// Needs OPENAI_API_KEY (never committed). Costs API credits: use --dry-run and --limit first.
// Usage: node scripts/generate-images.mjs [--manifest images/manifest-a.json ...] [--dry-run] [--limit N] [--only lessons|questions|<topic>]
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { candidatePaths, lintEntry, STYLE, withImage } from './image-manifest.mjs'

const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const manifests = args.flatMap((a, i) => (args[i - 1] === '--manifest' ? [a] : []))
const files = manifests.length ? manifests : readdirSync('images').filter((f) => /^manifest.*\.json$/.test(f)).map((f) => `images/${f}`)
const limit = Number(opt('--limit') || Infinity)
const only = opt('--only')
const dry = flag('--dry-run')
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'

if (!dry && !process.env.OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY (or use --dry-run).'); process.exit(2) }
mkdirSync('public/images', { recursive: true })

let entries = files.flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).items)
if (only === 'lessons') entries = entries.filter((e) => e.id.endsWith('-lesson'))
else if (only === 'questions') entries = entries.filter((e) => !e.id.endsWith('-lesson'))
else if (only) entries = entries.filter((e) => e.id.startsWith(only))

let done = 0, skipped = 0, failed = 0
for (const e of entries) {
  if (done >= limit) break
  const errors = lintEntry(e)
  if (errors.length) { console.error(`reject ${e.id}: ${errors.join('; ')}`); failed++; continue }
  const itemPath = candidatePaths(e.file).find(existsSync)
  if (!itemPath) { console.error(`missing content file for ${e.id}`); failed++; continue }
  const out = `public/images/${e.id}.webp`
  const item = JSON.parse(readFileSync(itemPath, 'utf8'))
  if (item.image?.sign) { skipped++; continue }
  if (existsSync(out) && item.image?.src === `/images/${e.id}.webp`) { skipped++; continue }
  if (dry) { console.log(`[dry] ${e.id}: ${STYLE}${e.prompt}`); done++; continue }
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model, prompt: STYLE + e.prompt, size: '1024x1024', quality: 'medium', n: 1, output_format: 'webp', output_compression: 70 }),
    })
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
    const b64 = (await res.json()).data?.[0]?.b64_json
    if (!b64) throw new Error('no image in response')
    writeFileSync(out, Buffer.from(b64, 'base64'))
    writeFileSync(itemPath, JSON.stringify(withImage(item, e.id, e.alt), null, 2) + '\n')
    console.log(`ok ${e.id}`)
    done++
  } catch (err) { console.error(`FAILED ${e.id}: ${err.message}`); failed++ }
}
console.log(`${dry ? 'would generate' : 'generated'} ${done}, skipped ${skipped}, failed ${failed}`)
process.exit(failed ? 1 : 0)
