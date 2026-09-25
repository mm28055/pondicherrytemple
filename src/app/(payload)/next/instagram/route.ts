import config from '@payload-config'
import { getPayload } from 'payload'
import { importInstagram } from '@/instagram/import'

/* The morning Instagram check. Vercel calls it daily (vercel.json) with the
   CRON_SECRET; an admin who is signed in can also open it to check now. A
   few posts per visit keeps each run short; the rest follow next time. */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const secret = process.env.CRON_SECRET
  const fromCron = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
  if (!fromCron) {
    const { user } = await payload.auth({ headers: request.headers })
    if ((user as { role?: string } | null)?.role !== 'admin') {
      return new Response('Only an admin can run this.', { status: 403 })
    }
  }
  const result = await importInstagram(payload, { max: 10 })
  return Response.json(result)
}
