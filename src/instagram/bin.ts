import { getPayload, type SanitizedConfig } from 'payload'
import { importInstagram } from './import'

/** Called by `npm run instagram` (see `bin` in payload.config.ts). Brings in
    every post not yet in the admin — use it for the first, large import. */
export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config })
  try {
    await importInstagram(payload)
  } finally {
    await payload.destroy()
  }
  process.exit(0)
}
