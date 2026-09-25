'use client'

import { PublishButton as DefaultPublishButton, useAuth } from '@payloadcms/ui'
import type { PublishButtonClientProps } from 'payload'

/** Contributors write drafts; an editor publishes them. So they see no Publish button. */
export function PublishButton(props: PublishButtonClientProps) {
  const { user } = useAuth<{ role?: string }>()
  if (user?.role === 'contributor') return null
  return <DefaultPublishButton {...props} />
}
