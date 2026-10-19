'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

/* In a film's form, under its still frame: the film's video, to scrub to any
   moment, and a button that makes that moment the film's still. The frame is
   drawn from the video in this browser (no server work), saved to Photos &
   videos as a JPG, and chosen as the still; saving the film then passes it
   on to the video. */
export function FrameButton() {
  const videoId = useFormFields(([fields]) => fields.video?.value) as number | { id: number } | null | undefined
  const { setValue } = useField<number | null>({ path: 'still' })
  const [src, setSrc] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const id = typeof videoId === 'object' && videoId ? videoId.id : videoId

  const filmTitle = useFormFields(([fields]) => fields.title?.value) as string | undefined
  useEffect(() => setTitle(filmTitle ?? ''), [filmTitle])

  // the video file's address
  useEffect(() => {
    setSrc(null)
    if (!id) return
    let live = true
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { url?: string; mimeType?: string } | null) => {
        if (live && m?.url && m.mimeType?.startsWith('video/')) setSrc(m.url)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [id])

  const take = async () => {
    const v = video.current
    if (!v || !v.videoWidth) return setStatus('Let the video load (press play once), then try again.')
    setBusy(true)
    setStatus('Taking the frame…')
    try {
      // at most 1600 pixels across: plenty for a still, small to load
      const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(v.videoWidth * scale)
      canvas.height = Math.round(v.videoHeight * scale)
      canvas.getContext('2d')!.drawImage(v, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.88))
      if (!blob) throw new Error('the frame could not be drawn')
      const at = Math.round(v.currentTime)
      const name = `${(title || 'film').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'film'}-still-${at}s.jpg`
      const form = new FormData()
      form.append('file', new File([blob], name, { type: 'image/jpeg' }))
      form.append('_payload', JSON.stringify({ alt: `A still from the film “${title}”`, consent: 'not-needed' }))
      const res = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' })
      const body = (await res.json()) as { doc?: { id: number }; errors?: { message?: string }[] }
      if (!res.ok || !body.doc) throw new Error(body.errors?.[0]?.message ?? `the upload said ${res.status}`)
      setValue(body.doc.id)
      setStatus(`Done: the frame at ${Math.floor(at / 60)}:${String(at % 60).padStart(2, '0')} is the still. Save the film to keep it.`)
    } catch (e) {
      setStatus(`Could not take the frame: ${(e as Error).message}.`)
    } finally {
      setBusy(false)
    }
  }

  if (!id) return <p style={{ margin: '0 0 24px', color: 'var(--theme-elevation-500)' }}>Choose the film’s video above to take a still from it.</p>
  return (
    <div style={{ display: 'grid', gap: 10, margin: '0 0 28px', maxWidth: 520 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Use a frame from the video</div>
      {src ? (
        <video
          ref={video}
          src={src}
          crossOrigin="anonymous"
          controls
          muted
          playsInline
          preload="metadata"
          style={{ width: '100%', maxHeight: 360, background: '#000', borderRadius: 4 }}
        />
      ) : (
        <p style={{ margin: 0, color: 'var(--theme-elevation-500)' }}>Loading the video…</p>
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }} onClick={take} disabled={busy || !src}>
          Use this frame as the still
        </button>
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-600)' }}>
          {status ?? 'Pause the video at the moment you want, then press the button.'}
        </span>
      </div>
    </div>
  )
}
