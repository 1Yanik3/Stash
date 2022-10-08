<script lang="ts">
    import { mdiFileUpload } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import Controller from '../Controller.svelte'
    let controller: Controller

    import ImageGrid from '../components/ImageGrid.svelte'
    import Toolbar from '../components/Toolbar.svelte'
    import DropFile from '../components/DropFile.svelte'
    import MediaViewer from '../components/MediaViewer.svelte'
    import Navigationbar from '../components/Navigationbar/index.svelte'
    
    import { serverURL, cluster, group, visibleMedium, media, isFullscreen } from '../stores'

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

            const request = fetch(`${serverURL}/${$cluster.id}/${$group.id}/media`, {
                method: 'POST',
                body: data
            })

            console.log(request)

            await request

            console.log(request)

        }
    
        fileOver = false
        uploadProgress = null

        controller.updateMedia()
    }

    //#endregion

    //#region Shortcuts

    const keyDownEventListener = (e: KeyboardEvent) => {
        if (!$visibleMedium) return

        const mediaIndex = $media.indexOf($visibleMedium)

        if (visibleMedium && e.key == ",")
            if (mediaIndex > 0)
                visibleMedium.set(
                    $media[mediaIndex - 1]
                )
        if (visibleMedium && e.key == ".")
            if (mediaIndex < $media.length - 1)
                visibleMedium.set(
                    $media[mediaIndex + 1]
                )
                    
    }

    //#endregion   

</script>

<Controller bind:this={controller}/>
<svelte:window on:keydown={keyDownEventListener}/>

<main>
    
    <section style={$isFullscreen ? 'display: none' : ''}>
        <Navigationbar {controller}/>
    </section>

    <section
        id="imageGallerySection"
        style={`${$visibleMedium ? "" : "grid-column: 2 / span 2;"} ${$isFullscreen ? 'display: none' : ''}`}
    >

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

                <ImageGrid />

            {/if}
            
        </DropFile>

    </section>
    
    {#if $visibleMedium}
        <section style={$isFullscreen ? 'grid-column: 1 / span 3' : ''}>

            <Toolbar />
            
            <MediaViewer />

        </section>
    {/if}

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 300px minmax(200px, 600px) minmax(350px, 1fr);

        height: 100%;
        width: 100%;

        section {
            box-shadow: inset -0.7px 0 0 rgba($color: #fff, $alpha: 0.15);

            &:nth-child(1),  &:nth-child(3) {
                background: hsl(0, 0%, 13%);
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
                max-height: 100vh;
            }

        }
    }
</style>