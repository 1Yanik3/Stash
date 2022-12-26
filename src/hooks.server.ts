import type { Handle } from '@sveltejs/kit'

import jwt from 'jsonwebtoken'

const isJwtValid = (token: string) => {
  try {
    return (jwt.verify(token, "superSecretKey") as any).verified == true
  } catch {
    return false
  }
}

export const handle: Handle = (async ({ event, resolve }) => {
    // TODO: get rid of
    if (event.url.origin == "http://sveltekit-prerender")
        return await resolve(event)

    const isValid = isJwtValid(event.cookies.get("session") || "")

    // api is forbidden without valid login
    if (!isValid && event.url.pathname.startsWith("/api"))
        return new Response("Unauthorized", { status: 401 })

    // redirect to auth
    if (!isValid && !event.url.pathname.startsWith("/auth"))
        return Response.redirect(`${event.url.hostname == "localhost" ? "http://localhost:5173" : "https://stash.hera.lan"}/auth`, 307)

    // if has logged in, return to main page
    if (isValid && event.url.pathname == "/auth")
        return Response.redirect(event.url.hostname == "localhost" ? "http://localhost:5173" : "https://stash.hera.lan", 307)

    return await resolve(event)
})