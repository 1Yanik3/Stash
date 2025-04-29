import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ params, depends, parent }) => {
    depends("cluster")

    // TODO: pass from parent
    const { clusters } = await parent()

    const cluster = clusters.find(c => c.name == params.cluster) ||
        clusters[0] || {
            name: "default",
            id: 0,
            icon: "mdiUnknown",
            sortOrder: 1,
            type: "normal"
        }

    return {
        cluster
    }
}
