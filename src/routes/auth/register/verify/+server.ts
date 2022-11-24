import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

import { Client } from 'pg'
const client = new Client({
    host: '100.89.255.87',
    user: 'postgres',
    database: 'postgres',
    password: 'gorm123',
    port: 23077
})
await client.connect()

// create table
//   "public"."credentials" (
//     "id" serial primary key,
//     "credential_id" BYTEA not null,
//     "credential_public_key" BYTEA not null,
//     "counter" INT not null
//   )

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json()
    
    const expectedChallenge: string = await fs.readFile("/tmp/authChallenge", { encoding: "utf-8" })

    let verification
    try {
        verification = await verifyRegistrationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: "http://localhost:5173",
            expectedRPID: "localhost",
        })
    } catch (error) {
        console.error(error)
        throw "asd"
    }

    const { verified, registrationInfo } = verification

    if (verified) {
        // TODO: Save credentials
        const res = await client.query("INSERT INTO credentials (credential_id, credential_public_key, counter) VALUES ($1, $2, $3)", [
            registrationInfo?.credentialID,
            registrationInfo?.credentialPublicKey,
            registrationInfo?.counter,
        ])
        console.log(res)
    }


    return new Response(JSON.stringify(verified))
}