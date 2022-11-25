import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, url }) => {
    const body = await request.json()
    
    const expectedChallenge: string = await fs.readFile("/tmp/authChallenge", { encoding: "utf-8" })

    let verification
    try {
        verification = await verifyRegistrationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: url.origin.replace("https", "http"),
            expectedRPID: url.hostname
        })
    } catch (error) {
        console.error(error)
        throw "asd"
    }

    const { verified, registrationInfo } = verification

    if (verified) {
        if (!registrationInfo?.credentialID || !registrationInfo?.credentialPublicKey)
            throw "Error"

        // Save credentials
        await prisma.credentials.create({
            data: {
                credentialID: registrationInfo.credentialID,
                credentialPublicKey: registrationInfo.credentialPublicKey
            }
        })
    }

    return new Response(JSON.stringify(verified))
}