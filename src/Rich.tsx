import type { ReactNode } from 'react'

// Renders lesson text from a tiny markup: paragraphs, "## " headings, "- " bullets, **bold**. Builds React nodes (no HTML injection).
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  )
}

export function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  const flush = () => {
    if (bullets.length) blocks.push(<ul key={`u${blocks.length}`}>{bullets.map((b, i) => <li key={i}>{inline(b)}</li>)}</ul>)
    bullets = []
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('- ')) { bullets.push(line.slice(2)); continue }
    flush()
    if (!line) continue
    if (line.startsWith('## ')) blocks.push(<h3 key={`h${blocks.length}`}>{line.slice(3)}</h3>)
    else blocks.push(<p key={`p${blocks.length}`}>{inline(line)}</p>)
  }
  flush()
  return <div className="rich">{blocks}</div>
}
