// Pure helpers for the illustration pipeline (DEC-027, DEC-010). No network, no Node APIs besides path.
import { join } from 'node:path'

export const STYLE =
  'Flat, friendly, colourful vector illustration with warm light, consistent style, adult characters of varied ethnicity, ' +
  'Midwestern American setting. No text, letters or numbers anywhere, no signboards, welcome signs, road signs, traffic signals or pavement markings. Scene: '

// Road signs, signals and markings must come from the official library, never from an AI image.
const SIGN_SUBJECT = /\b(stop|yield|speed limit|road|traffic|warning|regulatory|street|railroad)\s+(signs?|signals?|lights?|markings?)\b|\btraffic lights?\b|\bcrosswalk markings?\b/i

export function lintEntry(e) {
  const errors = []
  if (!e.id || !e.file) errors.push('missing id/file')
  if (typeof e.prompt !== 'string' || e.prompt.trim().split(/\s+/).length < 8) errors.push('prompt too short')
  else if (SIGN_SUBJECT.test(e.prompt.replace(/\b(no|not|without|never)\b[^.]*\.?/gi, ' '))) errors.push('prompt makes a sign/signal/marking the subject (DEC-010)')
  if (!e.alt?.ru?.trim() || !e.alt?.en?.trim()) errors.push('missing bilingual alt text')
  return errors
}

// The content item may have been promoted from content-drafts/ to content/ since the manifest was written.
export function candidatePaths(file, root = '.') {
  const rel = file.replace(/^content(-drafts)?\//, '')
  return [join(root, file), join(root, 'content', rel), join(root, 'content-drafts', rel)]
}

export function withImage(item, id, alt) {
  if (item.image?.sign) return item // official sign images are never replaced
  return { ...item, image: { src: `/images/${id}.webp`, alt } }
}
