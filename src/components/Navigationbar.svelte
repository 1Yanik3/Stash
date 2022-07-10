<script lang="ts">
    import { mdiArchive, mdiBookshelf, mdiHook, mdiHookOff, mdiImage, mdiTrashCan, mdiVideo } from '@mdi/js'
    import Icon from 'mdi-svelte'
    import { sortingMethods } from '../types'
    
    import SidebarButton from "../components/SidebarButton.svelte"
    import SidebarSection from "../components/SidebarSection.svelte"
    import SidebarHierarchyEntry from "../components/SidebarHierarchyEntry.svelte"

    import { cluster, clusters, traverse, group, groups, tags, activeSortingMethod, mediaTypeFilter } from '../stores'

    export let controller: any

    const changeCluster = ((e: any) => {
        const { target }: { target: HTMLInputElement} = e
        console.log("123")
        window.history.pushState({}, '', `?c=${target.value}`)
        cluster.set($clusters.find(c => c.id == (target.value as any as number)) || $clusters[0])
        controller.updateGroups()
    })

    const createGroup = async () => {
        const name = window.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`https://stash.hera.lan/${$cluster.id}/groups`,{
                method: "POST",
                body: JSON.stringify({
                    Cluster: $cluster.id,
                    Name: name,
                    Parent: $group.id != -1 ? $group.id : ""
                })
            })
            controller.updateGroups()
        }
    }


</script>

<SidebarSection justify>
    {#key $clusters}
        <select on:change={changeCluster} >
            {#each $clusters as c}
                <option value={c.id} selected={c.id == $cluster.id}>{c.name}</option>
            {/each}
        </select>
    {/key}

    <div style="display: flex; align-items: center">

        <div
            on:click={() =>
                activeSortingMethod.set(
                    sortingMethods[(sortingMethods.indexOf($activeSortingMethod) + 1) % sortingMethods.length]
                )
            } 
            on:contextmenu|preventDefault={() =>
                activeSortingMethod.set($activeSortingMethod)
            }
            style="cursor: pointer; margin-right: 0.35em"
        >
            <Icon path={$activeSortingMethod.icon} size={0.8}/>
        </div>

        <div on:click={() => {
            traverse.set(!$traverse)
            localStorage.setItem('traverse', $traverse.toString())
        }} style="cursor: pointer; margin-right: 0.35em">
            {#if $traverse}
                <Icon path={mdiHook} size={0.8}/>
            {:else}
                <Icon path={mdiHookOff} size={0.8}/>
            {/if}
        </div>

    </div>
</SidebarSection>

<!-- Statics -->
<SidebarSection>
    <SidebarButton target={$groups.find(g => g.id == -3)} icon={mdiBookshelf}>
        All
    </SidebarButton>
    <SidebarButton target={$groups.find(g => g.id == -1)} icon={mdiArchive}>
        Unsorted
    </SidebarButton>
    <SidebarButton target={$groups.find(g => g.id == -2)} icon={mdiTrashCan}>
        Trash
    </SidebarButton>
</SidebarSection>

<!-- Folders -->
<SidebarSection title="Folders" action={createGroup}>

    {#key $groups}
        
        {#each $groups.filter(({ id }) => id > 0) as target}
            <SidebarHierarchyEntry {target}/>
        {/each}

    {/key}
    
</SidebarSection>

<!-- Tags -->
{#if $tags.length}

    <SidebarSection title="Tags">

        {#each $tags as tag}
            <SidebarButton {tag}/>
        {/each}

    </SidebarSection>

{/if}

<!-- Type -->
<SidebarSection title="Media Type">

    <SidebarButton icon={mdiImage} on:click={() => {
        if ($mediaTypeFilter == "image")
            mediaTypeFilter.set("")
        else
            mediaTypeFilter.set("image")
    }} active={$mediaTypeFilter == "image"}>
        Image
    </SidebarButton>
    
    <SidebarButton icon={mdiVideo} on:click={() => {
        if ($mediaTypeFilter == "video")
            mediaTypeFilter.set("")
        else
            mediaTypeFilter.set("video")
    }} active={$mediaTypeFilter == "video"}>
        Video
    </SidebarButton>

</SidebarSection>