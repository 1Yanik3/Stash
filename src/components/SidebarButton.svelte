<script lang="ts">
    import type { Group, Tag } from '../types'
    import { serverURL, group, tags, cluster, media } from '../stores'

    import { createEventDispatcher } from 'svelte'
    import { mdiPound } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import { page } from '$app/stores'

    let isDraggingOver = false

    export let target: Group | null = null
    export let tag: Tag | null = null

    export let icon: string = mdiPound
    export let indent: number = 0
    export let active: boolean = false

    const dispatch = createEventDispatcher()

    //#region Handle Drag (for moving media)

    const isFileTransfer = (e: DragEvent) => e.dataTransfer?.types.includes("Files")

    const handleDrop = (e: DragEvent) => {
        const items = e.dataTransfer?.items
        if (!items) return

        for (const i in items) {
            const item = items[i]
            if (item.type == "text/plain") item.getAsString(async mediaId => {

                if (mediaId.startsWith("mediaId_")) {

                    mediaId = mediaId.replace("mediaId_", "")

                    await fetch(`${serverURL}/${$cluster.id}/media/${mediaId}/group`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            GroupId: target?.id
                        })
                    })

                    media.set(
                        $media.filter(m => m.id.toString() != mediaId)
                    )
                    
                }

            })
        }
        
        isDraggingOver = false
    }
    const handleEnter = (e: DragEvent) => {
        if (isFileTransfer(e)) return

        isDraggingOver = true
    }
    const handleLeave = (e: DragEvent) => {
        isDraggingOver = false
    }

    //#endregion

</script>

<a
href={$group && target ? `?c=${$cluster.id || 1}&g=${target.id}` : ""}
style={`padding-left: ${0.75 + indent}em`}
class:active={active || tag?.active || ($group && target && $group.id == target.id)}

on:click={() => {

    dispatch('click')

    if (tag) {

        // is a tag button
        const tmp = $tags.find(t => t == tag)
        if (tmp)
            tmp.active = !tag.active
        tags.set($tags)

    }
    else {
        if (!target) return

        // is a group button
        if ($group != target)
            group.set(target)

    }
}}

on:drop|preventDefault|stopPropagation={handleDrop}
on:dragover|preventDefault={() => {}}
on:dragenter={handleEnter}
on:dragleave={handleLeave}
class:isDraggingOver
>

    <div class="section">

        <!-- @ts-ignore -->
        <div class="spacer"><Icon path={icon} size={"1.25em"}/></div>
        <span>
            {#if tag}
                {tag.name}
            {:else}
                <slot/>
            {/if}
        </span>

    </div>

    {#if tag}
        <div class="section" style="filter: opacity(0.6)">

            <span>{tag.count}</span>

        </div>
    {/if}

</a>

<style lang="scss">
    a {
        font-weight: 200;
        text-decoration: none;

        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0.5em 0.75em;

        transition: background 100ms, border 100ms;
        border: 1px solid transparent;

        &:hover {
            background: hsl(0, 0%, 22%);
            border: 1px solid hsl(0, 0%, 24%);
        }
        &.active {
            background: hsl(0, 0%, 26%);
            border: 1px solid hsl(0, 0%, 29%);
        }

        &.isDraggingOver {
            background: hsl(0, 0%, 30%);
            border: 1px solid hsl(0, 0%, 45%);
        }

        border-left: none !important;
        border-right: none !important;

        .section {
            display: flex;
            align-items: center;

            .spacer { margin-right: 0.35em }
            span { font-weight: 200 }
        }
    }
</style>