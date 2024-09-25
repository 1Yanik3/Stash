import type routes from "$lib/server/routes/_index"

export default function query<Endpoint extends keyof typeof routes>(
  endpoint: Endpoint,
  ...args: Parameters<(typeof routes)[Endpoint]>
): ReturnType<(typeof routes)[Endpoint]> {
  // @ts-ignore
  return fetch("/api/rpc", {
    method: "POST",
    body: JSON.stringify({
      endpoint,
      args
    })
  }).then(res => res.json())
}
