import { generateAuthenticationOptions } from "@simplewebauthn/server"
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ url }) => {

    const auth = await prisma.auths.findUniqueOrThrow({
        where: { hostname: url.hostname },
        include: {
            authenticators: true
        }
    })

    const options = await generateAuthenticationOptions({
        // Require users to use a previously-registered authenticator
        allowCredentials: auth.authenticators.map(authenticator => ({
            id: authenticator.credentialID,
            type: 'public-key',
        })),
        userVerification: 'preferred',
    })

    // Remember the challenge
    await prisma.auths.update({
        where: {
            hostname: auth.hostname
        },
        data: {
            expectedChallenge: options.challenge,
            oneTimeToken: ""
        }
    })

    return json(options)
}