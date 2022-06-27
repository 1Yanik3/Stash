<script lang="ts">
    import type { Group, Cluster, Tag, Medium } from 'src/types'

    import { page } from '$app/stores'
    import { mdiArchive, mdiCog, mdiFileUpload, mdiHook, mdiHookOff, mdiImage, mdiTrashCan, mdiVideo } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import SidebarButton from "../components/SidebarButton.svelte"
    import SidebarSection from "../components/SidebarSection.svelte"
    import SidebarHierarchyEntry from "../components/SidebarHierarchyEntry.svelte"
    import ImageGrid from '../components/ImageGrid.svelte'
    import Toolbar from '../components/Toolbar.svelte'
    import DropFile from '../components/DropFile.svelte'
    
    //#region Clusters and Groups

    let clusters: Array<Cluster> = []
    let cluster: Cluster = { id: 0, name: "Loading..." }

    let groups: Array<Group> = []
    let group: Group = { id: 0, name: "Loading...", children: [] }

    ;(async () => {
        console.log("Updating clusters...")
        try {
            const res = await fetch(`http://localhost:8080/clusters`)
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

            const res = await fetch(`http://localhost:8080/${cluster.id}/groups`)
            groups = (await res.json()).map((c: Group) => {

                if (c.id == -1) c.icon = mdiArchive
                if (c.id == -2) c.icon = mdiTrashCan

                if (c.icon == "images") c.icon = mdiImage
                if (c.icon == "videos") c.icon = mdiVideo

                return c

            })

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
    $: cluster && updateGroups()

    const createGroup = () => {
        fetch(`http://localhost:8080/${cluster.id}/groups`,{
            method: "POST",
            body: JSON.stringify({
                Cluster: cluster.id,
                Name: window.prompt("Enter a name for the new collection"),
                Parent: group.id != -1 ? group.id : ""
            })
        }).then(() => updateGroups())
    }

    //#endregion

    //#region Tags
    
    let tags: Array<Tag> = []

    const updateTags = async () => {
        console.log("Updating tags...")
        try {

            const res = await fetch(`http://localhost:8080/${cluster.id}/tags`)
            tags = (await res.json()).map((t: any) => { t.active = false; return t })
            
        } catch (err) {
            console.error("failed to update tags", err)
        }
    }
    $: cluster && updateTags()

    const clearTagSelection = () => tags = tags.map(t => { t.active = false; return t })
    $: if($page.url) clearTagSelection()

    //#endregion

    let visibleMedium: Medium | null = null
    let isFullscreen: boolean
    $: if (!visibleMedium) isFullscreen = false
    let traverse: boolean = false

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

            await fetch(`http://localhost:8080/${cluster.id}/${group.id}/media`, {
                method: 'POST',
                body: data
            }).catch(console.error)

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

</script>

<svelte:window on:keydown={keyDownEventListener}/>

<main>
    
    <section style={isFullscreen ? 'display: none' : ''}>

        <SidebarSection justify>
            <select bind:value={cluster}>
                {#each clusters as cluster}
                    <option value={cluster}>{cluster.name}</option>
                {/each}
            </select>

            <div style="display: flex; align-items: center">
                
                <div on:click={() => traverse = !traverse} style="cursor: pointer; margin-right: 0.25em">
                    {#if traverse}
                        <Icon path={mdiHook} size={0.8}/>
                    {:else}
                        <Icon path={mdiHookOff} size={0.8}/>
                    {/if}
                </div>

                <Icon path={mdiCog} size={0.8}/>
            </div>
        </SidebarSection>

        <!-- Statics -->
        <SidebarSection>
            <SidebarButton target={groups[0]} bind:group icon={mdiArchive}>
                Unsorted
            </SidebarButton>
            <SidebarButton target={groups[1]} bind:group icon={mdiTrashCan}>
                Trash
            </SidebarButton>
        </SidebarSection>

        <!-- Folders -->
        <SidebarSection title="Folders" action={createGroup}>
            
            {#each groups.filter(({ id }) => id > 0) as target}
                <SidebarHierarchyEntry {target} bind:group bind:cluster={cluster} />
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

                {#key  [ group, traverse ]}
                    <ImageGrid {cluster} {group} bind:visibleMedium {traverse} bind:mediaIndex bind:mediaCount />
                {/key}

            {/if}
            
        </DropFile>

    </section>
    
    {#if visibleMedium}
        <section style={isFullscreen ? 'grid-column: 1 / span 3' : ''}>

            <Toolbar bind:visibleMedium bind:isFullscreen {cluster} />
            
            <div class="media">
                {#if visibleMedium.type.startsWith("image")}
                    <img src={`http://localhost:8080/${cluster.id}/media/${visibleMedium.id}`} alt={visibleMedium.name}/>
                {:else if visibleMedium.type.startsWith("video")}
                    <video
                        src={`http://localhost:8080/${cluster.id}/media/${visibleMedium.id}`}
                        alt={visibleMedium.name}
                        controls
                        autoplay
                    ><track kind="captions"/></video>
                {:else}
                    <span>{visibleMedium.name}</span>
                {/if}
            </div>

        </section>
    {/if}

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 200px minmax(200px, 450px) minmax(350px, 1fr);

        height: 100%;
        width: 100%;

        section {
            box-shadow: inset -0.7px 0 0 rgba($color: #fff, $alpha: 0.15);

            &:nth-child(1),  &:nth-child(3) {
                background: hsl(0, 0%, 16%);
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

                .media {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    // TODO: Make more elegant
                    height: calc(100vh - 40.5px);

                    background: #202020;

                    img, video {
                        max-width: 100%;
                        // TODO: Make more elegant
                        max-height: calc(100vh - 40.25px);
                    }
                }

            }

        }
    }
</style>