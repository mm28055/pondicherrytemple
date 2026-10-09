'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/* On a list in the admin (the field notes, say): open an entry, and on
   coming back to the list, by Back or by the menu, it opens at the page it
   was on and scrolls to that entry, marked for a moment. Remembered for as
   long as the browser tab is open. */

type Memory = { search?: string; last?: string; returning?: boolean; scroll?: number }

export function ListMemory() {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const key = `sthalam-list:${pathname}`
    const read = (): Memory => {
      try {
        return JSON.parse(sessionStorage.getItem(key) || '{}') as Memory
      } catch {
        return {}
      }
    }
    const save = (patch: Memory) => {
      try {
        sessionStorage.setItem(key, JSON.stringify({ ...read(), ...patch }))
      } catch {
        // storage unavailable: nothing is remembered
      }
    }
    const saved = read()
    const here = params.toString()

    // back by the menu, which leaves out the page: to the page it was on
    if (saved.returning && !params.get('page') && saved.search && new URLSearchParams(saved.search).get('page')) {
      router.replace(`${pathname}?${saved.search}`, { scroll: false })
      return
    }
    save({ search: here })

    // opening an entry: remember which, and where the list was
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]')
      const href = a?.getAttribute('href')?.split('?')[0]
      if (href && href.startsWith(`${pathname}/`) && !href.endsWith('/create')) {
        save({ last: href, returning: true, scroll: window.scrollY, search: params.toString() })
      }
    }
    document.addEventListener('click', onClick, true)

    // back from an entry: to it, marked
    let timer: number | undefined
    if (saved.returning) {
      save({ returning: false })
      let tries = 0
      const find = () => {
        const a = saved.last ? document.querySelector(`a[href="${saved.last}"], a[href^="${saved.last}?"]`) : null
        if (a) {
          const row = a.closest('tr') ?? a
          row.scrollIntoView({ block: 'center' })
          row.classList.add('sthalam-list-last')
          // the browser may set the page's scroll again after Back: look once more
          const again = () => {
            const r = row.getBoundingClientRect()
            if (r.top < 0 || r.bottom > window.innerHeight) row.scrollIntoView({ block: 'center' })
          }
          window.setTimeout(again, 400)
          window.setTimeout(again, 1000)
          timer = window.setTimeout(() => row.classList.remove('sthalam-list-last'), 2500)
        } else if (tries++ < 50) {
          timer = window.setTimeout(find, 100)
        } else if (saved.scroll) {
          window.scrollTo(0, saved.scroll)
        }
      }
      find()
    }

    return () => {
      document.removeEventListener('click', onClick, true)
      window.clearTimeout(timer)
    }
  }, [pathname, params, router])

  return null
}
