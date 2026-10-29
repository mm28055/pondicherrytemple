import config from '@payload-config'
import { revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import { PHOTOS_TAG, SITE_CONTENT_TAG } from '@/lib/siteCache'

/* The whole site refreshed, as when anything is saved in the admin
   (payload/revalidate): for after a script has changed the database from
   outside the site (bringing photographs in, which refreshes nothing as it
   goes). Each page keeps being shown as it was until it has been rebuilt.
   With the CRON_SECRET, or by an admin who is signed in. */

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  const withSecret = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
  if (!withSecret) {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if ((user as { role?: string } | null)?.role !== 'admin') {
      return new Response('Only an admin can run this.', { status: 403 })
    }
  }
  revalidateTag(SITE_CONTENT_TAG, 'max')
  revalidateTag(PHOTOS_TAG, 'max')
  return Response.json({ refreshed: true })
}
