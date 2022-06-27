<script lang="ts">
    import type { Group, Cluster, Tag, Medium } from 'src/types'

    import { page } from '$app/stores'
    import { mdiArchive, mdiCog, mdiFileUpload, mdiFolder, mdiImageAlbum, mdiTrashCan, mdiVideo } from '@mdi/js'
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
        const res = await fetch(`http://localhost:8080/clusters`)
        clusters = await res.json()
        cluster = clusters.find(c => c.id == Number((new URL($page.url)).searchParams.get("c"))) || clusters[0]
    })()

    //#endregion

    //#region Groups

    const updateGroups = async () => {
        console.log("Updating groups...")
        const res = await fetch(`http://localhost:8080/${cluster.id}/groups`)
        groups = (await res.json()).map((c: Group) => {

            if (c.id == -1) c.icon = mdiArchive
            if (c.id == -2) c.icon = mdiTrashCan

            if (c.id == 1) c.icon = mdiImageAlbum
            if (c.id == 2) c.icon = mdiVideo

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
    }
    $: cluster && updateGroups()

    //#endregion

    //#region Tags
    
    let tags: Array<Tag> = []

    const updateTags = async () => {
        console.log("Updating tags...")
        const res = await fetch(`http://localhost:8080/${cluster.id}/tags`)
        tags = (await res.json()).map((t: any) => { t.active = false; return t })
    }
    $: cluster && updateTags()

    const clearTagSelection = () => tags = tags.map(t => { t.active = false; return t })
    $: if($page.url) clearTagSelection()

    //#endregion

    let visibleMedium: Medium

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

</script>

<main>
    
    <section>

        <SidebarSection justify>
            <select bind:value={cluster}>
                {#each clusters as cluster}
                    <option value={cluster}>{cluster.name}</option>
                {/each}
            </select>

            <Icon path={mdiCog} size={0.8}/>
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
        <SidebarSection title="Folders">
            
            {#each groups.filter(({ id }) => id > 0) as target}
                <SidebarHierarchyEntry {target} bind:group />
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

    <section style={visibleMedium ? "" : "grid-column: 2 / span 2;"}>

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

                {#key [group]}
                    <ImageGrid {cluster} {group} bind:visibleMedium />
                {/key}

            {/if}
            
        </DropFile>

    </section>
    
    {#if visibleMedium}
        <section>

            <Toolbar bind:visibleMedium/>
            
                <div class="image">
                    <img src={`http://localhost:8080/${cluster.id}/media/${visibleMedium.id}`} alt={visibleMedium.name}>
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

                .image {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    // TODO: Make more elegant
                    height: calc(100vh - 40.5px);

                    background: #202020;

                    img {
                        max-width: 100%;
                        // TODO: Make more elegant
                        max-height: calc(100vh - 40.25px);
                    }
                }

            }

        }
    }
</style>