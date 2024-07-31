<script lang="ts">
  import { JustifiedGrid } from "$components/Grid/Grids/JustifiedGrid"

  import GridThumbnail from "./GridThumbnail.svelte"
  import type { Media } from "@prisma/client"

  export let media: Media[]
  export let i: number
</script>

<JustifiedGrid
  autoResize={true}
  useResizeObserver={true}
  defaultDirection="start"
  gap={14}
  sizeRange={[150, 500]}
  useTransform={true}
>
  {#each media as medium}
    <GridThumbnail {medium} {i} />
  {/each}
</JustifiedGrid>
