<script lang="ts">
    import SidebarButton from './SidebarButton.svelte'

    import * as Icons from '@mdi/js';

    import type { PageData } from './$types';

    export let target: PageData["groups"][number]
    export let indent = 0
    export let guest = false

    let element: HTMLAnchorElement

    const collator = new Intl.Collator([], {numeric: true})
</script>

<SidebarButton
    bind:element
    bind:target
    {indent}
    {guest}
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
        <svelte:self bind:target={child} indent={indent + 1} {guest} />
    {/each}
{/if}