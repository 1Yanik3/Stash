import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import jwt from 'jsonwebtoken'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log(1)
    const body = await request.json()

    const expectedChallenge: string = await fs.readFile("/tmp/authChallenge", { encoding: "utf-8" })
    
    const userAuthenticators = (await prisma.credentials.findMany()).filter(t => body.id == t.credentialID.toString('base64url'))

    if (userAuthenticators.length != 1)
        throw "Received wrong number of credentials"

    let verification
    try {
        verification = await verifyAuthenticationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: "http://localhost:5173",
            expectedRPID: "localhost",
            authenticator: {
                credentialID: userAuthenticators[0].credentialID,
                credentialPublicKey: userAuthenticators[0].credentialPublicKey,
                counter: userAuthenticators[0].counter
            }
        })
    } catch (error) {
        console.error(error)
        throw error
    }

    const { verified } = verification

    if (verified) {
        // update counter
        await prisma.credentials.update({
            data: {
                counter: verification.authenticationInfo.newCounter
            },
            where: {
                credentialID: userAuthenticators[0].credentialID
            }
        })
    }

    cookies.set("session", jwt.sign("verified", "superSecretKey"), { expires: new Date(Date.now() + 2678400000), path: "/" })

    return new Response(JSON.stringify(verified))
}