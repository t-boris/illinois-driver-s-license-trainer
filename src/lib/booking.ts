import type { L10n } from './types'

// Official Illinois Secretary of State links, verified 2026-10-04 (SRC-002, DEC-020, REQ-009).
export const BOOKING_LINKS = {
  appointments: 'https://www.ilsos.gov/departments/drivers/appointments.html',
  schedule: 'https://apps.ilsos.gov/dlexamcheck/',
  facilities: 'https://apps.ilsos.gov/facilityfinder/facility',
  documents: 'https://www.ilsos.gov/departments/drivers/drivers-license/accept-id-checklist.html',
  realId: 'https://realid.ilsos.gov/',
} as const

export const BOOKING: {
  title: L10n; intro: L10n; steps: { text: L10n; link?: { href: string; label: L10n } }[]; extras: L10n[]; disclaimer: L10n
} = {
  title: { ru: 'Запись на экзамен', en: 'Book your exam' },
  intro: {
    ru: 'Записаться на экзамен можно на официальном сайте Секретаря штата Иллинойс. Приложение само ничего не бронирует и не хранит данные о записи.',
    en: 'You book your exam on the official Illinois Secretary of State website. This app does not book anything and stores no appointment data.',
  },
  steps: [
    {
      text: { ru: 'Откройте официальную страницу записи и выберите «Schedule a DMV Appointment». Записаться можно за 90 дней вперёд.', en: 'Open the official appointments page and choose “Schedule a DMV Appointment”. You can book up to 90 days in advance.' },
      link: { href: BOOKING_LINKS.schedule, label: { ru: 'Записаться на приём', en: 'Schedule a DMV appointment' } },
    },
    {
      text: { ru: 'Найдите ближайший офис DMV (Driver Services).', en: 'Find your nearest DMV (Driver Services) facility.' },
      link: { href: BOOKING_LINKS.facilities, label: { ru: 'Поиск офиса DMV', en: 'DMV facility finder' } },
    },
    {
      text: { ru: 'Заранее соберите документы по официальному списку.', en: 'Gather your documents from the official checklist beforehand.' },
      link: { href: BOOKING_LINKS.documents, label: { ru: 'Список документов', en: 'Acceptable documents checklist' } },
    },
    {
      text: { ru: 'Нужен REAL ID? Проверьте, нужен ли он вам и какие документы требуются.', en: 'Need a REAL ID? Check whether you need one and which documents it takes.' },
      link: { href: BOOKING_LINKS.realId, label: { ru: 'Информация о REAL ID', en: 'REAL ID information' } },
    },
    {
      text: { ru: 'Чтобы отменить или изменить запись, откройте страницу записи и выберите «Cancel or Modify a DMV Appointment».', en: 'To cancel or change an appointment, open the appointments page and choose “Cancel or Modify a DMV Appointment”.' },
      link: { href: BOOKING_LINKS.appointments, label: { ru: 'Страница записи (SOS)', en: 'Appointments page (SOS)' } },
    },
  ],
  extras: [
    {
      ru: 'Устный экзамен (письменный тест вслух) можно запросить лично в любом офисе Driver Services с понедельника по четверг — для тех, кому мешает языковой барьер или трудности с чтением.',
      en: 'An oral version of the written test can be requested in person at any Driver Services facility, Monday through Thursday, if you have a language barrier or any reading or learning difficulty.',
    },
    {
      ru: 'Для старших водителей есть отдельная линия: 800-252-8980, вариант 2 (пн–пт, 8:00–16:30), а также офисы без записи только для пенсионеров.',
      en: 'Seniors have a dedicated line: 800-252-8980, option 2 (Mon–Fri, 8 a.m.–4:30 p.m.), plus walk-in seniors-only DMVs.',
    },
  ],
  disclaimer: {
    ru: 'Правила и доступность записи определяет Секретарь штата Иллинойс; перед визитом сверяйтесь с ilsos.gov.',
    en: 'Appointment rules and availability are set by the Illinois Secretary of State; check ilsos.gov before your visit.',
  },
}
