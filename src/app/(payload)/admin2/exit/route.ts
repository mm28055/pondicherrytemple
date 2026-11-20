import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { EDIT_COOKIE } from '@/lib/editing'

/* Leave Admin2: back to the site as the public sees it, on the same page. */
export async function GET(request: Request) {
  ;(await draftMode()).disable()
  ;(await cookies()).delete(EDIT_COOKIE)
  const referer = request.headers.get('referer')
  const back = referer ? new URL(referer) : null
  redirect(back && back.origin === new URL(request.url).origin ? back.pathname : '/')
}
