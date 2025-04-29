import type routes from "$lib/server/routes/_index"

export default function query<Endpoint extends keyof typeof routes>(
    endpoint: Endpoint,
    d: Parameters<(typeof routes)[Endpoint]>[0]
): ReturnType<(typeof routes)[Endpoint]> {
    // @ts-ignore
    return fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({
            endpoint,
            d
        })
    }).then(async res => {
        if (!res.ok) throw new Error("Failed to fetch")
        const response = await res.text()
        if (!response) return null
        return JSON.parse(response)
    })
}
