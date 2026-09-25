import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/* "Leave preview": back to the published site, on the same page. */
export async function GET(request: Request) {
  ;(await draftMode()).disable()
  const referer = request.headers.get('referer')
  const back = referer ? new URL(referer) : null
  redirect(back && back.origin === new URL(request.url).origin ? back.pathname : '/')
}
