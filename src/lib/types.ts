export type Lang = 'ru' | 'en'
export type L10n = Record<Lang, string>
export interface Img { src?: string; alt: L10n; sign?: boolean; signId?: string }
export interface Option { correct: boolean; text: L10n; explanation: L10n }
export interface Question { draft?: boolean; kind: 'question'; id: string; topic: string; pool: 'quiz' | 'exam'; category: 'sign' | 'rule'; text: L10n; options: Option[]; image?: Img }
export interface Lesson { draft?: boolean; kind: 'lesson'; id: string; topic: string; title: L10n; body: L10n; image?: Img }
export interface Term { draft?: boolean; kind: 'term'; id: string; topic: string; term: L10n; definition: L10n }
export type SignCategory = 'regulatory' | 'warning' | 'guide' | 'construction' | 'signal' | 'marking' | 'other'
export interface SignCard { draft?: boolean; kind: 'signcard'; id: string; topic: string; signId: string; category: SignCategory; name: L10n; meaning: L10n }
export interface SignAsset { id: string; designation: string; url: string; alt: L10n }
export type Item = Question | Lesson | Term | SignCard
export interface Topic { id: string; title: L10n; lesson?: Lesson; questions: Question[] }
