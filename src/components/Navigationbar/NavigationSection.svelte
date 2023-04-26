<script lang="ts">
    import { mdiArchiveOutline, mdiBookshelf, mdiDotsVertical, mdiFolderHidden, mdiImageOutline, mdiImport, mdiPlus, mdiRenameBox, mdiTagOffOutline, mdiTrashCanOutline, mdiVideoOutline } from '@mdi/js'
    
    import SidebarHierarchyEntry from "../SidebarHierarchyEntry.svelte"
    import SidebarSection from "../SidebarSection.svelte"
    import SidebarButton from "../SidebarButton.svelte"

    import { story, tags, mediaTypeFilter, controller, data, clusterIndex, getCluster } from '$lib/stores'
    import { slide } from 'svelte/transition'
    import Shortcut from '../../reusables/Shortcut.svelte'
    import ImportPopup from '../Popups/ImportPopup.svelte';
    import { page } from '$app/stores';

    // TODO: Move into other section
    let showOptions = false
    const createGroup = async () => {
        const name = await $controller.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`/api/cluster/${getCluster($clusterIndex).id}/group`,{
                method: "POST",
                body: JSON.stringify({
                    name,
                    parentId: +$page.params.group != -1 ? +$page.params.group : ""
                })
            })
            $controller.updateAll()
        }
    }

    const renameGroup = async () => {
        const g = $controller.getGroup()
        const name = await $controller.prompt("Enter a name for the group", g.name)

        if (name) {
            await fetch(`/api/group/${g.id}/rename`,{
                method: "PUT",
                body: JSON.stringify({
                    name
                })
            })
            $controller.updateAll()
        }
    }
    
    // TODO
    const toggleHidden = () => {
        const g = $controller.flattenAllGroups().find(g => g.group.id == +$page.params.group)

        fetch(`/api/group/${g?.group.id}/collapsed/${!!g?.group.children.length && !g?.group.collapsed}`, {
            method: "PATCH"
        })
    }

    let importPopup = false
</script>

<!-- Create Group -->
<Shortcut key="c" action={() => getCluster($clusterIndex).type != "stories" && createGroup()} />
<Shortcut key="r" action={renameGroup} />

<main>
    {#if getCluster($clusterIndex)?.type == "stories"}
    <div style="margin-top: 8px; margin-right: 2px">
        <!-- <SidebarButton icon={mdiPlus}>
            Add
        </SidebarButton> -->
        <!-- <SidebarSection title="Stories"> -->
        <SidebarSection>
            {#each getCluster($clusterIndex).stories as s}
                <SidebarButton icon={null} active={$story == s} on:click={() => story.set(s)}>
                    {s.title}
                </SidebarButton>
            {/each}
        </SidebarSection>
    </div>
    {:else}
    {@const c = $data.find(c => c.id == $clusterIndex)}
    <div>
        <!-- Statics -->
        <SidebarSection horizontal>
            <SidebarButton hidden target={c?.groups.find(g => g.id == c.everythingGroupId)} icon={mdiBookshelf}>
                All
            </SidebarButton>
            <SidebarButton hidden target={c?.groups.find(g => g.id == c.unsortedGroupId)} icon={mdiArchiveOutline}>
                Unsorted
            </SidebarButton>
            <SidebarButton hidden target={c?.groups.find(g => g.id == c.trashGroupId)} icon={mdiTrashCanOutline}>
                Trash
            </SidebarButton>
            <SidebarButton hidden on:click={e =>
                showOptions = !showOptions
            } icon={mdiDotsVertical}/>
        </SidebarSection>

        {#if showOptions}
        <div transition:slide>
            <SidebarSection>
                <SidebarButton right on:click={toggleHidden} icon={mdiFolderHidden}>
                    Toggle Hidden
                </SidebarButton>
                <SidebarButton right on:click={renameGroup} icon={mdiRenameBox}>
                    Rename Group
                </SidebarButton>
                <SidebarButton right on:click={createGroup} icon={mdiPlus}>
                    Create Group
                </SidebarButton>
                <SidebarButton right on:click={() => importPopup = true} icon={mdiImport}>
                    Import
                </SidebarButton>
            </SidebarSection>
        </div>
        {/if}
    </div>

    <div>
        <!-- Folders -->
        <SidebarSection title="Folders">
            {@const cluster = $data.find(c => c.id == $clusterIndex)}
            {#if cluster}
                {#each cluster.groups.filter(({ id }) => id > 0) as target}
                    <SidebarHierarchyEntry {target}/>
                {/each}
            {/if}
        </SidebarSection>

        {#if c?.type != "collection"}

        <!-- Tags -->
        {#if $tags.length}
            <SidebarSection title="Tags">

                {#each $tags
                    .filter(t => t.name != "Untagged")
                    .sort((a, b) => b.count - a.count)
                as tag}
                    <SidebarButton {tag}/>
                {/each}

                <SidebarButton
                    tag={$tags.find(t => t.name == "Untagged")}
                    icon={mdiTagOffOutline}
                />

            </SidebarSection>
        {/if}

        <!-- Type -->
        <SidebarSection title="Media Type">

            <SidebarButton icon={mdiImageOutline} on:click={() => {
                if ($mediaTypeFilter == "image")
                    mediaTypeFilter.set("")
                else
                    mediaTypeFilter.set("image")
            }} active={$mediaTypeFilter == "image"}>
                Image
            </SidebarButton>
            
            <SidebarButton icon={mdiVideoOutline} on:click={() => {
                if ($mediaTypeFilter == "video")
                    mediaTypeFilter.set("")
                else
                    mediaTypeFilter.set("video")
            }} active={$mediaTypeFilter == "video"}>
                Video
            </SidebarButton>

        </SidebarSection>
        
        {/if}
    </div>
    {/if}
</main>

{#if importPopup}
    <ImportPopup bind:visible={importPopup}/>
{/if}

<style lang="scss">
    main {
        height: 100vh;
        overflow: hidden;

        & > :nth-child(2) {
            overflow: scroll;
            scrollbar-width: none;
            height: calc(100% - 60px);
            scroll-padding: 38px;
        }
    }
</style>