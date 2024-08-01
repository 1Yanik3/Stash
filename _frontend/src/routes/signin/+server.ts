import { RequestHandler } from "@sveltejs/kit"
import { bcrypt } from "hash-wasm"

import prisma from "$lib/server/prisma"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { username, password } = await request.json()

  //   const salt =
  //     (Math.random() + 1).toString(36).substring(4) +
  //     (Math.random() + 1).toString(36).substring(4)

  const match = await prisma.credentials.findFirst({
    where: {
      username
    }
  })

  if (!match) {
    return new Response("Invalid username or password", {
      status: 401
    })
  }

  const hash = await bcrypt({ costFactor: 10, password, salt: match.salt })
  console.log(hash, match.hash)

  if (match.hash !== hash) {
    return new Response("Invalid username or password", {
      status: 401
    })
  }

  const session = await prisma.session.create({
    data: {
      token: (Math.random() + 1).toString(36).substring(2),
      credential: {
        connect: {
          id: match.id
        }
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
    }
  })

  cookies.set("session", session.token, {
    maxAge: 1000 * 60 * 60 * 24 * 60,
    path: "/"
  })

  return new Response(null, {
    status: 200
  })
}
