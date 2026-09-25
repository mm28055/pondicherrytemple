import type { Access, FieldAccess, PayloadRequest } from 'payload'

/* Who can do what.

   - Admin: everything, including adding people to the team.
   - Editor (Deepa, Arun…): writes, uploads, edits and publishes anything.
   - Contributor (for later, when others are invited): writes drafts and
     uploads; can change only their own drafts; cannot publish. */

export type Role = 'admin' | 'editor' | 'contributor'

export const roleOf = (req: PayloadRequest): Role | undefined =>
  (req.user as { role?: Role } | null | undefined)?.role

const isEditorRole = (role?: Role) => role === 'admin' || role === 'editor'

export const isAdmin: Access = ({ req }) => roleOf(req) === 'admin'
export const isEditor: Access = ({ req }) => isEditorRole(roleOf(req))
export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const adminOnlyField: FieldAccess = ({ req }) => roleOf(req) === 'admin'
export const editorOnlyField: FieldAccess = ({ req }) => isEditorRole(roleOf(req))

/** The public sees what is published; the team sees drafts too. */
export const publishedOrTeam: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

/** Contributors may save drafts, never publish. */
export const canCreateContent: Access = ({ req, data }) => {
  const role = roleOf(req)
  if (!role) return false
  return isEditorRole(role) || data?._status !== 'published'
}

/** Editors change anything; contributors only their own drafts. */
export const canUpdateContent: Access = ({ req, data }) => {
  const role = roleOf(req)
  if (!role || !req.user) return false
  if (isEditorRole(role)) return true
  if (data?._status === 'published') return false
  return { createdBy: { equals: req.user.id } }
}

/** For collections without drafts (uploads): editors change anything,
    contributors only what they uploaded. */
export const canUpdateOwn: Access = ({ req }) => {
  const role = roleOf(req)
  if (!role || !req.user) return false
  return isEditorRole(role) ? true : { createdBy: { equals: req.user.id } }
}
