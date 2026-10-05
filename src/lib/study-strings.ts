import type { L10n, SignCategory } from './types'

export const SIGN_CATEGORY_LABEL: Record<SignCategory, L10n> = {
  regulatory: { ru: 'Запрещающие и предписывающие', en: 'Regulatory signs' },
  warning: { ru: 'Предупреждающие', en: 'Warning signs' },
  guide: { ru: 'Указательные', en: 'Guide signs' },
  construction: { ru: 'Дорожные работы', en: 'Construction and maintenance' },
  signal: { ru: 'Светофоры и сигналы', en: 'Traffic signals' },
  marking: { ru: 'Дорожная разметка', en: 'Pavement markings' },
  other: { ru: 'Другие знаки', en: 'Other signs' },
}
