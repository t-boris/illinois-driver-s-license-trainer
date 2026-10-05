---
type: feature
id: illinois-driver-s-license-trainer
title: Illinois Driver's License Trainer
status: exploring
owner: Boris Tsekinovsky
created: 2026-10-05
provenance: Created from the new-project intake
understanding:
  Problem: known
  Target Users: known
  Primary Workflow: known
  Permissions: known
  Failure Scenarios: partial
  Data Model: partial
  Notifications: n/a
  Security: known
  Analytics: known
  Dependencies: partial
  Acceptance Criteria: known
understanding_notes:
  Problem: Скучные официальные материалы и отсутствие весёлого двуязычного мобильного тренажёра для письменного экзамена в Иллинойсе.
  Target Users: Русскоязычные взрослые иммигранты в Иллинойсе, сдающие впервые или переоформляющие; английский полностью поддерживается.
  Primary Workflow: Урок по теме → квиз → симуляция экзамена; переключатель языка + «показать на английском» на экране вопроса; индикатор готовности по темам.
  Permissions: Без аккаунтов и ролей; все пользователи анонимны.
  Failure Scenarios: Потеря прогресса при очистке браузера — следствие DEC-004; недоступность аналитики не влияет на обучение. Остальное решает исполнитель.
  Data Model: Темы, уроки, двуязычные вопросы с объяснениями и картинками, локальный прогресс, агрегированные события аналитики. Детали схемы — за исполнителем.
  Notifications: Уведомлений нет.
  Security: Нет ПД и аккаунтов; аналитика анонимна, без идентификаторов; нужна краткая заметка о приватности.
  Analytics: Анонимная агрегированная аналитика просмотров и результатов по вопросам/темам, без баннера согласия.
  Dependencies: "Официальный Illinois Rules of the Road как источник контента; Vercel для деплоя; генератор картинок (не выбран). Внешний факт для проверки: формат реального экзамена и доступность сдачи на русском."
  Acceptance Criteria: Готовность = порог по каждой теме + сданная симуляция; критерии зафиксированы в требованиях.
questions_left: 0
confirmed: 2026-10-05
---

# Illinois Driver's License Trainer

## Idea

A bilingual (Russian/English) web application that prepares users for the Illinois driver's license written knowledge test. It works equally on phones and desktops, uses an upbeat, playful tone and a large amount of (generated) imagery, and aims to get the user as ready as possible for the real exam. Hosted on Vercel.

## Problem

People preparing for the Illinois written driving test — in particular Russian speakers who may not be fully comfortable with English-only materials — face dry official manuals and uninspiring quiz sites. There is no fun, visual, mobile-friendly bilingual trainer that systematically brings them to exam readiness.

## Scope

IN (v1): Russian/English UI and content with language switching; responsive web app (mobile + desktop); study content covering Illinois rules of the road and road signs; practice/quiz mode and an exam-simulation mode modelled on the real Illinois test; playful, positive tone, illustrations/images throughout; deployment on Vercel.
OUT (v1, inferred — to be confirmed): road (driving) test preparation, DMV appointment booking, other US states, paid plans/monetisation, native mobile apps, offline mode, social features.
