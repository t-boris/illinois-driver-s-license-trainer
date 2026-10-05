// Simple stroke pictograms (24px grid). Decorative: always aria-hidden.
const base = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export function IconBook() { return <svg {...base}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M8 7h8M8 11h6" /></svg> }
export function IconSign() { return <svg {...base}><path d="M12 5.5v8" strokeWidth="3" /><path d="M12 18.5h.01" strokeWidth="3.4" /></svg> }
export function IconTerms() { return <svg {...base}><path d="M4 18 9 6l5 12M5.8 14h6.4" /><path d="M16 11h4M18 11v7" /></svg> }
export function IconPencil() { return <svg {...base}><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" /><path d="M14 7l3 3" /></svg> }
export function IconFlag() { return <svg {...base}><path d="M5 21V4" /><path d="M5 5h12l-2 4 2 4H5" /></svg> }
export function IconCalendar() { return <svg {...base}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg> }
export function IconCheck() { return <svg {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> }
export function IconBulb() { return <svg {...base}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg> }
export function IconSearch() { return <svg {...base}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg> }
export function IconChevron() { return <svg {...base}><path d="M9 5l7 7-7 7" /></svg> }
export function IconInfo() { return <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg> }
export function IconExternal() { return <svg {...base}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg> }

export function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect x="1" y="4" width="32" height="26" rx="6" fill="var(--green)" />
      <rect x="4" y="7" width="26" height="20" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M10 22V12M13.5 12h3.2a3 3 0 0 1 0 6H13.5M22.5 12v10h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function CarIcon() {
  return (
    <svg width="64" height="30" viewBox="0 0 64 30" aria-hidden="true">
      <path d="M4 20c0-3 1.5-4 4-4.5l6-6c1-1 2.3-1.5 3.7-1.5h17c1.6 0 3 .7 4 1.9l5 5.6c5 .4 8.3 1 9.3 2.6.7 1.1.9 2.2.9 3.9v1H4z" fill="#ffc20e" />
      <path d="M20 10h8v5h-13zM31 10h6c.9 0 1.7.4 2.3 1l3.2 4H31z" fill="#fff" opacity=".85" />
      <circle cx="18" cy="23" r="5" fill="#13212c" /><circle cx="18" cy="23" r="2" fill="#fff" />
      <circle cx="48" cy="23" r="5" fill="#13212c" /><circle cx="48" cy="23" r="2" fill="#fff" />
    </svg>
  )
}
