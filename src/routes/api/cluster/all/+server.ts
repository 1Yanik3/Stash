import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit"

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
  const data = await prisma.clusters.findMany({
    include: {
      groups: {
        where: {
          parentId: null
        },
        include: { // 1
          children: { // 2
            include: { // 3
              children: { // 4
                include: { // 5
                  children: { // 6
                    include: { // 7
                      children: { // 8
                        include: { // 9
                          children: {
                            include: { // 1
                              children: { // 2
                                include: { // 3
                                  children: { // 4
                                    include: { // 5
                                      children: { // 6
                                        include: { // 7
                                          children: { // 8
                                            include: { // 9
                                              children: true,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      stories: true
    },
  });

  return json(data)
};
