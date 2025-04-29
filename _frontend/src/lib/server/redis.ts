import { createClient } from "redis"

const client = await createClient({
    url: "redis://@10.42.0.1:6379/1"
})
    .on("error", err => console.log("Redis Client Error", err))
    .connect()

export default client
