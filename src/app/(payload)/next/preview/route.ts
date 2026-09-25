import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { pathFor } from '@/payload/paths'

/* The admin's "Preview" button lands here: for someone signed in to the
   admin, switch the site into preview (drafts shown) and open the page. */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Sign in to the admin to preview.', { status: 401 })

  const url = new URL(request.url)
  const collection = url.searchParams.get('collection') ?? ''
  const id = url.searchParams.get('id') ?? ''
  const path = await pathFor(payload, collection, id)
  if (!path) return new Response('Nothing to preview yet — save it first.', { status: 404 })

  ;(await draftMode()).enable()
  redirect(path)
}
