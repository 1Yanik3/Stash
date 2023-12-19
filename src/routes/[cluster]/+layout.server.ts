import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent, params, depends }) => {
  depends("cluster")

  const data = await parent()

  const cluster =
    data.clusters.find(c => c.name == params.cluster) || data.clusters[0]

  return {
    cluster
  }
}
