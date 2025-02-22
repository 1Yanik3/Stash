import { createClient } from "redis"

const client = await createClient({
  url: "redis://@192.168.0.20:6379/1"
})
  .on("error", err => console.log("Redis Client Error", err))
  .connect()

export default client
