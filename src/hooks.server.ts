import type { Handle } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

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

  const sessionCookie = event.cookies.get("session") || ""

  if (event.url.pathname.startsWith("/guest")) {

    // TODO
    if (sessionCookie != "TotallySecretToken@4x2PLm6J") {
      return new Response("Unauthorized (guest token invalid or not present)", { status: 401 })
    }

    if (event.url.pathname.startsWith("/guest/")) {

      const cluster = await prisma.groups.findFirst({
        where: {
          id: +(event.params.group || 0)
        },
        select: {
          clusterId: true
        }
      })

      if (cluster?.clusterId != 3) {
        return new Response("Unauthorized (no guest access to group allowed)", { status: 401 })
      }

    }

  } else {
    const isValid = isJwtValid(sessionCookie)

    // api is forbidden without valid login
    if (!isValid && event.url.pathname.startsWith("/api")) {

      // TODO
      if (
        event.request.method == "GET"
        && sessionCookie == "TotallySecretToken@4x2PLm6J"
      ) {
        return await resolve(event)
      }
      return new Response("Unauthorized", { status: 401 })
    }

    // redirect to auth
    if (!isValid && !event.url.pathname.startsWith("/auth"))
      return Response.redirect(`${event.url.hostname == "localhost" ? "http://localhost:5173" : "https://stash.hera.lan"}/auth`, 307)

    // if has logged in, return to main page
    if (isValid && event.url.pathname == "/auth")
      return Response.redirect(event.url.hostname == "localhost" ? "http://localhost:5173" : "https://stash.hera.lan", 307)
  }

  if (event.url.pathname == "/auth" && sessionCookie == "TotallySecretToken@4x2PLm6J")
    return Response.redirect(`${event.url.hostname == "localhost" ? "http://localhost:5173" : "https://stash.hera.lan"}/guest`, 307)

  return await resolve(event)
})