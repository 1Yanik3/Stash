<script lang="ts">
  import type { Media } from "@prisma/client"

  import ImageGridTableRow from "./ImageGrid_Table_Row.svelte"

  export let media: Array<Media & { disabled?: Boolean; expanded?: Boolean }>

  const getProcessedMedia = (oldMedia: typeof media) => {
    let alreadyProcessedGroupedInto: number[] = []
    let newMedia: typeof media = []
    for (let i = 0; i < media.length; i++) {
      const element = oldMedia[i]
      if (element.groupedIntoNamesId != null) {
        if (!alreadyProcessedGroupedInto.includes(element.groupedIntoNamesId)) {
          alreadyProcessedGroupedInto.push(element.groupedIntoNamesId)
          newMedia.push(element)
        }
      } else {
        newMedia.push(element)
      }
    }
    console.log({ newMedia })
    return newMedia
  }
  $: processedMedia = getProcessedMedia(media)

  let page = 0
  const pageSize = 20

  const getSortedMatchingMedia = (medium: (typeof media)[0]) => {
    return medium.groupedIntoNamesId == null
      ? []
      : media
          .filter(m => m.groupedIntoNamesId == medium.groupedIntoNamesId)
          .sort((a, b) => a.name.localeCompare(b.name))
  }
</script>

<main>
  {#each processedMedia.slice(page * pageSize, (page + 1) * pageSize) as medium (medium.id)}
    <ImageGridTableRow {medium} children={getSortedMatchingMedia(medium)} />
  {/each}
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 1em;
  }
</style>
