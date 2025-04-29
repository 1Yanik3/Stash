import redis from "$lib/server/redis"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
    queries: await redis.mGet(await redis.keys("query:*"))
})
