import { verifyRegistrationResponse } from "@simplewebauthn/server"
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request, url }) => {
    const body = await request.json()

    const auth = await prisma.auths.findUniqueOrThrow({
        where: { hostname: url.hostname }
    })

    let verification
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: auth.expectedChallenge,
            expectedOrigin: url.origin.replace(":80", ""),
            expectedRPID: url.hostname,
        })
    } catch (e: any) {
        console.error(e)
        throw error(400, e.message)
    }

    const { registrationInfo } = verification

    if (!registrationInfo)
        throw error(400, "No registration info")

    const { credentialPublicKey, credentialID, counter } = registrationInfo


    await prisma.authenticators.create({
        data: {
            credentialPublicKey: Buffer.from(credentialPublicKey.buffer),
            credentialID: Buffer.from(credentialID.buffer),
            counter,
            authsHostname: auth.hostname
        }
    })

    return json(verification)
}