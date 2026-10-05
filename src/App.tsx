import { useEffect, useState } from 'react'
import { topics, examPool, examDraw, quizPool, signAssets } from './lib/content'
import { EXAM } from './lib/config'
import { initialLang, persistLang, strings, type Key } from './lib/i18n'
import { load, save, reset, topicStats, readiness, type Progress } from './lib/progress'
import { track } from './lib/analytics'
import { BOOKING } from './lib/booking'
import { LearnPage, PracticePage, SignsPage, TermsPage } from './Study'
import type { Lang, Question, Img } from './lib/types'

type Route = { page: 'home' } | { page: 'lesson' | 'quiz'; topic: string } | { page: 'exam' } | { page: 'privacy' } | { page: 'book' } | { page: 'learn' | 'practice' | 'signs' | 'terms' }

function parse(hash: string): Route {
  const [p, id] = hash.replace(/^#\/?/, '').split('/')
  if ((p === 'lesson' || p === 'quiz') && id) return { page: p, topic: decodeURIComponent(id) }
  if (['exam', 'privacy', 'book', 'learn', 'practice', 'signs', 'terms'].includes(p)) return { page: p } as Route
  return { page: 'home' }
}

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

function Picture({ img, lang }: { img?: Img; lang: Lang }) {
  if (!img) return null
  const src = img.sign ? signAssets[img.signId ?? '']?.url : img.src
  return src ? <img className={img.sign ? 'pic sign-pic' : 'pic'} src={src} alt={img.alt[lang]} loading="lazy" /> : null
}

function QuestionRun({ questions, lang, onAnswer, onDone, doneLabel }: {
  questions: Question[]; lang: Lang; onAnswer: (q: Question, ok: boolean) => void; onDone: () => void; doneLabel: string
}) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [en, setEn] = useState(false)
  const t = (k: Key) => strings[k][lang]
  const q = questions[i]
  if (!q) return <p>{t('noQuestions')}</p>
  const ok = pick !== null && q.options[pick].correct
  const last = i === questions.length - 1
  return (
    <section>
      <p className="muted">{i + 1} / {questions.length}</p>
      <h2>{q.text[lang]}</h2>
      <Picture img={q.image} lang={lang} />
      {lang === 'ru' && (
        <>
          <button className="link" aria-expanded={en} onClick={() => setEn(!en)}>{en ? t('hideEn') : t('showEn')}</button>
          {en && (
            <div className="en-block" lang="en">
              <strong>{q.text.en}</strong>
              <ul>{q.options.map((o, k) => <li key={k}>{o.text.en}</li>)}</ul>
            </div>
          )}
        </>
      )}
      <div className="options">
        {q.options.map((o, k) => (
          <button key={k} className={`opt${pick === k ? ' sel' : ''}${checked && o.correct ? ' good' : ''}`}
            disabled={checked} onClick={() => setPick(k)}>{o.text[lang]}</button>
        ))}
      </div>
      {!checked ? (
        <button className="primary" disabled={pick === null} onClick={() => { setChecked(true); onAnswer(q, ok) }}>{t('check')}</button>
      ) : (
        <>
          <p className={ok ? 'fb good' : 'fb hint'}>{ok ? t('correct') : t('wrong')} {q.options[pick!].explanation[lang]}</p>
          <button className="primary" onClick={() => {
            if (last) onDone(); else { setI(i + 1); setPick(null); setChecked(false); setEn(false) }
          }}>{last ? doneLabel : t('next')}</button>
        </>
      )}
    </section>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [route, setRoute] = useState<Route>(() => parse(location.hash))
  const [progress, setProgress] = useState<Progress>(load)
  const [toast, setToast] = useState<string | null>(null)
  const [run, setRun] = useState(0)
  const t = (k: Key) => strings[k][lang]

  useEffect(() => { document.documentElement.lang = lang; persistLang(lang) }, [lang])
  useEffect(() => {
    const h = () => { setRoute(parse(location.hash)); setRun((r) => r + 1) }
    addEventListener('hashchange', h); return () => removeEventListener('hashchange', h)
  }, [])
  useEffect(() => { track({ type: 'view', page: route.page, topic: 'topic' in route ? route.topic : undefined }) }, [route])
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(null), 4000); return () => clearTimeout(id) } }, [toast])

  const update = (p: Progress) => { setProgress(p); save(p) }
  const celebrate = (m: Key) => setToast(strings[m][lang])
  const go = (h: string) => location.assign(`#${h}`)

  const wasReady = readiness(progress, topics).ready
  const afterChange = (p: Progress, msg?: Key) => {
    update(p)
    if (msg) celebrate(msg)
    else if (!wasReady && readiness(p, topics).ready) celebrate('ready')
  }

  const body = (() => {
    if (route.page === 'book')
      return (
        <section>
          <h2>{BOOKING.title[lang]}</h2>
          <p>{BOOKING.intro[lang]}</p>
          <ol>
            {BOOKING.steps.map((st, i) => (
              <li key={i}>
                {st.text[lang]}
                {st.link && <> <a href={st.link.href} target="_blank" rel="noopener noreferrer">{st.link.label[lang]} ↗</a></>}
              </li>
            ))}
          </ol>
          {BOOKING.extras.map((e, i) => <p key={i}>{e[lang]}</p>)}
          <p className="muted">{BOOKING.disclaimer[lang]}</p>
        </section>
      )
    if (route.page === 'learn') return <LearnPage lang={lang} go={go} />
    if (route.page === 'practice') return <PracticePage lang={lang} go={go} progress={progress} />
    if (route.page === 'signs') return <SignsPage lang={lang} />
    if (route.page === 'terms') return <TermsPage lang={lang} />
    if (route.page === 'privacy') return <section><h2>{t('privacy')}</h2><p>{strings.privacyBody[lang]}</p></section>
    if (route.page === 'lesson' || route.page === 'quiz') {
      const topic = topics.find((x) => x.id === route.topic)
      if (!topic) return null
      if (route.page === 'lesson')
        return (
          <section>
            <h2>{topic.title[lang]}</h2>
            <Picture img={topic.lesson?.image} lang={lang} />
            <p>{topic.lesson?.body[lang]}</p>
            <button className="primary" onClick={() => go(`/quiz/${encodeURIComponent(topic.id)}`)}>{t('quiz')}</button>
          </section>
        )
      return (
        <QuestionRun key={`${topic.id}-${run}`} questions={shuffle(quizPool(topic.id))} lang={lang} doneLabel={t('finish')}
          onAnswer={(q, ok) => {
            track({ type: 'answer', topic: topic.id, question: q.id, correct: ok })
            update({ ...progress, answers: { ...progress.answers, [topic.id]: { ...progress.answers[topic.id], [q.id]: ok } } })
          }}
          onDone={() => {
            if (!topicStats(progress, topic).met) { go('/'); return }
            afterChange(progress, 'topicDone'); go('/')
          }} />
      )
    }
    if (route.page === 'exam') return <Exam key={run} lang={lang} onFinish={(sim) => {
      track({ type: 'simulation', passed: sim.passed })
      afterChange({ ...progress, sims: [...progress.sims, sim] }, sim.passed ? 'passed' : undefined)
      go('/')
    }} />
    const r = readiness(progress, topics)
    return (
      <>
        <p className="note">{t('langNote')}</p>
        <h2>{t('readiness')}</h2>
        {r.ready ? <p className="fb good">{t('ready')}</p> : (
          <p>{t('remaining')} {[...r.weak.map((id) => topics.find((x) => x.id === id)!.title[lang]), ...(r.simPassed ? [] : [t('passSim')])].join(', ')}</p>
        )}
        <h2>{t('hub')}</h2>
        <ul className="hub">
          {([
            ['📖', t('learn'), '/learn', false],
            ['🚸', t('signs'), '/signs', false],
            ['🔤', t('terms'), '/terms', false],
            ['✏️', t('practice'), '/practice', false],
            ['🏁', t('simulation'), '/exam', examPool().length === 0],
            ['📅', BOOKING.title[lang], '/book', false],
          ] as const).map(([icon, label, href, off]) => (
            <li key={href}><button disabled={off} onClick={() => go(href)}><span aria-hidden="true">{icon}</span> {label}</button></li>
          ))}
        </ul>
        <h2>{t('progress')}</h2>
        {topics.length === 0 && <p>{t('noContent')}</p>}
        <ul className="progress">
          {topics.map((tp) => { const st = topicStats(progress, tp); return (
            <li key={tp.id}>{tp.title[lang]} <span className="muted">{st.correct}/{st.answered} {st.met ? '✓' : ''}</span></li>) })}
        </ul>
        <p className="muted">{t('deviceLocal')}</p>
        <button className="link" onClick={() => { if (confirm(t('resetConfirm'))) setProgress(reset()) }}>{t('reset')}</button>
      </>
    )
  })()

  return (
    <div className="app">
      <header>
        <a href="#/" className="brand">{t('title')}</a>
        <div className="lang" role="group" aria-label="Language">
          {(['ru', 'en'] as const).map((l) => <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
        </div>
      </header>
      <main>{body}</main>
      <footer><a href="#/privacy">{t('privacy')}</a></footer>
      {toast && <div className="toast" role="status">🎉 {toast}</div>}
    </div>
  )
}

function Exam({ lang, onFinish }: { lang: Lang; onFinish: (s: import('./lib/progress').Sim) => void }) {
  const [qs] = useState(() => examDraw())
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState<import('./lib/progress').Sim | null>(null)
  const t = (k: Key) => strings[k][lang]
  if (summary)
    return (
      <section>
        <h2>{t('score')}: {summary.correct}/{summary.total}</h2>
        <p className={summary.passed ? 'fb good' : 'fb hint'}>{summary.passed ? t('passed') : t('notPassed')}</p>
        <ul>{Object.entries(summary.perTopic).map(([id, [c, n]]) => <li key={id}>{topics.find((x) => x.id === id)?.title[lang]}: {c}/{n}</li>)}</ul>
        <button className="primary" onClick={() => onFinish(summary)}>{t('home')}</button>
      </section>
    )
  return (
    <QuestionRun questions={qs} lang={lang} doneLabel={t('finish')}
      onAnswer={(q, ok) => { track({ type: 'answer', topic: q.topic, question: q.id, correct: ok }); setResults((r) => ({ ...r, [q.id]: ok })) }}
      onDone={() => {
        const perTopic: Record<string, [number, number]> = {}
        for (const q of qs) { const e = perTopic[q.topic] ?? [0, 0]; perTopic[q.topic] = [e[0] + (results[q.id] ? 1 : 0), e[1] + 1] }
        const correct = qs.filter((q) => results[q.id]).length
        // Pass mark scales if the bank is smaller than the official test length (provisional, DEC-012).
        const need = Math.ceil((EXAM.passCorrect / EXAM.total) * qs.length)
        setSummary({ date: new Date().toISOString().slice(0, 10), correct, total: qs.length, passed: qs.length > 0 && correct >= need, perTopic })
      }} />
  )
}
