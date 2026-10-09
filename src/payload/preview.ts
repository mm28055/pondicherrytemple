/** The admin's "Preview" button: opens the page as it will look, drafts
    included. The route at /next/preview works out which page to show. */
export const previewURL =
  (collection: string) =>
  (doc: Record<string, unknown>): string | null =>
    doc?.id ? `/next/preview?collection=${collection}&id=${String(doc.id)}` : null

/** On a long list: back from an entry, to the page and the entry it was on. */
export const listMemory = { beforeList: ['/components/admin/ListMemory#ListMemory'] }

/** Admin buttons for collections with drafts: contributors see no Publish
    button. (And the list remembers its place.) */
export const draftButtons = {
  ...listMemory,
  edit: { PublishButton: '/components/admin/PublishButton#PublishButton' },
}
