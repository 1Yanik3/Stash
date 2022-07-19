<script lang="ts">
    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder, mdiFolderHidden } from '@mdi/js'

    import type { Group } from 'src/types'
    import { cluster } from '../stores'

    export let target: Group
    export let indent: number = 0
</script>

<SidebarButton
    bind:target {indent}
    icon={target.icon || target.collapsed ? mdiFolderHidden : mdiFolder}
>
    {target.name}
</SidebarButton>

{#if target.children && !target.collapsed}
    {#each target.children.sort((a, b) => a.name.localeCompare(b.name)) as child}
        <svelte:self bind:target={child} indent={indent + 1}/>
    {/each}
{/if}