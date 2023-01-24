import type { RequestHandler } from './$types'

import jwt from 'jsonwebtoken'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, url, cookies }) => {
    const { token } = await request.json()

    const count = await prisma.credentials.count({
        where: {
            credential: token
        }
    })

    if (count < 1) {
        throw "Wrong credentials"
    }

    cookies.set(
        "session",
        jwt.sign({ verified: true }, "superSecretKey"),
        { expires: new Date(Date.now() + 2678400000), path: "/", sameSite: "none" }
    )

    return new Response()
}