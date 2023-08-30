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

  // const origin = event.url.origin.includes("localhost") ? event.url.origin : event.url.origin.replace("http", "https")
  const origin = event.url.origin.replace(/:\d+$/, "")

  const sessionCookie = event.cookies.get("session") || ""

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
    return Response.redirect(`${origin}/auth`, 307)

  // if has logged in, return to main page
  if (isValid && event.url.pathname == "/auth")
    return Response.redirect(origin, 307)

  return await resolve(event)
})