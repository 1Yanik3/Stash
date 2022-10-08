<script lang="ts">
    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder, mdiFolderHidden, mdiFolderOutline } from '@mdi/js'

    import type { Group } from 'src/types'
    import { onMount } from 'svelte'
    import { group } from '../stores';
    import { fade, slide } from 'svelte/transition';

    export let target: Group
    export let indent: number = 0

    let element: HTMLAnchorElement
    group.subscribe(() => {
        if (!element) return

        const r = element.getBoundingClientRect()
        if ($group == target && !(
            r.top >= 60 &&
            r.bottom <= (window.innerHeight - 40)
        )) {
            element.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            })
        }
    })
    onMount(() => {
        if ($group == target) 
            element.scrollIntoView({
                block: "center"
            })
    })
</script>

<div transition:fade>
<SidebarButton
    bind:element
    bind:target {indent}
    icon={target.icon || target.collapsed ? mdiFolderHidden : mdiFolderOutline}
>
    {target.name}
</SidebarButton>

</div>

{#if target.children && !target.collapsed}
    {#each target.children.sort((a, b) => a.name.localeCompare(b.name)) as child}
        <svelte:self bind:target={child} indent={indent + 1}/>
    {/each}
{/if}