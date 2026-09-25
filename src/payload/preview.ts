/** The admin's "Preview" button: opens the page as it will look, drafts
    included. The route at /next/preview works out which page to show. */
export const previewURL =
  (collection: string) =>
  (doc: Record<string, unknown>): string | null =>
    doc?.id ? `/next/preview?collection=${collection}&id=${String(doc.id)}` : null

/** Admin buttons for collections with drafts: contributors see no Publish button. */
export const draftButtons = {
  edit: { PublishButton: '/components/admin/PublishButton#PublishButton' },
}
