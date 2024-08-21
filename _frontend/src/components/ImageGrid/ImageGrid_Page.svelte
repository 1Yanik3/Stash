<script lang="ts">
  import type { Media } from "@prisma/client/wasm"

  import Grid from "$components/Grid/Grid.svelte"

  import GridThumbnail from "./GridThumbnail.svelte"

  export let media: Media[]
  export let i: number
</script>

<Grid
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
</Grid>
