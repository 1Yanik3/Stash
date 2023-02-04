<script lang="ts">
    import SidebarButton from '../components/SidebarButton.svelte'

    import type { Group } from 'src/types'
    import { onMount } from 'svelte'
    import { group } from '$lib/stores';
    import * as Icons from '@mdi/js';

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

    const collator = new Intl.Collator([], {numeric: true})

    console.log($group.icon)
</script>

<SidebarButton
    bind:element
    bind:target
    {indent}
    icon={target.icon 
        // @ts-ignore
        ? Icons[`mdi${target.icon || ""}`]
        : target.collapsed ? Icons.mdiFolderHidden : Icons.mdiFolderOutline
    }
>
    {target.name}
</SidebarButton>

{#if target.children && !target.collapsed}
    {#each target.children.sort((a, b) => collator.compare(a.name, b.name)) as child}
        <svelte:self bind:target={child} indent={indent + 1}/>
    {/each}
{/if}