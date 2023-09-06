import type { RequestHandler } from './$types'
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { error, json } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ url, request }) => {
    const { oneTimeRegistrationToken } = await request.json()

    const auth = await prisma.auths.findUniqueOrThrow({
        where: { hostname: url.hostname },
        include: {
            authenticators: true
        }
    })

    if (auth.oneTimeToken.length < 1 || oneTimeRegistrationToken != auth.oneTimeToken)
        throw error(403, "Wrong registration token")
    
    const options = await generateRegistrationOptions({
        rpName: `Stash (${url.host})`,
        rpID: auth.hostname,
        userID: "-1",
        userName: "confused",
        attestationType: 'none',
        // TODO: Prevent users from re-registering existing authenticators
        excludeCredentials: auth.authenticators.map(authenticator => ({
            id: authenticator.credentialID,
            type: 'public-key',
        })),
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