import type { Cookies } from "@sveltejs/kit"

import prisma from "./prisma"

export const protectEndpoint = async (cluster: string, cookies: Cookies) => {
  await prisma.clusters.findFirstOrThrow({
    where: {
      name: cluster,
      credentials: {
        some: {
          Session: {
            some: {
              token: cookies.get("session") || ""
            }
          }
        }
      }
    }
  })
}
