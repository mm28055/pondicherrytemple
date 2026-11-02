'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { withCopyright } from '../../lib/copyrightExif'
import { AT_ONCE, isDeepas, minutes, shrink, slugify, takenAtOf } from './PhotoGrid'

/* In a festival's, a temple's or a field note's form: its photographs as
   small pictures, as in a photo set's (PhotoGrid), all of them, wherever
   they come from (tagged with it; a note's, from its photo sets too).
   - Dragged into the order its page shows them in (saved with "Save
     order"; lib/photoOrders), or put newest or oldest first by when each
     was taken, or back in the site's own order.
   - Clicked to choose them (shift-click for a run), and the chosen deleted
     together; a festival's or temple's taken off it, without deleting them.
   - More added, as many at once as wanted, made ready in this browser as a
     set's are: tagged with the festival or temple (a note's, with its
     temples and festivals, and put in the note, kept once it is saved). */

type Kind = 'observances' | 'temples' | 'field-notes'
type Photo = {
  id: number
  filename?: string | null
  featured?: boolean | null
  url?: string | null
  sizes?: { thumbnail?: { url?: string | null } | null } | null
  set?: number | null
  taken?: string | null
}
type Ref = number | { id: number }
const idsOf = (v: unknown): number[] =>
  Array.isArray(v) ? v.map((r: Ref) => (typeof r === 'object' ? r.id : r)).filter((x): x is number => typeof x === 'number') : []

const WHAT: Record<Kind, string> = { observances: 'festival or ritual', temples: 'temple', 'field-notes': 'field note' }

const errorOf = async (res: Response) => ((await res.json()) as { errors?: { message?: string }[] }).errors?.[0]?.message ?? res.statusText

export function TaggedPhotoGrid({ kind }: { kind: Kind }) {
  const { id } = useDocumentInfo()
  const slug = useFormFields(([f]) => f.slug?.value) as string | undefined
  const temples = useFormFields(([f]) => f.temples?.value)
  const observances = useFormFields(([f]) => f.observances?.value)
  // a note's own photos (its "Photographs" field), which those added here join
  const ownPhotos = useField<unknown>({ path: 'photos' })
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [ordered, setOrdered] = useState(false) // an order saved for it
  const [order, setOrder] = useState<number[] | null>(null) // as rearranged, before it is saved
  const [chosen, setChosen] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dropOn, setDropOn] = useState(false)
  const [asking, setAsking] = useState<'delete' | 'untag' | null>(null)
  const lastClicked = useRef<number | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!id) return
    const res = await fetch(`/api/photo-orders/photos?kind=${kind}&id=${id}`, { credentials: 'include' })
    const body = (await res.json()) as { photos?: Photo[]; ordered?: boolean }
    setPhotos(body.photos ?? [])
    setOrdered(Boolean(body.ordered))
    setOrder(null)
  }, [id, kind])
  useEffect(() => {
    load()
  }, [load])

  if (!id) return <p style={{ margin: '24px 0', color: 'var(--theme-elevation-500)' }}>Save it first, then its photos are shown here.</p>

  const byId = new Map((photos ?? []).map((p) => [p.id, p]))
  const shown = order ? order.map((i) => byId.get(i)!).filter(Boolean) : (photos ?? [])
  const tagged = kind !== 'field-notes'

  const choose = (pid: number, e: React.MouseEvent) => {
    const next = new Set(chosen)
    if (e.shiftKey && lastClicked.current !== null) {
      const ids = shown.map((p) => p.id)
      const [a, b] = [ids.indexOf(lastClicked.current), ids.indexOf(pid)].sort((x, y) => x - y)
      ids.slice(a, b + 1).forEach((i) => next.add(i))
    } else if (next.has(pid)) next.delete(pid)
    else next.add(pid)
    lastClicked.current = pid
    setChosen(next)
  }

  // the photo dragged (or, if it is chosen, all the chosen) put before the one it is dropped on
  const moveTo = (target: number) => {
    if (dragging === null || dragging === target) return
    const ids = shown.map((p) => p.id)
    const moving = chosen.has(dragging) ? ids.filter((i) => chosen.has(i)) : [dragging]
    if (moving.includes(target)) return
    const rest = ids.filter((i) => !moving.includes(i))
    const from = ids.indexOf(dragging)
    const at = rest.indexOf(target) + (ids.indexOf(target) > from ? 1 : 0)
    rest.splice(at, 0, ...moving)
    setOrder(rest)
  }

  // put in order by when each was taken (those not known at the end), to be saved with Save order
  const byDate = (newest: boolean) => {
    const when = (p: Photo) => p.taken ?? ''
    const sorted = [...shown].sort((a, b) => {
      const x = when(a), y = when(b)
      if (!x || !y) return (x ? 0 : 1) - (y ? 0 : 1) || a.id - b.id
      return (newest ? y.localeCompare(x) : x.localeCompare(y)) || a.id - b.id
    })
    setOrder(sorted.map((p) => p.id))
  }

  const saveOrder = async (ids: number[]) => {
    setBusy(true)
    setStatus(ids.length ? 'Saving the order…' : 'Going back to the site’s own order…')
    try {
      const res = await fetch('/api/photo-orders/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, id, ids }),
      })
      if (!res.ok) throw new Error(await errorOf(res))
      setStatus(ids.length ? 'Order saved. The site shows it within a minute or two.' : 'Back in the site’s own order: the newest first.')
      await load()
    } catch (e) {
      setStatus(`The order was not saved: ${(e as Error).message}`)
    }
    setBusy(false)
  }

  // in parts of 25: each part deleted together; or, taken off, each photo saved with its own tags less this one
  const inParts = async (verb: string, ids: number[], each: (part: number[]) => Promise<void>) => {
    let done = 0
    try {
      for (let i = 0; i < ids.length; i += 25) {
        setStatus(`${verb}… ${done} of ${ids.length}`)
        const part = ids.slice(i, i + 25)
        await each(part)
        done += part.length
      }
      return `${done} photo${done === 1 ? '' : 's'}`
    } catch (e) {
      throw new Error(`stopped after ${done}: ${(e as Error).message}`)
    }
  }

  const remove = async () => {
    const ids = [...chosen]
    setAsking(null)
    if (!ids.length) return
    setBusy(true)
    try {
      const n = await inParts('Deleting', ids, async (part) => {
        const q = new URLSearchParams(part.map((pid, k) => [`where[id][in][${k}]`, String(pid)]))
        const res = await fetch(`/api/media?${q}`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) throw new Error(await errorOf(res))
      })
      setStatus(`${n} deleted.`)
    } catch (e) {
      setStatus(`Deleting ${(e as Error).message}`)
    }
    setChosen(new Set())
    await load()
    setBusy(false)
  }

  const untag = async () => {
    const ids = [...chosen]
    setAsking(null)
    if (!ids.length) return
    setBusy(true)
    try {
      const n = await inParts('Taking them off', ids, async (part) => {
        const q = new URLSearchParams({ depth: '0', limit: '0', pagination: 'false', [`select[${kind}]`]: 'true' })
        part.forEach((pid, k) => q.set(`where[id][in][${k}]`, String(pid)))
        const { docs } = (await (await fetch(`/api/media?${q}`, { credentials: 'include' })).json()) as { docs?: Record<string, unknown>[] }
        await Promise.all(
          (docs ?? []).map(async (m) => {
            const res = await fetch(`/api/media/${m.id}`, {
              method: 'PATCH',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [kind]: idsOf(m[kind]).filter((x) => x !== id) }),
            })
            if (!res.ok) throw new Error(await errorOf(res))
          })
        )
      })
      setStatus(`${n} taken off this ${WHAT[kind]}, kept in the photo library.`)
    } catch (e) {
      setStatus(`Taking them off ${(e as Error).message}`)
    }
    setChosen(new Set())
    await load()
    setBusy(false)
  }

  const add = async (files: File[]) => {
    files = files.filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setBusy(true)
    const stem = slugify(slug || WHAT[kind])
    // tagged with this festival or temple; a note's with its own temples and festivals
    const tags = tagged ? { [kind]: [id] } : { temples: idsOf(temples), observances: idsOf(observances) }
    const started = Date.now()
    let done = 0
    const made: number[] = []
    const failed: string[] = []
    const tell = () => {
      const left = files.length - done
      const eta = done ? ` · ${minutes(((Date.now() - started) / done) * left)} left` : ' · working out how long it will take…'
      setStatus(`Adding photos: ${done} of ${files.length}${left ? eta : ''}${failed.length ? ` · ${failed.length} failed` : ''}`)
    }
    tell()
    let next = 0
    const worker = async () => {
      while (next < files.length) {
        const file = files[next++]
        try {
          const [blob, takenAt] = await Promise.all([shrink(file), takenAtOf(file)])
          const form = new FormData()
          const name = `${stem}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.jpg`
          const marked = withCopyright(new Uint8Array(await blob.arrayBuffer()), takenAt ? new Date(takenAt) : undefined)
          form.append('file', new File([marked as BlobPart], name, { type: 'image/jpeg' }))
          form.append(
            '_payload',
            JSON.stringify({
              ...tags,
              credit: isDeepas(file.name) ? 'Photograph: Deepa' : 'Photograph: Arunaditya',
              consent: 'not-needed',
              alt: '',
              ...(takenAt ? { takenAt } : {}),
            })
          )
          const res = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' })
          if (!res.ok) throw new Error(await errorOf(res))
          made.push(((await res.json()) as { doc: { id: number } }).doc.id)
        } catch (e) {
          failed.push(`${file.name} (${(e as Error).message})`)
        }
        done++
        tell()
      }
    }
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, files.length) }, worker))
    const took = minutes(Date.now() - started).replace('about ', '')
    if (!tagged && made.length) ownPhotos.setValue([...idsOf(ownPhotos.value), ...made])
    setStatus(
      `${made.length} of ${files.length} photos added, with their three sizes, in ${took}.` +
        (!tagged && made.length ? ' Save the note (or publish it) to keep them in it.' : '') +
        (failed.length ? ` Not added: ${failed.join('; ')}` : '')
    )
    await load()
    // a note's new photos are in it once it is saved: shown here meanwhile
    if (!tagged && made.length)
      setPhotos((had) => [...(had ?? []), ...made.filter((m) => !(had ?? []).some((p) => p.id === m)).map((m) => ({ id: m }))])
    setBusy(false)
  }

  const button: React.CSSProperties = { margin: 0 }
  const danger = 'var(--theme-error-500)'
  return (
    <div
      style={{ margin: '24px 0 32px' }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDropOn(true)
        }
      }}
      onDragLeave={() => setDropOn(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return
        e.preventDefault()
        setDropOn(false)
        if (!busy) add([...e.dataTransfer.files])
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <strong style={{ marginRight: 8 }}>Photos{photos ? ` (${photos.length})` : ''}</strong>
        <button type="button" className="btn btn--style-primary btn--size-small" style={button} disabled={busy} onClick={() => input.current?.click()}>
          Add photos
        </button>
        {order && (
          <>
            <button type="button" className="btn btn--style-primary btn--size-small" style={button} disabled={busy} onClick={() => saveOrder(order)}>
              Save order
            </button>
            <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy} onClick={() => setOrder(null)}>
              Undo moves
            </button>
          </>
        )}
        <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy || shown.length < 2} onClick={() => byDate(true)}>
          Newest first
        </button>
        <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy || shown.length < 2} onClick={() => byDate(false)}>
          Oldest first
        </button>
        {ordered && !order && (
          <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy} onClick={() => saveOrder([])}>
            Back to the site’s order
          </button>
        )}
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          style={button}
          disabled={busy || !shown.length}
          onClick={() => setChosen(chosen.size === shown.length ? new Set() : new Set(shown.map((p) => p.id)))}
        >
          {chosen.size === shown.length && shown.length ? 'Choose none' : 'Choose all'}
        </button>
        {chosen.size > 0 && !asking && (
          <>
            {tagged && (
              <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy} onClick={() => setAsking('untag')}>
                Take {chosen.size} off this {WHAT[kind]}
              </button>
            )}
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              style={{ ...button, color: danger }}
              disabled={busy}
              onClick={() => setAsking('delete')}
            >
              Delete {chosen.size} chosen
            </button>
          </>
        )}
        {chosen.size > 0 && asking && (
          <>
            <span style={{ color: asking === 'delete' ? danger : undefined }}>
              {asking === 'delete'
                ? `Delete ${chosen.size} photo${chosen.size === 1 ? '' : 's'} for good?`
                : `Take ${chosen.size} photo${chosen.size === 1 ? '' : 's'} off this ${WHAT[kind]}? They stay in the photo library.`}
            </span>
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              style={asking === 'delete' ? { ...button, background: danger, borderColor: danger } : button}
              disabled={busy}
              onClick={asking === 'delete' ? remove : untag}
            >
              {asking === 'delete' ? 'Yes, delete' : 'Yes, take them off'}
            </button>
            <button type="button" className="btn btn--style-secondary btn--size-small" style={button} onClick={() => setAsking(null)}>
              No
            </button>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])]
            e.target.value = ''
            add(files)
          }}
        />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--theme-elevation-500)' }}>
        {!tagged && 'Every photo shown with this note: those of its photo sets, and any put in it. '}
        Drag a photo to move it (the chosen ones move together), then Save order: they come first on its page, in that order. Click photos to choose them;
        shift-click chooses a run. Drop files here to add them.
      </p>
      {status && <p style={{ margin: '0 0 12px', fontSize: 14 }}>{status}</p>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 6,
          minHeight: 96,
          padding: 6,
          borderRadius: 4,
          outline: dropOn ? '2px dashed var(--theme-success-500)' : '1px solid var(--theme-elevation-100)',
        }}
      >
        {photos === null && <span style={{ color: 'var(--theme-elevation-500)' }}>Loading…</span>}
        {shown.map((p) => {
          const on = chosen.has(p.id)
          return (
            <div
              key={p.id}
              draggable={!busy}
              onDragStart={(e) => {
                setDragging(p.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => {
                if (dragging !== null) {
                  e.preventDefault()
                  moveTo(p.id)
                }
              }}
              onClick={(e) => choose(p.id, e)}
              title={p.filename ?? ''}
              style={{
                position: 'relative',
                aspectRatio: '1',
                cursor: 'grab',
                borderRadius: 3,
                overflow: 'hidden',
                background: 'var(--theme-elevation-100)',
                outline: on ? '3px solid var(--theme-success-500)' : 'none',
                outlineOffset: -3,
                opacity: dragging === p.id ? 0.4 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.sizes?.thumbnail?.url ?? p.url ?? ''}
                alt=""
                loading="lazy"
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {on && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: 'var(--theme-success-500)',
                    color: '#fff',
                    fontSize: 12,
                    lineHeight: '18px',
                    textAlign: 'center',
                  }}
                >
                  ✓
                </span>
              )}
              {p.featured && (
                <span title="Show first" style={{ position: 'absolute', top: 2, right: 5, color: '#fff', textShadow: '0 0 3px #000' }}>
                  ★
                </span>
              )}
              <a
                href={`/admin/collections/media/${p.id}`}
                onClick={(e) => e.stopPropagation()}
                title="Open this photo"
                style={{
                  position: 'absolute',
                  bottom: 3,
                  right: 3,
                  padding: '0 5px',
                  borderRadius: 3,
                  background: 'rgba(0,0,0,.55)',
                  color: '#fff',
                  fontSize: 11,
                  textDecoration: 'none',
                }}
              >
                open
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
