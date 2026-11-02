import { APIError, type CollectionConfig } from 'payload'
import { isLoggedIn } from '../access'
import { refresh } from '../revalidate'
import { ORDER_KINDS, type OrderKind, photosOf, saveOrder } from '../../lib/photoOrders'

/* The order a festival's, a temple's or a field note's photographs are put
   in, in the photo grid of its form (lib/photoOrders): never edited here,
   so not listed in the admin. */

const kindOf = (k: unknown): OrderKind => {
  if (!ORDER_KINDS.includes(k as OrderKind)) throw new APIError('A festival, a temple or a field note?', 400)
  return k as OrderKind
}

export const PhotoOrders: CollectionConfig = {
  slug: 'photo-orders',
  admin: { hidden: true },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  endpoints: [
    {
      // its photographs, for its grid: ?kind=observances&id=12
      path: '/photos',
      method: 'get',
      handler: async (req) => {
        if (!req.user) throw new APIError('Sign in first.', 401)
        const id = Number(req.searchParams.get('id'))
        if (!id) throw new APIError('Which one?', 400)
        return Response.json(await photosOf(req.payload, req, kindOf(req.searchParams.get('kind')), id))
      },
    },
    {
      // its order saved: { kind, id, ids }, ids empty to go back to the site's own order
      path: '/save',
      method: 'post',
      handler: async (req) => {
        if (!req.user) throw new APIError('Sign in first.', 401)
        const { kind, id, ids } = ((await req.json?.()) ?? {}) as { kind?: string; id?: number; ids?: number[] }
        if (!id || !Array.isArray(ids)) throw new APIError('Which photos, in what order?', 400)
        await saveOrder(req.payload, req, kindOf(kind), id, ids.map(Number).filter(Boolean))
        refresh({}, 'media')
        return Response.json({ saved: ids.length })
      },
    },
  ],
  fields: [
    { name: 'of', type: 'text', required: true, unique: true, index: true },
    { name: 'ids', type: 'json', required: true },
  ],
}
