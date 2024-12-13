<script lang="ts">
  import type { Media } from "@prisma/client/wasm"

  import Grid from "$components/ImageGrid/Grid/Grid.svelte"

  import GridThumbnail from "./GridThumbnail.svelte"

  interface Props {
    media: Media[]
  }

  let { media }: Props = $props()
</script>

<Grid
  autoResize={false}
  useResizeObserver={true}
  defaultDirection="start"
  gap={14}
  sizeRange={[150, 500]}
  useTransform={true}
>
  {#each media as medium}
    <GridThumbnail {medium} />
  {/each}
</Grid>
