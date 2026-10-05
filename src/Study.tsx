import { useMemo, useState } from 'react'
import { topics, terms, signCards, signAssets } from './lib/content'
import { strings, type Key } from './lib/i18n'
import { topicStats, type Progress } from './lib/progress'
import { SIGN_CATEGORY_LABEL } from './lib/study-strings'
import type { Lang, SignCategory } from './lib/types'

const CATEGORY_ORDER: SignCategory[] = ['regulatory', 'warning', 'guide', 'construction', 'signal', 'marking', 'other']

export function LearnPage({ lang, go }: { lang: Lang; go: (h: string) => void }) {
  const t = (k: Key) => strings[k][lang]
  const withLessons = topics.filter((x) => x.lesson)
  return (
    <section>
      <h2>{t('learn')}</h2>
      <p className="muted">{t('learnHint')}</p>
      {withLessons.length === 0 && <p>{t('noContent')}</p>}
      <ul className="topics">
        {withLessons.map((tp) => (
          <li key={tp.id}>
            <strong>{tp.title[lang]}</strong>
            <div className="row"><button onClick={() => go(`/lesson/${encodeURIComponent(tp.id)}`)}>{t('lesson')}</button></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PracticePage({ lang, go, progress }: { lang: Lang; go: (h: string) => void; progress: Progress }) {
  const t = (k: Key) => strings[k][lang]
  return (
    <section>
      <h2>{t('practice')}</h2>
      <p className="muted">{t('practiceHint')}</p>
      {topics.length === 0 && <p>{t('noContent')}</p>}
      <ul className="topics">
        {topics.map((tp) => {
          const s = topicStats(progress, tp)
          return (
            <li key={tp.id}>
              <strong>{tp.title[lang]}</strong> <span className="muted">{s.correct}/{s.answered} {s.met ? '✓' : ''}</span>
              <div className="row"><button onClick={() => go(`/quiz/${encodeURIComponent(tp.id)}`)}>{t('quiz')}</button></div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function SignsPage({ lang }: { lang: Lang }) {
  const t = (k: Key) => strings[k][lang]
  const groups = useMemo(() => {
    const m = new Map<SignCategory, typeof signCards>()
    for (const c of signCards) m.set(c.category, [...(m.get(c.category) ?? []), c])
    return [...m.entries()].sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
  }, [])
  return (
    <section>
      <h2>{t('signs')}</h2>
      <p className="muted">{t('signsHint')}</p>
      {groups.length === 0 && <p>{t('noContent')}</p>}
      {groups.map(([cat, cards]) => (
        <div key={cat}>
          <h3>{SIGN_CATEGORY_LABEL[cat][lang]}</h3>
          <ul className="signs">
            {cards.map((c) => {
              const a = signAssets[c.signId]
              return (
                <li key={c.id}>
                  <details>
                    <summary>
                      {a && <img className="sign" src={a.url} alt={a.alt[lang]} loading="lazy" />}
                      <span>{c.name[lang]}</span>
                    </summary>
                    <p>{c.meaning[lang]}</p>
                  </details>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

export function TermsPage({ lang }: { lang: Lang }) {
  const t = (k: Key) => strings[k][lang]
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return [...terms]
      .filter((x) => !n || `${x.term.en} ${x.term.ru} ${x.definition[lang]}`.toLowerCase().includes(n))
      .sort((a, b) => a.term.en.localeCompare(b.term.en))
  }, [q, lang])
  return (
    <section>
      <h2>{t('terms')}</h2>
      <p className="muted">{t('termsHint')}</p>
      <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} />
      {list.length === 0 && <p>{terms.length === 0 ? t('noContent') : t('noResults')}</p>}
      <dl className="terms">
        {list.map((x) => (
          <div key={x.id}>
            <dt lang="en">{x.term.en}{lang === 'ru' && <span className="ru"> — {x.term.ru}</span>}</dt>
            <dd>{x.definition[lang]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
