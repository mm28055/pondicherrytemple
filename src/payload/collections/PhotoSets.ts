import { APIError, type CollectionConfig } from 'payload'
import { canCreateContent, canUpdateContent, isEditor } from '../access'
import { createdByField, observancesField, regionField, templesField } from '../fields'
import { refresh, refreshHooks } from '../revalidate'

/* The photographs of one visit: a temple's day (or event), as they were kept
   in their folder (temple / date_event / photos). Its photos belong where it
   does, so each needs no tags of its own:
   - on the pages of its temples;
   - beside the field note of the same temple and day, by itself, as soon as
     that note is published (or the one chosen here);
   - on the pages of that day's festivals and rituals at its temples (from
     "The year so far"), and of any chosen here;
   - always on the Photographs page;
   - ticked "Pondicherry's Hindu Ethos": a card of its own in that section of
     the Temples page. */
export const PhotoSets: CollectionConfig = {
  slug: 'photo-sets',
  labels: { singular: 'Photo set', plural: 'Photo sets' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'temples', 'ethos'],
    description:
      'The photographs of one day or event, as kept in its folder. They appear on the pages of its temples, beside the field note of the same temple and day (by themselves, once it is published), on the pages of that day’s festivals and rituals, and on the Photographs page.',
  },
  access: {
    read: () => true,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: refreshHooks,
  endpoints: [
    {
      // the set's photos in the order arranged in its photo grid: each one's
      // place saved, and the site refreshed once, not once for each photo
      path: '/:id/order',
      method: 'post',
      handler: async (req) => {
        if (!req.user) throw new APIError('Sign in first.', 401)
        const set = Number(req.routeParams?.id)
        const { ids } = ((await req.json?.()) ?? {}) as { ids?: number[] }
        if (!set || !Array.isArray(ids)) throw new APIError('Which photos, in what order?', 400)
        const own = await req.payload.find({
          collection: 'media',
          where: { set: { equals: set } },
          depth: 0,
          limit: 0,
          pagination: false,
          select: { position: true },
          req,
        })
        const was = new Map(own.docs.map((m) => [m.id, m.position]))
        const quiet = { req, depth: 0, overrideAccess: false, context: { skipRevalidate: true } } as const
        let changed = 0
        for (const [i, id] of ids.entries()) {
          if (!was.has(id) || was.get(id) === i + 1) continue
          await req.payload.update({ collection: 'media', id, data: { position: i + 1 }, ...quiet })
          changed++
        }
        if (changed) refresh({}, 'media')
        return Response.json({ changed })
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { width: '45%' } },
        {
          name: 'short',
          type: 'text',
          label: 'Short name',
          admin: {
            width: '30%',
            description:
              'The occasion in a few words, beside each photo in the viewer ("Brahmotsavam Day 5"). Empty: the title up to its first comma, and no further than "Day 5".',
          },
        },
        {
          name: 'date',
          type: 'date',
          index: true,
          admin: {
            width: '25%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
            description: 'The day they were taken. Empty where it is not known.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        templesField({ width: '50%', description: 'The temples they were taken at. Empty for none.' }),
        observancesField({
          width: '50%',
          description: 'Only where the day’s festivals and rituals (from “The year so far”) are not enough: these are added to them.',
        }),
      ],
    },
    {
      name: 'dayOrder',
      type: 'number',
      label: 'Place in its day',
      min: 1,
      admin: {
        description:
          'Where a day is divided into several sets, their order on the site: 1 first, 2 next, and so on. Empty: by the time their photos were taken.',
      },
    },
    {
      name: 'ethos',
      type: 'checkbox',
      label: "Pondicherry's Hindu Ethos",
      defaultValue: false,
      admin: { description: 'A card of its own in the section "Pondicherry\'s Hindu Ethos" on the Temples page.' },
    },
    {
      name: 'fieldNote',
      type: 'relationship',
      relationTo: 'field-notes',
      label: 'Field note',
      admin: {
        description:
          'Optional. Left empty, they go beside every field note of the same day and temple. Chosen, beside this note only.',
      },
    },
    {
      // its photos as small pictures: dragged into order, chosen to delete, more added
      name: 'photoGrid',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PhotoGrid#PhotoGrid' } },
    },
    {
      name: 'photos',
      type: 'join',
      collection: 'media',
      on: 'set',
      defaultLimit: 50,
      admin: { hidden: true, defaultColumns: ['filename', 'credit', 'featured'] },
    },
    {
      name: 'folder',
      type: 'text',
      label: 'From the folder',
      admin: { position: 'sidebar', readOnly: true, description: 'Where its photos were brought in from.' },
    },
    regionField,
    createdByField,
  ],
}
