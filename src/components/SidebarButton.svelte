<script lang="ts">
    import type { Group, Tag } from '../types'
    import { serverURL, group, tags, cluster, media, groups } from '../stores'

    import { createEventDispatcher } from 'svelte'
    import { mdiPound } from '@mdi/js'
    import Icon from 'mdi-svelte'

    let isDraggingOver = false

    export let target: Group | null = null
    export let tag: Tag | null = null

    export let icon: string = mdiPound
    export let indent: number = 0
    export let active: boolean = false

    export let hidden = false
    export let right = false

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
class:hidden
class:right
on:click={e => {

    dispatch('click', e)

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

on:dblclick={() => {
    if (!target) return
    fetch(`${serverURL}/${$cluster.id}/${$group.id}/collapsed/${!!target.children.length && !target.collapsed}`, {
        method: "PATCH"
    })
    
    $groups.find(g => {
        // @ts-ignore
        const recursion = (g) => {
            if (g == target && g.children.length) {
                // @ts-ignore
                g.collapsed = !g.collapsed
            }
            else
                g.children.forEach(recursion)
        }
        return recursion(g)
    })

    groups.set($groups)
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
        margin: 0.15em 0.5em;
        border-radius: 0.35em;

        transition: background 100ms, border 100ms;
        border: 1px solid transparent;

        &:hover {
            background: hsl(0, 0%, 22%);
            border: 1px solid hsl(0, 0%, 24%);
        }
        &.active {
            background: hsl(0, 0%, 24%);
            border: 1px solid hsl(0, 0%, 33%);
        }

        &.isDraggingOver {
            background: hsl(0, 0%, 30%);
            border: 1px solid hsl(0, 0%, 45%);
        }
        .section {
            display: grid;
            grid-auto-flow: column;
            align-items: center;

            .spacer { margin-right: 0.35em }
            span {
                font-weight: 200;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        &.hidden {
            justify-content: center;
            align-items: center;
            .section {
                .spacer { margin-right: unset }
            }
            span {
                display: none;
            }
        }

        &.right {
            &, .section {
                flex-direction: row-reverse;
            }
        }
    }
</style>