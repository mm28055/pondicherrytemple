import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { missingTags, writeTags } from '../lib/photoTags'

/* Every photograph given its temples and festivals as its own tags, from
   where it belongs (its photo set, that day's occasions, its field notes:
   lib/photoTags), which the site worked out each time until now and from
   here on reads from the photo alone. Nothing a page shows changes. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const todo = await missingTags(payload, req)
  const rows = await writeTags(todo, (statement) => db.execute(sql.raw(statement)))
  payload.logger.info(`photo tags: ${rows} added to ${todo.length} photos`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // kept: the tags are the photos' own now
}
