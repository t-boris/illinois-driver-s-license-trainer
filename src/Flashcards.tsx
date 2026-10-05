import { useEffect, useMemo, useState } from 'react'
import { signCards, signAssets, terms } from './lib/content'
import { strings, type Key } from './lib/i18n'
import { IconChevron } from './Icons'
import type { Lang } from './lib/types'

type Card = { id: string; front: { img?: { url: string; alt: string }; text?: string }; back: { title: string; body: string } }

function deck(kind: 'signs' | 'terms', lang: Lang): Card[] {
  if (kind === 'signs')
    return signCards.filter((c) => signAssets[c.signId]).map((c) => {
      const a = signAssets[c.signId]
      return { id: c.id, front: { img: { url: a.url, alt: a.alt[lang] } }, back: { title: c.name[lang], body: c.meaning[lang] } }
    })
  return terms.map((x) => ({ id: x.id, front: { text: x.term.en }, back: { title: lang === 'ru' ? x.term.ru : x.term.en, body: x.definition[lang] } }))
}

const shuffled = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

export function Flashcards({ lang, kind, go }: { lang: Lang; kind: 'signs' | 'terms'; go: (h: string) => void }) {
  const t = (k: Key) => strings[k][lang]
  const base = useMemo(() => deck(kind, lang), [kind, lang])
  const [order, setOrder] = useState<string[]>(() => shuffled(base.map((c) => c.id)))
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const byId = useMemo(() => Object.fromEntries(base.map((c) => [c.id, c])), [base])
  const card = byId[order[i]]
  const move = (d: number) => { setFlipped(false); setI((x) => (x + d + order.length) % order.length) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); setFlipped((f) => !f) }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  if (!card) return <section><h2>{t('flashcards')}</h2><p className="empty">{t('noContent')}</p></section>
  return (
    <section className="reading">
      <button className="link" onClick={() => go(kind === 'signs' ? '/signs' : '/terms')}>{t('back')}</button>
      <h2>{t('flashcards')}: {kind === 'signs' ? t('signs') : t('terms')}</h2>
      <p className="muted">{t('flipHint')}</p>
      <div className="q-top"><div className="bar" aria-hidden="true"><i style={{ width: `${((i + 1) / order.length) * 100}%` }} /></div><span>{i + 1} {t('questionOf')} {order.length}</span></div>
      <button key={card.id} className={`flash${flipped ? ' flipped' : ''}`} aria-pressed={flipped} onClick={() => setFlipped(!flipped)}>
        <span className="face front">
          {card.front.img && <img src={card.front.img.url} alt={card.front.img.alt} />}
          {card.front.text && <strong lang="en">{card.front.text}</strong>}
        </span>
        <span className="face back"><strong>{card.back.title}</strong><span>{card.back.body}</span></span>
      </button>
      <div className="flash-actions">
        <button className="ghost" onClick={() => move(-1)} aria-label={t('prev')}><span className="flip-x"><IconChevron /></span></button>
        <button className="ghost" onClick={() => { setOrder(shuffled(order)); setI(0); setFlipped(false) }}>{t('shuffle')}</button>
        <button className="primary" onClick={() => move(1)}>{t('next')}</button>
      </div>
    </section>
  )
}
