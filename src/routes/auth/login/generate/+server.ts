import type { RequestHandler } from './$types'

import { generateAuthenticationOptions } from '@simplewebauthn/server'
import fs from 'fs/promises'

import { Client } from 'pg'
const client = new Client({
    host: '100.89.255.87',
    user: 'postgres',
    database: 'postgres',
    password: 'gorm123',
    port: 23077
})
await client.connect()

export const GET: RequestHandler = async ({ }) => {
    // Retrieve any previously registered authenticators
    const userAuthenticators: { credential_id: Buffer, credential_public_key: Buffer, counter: number }[] = (await client.query("SELECT * FROM credentials")).rows

    const options = generateAuthenticationOptions({
        // Require users to use a previously-registered authenticator
        allowCredentials: userAuthenticators.map(authenticator => ({
            id: authenticator.credential_id,
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