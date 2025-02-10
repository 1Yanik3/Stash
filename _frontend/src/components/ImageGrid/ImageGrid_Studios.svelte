<script lang="ts">
  import type { Media } from "@prisma/client/wasm"

  import { invalidateAll } from "$app/navigation"
  import Button from "$components/elements/Button.svelte"
  import { isMobile } from "$lib/context"
  import IntersectionObserver from "$reusables/IntersectionObserver.svelte"

  import ImageGridStudiosThumbnail from "./ImageGrid_Studios_Thumbnail.svelte"

  interface Props {
    media: Array<Media & { disabled?: Boolean; expanded?: Boolean }>
    i: number
  }

  let { media, i }: Props = $props()

  const getProcessedMedia = $state((oldMedia: typeof media) => {
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
  })

  const getSortedMatchingMedia = (medium: (typeof media)[0]) => {
    return medium.groupedIntoNamesId == null
      ? [medium]
      : media
          .filter(m => m.groupedIntoNamesId == medium.groupedIntoNamesId)
          .sort((a, b) => a.name.localeCompare(b.name))
  }

  let selectedMedia: string[] = $state([])
</script>

<IntersectionObserver once={true} top={750} delay={i > 0 ? 300 : 0}>
  {#snippet children({ intersecting })}
    {#if intersecting}
      <main class:isMobile={isMobile.current}>
        {#if selectedMedia.length}
          <div class="groupActions">
            <Button
              card
              icon="mdiGroup"
              disabled={selectedMedia.length <= 1}
              onclick={() => {
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
            onclick={() => (medium.expanded = !medium.expanded)}
            parent={medium.groupedIntoNamesId != null}
            bind:selectedMedia
          />

          {#if medium.groupedIntoNamesId != null && medium.expanded}
            <div style="grid-column: 1/-1;"></div>
            {#each getSortedMatchingMedia(medium) as subMedium}
              <ImageGridStudiosThumbnail
                sub
                medium={subMedium}
                bind:selectedMedia
              />
            {/each}
            <div style="grid-column: 1/-1;"></div>
          {/if}
        {/each}
      </main>
    {/if}
  {/snippet}
</IntersectionObserver>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
