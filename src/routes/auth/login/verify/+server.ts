import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import jwt from 'jsonwebtoken'

import { Client } from 'pg'
const client = new Client({
    host: '100.89.255.87',
    user: 'postgres',
    database: 'postgres',
    password: 'gorm123',
    port: 23077
})
await client.connect()

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log(1)
    const body = await request.json()

    const expectedChallenge: string = await fs.readFile("/tmp/authChallenge", { encoding: "utf-8" })

    const userAuthenticators: { credential_id: Buffer, credential_public_key: Buffer, counter: number }[] = (await
        client.query("SELECT * FROM credentials")
    ).rows.filter(t => body.id == t.credential_id.toString('base64url'))

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
                credentialID: userAuthenticators[0].credential_id,
                credentialPublicKey: userAuthenticators[0].credential_public_key,
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
        await client.query("UPDATE credentials SET counter = $1", [ verification.authenticationInfo.newCounter ])
    }

    cookies.set("session", jwt.sign("verified", "superSecretKey"), { expires: new Date(Date.now() + 2678400000), path: "/" })

    return new Response(JSON.stringify(verified))
}