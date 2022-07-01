<script lang="ts">
    import type { Cluster, Group } from 'src/types'

    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder, mdiFolderHidden } from '@mdi/js'

    export let cluster: Cluster
    export let group: Group
    export let target: Group
    export let indent: number = 0
</script>

<SidebarButton
    bind:group bind:target {indent} {cluster}
    icon={target.icon || target.collapsed ? mdiFolderHidden : mdiFolder}
>
    {target.name}
</SidebarButton>

{#if target.children && !target.collapsed}
    {#each target.children.sort((a, b) => a.name.localeCompare(b.name)) as child}
        <svelte:self bind:group bind:target={child} indent={indent + 1} {cluster}/>
    {/each}
{/if}