import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ request }) => Response.redirect(`${request.url}-3`)