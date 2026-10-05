import { useEffect, useRef, useState } from 'react'
import { topics, examPool, examDraw, quizPool, signAssets } from './lib/content'
import { EXAM } from './lib/config'
import { initialLang, persistLang, strings, type Key } from './lib/i18n'
import { load, save, reset, topicStats, readiness, type Progress, type Sim } from './lib/progress'
import { track } from './lib/analytics'
import { BOOKING } from './lib/booking'
import { LearnPage, PracticePage, SignsPage, TermsPage } from './Study'
import { Rich } from './Rich'
import { IconBook, IconBulb, IconCalendar, IconCheck, IconExternal, IconFlag, IconInfo, IconPencil, IconSign, IconTerms, Logo } from './Icons'
import type { Lang, Question, Img } from './lib/types'

type Route = { page: 'home' } | { page: 'lesson' | 'quiz'; topic: string } | { page: 'exam' } | { page: 'privacy' } | { page: 'book' } | { page: 'learn' | 'practice' | 'signs' | 'terms' }

function parse(hash: string): Route {
  const [p, id] = hash.replace(/^#\/?/, '').split('/')
  if ((p === 'lesson' || p === 'quiz') && id) return { page: p, topic: decodeURIComponent(id) }
  if (['exam', 'privacy', 'book', 'learn', 'practice', 'signs', 'terms'].includes(p)) return { page: p } as Route
  return { page: 'home' }
}

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const LETTERS = ['A', 'B', 'C', 'D', 'E']

function Picture({ img, lang }: { img?: Img; lang: Lang }) {
  if (!img) return null
  const src = img.sign ? signAssets[img.signId ?? '']?.url : img.src
  return src ? <img className={img.sign ? 'pic sign-pic' : 'pic'} src={src} alt={img.alt[lang]} loading="lazy" /> : null
}

function QuestionRun({ questions: given, lang, onAnswer, onDone, doneLabel, shuffled = false }: {
  questions: Question[]; lang: Lang; onAnswer: (q: Question, ok: boolean) => void; onDone: () => void; doneLabel: string; shuffled?: boolean
}) {
  // Order is fixed once per run: a parent re-render must never reshuffle the questions under the learner.
  const [questions] = useState(() => (shuffled ? shuffle(given) : given))
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [en, setEn] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)
  useEffect(() => { if (checked) feedback.current?.scrollIntoView({ block: 'nearest' }) }, [checked])
  const t = (k: Key) => strings[k][lang]
  const q = questions[i]
  if (!q) return <p className="empty">{t('noQuestions')}</p>
  const ok = pick !== null && q.options[pick].correct
  const last = i === questions.length - 1
  return (
    <section className="reading">
      <div className="q-top">
        <div className="bar" aria-hidden="true"><i style={{ width: `${((i + (checked ? 1 : 0)) / questions.length) * 100}%` }} /></div>
        <span>{i + 1} {t('questionOf')} {questions.length}</span>
      </div>
      <h2 className="q-text">{q.text[lang]}</h2>
      <Picture img={q.image} lang={lang} />
      {lang === 'ru' && (
        <>
          <button className="en-toggle" aria-expanded={en} onClick={() => setEn(!en)}>{en ? t('hideEn') : t('showEn')}</button>
          {en && (
            <div className="en-block" lang="en">
              <strong>{q.text.en}</strong>
              <ul>{q.options.map((o, k) => <li key={k}>{o.text.en}</li>)}</ul>
            </div>
          )}
        </>
      )}
      <div className="options">
        {q.options.map((o, k) => {
          const cls = checked ? (o.correct ? ' good' : pick === k ? ' miss' : '') : pick === k ? ' sel' : ''
          return (
            <button key={k} className={`opt${cls}`} disabled={checked} onClick={() => setPick(k)}>
              <span className="badge">{checked && o.correct ? <IconCheck /> : LETTERS[k]}</span>
              <span>{o.text[lang]}</span>
            </button>
          )
        })}
      </div>
      {checked && (
        <div ref={feedback} className={`fb ${ok ? 'good' : 'hint'}`} role="status">
          {ok ? <IconCheck /> : <IconBulb />}
          <div><strong>{ok ? t('correct') : t('wrong')}</strong>{q.options[pick!].explanation[lang]}</div>
        </div>
      )}
      <div className="actions">
        {!checked ? (
          <button className="primary" disabled={pick === null} onClick={() => { setChecked(true); onAnswer(q, ok) }}>{t('check')}</button>
        ) : (
          <button className="primary" onClick={() => {
            if (last) onDone(); else { setI(i + 1); setPick(null); setChecked(false); setEn(false) }
          }}>{last ? doneLabel : t('next')}</button>
        )}
      </div>
    </section>
  )
}

const CONFETTI = ['#ffc20e', '#ffffff', '#7fe0b8', '#ffc20e', '#ffffff', '#7fe0b8', '#ffc20e', '#ffffff']
function Celebration({ message }: { message: string }) {
  return (
    <div className="celebrate" role="status">
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((c, k) => <i key={k} style={{ left: `${10 + k * 11}%`, background: c, animationDelay: `${k * 0.05}s`, ['--dx' as string]: `${(k % 2 ? 1 : -1) * (10 + k * 4)}px` }} />)}
      </div>
      <span className="star" aria-hidden="true" />
      <strong>{message}</strong>
    </div>
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
    const h = () => { setRoute(parse(location.hash)); setRun((r) => r + 1); window.scrollTo(0, 0) }
    addEventListener('hashchange', h); return () => removeEventListener('hashchange', h)
  }, [])
  useEffect(() => { track({ type: 'view', page: route.page, topic: 'topic' in route ? route.topic : undefined }) }, [route])
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(null), 4500); return () => clearTimeout(id) } }, [toast])

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
        <section className="reading">
          <h2>{BOOKING.title[lang]}</h2>
          <p>{BOOKING.intro[lang]}</p>
          <ol className="steps">
            {BOOKING.steps.map((st, i) => (
              <li key={i}>
                {st.text[lang]}
                {st.link && <a href={st.link.href} target="_blank" rel="noopener noreferrer">{st.link.label[lang]} <IconExternal /></a>}
              </li>
            ))}
          </ol>
          {BOOKING.extras.map((e, i) => <p key={i} className="info"><IconInfo /><span>{e[lang]}</span></p>)}
          <p className="muted">{BOOKING.disclaimer[lang]}</p>
        </section>
      )
    if (route.page === 'learn') return <LearnPage lang={lang} go={go} />
    if (route.page === 'practice') return <PracticePage lang={lang} go={go} progress={progress} />
    if (route.page === 'signs') return <SignsPage lang={lang} />
    if (route.page === 'terms') return <TermsPage lang={lang} />
    if (route.page === 'privacy') return <section className="reading"><h2>{t('privacy')}</h2><p>{strings.privacyBody[lang]}</p></section>
    if (route.page === 'lesson' || route.page === 'quiz') {
      const topic = topics.find((x) => x.id === route.topic)
      if (!topic) return null
      if (route.page === 'lesson')
        return (
          <section className="reading">
            <h2>{topic.title[lang]}</h2>
            <Picture img={topic.lesson?.image} lang={lang} />
            <Rich text={topic.lesson?.body[lang] ?? ''} />
            <div className="actions"><button className="primary" onClick={() => go(`/quiz/${encodeURIComponent(topic.id)}`)}>{t('takeQuiz')}</button></div>
          </section>
        )
      return (
        <QuestionRun key={`${topic.id}-${run}`} questions={quizPool(topic.id)} shuffled lang={lang} doneLabel={t('finish')}
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
    const n = r.weak.length
    const plural = (k: number, one: string, few: string, many: string) => (k % 10 === 1 && k % 100 !== 11 ? one : k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 12 || k % 100 > 14) ? few : many)
    const topicsLeft = lang === 'ru' ? `${n} ${plural(n, 'тема', 'темы', 'тем')}` : `${n} ${n === 1 ? 'topic' : 'topics'}`
    const remaining = [...(n ? [topicsLeft] : []), ...(r.simPassed ? [] : [t('passSim')])].join(lang === 'ru' ? ' и ' : ' and ')
    const tiles = [
      { cls: 'learn', icon: <IconBook />, label: t('learn'), sub: t('learnHint'), href: '/learn', off: false },
      { cls: 'sec-signs', icon: <IconSign />, label: t('signs'), sub: t('signsHint'), href: '/signs', off: false },
      { cls: 'terms', icon: <IconTerms />, label: t('terms'), sub: t('termsHint'), href: '/terms', off: false },
      { cls: 'practice', icon: <IconPencil />, label: t('practice'), sub: t('practiceHint'), href: '/practice', off: false },
      { cls: 'exam', icon: <IconFlag />, label: t('simulation'), sub: t('simulationHint'), href: '/exam', off: examPool().length === 0 },
      { cls: 'book', icon: <IconCalendar />, label: BOOKING.title[lang], sub: t('bookHint'), href: '/book', off: false },
    ]
    return (
      <>
        <div className="guide">
          <h1>{t('tagline')}</h1>
          {topics.length > 0 ? (
            <>
              <div className="seg" role="img" aria-label={t('readiness')}>
                {topics.map((tp) => <i key={tp.id} className={topicStats(progress, tp).met ? 'on' : ''} />)}
                <i className={`sim${r.simPassed ? ' on' : ''}`} />
              </div>
              <div className="seg-legend">{r.ready ? t('ready') : `${t('remaining')} ${remaining}`}</div>
            </>
          ) : <p>{t('noContent')}</p>}
        </div>
        <ul className="hub">
          {tiles.map((x) => (
            <li key={x.href}>
              <button className="tile" disabled={x.off} onClick={() => go(x.href)}>
                <span className={`shape ${x.cls}`}>{x.icon}</span>
                <span><strong>{x.label}</strong><span className="sub">{x.sub}</span></span>
              </button>
            </li>
          ))}
        </ul>
        {topics.length > 0 && (
          <>
            <h2 className="section-title">{t('progress')}</h2>
            <ul className="rows">
              {topics.map((tp) => {
                const st = topicStats(progress, tp)
                return (
                  <li key={tp.id} className="pad">
                    <div className="row-main"><strong>{tp.title[lang]} {st.met && <span className="tick"><IconCheck /></span>}</strong>
                      <div className="mini" aria-hidden="true">{Array.from({ length: 5 }, (_, k) => <i key={k} className={k < Math.min(5, Math.round((st.correct / Math.max(1, 5)) * 5)) ? 'on' : ''} />)}</div></div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        <p className="info" style={{ marginTop: 20 }}><IconInfo /><span>{t('langNote')}</span></p>
        <p className="muted">{t('deviceLocal')}</p>
        <button className="link" onClick={() => { if (confirm(t('resetConfirm'))) setProgress(reset()) }}>{t('reset')}</button>
      </>
    )
  })()

  return (
    <div className="app">
      <header>
        <a href="#/" className="brand"><Logo /><span>{t('title')}</span></a>
        <div className="lang" role="group" aria-label="Language">
          {(['ru', 'en'] as const).map((l) => <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
        </div>
      </header>
      <main>{body}</main>
      <footer><p>{t('unofficial')}</p><a href="#/privacy">{t('privacy')}</a></footer>
      {toast && <Celebration message={toast} />}
    </div>
  )
}

function Exam({ lang, onFinish }: { lang: Lang; onFinish: (s: Sim) => void }) {
  const [qs] = useState(() => examDraw())
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState<Sim | null>(null)
  const t = (k: Key) => strings[k][lang]
  if (summary)
    return (
      <section className="reading">
        <p className="muted">{t('score')}</p>
        <div className="score">{summary.correct}<span className="muted"> / {summary.total}</span></div>
        <p className={`fb ${summary.passed ? 'good' : 'hint'}`} style={{ marginTop: 16 }}>{summary.passed ? <IconCheck /> : <IconBulb />}<span>{summary.passed ? t('passed') : t('notPassed')}</span></p>
        <ul className="breakdown">
          {Object.entries(summary.perTopic).map(([id, [c, n]]) => (
            <li key={id}><span>{topics.find((x) => x.id === id)?.title[lang]}</span><span className="muted">{c}/{n}</span>
              <div className="mini" aria-hidden="true"><i className={c / n >= 0.8 ? 'on' : ''} style={{ flex: n }} /></div></li>
          ))}
        </ul>
        <div className="actions"><button className="primary" onClick={() => onFinish(summary)}>{t('home')}</button></div>
      </section>
    )
  return (
    <QuestionRun questions={qs} lang={lang} doneLabel={t('finish')}
      onAnswer={(q, ok) => { track({ type: 'answer', topic: q.topic, question: q.id, correct: ok }); setResults((r) => ({ ...r, [q.id]: ok })) }}
      onDone={() => {
        const perTopic: Record<string, [number, number]> = {}
        for (const q of qs) { const e = perTopic[q.topic] ?? [0, 0]; perTopic[q.topic] = [e[0] + (results[q.id] ? 1 : 0), e[1] + 1] }
        const correct = qs.filter((q) => results[q.id]).length
        // The pass mark scales if the bank is smaller than the official 35-question test (80%, DEC-019).
        const need = Math.ceil((EXAM.passCorrect / EXAM.total) * qs.length)
        setSummary({ date: new Date().toISOString().slice(0, 10), correct, total: qs.length, passed: qs.length > 0 && correct >= need, perTopic })
      }} />
  )
}
