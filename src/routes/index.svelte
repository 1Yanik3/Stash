<script lang="ts">
    import type { Group, Cluster, Tag, Medium } from 'src/types'

    import { page } from '$app/stores'
    import { onMount } from 'svelte'

    import { mdiArchive, mdiBookshelf, mdiFileUpload, mdiHook, mdiHookOff, mdiImage, mdiSort, mdiSortAlphabeticalAscending, mdiSortAlphabeticalDescending, mdiSortCalendarAscending, mdiSortCalendarDescending, mdiTrashCan, mdiVideo } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import SidebarButton from "../components/SidebarButton.svelte"
    import SidebarSection from "../components/SidebarSection.svelte"
    import SidebarHierarchyEntry from "../components/SidebarHierarchyEntry.svelte"
    import ImageGrid from '../components/ImageGrid.svelte'
    import Toolbar from '../components/Toolbar.svelte'
    import DropFile from '../components/DropFile.svelte'
    import MediaViewer from '../components/MediaViewer.svelte'
    
    //#region Clusters and Groups

    let clusters: Array<Cluster> = []
    let cluster: Cluster = { id: 0, name: "Loading..." }

    let groups: Array<Group> = []
    let group: Group = { id: 0, name: "Loading...", children: [], collapsed: false }

    ;(async () => {
        console.log("Updating clusters...")
        try {
            const res = await fetch(`https://stash.hera.lan/clusters`)
            clusters = await res.json()
            cluster = clusters.find(c => c.id == Number((new URL($page.url)).searchParams.get("c"))) || clusters[0]
        } catch (err) {
            console.error("failed to update clusters", err)
        }
    })()

    //#endregion

    //#region Groups

    const updateGroups = async () => {
        console.log("Updating groups...")
        try {

            const res = await fetch(`https://stash.hera.lan/${cluster.id}/groups`)
            groups = (await res.json()).map((c: Group) => {

                if (c.id == -1) c.icon = mdiArchive
                if (c.id == -2) c.icon = mdiTrashCan

                if (c.icon == "images") c.icon = mdiImage
                if (c.icon == "videos") c.icon = mdiVideo

                return c

            }).sort((a: Group, b: Group) => a.name.localeCompare(b.name))

            const flattentedGroups: Array<Group> = []
            const flatten = (input: Group) => {

                if (input.children.length)
                    input.children.forEach(g => flatten(g))

                flattentedGroups.push(input)

            }
            groups.forEach(g => flatten(g))

            group = flattentedGroups.find(g => g.id == Number((new URL($page.url)).searchParams.get("g"))) || groups[0]

        } catch (err) {
            console.error("failed to update groups", err)
        }
    }
    $: cluster && cluster.id && updateGroups()

    const createGroup = async () => {
        const name = window.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`https://stash.hera.lan/${cluster.id}/groups`,{
                method: "POST",
                body: JSON.stringify({
                    Cluster: cluster.id,
                    Name: name,
                    Parent: group.id != -1 ? group.id : ""
                })
            })
            updateGroups()
        }
    }

    //#endregion

    //#region Tags
    
    let tags: Array<Tag> = []

    const updateTags = async () => {
        console.log("Updating tags...")
        try {

            const res = await fetch(`https://stash.hera.lan/${cluster.id}/${group.id}/tags`)
            tags = (await res.json()).map((t: any) => { t.active = false; return t })
            
        } catch (err) {
            console.warn("failed to update tags", err)
        }
    }
    $: cluster && group && cluster.id && group.id > 0 && updateTags()

    const clearTagSelection = () => tags = tags.map(t => { t.active = false; return t })
    $: if($page.url) clearTagSelection()

    //#endregion

    let visibleMedium: Medium | null = null
    let isFullscreen: boolean
    $: if (!visibleMedium) isFullscreen = false
    let traverse: boolean = false
    onMount(() => {
        traverse = localStorage.getItem('traverse') == "true"
    })

    //#region Uploader

    let fileOver = false
    let uploadProgress: null | { done: number, from: number } = null

    const onDrop = async (files: File[]) => {

        for (const i in files) {

            uploadProgress = {
                done: +i,
                from: files.length
            }

            const data = new FormData()
            data.append('file', files[i])
            data.append('user', 'hubot')

            const request = fetch(`https://stash.hera.lan/${cluster.id}/${group.id}/media`, {
                method: 'POST',
                body: data
            })

            request.catch(console.error)

            console.log(request)

            await request

        }
    
        fileOver = false
        uploadProgress = null
    }

    //#endregion

    //#region Shortcuts

    let mediaIndex = 0
    let mediaCount = 0

    const keyDownEventListener = (e: KeyboardEvent) => {

        if (visibleMedium && e.key == "ArrowLeft")
            if (mediaIndex > 0)
                mediaIndex -= 1
        if (visibleMedium && e.key == "ArrowRight")
            if (mediaIndex < mediaCount)
                mediaIndex += 1

    }

    //#endregion   
    
    
    //#region Sorting

    const sortingMethods = [
        {
            icon: mdiSortAlphabeticalAscending,
            method: (a: Medium, b: Medium) => a.name.localeCompare(b.name)
        },
        {
            icon: mdiSortAlphabeticalDescending,
            method: (a: Medium, b: Medium) => b.name.localeCompare(a.name)
        },
        {
            icon: mdiSortCalendarAscending,
            method: (a: Medium, b: Medium) => a.date - b.date
        },
        {
            icon: mdiSortCalendarDescending,
            method: (a: Medium, b: Medium) => b.date - a.date
        },
        {
            icon: mdiSort,
            method: (a: Medium, b: Medium) => 0.5 - Math.random()
        }
    ]
    let activeSortingMethod = sortingMethods[3]

    //#endregion

</script>

<svelte:window on:keydown={keyDownEventListener}/>

<main>
    
    <section style={isFullscreen ? 'display: none' : ''}>

        <SidebarSection justify>
            <select
                bind:value={cluster}
                on:change={() => window.history.pushState(`?c=${cluster.id}`, document.title)}
            >
                {#each clusters as cluster}
                    <option value={cluster}>{cluster.name}</option>
                {/each}
            </select>

            <div style="display: flex; align-items: center">

                <div
                    on:click={() =>
                        activeSortingMethod = sortingMethods[(sortingMethods.indexOf(activeSortingMethod) + 1) % sortingMethods.length]
                    } 
                    on:contextmenu|preventDefault={() =>
                        activeSortingMethod = activeSortingMethod
                    }
                    style="cursor: pointer; margin-right: 0.35em"
                >
                    <Icon path={activeSortingMethod.icon} size={0.8}/>
                </div>

                <div on:click={() => {
                    traverse = !traverse
                    localStorage.setItem('traverse', traverse.toString())
                }} style="cursor: pointer; margin-right: 0.35em">
                    {#if traverse}
                        <Icon path={mdiHook} size={0.8}/>
                    {:else}
                        <Icon path={mdiHookOff} size={0.8}/>
                    {/if}
                </div>

            </div>
        </SidebarSection>

        <!-- Statics -->
        <SidebarSection>
            <SidebarButton target={groups.find(g => g.id == -3)} bind:group icon={mdiBookshelf}>
                All
            </SidebarButton>
            <SidebarButton target={groups.find(g => g.id == -1)} bind:group icon={mdiArchive}>
                Unsorted
            </SidebarButton>
            <SidebarButton target={groups.find(g => g.id == -2)} bind:group icon={mdiTrashCan}>
                Trash
            </SidebarButton>
        </SidebarSection>

        <!-- Folders -->
        <SidebarSection title="Folders" action={createGroup}>
            
            {#each groups.filter(({ id }) => id > 0) as target}
                <SidebarHierarchyEntry {target} {cluster} bind:group/>
            {/each}
            
        </SidebarSection>

        <!-- Tags -->
        <SidebarSection title="Tags">

            {#each tags as { name, count, active }}
                <!-- @ts-ignore -->
                <SidebarButton bind:active {count}>
                    {name}
                </SidebarButton>
            {/each}

        </SidebarSection>

    </section>

    <section style={`${visibleMedium ? "" : "grid-column: 2 / span 2;"} ${isFullscreen ? 'display: none' : ''}`}>

        <DropFile
            onDrop={onDrop}
            onEnter={() => fileOver = true}
            onLeave={() => fileOver = false}
        >

            {#if fileOver || uploadProgress != null}
                
                    <div class="dropZone">
                        <Icon path={mdiFileUpload} size={3}/>
                        {#if uploadProgress}
                            <span>uploading {uploadProgress?.done} out of {uploadProgress?.from}</span>
                        {:else}
                            <span>Drop to upload</span>
                        {/if}
                    </div>

            {:else}

                {#key  [ group, traverse, activeSortingMethod ]}
                    <ImageGrid {cluster} {group} bind:visibleMedium {traverse} bind:mediaIndex bind:mediaCount {tags} {activeSortingMethod} />
                {/key}

            {/if}
            
        </DropFile>

    </section>
    
    {#if visibleMedium}
        <section style={isFullscreen ? 'grid-column: 1 / span 3' : ''}>

            <Toolbar bind:visibleMedium bind:isFullscreen {cluster} />
            
            <MediaViewer {visibleMedium} {cluster} />

        </section>
    {/if}

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 220px minmax(200px, 600px) minmax(350px, 1fr);

        height: 100%;
        width: 100%;

        section {
            box-shadow: inset -0.7px 0 0 rgba($color: #fff, $alpha: 0.15);

            &:nth-child(1),  &:nth-child(3) {
                background: hsl(0, 0%, 16%);
            }
            &:nth-child(1) {
                overflow-y: auto;
            }
            &:nth-child(2) {
                padding: 1em;

                .dropZone {
                    box-shadow: inset 0.7px 0.7px 0.7px rgba($color: #fff, $alpha: 0.15);
                    background: #444;
                    height: 100%;
                    width: 100%;

                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;

                    pointer-events: none;

                    span { margin-top: 0.5em }
                }
            }

            // Grid
            &:nth-child(2) {
                background: hsl(0, 0%, 19%);
                overflow-y: auto;
            }

            // Image viewer
            &:nth-child(3) {

                max-height: 50vh;

                display: grid;
                grid-template-rows: auto 1fr;

            }

        }
    }
</style>