import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => Response.redirect(`${url.origin}/guest/-9`)