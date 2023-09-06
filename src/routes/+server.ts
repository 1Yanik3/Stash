import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => Response.redirect(`${url.origin}/People/-3`)