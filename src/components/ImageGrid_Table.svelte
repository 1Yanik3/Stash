<script lang="ts">
    import { invalidate } from "$app/navigation";
    import type { Media } from "@prisma/client";
    import SidebarButton from "../routes/[cluster]/SidebarButton.svelte";
    import GridThumbnail from "./GridThumbnail.svelte";

    export let media: Array<Media & { disabled?: Boolean; expanded?: Boolean }>;

    const getProcessedMedia = (oldMedia: typeof media) => {
        let alreadyProcessedGroupedInto: number[] = [];
        let newMedia: typeof media = [];
        for (let i = 0; i < media.length; i++) {
            const element = oldMedia[i];
            if (element.groupedIntoNamesId != null) {
                if (
                    !alreadyProcessedGroupedInto.includes(
                        element.groupedIntoNamesId,
                    )
                ) {
                    alreadyProcessedGroupedInto.push(
                        element.groupedIntoNamesId,
                    );
                    newMedia.push(element);
                }
            } else {
                newMedia.push(element);
            }
        }
        return newMedia;
    };
    $: processedMedia = getProcessedMedia(media);

    // TODO: Remove duplication
    const handleTagsKeyDown = (e: KeyboardEvent, medium: Media) => {
        const value: string = (e.target as any).value;
        if (e.key == "Enter" && value) {
            fetch(`/api/media/${medium.id}/tag`, {
                method: "PUT",
                body: JSON.stringify({
                    name: value,
                }),
            })
                .then(() => {
                    const isInUnsorted =
                        medium.tags.length == 1 &&
                        medium.tags[0] == "show_unsorted";

                    const tmp = medium;
                    tmp?.tags.push(value);
                    medium = tmp;

                    (e.target as any).value = "";

                    if (isInUnsorted) {
                        removeTagFromMedia("show_unsorted", medium);
                    } else {
                        invalidate("media-and-tags");
                    }
                })
                .catch(console.error);
        }
    };

    // TODO: Remove duplication
    const removeTagFromMedia = (tag: string, medium: Media) => {
        fetch(`/api/media/${medium.id}/tag/${tag}`, {
            method: "DELETE",
        }).then(() => {
            if (!medium) return;
            const tmp = medium;
            tmp.tags = tmp.tags.filter((t) => t != tag);
            medium = tmp;

            invalidate("media-and-tags");
        });
    };

    let page = 0;
    const pageSize = 20;
</script>

<main>
    <div class="row">
        <b>Thumbnail</b>
        <b>Name</b>
        <div style="display: flex; align-items: center; user-select: none">
            <b style="margin-right: 0.5em;flex-grow: 1">Tags</b>
            <SidebarButton
                card
                icon="mdiPagePrevious"
                on:click={() => page--}
                disabled={page == 0}
            />
            <span>{page + 1}/{Math.ceil(processedMedia.length / pageSize)}</span
            >
            <SidebarButton
                card
                icon="mdiPageNext"
                on:click={() => page++}
                disabled={page ==
                    Math.ceil(processedMedia.length / pageSize) - 1}
            />
        </div>
    </div>

    {#each processedMedia.slice(page * pageSize, (page + 1) * pageSize) as medium (medium.id)}
        <div class="row">
            <div class="thumbnail">
                <GridThumbnail {medium} i={-1} disableActive />
            </div>
            <span
                role="textbox"
                contenteditable
                bind:innerText={medium.name}
                on:input={(e) => {
                    fetch(`/api/media/${medium.id}/rename`, {
                        method: "PUT",
                        body: JSON.stringify({
                            name: medium.name,
                        }),
                    });
                }}
            />
            <div class="tags">
                {#each medium.tags as tag}
                    <span class="tag" on:contextmenu={() => removeTagFromMedia(tag, medium)}>{tag}</span>
                {/each}

                <input
                    type="text"
                    on:keydown|stopPropagation={(e) =>
                        handleTagsKeyDown(e, medium)}
                />
            </div>
        </div>
    {/each}

    <!--  {#each getProcessedMedia(media) as medium}
        <ImageGridStudiosThumbnail
            {medium}
            on:click={() => (medium.expanded = !medium.expanded)}
            parent={medium.groupedIntoNamesId != null}
            bind:selectedMedia
        />

        {#if medium.groupedIntoNamesId != null && medium.expanded}
            {#each getSortedMatchingMedia(medium) as subMedium}
                <ImageGridStudiosThumbnail
                    sub
                    medium={subMedium}
                    bind:selectedMedia
                />
            {/each}
        {/if}
    {/each} -->
</main>

<style lang="scss">
    main {
        display: grid;
        gap: 1em;

        .row {
            display: grid;
            grid-template-columns: 150px 1fr 1fr auto;
            gap: 1em;
            align-items: center;

            b {
                font-weight: 500;
            }

            span {
                overflow: hidden;
            }

            .thumbnail {
                aspect-ratio: 16/9;
            }

            .tags {
                gap: 0.5em;
                margin-left: 0.75em;
                margin-bottom: 5.5px;
                user-select: none;

                .tag {
                    background: $color-dark-level-2;
                    padding: 0.3em 0.4em;
                    border: 1px solid $border-color-1;
                    border-radius: 5px;
                    margin-right: 0.25em;
                }
            }
        }
    }
</style>
