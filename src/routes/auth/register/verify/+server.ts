import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, url }) => {
    const { credential, inviteCode } = await request.json()

    // throw if invite code not found
    const invite = await prisma.inviteCodes.findFirstOrThrow({
        where: {
            code: inviteCode
        }
    })
    
    const expectedChallenge: string = await fs.readFile("/tmp/authChallenge", { encoding: "utf-8" })

    let verification
    try {
        verification = await verifyRegistrationResponse({
            credential,
            expectedChallenge,
            expectedOrigin: url.origin.replace("http", "https"),
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
                credentialPublicKey: registrationInfo.credentialPublicKey,
                credentialsMetadataId: invite.credentialsMetadataId
            }
        })
    }

    return new Response(JSON.stringify(verified))
}