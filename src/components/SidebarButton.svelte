<script lang="ts">
    import type { Cluster, Group, Tag } from '../types'
    import { serverURL, group, tags } from '../stores'

    import { createEventDispatcher } from 'svelte'
    import { mdiPound } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import { page } from '$app/stores'

    export let cluster: Cluster | null = null
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
href={group && target ? `?c=${(new URL($page.url)).searchParams.get("c") || 1}&g=${target.id}` : ""}
style={`padding-left: ${0.75 + indent}em`}
class:active={active || tag?.active || (group && target && $group.id == target.id)}

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
    if (!target || !cluster) return

    fetch(`/${cluster.id}/${target.id}/collapsed/${!!target.children.length && !target.collapsed}`, {
        method: "PATCH"
    })
    target.collapsed = !!target.children.length && !target.collapsed

}}
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

        &:hover {
            background: hsl(0, 0%, 22%);
        }
        &.active {
            background: hsl(0, 0%, 26%);
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