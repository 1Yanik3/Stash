import { verifyAuthenticationResponse } from "@simplewebauthn/server"
import { error, json } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, url, cookies }) => {
    const body = await request.json()

    const auth = await prisma.auths.findUniqueOrThrow({
        where: { hostname: url.hostname }
    })

    let verification
    try {
        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: auth.expectedChallenge,
            expectedOrigin: url.origin,
            expectedRPID: auth.hostname,
            authenticator: await prisma.authenticators.findFirstOrThrow({
                where: {
                    credentialID: Buffer.from(body.id, "base64")
                }
            }),
        })
    } catch (e: any) {
        console.error(e)
        throw error(400, e.message)
    }

    if (!verification)
        throw error(401, "Invalid credentials")


    cookies.set(
        "session",
        // TODO: Make key actually safe
        jwt.sign({ verified: true }, "superSecretKey"),
        { expires: new Date(Date.now() + 2678400000), path: "/", sameSite: "none" }
    )

    return json(verification)
}