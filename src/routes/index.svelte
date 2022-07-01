<script lang="ts">
    import { mdiFileUpload } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import Controller from '../Controller.svelte'
    let controller: Controller

    import ImageGrid from '../components/ImageGrid.svelte'
    import Toolbar from '../components/Toolbar.svelte'
    import DropFile from '../components/DropFile.svelte'
    import MediaViewer from '../components/MediaViewer.svelte'
    import Navibationbar from '../components/Navigationbar.svelte'
    
    //#region Clusters and Groups

    import { cluster, group, visibleMedium, traverse, activeSortingMethod } from '../stores'

    //#endregion

    let isFullscreen: boolean
    // $: if (!visibleMedium) isFullscreen = false

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

            const request = fetch(`https://stash.hera.lan/${$cluster.id}/${$group.id}/media`, {
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

</script>

<Controller bind:this={controller}/>
<svelte:window on:keydown={keyDownEventListener}/>

<main>
    
    <section style={isFullscreen ? 'display: none' : ''}>
        <Navibationbar {controller}/>
    </section>

    <section style={`${$visibleMedium ? "" : "grid-column: 2 / span 2;"} ${isFullscreen ? 'display: none' : ''}`}>

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

                {#key  [ $group, $traverse, $activeSortingMethod ]}
                    <ImageGrid bind:mediaIndex bind:mediaCount/>
                {/key}

            {/if}
            
        </DropFile>

    </section>
    
    {#if $visibleMedium}
        <section style={isFullscreen ? 'grid-column: 1 / span 3' : ''}>

            <Toolbar bind:isFullscreen />
            
            <MediaViewer />

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