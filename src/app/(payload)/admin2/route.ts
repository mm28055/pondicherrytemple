import config from '@payload-config'
import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { EDIT_COOKIE } from '@/lib/editing'

/* Admin2 (lib/editing): the site itself, editable. Signed in to the admin,
   this turns on preview (drafts shown, pages read fresh) and editing, and
   opens the site — at ?page=/… if given, else the home page. Not signed in:
   to the admin's sign-in, and back here after. */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) redirect('/admin/login?redirect=%2Fadmin2')

  const page = new URL(request.url).searchParams.get('page') ?? '/'
  ;(await draftMode()).enable()
  ;(await cookies()).set(EDIT_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax' })
  redirect(page.startsWith('/') && !page.startsWith('//') ? page : '/')
}
