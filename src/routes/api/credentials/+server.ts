import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async () => new Response(JSON.stringify(
    await prisma.credentialsMetadata.findMany({
        include: {
            InviteCodes: true
        }
    })
))

export const POST: RequestHandler = async ({ request }) => {

    const { icon, name } = await request.json()

    const inviteCode = await prisma.inviteCodes.create({
        data: {
            code: "123456", // TOOD
            duration: 7, // TODO (days)
            Metadata: {
                create: {
                    icon,
                    name
                }
            }
        }
    })

    return new Response()

}