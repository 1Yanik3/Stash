<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import { mdiGroup, mdiUngroup } from "@mdi/js";
    import type { Media, Tags } from '@prisma/client';
    import { onMount } from "svelte";
    import IntersectionObserver from "../reusables/IntersectionObserver.svelte";
    import type { PageData } from "../routes/[cluster]/[group]/$types";
    import SidebarButton from "../routes/[cluster]/[group]/SidebarButton.svelte";
    import ImageGridStudiosThumbnail from "./ImageGrid_Studios_Thumbnail.svelte";

    $: pageData = $page.data as PageData

    let finishedLoading = false
    onMount(() => setTimeout(() => finishedLoading = true, 100))

    export let media: Array<Media & { tags: Tags[], disabled?: Boolean, expanded?: Boolean }>
    export let i: number

    const alreadyProcessedGroupedInto: number[] = []
    for (let i = 0; i < media.length; i++) {
        const element = media[i];
        if (element.groupedIntoNamesId != null) {
            if (alreadyProcessedGroupedInto.includes(element.groupedIntoNamesId)) {
                element.disabled = true
            } else {
                alreadyProcessedGroupedInto.push(element.groupedIntoNamesId)
            }
        }
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

        <main>

            {#if selectedMedia.length}
                <div class="groupActions">
                    <SidebarButton card icon={mdiGroup} disabled={selectedMedia.length <= 1}
                        on:click={() => {
                            // TODO: Allow grouping of media
                            fetch(`/api/group-together`,{
                                method: "POST",
                                body: JSON.stringify(selectedMedia)
                            }).then(() => invalidate("media-and-tags"))
                        }}
                    >Group</SidebarButton>
                    <SidebarButton card icon={mdiUngroup} disabled={selectedMedia.length > 1}
                    
                    >Ungroup</SidebarButton>
                </div>
            {/if}

            {#each media.filter(m => !m.disabled) as medium, i}
                {@const parent = medium.groupedIntoNamesId != null}
                {@const sortedMatchingMedia =  !parent ? [ medium ] : (
                    media.filter(m => m.groupedIntoNamesId == medium.groupedIntoNamesId)
                    .sort((a, b) => a.name.localeCompare(b.name))
                )}

                <ImageGridStudiosThumbnail medium={sortedMatchingMedia[0]} on:click={() => medium.expanded = !medium.expanded} {finishedLoading} {parent} bind:selectedMedia />

                {#if parent && medium.expanded}
                    {#each sortedMatchingMedia as subMedium, i}
                        <ImageGridStudiosThumbnail sub medium={subMedium} {finishedLoading} bind:selectedMedia />
                    {/each}
                {/if}
            {/each}

        </main>


    {/if}

</IntersectionObserver>

<style lang="scss">

    main {
        // display: grid;
        // grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));;
        gap: 0.5em;
        margin-bottom: 1em;

        .groupActions {
            display: flex;
        }

    }

</style>