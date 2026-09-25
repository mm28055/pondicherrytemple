/* Turns the original content's paragraphs (plain text, or simple HTML with
   <em>/<strong> and the odd <h3>) into the editor's format — word for word. */

type TextNode = {
  type: 'text'
  text: string
  format: number
  detail: 0
  mode: 'normal'
  style: ''
  version: 1
}

const ITALIC = 2
const BOLD = 1

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&(apos|#39);/g, "'")

const text = (value: string, format = 0): TextNode => ({
  type: 'text',
  text: decode(value),
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

function inline(html: string): TextNode[] {
  const nodes: TextNode[] = []
  const re = /<(em|i|strong|b)>([\s\S]*?)<\/\1>/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (m.index > last) nodes.push(text(html.slice(last, m.index)))
    nodes.push(text(m[2], m[1] === 'em' || m[1] === 'i' ? ITALIC : BOLD))
    last = re.lastIndex
  }
  if (last < html.length) nodes.push(text(html.slice(last)))
  return nodes.filter((n) => n.text.length > 0)
}

const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

/** Paragraphs (and "<h2>/<h3>…" subheadings) → editor content. */
export function toLexical(blocks: string[]) {
  return {
    root: {
      type: 'root',
      ...block,
      children: blocks.map((b) => {
        const heading = /^<(h[23])>([\s\S]*)<\/\1>$/.exec(b.trim())
        return heading
          ? { type: 'heading', tag: heading[1], ...block, children: inline(heading[2]) }
          : { type: 'paragraph', textFormat: 0, textStyle: '', ...block, children: inline(b) }
      }),
    },
  }
}
