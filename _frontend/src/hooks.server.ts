import { Handle } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

const isSessionCookieValid = async (session_cookie: string | null) => {
  if (!session_cookie) {
    return false
  }

  return (
    (await prisma.session.count({
      where: {
        token: session_cookie,
        expiresAt: { gte: new Date() }
      }
    })) > 0
  )
}

export const handle: Handle = async ({ event, resolve }) => {
  const isSessionValid = await isSessionCookieValid(
    event.request.headers.get("cookie")?.split("session=")[1] || ""
  )

  // Valid Auth
  if (isSessionValid) {
    if (event.url.pathname.startsWith("/signin")) {
      return new Response(null, {
        status: 307,
        headers: { location: "/People" }
      })
    }
  }

  // Invalid Auth
  else {
    if (!event.url.pathname.startsWith("/signin")) {
      return new Response(null, {
        status: 307,
        headers: { location: "/signin" }
      })
    }
  }

  return await resolve(event)
}
