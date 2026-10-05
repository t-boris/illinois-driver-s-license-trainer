// Pure item validation, shared by the build gate and the runtime filter (no Node APIs).
export const SIGN_CATEGORIES = ['regulatory', 'warning', 'guide', 'construction', 'signal', 'marking', 'other']
const isStr = (v) => typeof v === 'string' && v.trim() !== ''
const isDate = (v) => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v)

function checkReview(item, lang, errors) {
  const r = item.review?.[lang]
  if (!r || !isStr(r.reviewer) || !isDate(r.date)) {
    errors.push(`missing ${lang.toUpperCase()} review record (reviewer, date)`)
  }
}

export function validateItem(item, { draft = false } = {}) {
  const errors = []
  if (!isStr(item.id)) errors.push('missing id')
  if (!isStr(item.sectionRef)) errors.push('missing Rules of the Road section reference')
  if (!isStr(item.manualVersion)) errors.push('missing manual version/date')
  if (!draft) {
    checkReview(item, 'ru', errors)
    checkReview(item, 'en', errors)
  } else if (item.review) errors.push('drafts must not carry review records (only the owner or a designee adds them)')
  if (!isStr(item.topic)) errors.push('missing topic')
  if (item.kind === 'signcard') {
    if (!isStr(item.signId)) errors.push('sign card must reference a sign library asset (signId)')
    if (!SIGN_CATEGORIES.includes(item.category)) errors.push(`sign category must be one of ${SIGN_CATEGORIES.join(', ')}`)
  }
  if (item.kind === 'question' && !['quiz', 'exam'].includes(item.pool)) errors.push('question pool must be "quiz" or "exam"')
  if (item.kind === 'question' && !['sign', 'rule'].includes(item.category)) errors.push('question category must be "sign" or "rule"')
  for (const lang of ['ru', 'en']) {
    if (item.kind === 'question') {
      const t = item.text?.[lang]
      if (!isStr(t)) errors.push(`missing ${lang} question text`)
      const opts = item.options
      if (!Array.isArray(opts) || opts.length < 2) errors.push('needs at least 2 options')
      else
        opts.forEach((o, i) => {
          if (!isStr(o.text?.[lang])) errors.push(`option ${i}: missing ${lang} text`)
          if (!isStr(o.explanation?.[lang])) errors.push(`option ${i}: missing ${lang} explanation`)
        })
      if (Array.isArray(opts) && opts.filter((o) => o.correct).length !== 1)
        errors.push('exactly one option must be correct')
    } else if (item.kind === 'term') {
      if (!isStr(item.term?.[lang])) errors.push(`missing ${lang} term`)
      if (!isStr(item.definition?.[lang])) errors.push(`missing ${lang} definition`)
    } else if (item.kind === 'signcard') {
      if (!isStr(item.name?.[lang])) errors.push(`missing ${lang} sign name`)
      if (!isStr(item.meaning?.[lang])) errors.push(`missing ${lang} sign meaning`)
    } else if (item.kind === 'lesson') {
      if (!isStr(item.title?.[lang]) || !isStr(item.body?.[lang])) errors.push(`missing ${lang} lesson title/body`)
    } else errors.push(`unknown kind "${item.kind}"`)
  }
  if (item.image) {
    if (!item.image.sign && !isStr(item.image.src)) errors.push('image missing src')
    if (!isStr(item.image.alt?.ru) || !isStr(item.image.alt?.en)) errors.push('image missing bilingual alt text')
    if (item.image.sign && !isStr(item.image.signId)) errors.push('sign image must reference a sign library asset (signId)')
  }
  return errors
}


// A sign library asset (DEC-010, REQ-005): the only permitted source of sign imagery.
// MUTCD Introduction para. 04: designs are public domain except the Interstate Shield and items owned by FHWA.
const EXCLUDED_DESIGNATIONS = new Set(['M1-1'])

export function validateSign(sign, fileExists) {
  const errors = []
  if (EXCLUDED_DESIGNATIONS.has(sign.designation)) errors.push(`${sign.designation} (Interstate Shield) is excluded from the public-domain MUTCD designs`)
  if (!isStr(sign.id)) errors.push('missing id')
  if (!isStr(sign.designation)) errors.push('missing sign designation (e.g. R1-1)')
  if (!isStr(sign.source?.publication)) errors.push('missing source publication')
  if (!/^https:\/\//.test(sign.source?.url ?? '')) errors.push('missing source url')
  if (!isDate(sign.source?.retrieved)) errors.push('missing source retrieval date')
  if (!isStr(sign.file) || !fileExists(sign.file)) errors.push('missing or non-existent asset file')
  if (!isStr(sign.alt?.ru) || !isStr(sign.alt?.en)) errors.push('missing bilingual alt text')
  return errors
}
