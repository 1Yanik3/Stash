<script lang="ts">
    import { mdiArchiveOutline, mdiBookshelf, mdiDotsVertical, mdiFolderHidden, mdiImageOutline, mdiPlus, mdiRenameBox, mdiTrashCanOutline, mdiVideoOutline } from '@mdi/js'
    
    import SidebarHierarchyEntry from "../SidebarHierarchyEntry.svelte"
    import SidebarSection from "../SidebarSection.svelte"
    import SidebarButton from "../SidebarButton.svelte"

    import { serverURL, cluster, group, groups, stories, story, tags, mediaTypeFilter, controller } from '$lib/stores'
    import { slide } from 'svelte/transition'
    import Shortcut from '../../reusables/Shortcut.svelte'

    // TODO: Move into other section
    let showOptions = false
    const createGroup = async () => {
        const name = window.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`/api/cluster/${$cluster.id}/group`,{
                method: "POST",
                body: JSON.stringify({
                    name,
                    parentId: $group.id != -1 ? $group.id : ""
                })
            })
            $controller.updateGroups()
        }
    }

    const renameGroup = async () => {
        const name = window.prompt("Enter a name for the group", $group.name)

        if (name) {
            await fetch(`${serverURL}/${$cluster.id}/${$group.id}/name/${name}`,{
                method: "PATCH"
            })
            $controller.updateGroups()
        }
    }
    
    const toggleHidden = () => {
        fetch(`${serverURL}/${$cluster.id}/${$group.id}/collapsed/${!!$group.children.length && !$group.collapsed}`, {
            method: "PATCH"
        })
        groups.set(
            $groups.map(g => {
                if (g == $group && g.children.length) {
                    g.collapsed = !g.collapsed
                }
                return g
            })
        )
    }
</script>

<!-- Create Group -->
<Shortcut key="c" action={createGroup} />
<Shortcut key="r" action={renameGroup} />

<main>
    {#if $cluster.type == "stories"}
    <div style="margin-top: 8px; margin-right: 2px">
        <!-- <SidebarButton icon={mdiPlus}>
            Add
        </SidebarButton> -->
        <!-- <SidebarSection title="Stories"> -->
        <SidebarSection>
            {#each $stories as s}
                <SidebarButton icon={null} active={$story == s} on:click={() => story.set(s)}>
                    {s.title}
                </SidebarButton>
            {/each}
        </SidebarSection>
    </div>
    {:else}
    <div>
        <!-- Statics -->
        <SidebarSection horizontal>
            <SidebarButton hidden target={$groups.find(g => g.id < 0 && g.name == "Everything")} icon={mdiBookshelf}>
                All
            </SidebarButton>
            <SidebarButton hidden target={$groups.find(g => g.id < 0 && g.name == "Unsorted")} icon={mdiArchiveOutline}>
                Unsorted
            </SidebarButton>
            <SidebarButton hidden target={$groups.find(g => g.id < 0 && g.name == "Trash")} icon={mdiTrashCanOutline}>
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
            </SidebarSection>
        </div>
        {/if}
    </div>

    <div>
        <!-- Folders -->
        <SidebarSection title="Folders">
            {#key $groups}
                
                {#each $groups.filter(({ id }) => id > 0) as target}
                    <SidebarHierarchyEntry {target}/>
                {/each}

            {/key}
        </SidebarSection>

        {#if $cluster.type != "collection"}

        <!-- Tags -->
        {#if $tags.length}
            <SidebarSection title="Tags">

                {#each $tags.sort((a, b) => b.count - a.count) as tag}
                    <SidebarButton {tag}/>
                {/each}

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