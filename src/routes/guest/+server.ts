import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => Response.redirect(`${url.origin.includes("localhost") ? url.origin : url.origin.replace("http", "https")}/guest/-9`)