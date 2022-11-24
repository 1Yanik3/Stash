import type { RequestHandler } from './$types'

import { generateAuthenticationOptions } from '@simplewebauthn/server'
import fs from 'fs/promises'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ }) => {
    // Retrieve any previously registered authenticators
    const userAuthenticators = await prisma.credentials.findMany()

    const options = generateAuthenticationOptions({
        // Require users to use a previously-registered authenticator
        allowCredentials: userAuthenticators.map(authenticator => ({
            id: authenticator.credentialID,
            type: 'public-key',
            // // Optional
            // transports: authenticator.transports,
        })),
        userVerification: 'preferred',
    })

    // Remember this challenge for this user
    await fs.writeFile("/tmp/authChallenge", options.challenge, { encoding: "utf-8" })

    return new Response(JSON.stringify(options))
}