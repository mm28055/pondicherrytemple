'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

/* In a photo set's form: its photos as small pictures, to see at a glance.
   - Dragged into the order the site shows them in (saved with "Save order").
   - Clicked to choose them (shift-click for a run of them), and the chosen
     deleted together, with no photo opened one by one.
   - More added, as many at once as wanted (dropped on the grid, or "Add
     photos"): each made ready in this browser as the import makes them
     (upright, at most 2400 pixels long, the camera's time kept, credited
     Deepa for files named IMG…, else Arunaditya), then sent to the set, where
     the server makes its three smaller sizes. How long the rest will take is
     shown as they go. */

type Photo = {
  id: number
  filename?: string | null
  position?: number | null
  takenAt?: string | null
  featured?: boolean | null
  sizes?: { thumbnail?: { url?: string | null } | null } | null
  url?: string | null
}

const MAX = 2400
const AT_ONCE = 3
// Deepa's camera runs this far ahead of Arunaditya's (scripts/import-photos)
const DEEPA_AHEAD_MS = 40 * 60 * 1000
const isDeepas = (name: string) => /^IMG/i.test(name)

const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const inOrder = (a: Photo, b: Photo) =>
  (a.position ?? Infinity) - (b.position ?? Infinity) ||
  (a.takenAt ?? '').localeCompare(b.takenAt ?? '') ||
  a.id - b.id

/** When the camera says it was taken: the earliest time in the file's details, in Pondicherry's time. */
async function takenAtOf(file: File): Promise<string | undefined> {
  const head = new TextDecoder('latin1').decode(await file.slice(0, 256 * 1024).arrayBuffer())
  const stamp = (head.match(/\d{4}:\d\d:\d\d \d\d:\d\d:\d\d/g) ?? []).filter((t) => !t.startsWith('0000')).sort()[0]
  if (!stamp) return undefined
  const camera = new Date(`${stamp.slice(0, 10).replace(/:/g, '-')}T${stamp.slice(11)}+05:30`)
  if (isNaN(camera.getTime())) return undefined
  return new Date(camera.getTime() - (isDeepas(file.name) ? DEEPA_AHEAD_MS : 0)).toISOString()
}

/** The photo upright, at most MAX pixels long, as a JPEG. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  // under the website's 4.5 MB limit for what is sent to it
  for (const quality of [0.85, 0.78, 0.7]) {
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', quality))
    if (blob && blob.size < 4 * 1024 * 1024) return blob
  }
  throw new Error('too large even made smaller')
}

const minutes = (ms: number) => {
  const m = Math.round(ms / 60000)
  return m < 1 ? 'under a minute' : m === 1 ? 'about a minute' : `about ${m} minutes`
}

export function PhotoGrid() {
  const { id } = useDocumentInfo()
  const templeIds = useFormFields(([f]) => f.temples?.value) as (number | { id: number })[] | undefined
  const date = useFormFields(([f]) => f.date?.value) as string | undefined
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [order, setOrder] = useState<number[] | null>(null) // as rearranged, before it is saved
  const [chosen, setChosen] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dropOn, setDropOn] = useState(false)
  const [asking, setAsking] = useState(false) // "Delete them for good?" shown
  const lastClicked = useRef<number | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!id) return
    const q = new URLSearchParams({ 'where[set][equals]': String(id), depth: '0', limit: '0', pagination: 'false' })
    for (const f of ['filename', 'position', 'takenAt', 'featured', 'url', 'sizes']) q.set(`select[${f}]`, 'true')
    const res = await fetch(`/api/media?${q}`, { credentials: 'include' })
    const body = (await res.json()) as { docs?: Photo[] }
    setPhotos((body.docs ?? []).sort(inOrder))
    setOrder(null)
  }, [id])
  useEffect(() => {
    load()
  }, [load])

  if (!id) return <p style={{ margin: '24px 0', color: 'var(--theme-elevation-500)' }}>Save the set first, then add its photos here.</p>

  const byId = new Map((photos ?? []).map((p) => [p.id, p]))
  const shown = order ? order.map((i) => byId.get(i)!).filter(Boolean) : (photos ?? [])

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

  const saveOrder = async () => {
    if (!order) return
    setBusy(true)
    setStatus('Saving the order…')
    try {
      const res = await fetch(`/api/photo-sets/${id}/order`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: order }),
      })
      if (!res.ok) throw new Error(((await res.json()) as { errors?: { message?: string }[] }).errors?.[0]?.message ?? res.statusText)
      setStatus('Order saved. The site shows it within a minute or two.')
      await load()
    } catch (e) {
      setStatus(`The order was not saved: ${(e as Error).message}`)
    }
    setBusy(false)
  }

  const remove = async () => {
    const ids = [...chosen]
    setAsking(false)
    if (!ids.length) return
    setBusy(true)
    let done = 0
    try {
      for (let i = 0; i < ids.length; i += 25) {
        setStatus(`Deleting… ${done} of ${ids.length}`)
        const part = ids.slice(i, i + 25)
        const q = new URLSearchParams(part.map((pid, k) => [`where[id][in][${k}]`, String(pid)]))
        const res = await fetch(`/api/media?${q}`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) throw new Error(((await res.json()) as { errors?: { message?: string }[] }).errors?.[0]?.message ?? res.statusText)
        done += part.length
      }
      setStatus(`${done} photo${done === 1 ? '' : 's'} deleted.`)
    } catch (e) {
      setStatus(`Stopped after ${done}: ${(e as Error).message}`)
    }
    setChosen(new Set())
    await load()
    setBusy(false)
  }

  const add = async (files: File[]) => {
    files = files.filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setBusy(true)
    // the name the import gives: temple and day, then the camera's file name
    let stem = 'pondicherry'
    const ids = (templeIds ?? []).map((t) => (typeof t === 'object' ? t.id : t))
    if (ids.length === 1) {
      const t = (await (await fetch(`/api/temples/${ids[0]}?depth=0&select[slug]=true`, { credentials: 'include' })).json()) as { slug?: string }
      if (t.slug) stem = t.slug
    }
    stem = slugify(`${stem} ${date ? new Date(new Date(date).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10) : ''}`)
    // placed after the rest, once the set has been put in order
    const last = Math.max(0, ...(photos ?? []).map((p) => p.position ?? 0))
    const placed = (photos ?? []).some((p) => typeof p.position === 'number')
    const started = Date.now()
    let done = 0
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
        const i = next++
        const file = files[i]
        try {
          const [blob, takenAt] = await Promise.all([shrink(file), takenAtOf(file)])
          const form = new FormData()
          const name = `${stem}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.jpg`
          form.append('file', new File([blob], name, { type: 'image/jpeg' }))
          form.append(
            '_payload',
            JSON.stringify({
              set: id,
              credit: isDeepas(file.name) ? 'Photograph: Deepa' : 'Photograph: Arunaditya',
              consent: 'not-needed',
              alt: '',
              ...(takenAt ? { takenAt } : {}),
              ...(placed ? { position: last + i + 1 } : {}),
            })
          )
          const res = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' })
          if (!res.ok) throw new Error(((await res.json()) as { errors?: { message?: string }[] }).errors?.[0]?.message ?? res.statusText)
        } catch (e) {
          failed.push(`${file.name} (${(e as Error).message})`)
        }
        done++
        tell()
      }
    }
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, files.length) }, worker))
    const took = minutes(Date.now() - started).replace('about ', '')
    setStatus(
      `${files.length - failed.length} of ${files.length} photos added, with their three sizes, in ${took}.` +
        (failed.length ? ` Not added: ${failed.join('; ')}` : '')
    )
    await load()
    setBusy(false)
  }

  const button: React.CSSProperties = { margin: 0 }
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
            <button type="button" className="btn btn--style-primary btn--size-small" style={button} disabled={busy} onClick={saveOrder}>
              Save order
            </button>
            <button type="button" className="btn btn--style-secondary btn--size-small" style={button} disabled={busy} onClick={() => setOrder(null)}>
              Undo moves
            </button>
          </>
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
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            style={{ ...button, color: 'var(--theme-error-500)' }}
            disabled={busy}
            onClick={() => setAsking(true)}
          >
            Delete {chosen.size} chosen
          </button>
        )}
        {chosen.size > 0 && asking && (
          <>
            <span style={{ color: 'var(--theme-error-500)' }}>
              Delete {chosen.size} photo{chosen.size === 1 ? '' : 's'} for good?
            </span>
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              style={{ ...button, background: 'var(--theme-error-500)', borderColor: 'var(--theme-error-500)' }}
              disabled={busy}
              onClick={remove}
            >
              Yes, delete
            </button>
            <button type="button" className="btn btn--style-secondary btn--size-small" style={button} onClick={() => setAsking(false)}>
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
        Drag a photo to move it (the chosen ones move together), then Save order. Click photos to choose them; shift-click chooses a run. Drop files here to
        add them.
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
