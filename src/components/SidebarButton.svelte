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

    //#region Context Menu

    let pos: { x: number, y: number } | null

    const id = Math.random().toString(16).substring(2, 16)

    const processBodyRightClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("a")?.id != id)
            pos = null
    }

    //#endregion

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

{#if pos}

    <main style={`left: ${pos.x}px; top: ${pos.y}px`}>
        <span>Rename</span>
        <span>Delete</span>
    </main>
    
{/if}

<svelte:body on:click={() => pos = null} on:contextmenu|preventDefault={processBodyRightClick} />

<a
{id}
href={$group && target ? `?c=${(new URL($page.url)).searchParams.get("c") || 1}&g=${target.id}` : ""}
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

on:contextmenu|preventDefault={e => {
    pos = {
        x: e.clientX,
        y: e.clientY
    }
}}

on:dblclick|stopPropagation={() => {
    if (!target || !$cluster) return

    fetch(`/${$cluster.id}/${target.id}/collapsed/${!!target.children.length && !target.collapsed}`, {
        method: "PATCH"
    })
    target.collapsed = !!target.children.length && !target.collapsed

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
        margin-right: 1px;

        transition: background 150ms;
        border: 1px solid transparent;


        &:hover {
            background: hsl(0, 0%, 22%);
        }
        &.active {
            background: hsl(0, 0%, 26%);
        }

        &.isDraggingOver {
            background: hsl(0, 0%, 30%);
            border: 1px solid hsl(0, 0%, 45%);
        }

        .section {
            display: flex;
            align-items: center;

            .spacer { margin-right: 0.35em }
            span { font-weight: 200 }
        }
    }

    main {
		position: absolute;

        background: #202020;
        box-shadow: inset 0.7px 0.7px 0.7px rgba($color: #fff, $alpha: 0.15);
        border-radius: 3px;

		display: grid;

        span {
            cursor: pointer;
            transition: background 150ms;
            padding: 0.5em;

            &:hover {
                background: #333;
            }
        }

	}
</style>