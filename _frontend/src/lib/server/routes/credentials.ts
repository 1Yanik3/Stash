import prisma from "../prisma"

export const createCredential = async (d: {
  username: string
  hash: string
  salt: string
}) =>
  await prisma.credentials.create({
    data: {
      id: Math.floor(Math.random() * 10000),
      username: d.username,
      hash: d.hash,
      salt: d.salt
    }
  })
