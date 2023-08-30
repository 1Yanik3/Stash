<script lang="ts">
    import { visibleMedium } from '$lib/stores'
    import GridThumbnail from './GridThumbnail.svelte'
    import type { Media, Tags } from '@prisma/client'
    import { mdiCardMultiple } from '@mdi/js'
    import { createEventDispatcher } from 'svelte'
    import { page } from "$app/stores"
    import Icon from './Icon.svelte'
    import type { PageData } from '../routes/[cluster]/[group]/$types';

    $: pageData = $page.data as PageData

    const dispatch = createEventDispatcher()

    export let selectedMedia: string[]
    export let medium: Media & { tags: Tags[] }
    export let finishedLoading: boolean

    export let parent = false
    export let sub = false

    const leftClick = (e: MouseEvent) => {
        if (e.metaKey) {
            visibleMedium.set(null)
            if (selectedMedia.includes(medium.id))
                selectedMedia = selectedMedia.filter(j => j != medium.id)
            else
                selectedMedia = [...selectedMedia, medium.id]
        } else {
            selectedMedia = []
            if (parent) {
                dispatch("click")
            } else {
                visibleMedium.set(medium)
            }
        }
    }
</script>

<main
on:mousedown={e => leftClick(e)}
class:active={$visibleMedium == medium && !parent}
class:selected={selectedMedia.includes(medium.id)}
class:sub
>

    <div class="thumb">
        <GridThumbnail {medium} i={-1} {finishedLoading} disableActive />
    </div>

    <div class="details">
        {#if parent}
            {#await fetch(`/api/group-together/${medium.groupedIntoNamesId}`).then(response => response.text()) then name}
                <b>
                    <Icon path={mdiCardMultiple} size={0.8} />
                    {name}
                </b>
            {/await}
        {:else}
        <b>{medium.name}</b>
            <span>
                {#if pageData.groups.find(g => g.id == medium.groupId)?.name}
                    {#if +$page.params.group == pageData.cluster.everythingGroupId}
                        {pageData.groups.find(g => g.id == medium.groupId)?.name},
                    {/if}
                {/if}
                {medium.width}x{medium.height}
            </span>
        {/if}
    </div>

    <div class="tags">

        {#each medium.tags || [] as tag}
            <span class="tag">{tag.name}</span>
        {/each}

    </div>

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 10em 1fr;
        user-select: none;

        padding: 1em;
        border: 1px solid transparent;
        border-radius: 0.5em;

        &.sub {
            margin-left: 3em;
        }

        transition: all 200ms;
        &:hover, &.active {
            background: #212121;
            box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
            border: 1px solid hsl(0, 0%, 22%);
        }

        &.selected {
            background: hsl(0, 0%, 27%);
            box-shadow: rgba(68, 68, 68, 0.2) 0px 1px 3px 0px, rgba(68, 68, 68, 0.12) 0px 1px 2px 0px;
            border: 1px solid hsl(0, 0%, 36%);
        }

        .thumb {
            grid-row: span 2;
        }

        .details {
            display: flex;
            flex-direction: column;
            gap: 0.25em;
            margin: 0.5em;
            margin-left: 0.75em;
            margin-bottom: 0;

            b {
                font-weight: bold;
            }
        }

        .tags {
            gap: 0.5em;
            margin-left: 0.75em;

            .tag {
                background: hsl(0, 0%, 25%);
                padding: 0.3em 0.4em;
                box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
                border-radius: 3px;

                margin-right: 0.25em;
            }
        }
    }
</style>