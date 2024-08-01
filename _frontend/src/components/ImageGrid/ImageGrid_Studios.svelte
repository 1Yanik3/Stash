<script lang="ts">
  import type { Media } from "@prisma/client"

  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import { settings } from "$lib/stores"
  import IntersectionObserver from "$reusables/IntersectionObserver.svelte"

  import ImageGridStudiosThumbnail from "./ImageGrid_Studios_Thumbnail.svelte"

  export let media: Array<Media & { disabled?: Boolean; expanded?: Boolean }>
  export let i: number

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
    return newMedia
  }

  const getSortedMatchingMedia = (medium: (typeof media)[0]) => {
    return medium.groupedIntoNamesId == null
      ? [medium]
      : media
          .filter(m => m.groupedIntoNamesId == medium.groupedIntoNamesId)
          .sort((a, b) => a.name.localeCompare(b.name))
  }

  let selectedMedia: string[] = []
</script>

<IntersectionObserver
  once={true}
  top={750}
  let:intersecting
  delay={i > 0 ? 300 : 0}
>
  {#if intersecting}
    <main class:isMobile={$settings.mobileLayout}>
      {#if selectedMedia.length}
        <div class="groupActions">
          <Button
            card
            icon="mdiGroup"
            disabled={selectedMedia.length <= 1}
            on:click={() => {
              // TODO: Allow grouping of media with UI
              fetch(`/api/group-together`, {
                method: "POST",
                body: JSON.stringify(selectedMedia)
              }).then(() => invalidateAll())
            }}>Group</Button
          >
          <Button card icon="mdiUngroup" disabled={selectedMedia.length > 1}
            >Ungroup</Button
          >
        </div>
      {/if}

      {#each getProcessedMedia(media) as medium}
        <ImageGridStudiosThumbnail
          {medium}
          on:click={() => (medium.expanded = !medium.expanded)}
          parent={medium.groupedIntoNamesId != null}
          bind:selectedMedia
        />

        {#if medium.groupedIntoNamesId != null && medium.expanded}
          <div style="grid-column: 1/-1;" />
          {#each getSortedMatchingMedia(medium) as subMedium}
            <ImageGridStudiosThumbnail
              sub
              medium={subMedium}
              bind:selectedMedia
            />
          {/each}
          <div style="grid-column: 1/-1;" />
        {/if}
      {/each}
    </main>
  {/if}
</IntersectionObserver>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 0.5em;
    margin-bottom: 1em;

    .groupActions {
      display: flex;
    }

    &.isMobile {
      gap: 0;
    }
  }
</style>
