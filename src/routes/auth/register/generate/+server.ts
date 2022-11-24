import type { RequestHandler } from './$types'

import { generateRegistrationOptions } from '@simplewebauthn/server'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({  }) => {
    const options = generateRegistrationOptions({
      rpName: "Stash",
      rpID: "localhost",
      userID: "Main user for Stash",
      userName: "Main user for Stash",
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      // excludeCredentials: userAuthenticators.map(authenticator => ({
      //   id: authenticator.credentialID,
      //   type: 'public-key',
      //   // Optional
      //   transports: authenticator.transports,
      // })),
    })
  
    // Remember the challenge for this user
    await fs.writeFile("/tmp/authChallenge", options.challenge, { encoding: "utf-8" })
  
    return new Response(JSON.stringify(options))
}