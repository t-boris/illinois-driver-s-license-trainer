import type { Lang } from './types'

export const strings = {
  title: { ru: 'Права Иллинойса: тренажёр', en: 'Illinois License Trainer' },
  tagline: { ru: 'Готовимся к письменному экзамену — легко и с улыбкой', en: 'Getting ready for the written test — easy and with a smile' },
  langNote: {
    ru: 'Письменный экзамен в Иллинойсе проводится на английском и может быть доступен на других языках; при необходимости можно запросить устный экзамен или переводчика. Подробности — на сайте Секретаря штата Иллинойс (ilsos.gov).',
    en: 'The Illinois written test is given in English and may be offered in other languages; an oral exam or an interpreter may be available on request. See the Illinois Secretary of State site (ilsos.gov) for details.',
  },
  learn: { ru: 'Учиться', en: 'Learn' },
  learnHint: { ru: 'Короткие уроки с картинками по каждой теме.', en: 'Short illustrated lessons for each topic.' },
  practice: { ru: 'Тесты по темам', en: 'Practice quizzes' },
  practiceHint: { ru: 'Проверьте себя после урока — ошибки здесь только учат.', en: 'Check yourself after a lesson — mistakes here only teach.' },
  signs: { ru: 'Знаки', en: 'Signs' },
  signsHint: { ru: 'Нажмите на знак, чтобы узнать, что он означает.', en: 'Tap a sign to see what it means.' },
  terms: { ru: 'Термины', en: 'Terms' },
  termsHint: { ru: 'Английские термины с экзамена и их русские аналоги.', en: 'Exam terms in English with plain explanations.' },
  takeQuiz: { ru: 'Пройти тест по теме', en: 'Take the topic quiz' },
  simulationHint: { ru: '35 вопросов, как на настоящем экзамене', en: '35 questions, like the real test' },
  bookHint: { ru: 'Шаги и официальные ссылки', en: 'Steps and official links' },
  questionOf: { ru: 'из', en: 'of' },
  search: { ru: 'Поиск', en: 'Search' },
  noResults: { ru: 'Ничего не найдено.', en: 'Nothing found.' },
  hub: { ru: 'Разделы', en: 'Sections' },
  topics: { ru: 'Темы', en: 'Topics' },
  noContent: { ru: 'Учебные материалы появятся здесь, как только пройдут проверку.', en: 'Study material will appear here once it has been reviewed.' },
  readiness: { ru: 'Готовность к экзамену', en: 'Exam readiness' },
  ready: { ru: 'Вы готовы! Удачи на экзамене!', en: "You're ready! Good luck on the test!" },
  remaining: { ru: 'Осталось:', en: 'Still to do:' },
  weakTopics: { ru: 'Темы для повторения', en: 'Topics to revisit' },
  passSim: { ru: 'сдать симуляцию экзамена', en: 'pass an exam simulation' },
  lesson: { ru: 'Урок', en: 'Lesson' },
  quiz: { ru: 'Квиз', en: 'Quiz' },
  simulation: { ru: 'Симуляция экзамена', en: 'Exam simulation' },
  showEn: { ru: 'Показать на английском', en: 'Show in English' },
  hideEn: { ru: 'Скрыть английский', en: 'Hide English' },
  next: { ru: 'Дальше', en: 'Next' },
  finish: { ru: 'Завершить', en: 'Finish' },
  check: { ru: 'Проверить', en: 'Check' },
  correct: { ru: 'Верно! Так держать!', en: 'Correct! Keep it up!' },
  wrong: { ru: 'Почти! Разберём, почему:', en: 'Almost! Here is why:' },
  home: { ru: 'На главную', en: 'Home' },
  back: { ru: 'Назад', en: 'Back' },
  score: { ru: 'Результат', en: 'Score' },
  passed: { ru: 'Симуляция сдана — отличная работа!', en: 'Simulation passed — great work!' },
  notPassed: { ru: 'В этот раз не вышло — каждая попытка учит. Попробуйте ещё!', en: 'Not this time — every try teaches something. Go again!' },
  topicDone: { ru: 'Тема пройдена — молодец!', en: 'Topic complete — nicely done!' },
  deviceLocal: { ru: 'Прогресс хранится только в этом браузере на этом устройстве.', en: 'Progress is stored only in this browser on this device.' },
  reset: { ru: 'Сбросить прогресс', en: 'Reset progress' },
  resetConfirm: { ru: 'Сбросить весь прогресс на этом устройстве?', en: 'Reset all progress on this device?' },
  privacy: { ru: 'Конфиденциальность', en: 'Privacy' },
  privacyBody: {
    ru: 'Мы собираем только анонимную статистику: просмотры страниц и тем, количество верных и неверных ответов по вопросам и темам, итоги симуляций. Без cookie, аккаунтов, имён и идентификаторов. Прогресс остаётся в вашем браузере.',
    en: 'We collect only anonymous statistics: page and topic views, correct/incorrect answer counts per question and topic, and simulation outcomes. No cookies, accounts, names or identifiers. Your progress stays in your browser.',
  },
  unofficial: {
    ru: 'Неофициальное учебное приложение, не связано с Секретарём штата Иллинойс. Официальный источник — Illinois Rules of the Road на ilsos.gov.',
    en: 'Unofficial study app, not affiliated with the Illinois Secretary of State. The official source is the Illinois Rules of the Road at ilsos.gov.',
  },
  flashcards: { ru: 'Карточки', en: 'Flashcards' },
  flipHint: { ru: 'Нажмите на карточку, чтобы перевернуть. Стрелки ← → — следующая и предыдущая.', en: 'Tap the card to flip it. Use ← → for previous and next.' },
  prev: { ru: 'Назад', en: 'Previous' },
  shuffle: { ru: 'Перемешать', en: 'Shuffle' },
  betaBanner: {
    ru: 'Бета: материалы ещё не проверены проверяющим по Rules of the Road. Главный источник — официальное руководство Иллинойса (ilsos.gov).',
    en: 'Beta: these materials have not yet been reviewed against the Rules of the Road by a reviewer. The official Illinois manual (ilsos.gov) is the authority.',
  },
  draftTag: { ru: 'Черновик', en: 'Draft' },
  progress: { ru: 'Прогресс', en: 'Progress' },
  noQuestions: { ru: 'Вопросов пока нет.', en: 'No questions yet.' },
} satisfies Record<string, Record<Lang, string>>

export type Key = keyof typeof strings
const LANG_KEY = 'ildl.lang'
export function initialLang(): Lang {
  try { const v = localStorage.getItem(LANG_KEY); if (v === 'ru' || v === 'en') return v } catch { /* ignore */ }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}
export function persistLang(l: Lang) { try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ } }
