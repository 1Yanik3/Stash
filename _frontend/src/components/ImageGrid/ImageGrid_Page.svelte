<script lang="ts">
  import type { Media } from "@prisma/client"

  import { JustifiedGrid } from "$components/Grid/Grids/JustifiedGrid"

  import GridThumbnail from "./GridThumbnail.svelte"

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
