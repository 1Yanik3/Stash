<script lang="ts">
    import { clusterIndex, controller, data, getCluster, visibleMedium } from '$lib/stores'
    import GridThumbnail from './GridThumbnail.svelte'
    import type { Media, Tags } from '@prisma/client'
    import { mdiCardMultiple } from '@mdi/js'
    import { createEventDispatcher } from 'svelte'
    import { page } from "$app/stores"
    import Icon from 'mdi-svelte'

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

    $: c = $data.find(c => c.groups.some(g => g.id == +$page.params.group))
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
                {#if $controller.getGroup().id == c?.everythingGroupId}
                    {getCluster($clusterIndex).groups.find(g => g.id == medium.groupId)?.name},
                {/if}
                {medium.width}x{medium.height}
            </span>
        {/if}
    </div>

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 10em 1fr;
        max-width: calc(100% - 64px);
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

        .details {
            display: flex;
            flex-direction: column;
            gap: 0.25em;
            margin: 0.5em;
            margin-left: 0.75em;

            b {
                font-weight: bold;
            }
        }
    }
</style>