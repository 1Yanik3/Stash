<script lang="ts">
    import { mdiFileUpload } from '@mdi/js';
    import Icon from "../../../components/Icon.svelte";

    import DropFile from '../../../components/DropFile.svelte';
    import ImageGrid from '../../../components/ImageGrid.svelte';
    import MediaViewer from '../../../components/MediaViewer.svelte';
    import Toolbar from '../../../components/Toolbar.svelte';
    
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { actionBar, actionBars, isFullscreen, visibleMedium } from '$lib/stores';
    import NavigationSection from './NavigationSection.svelte';

    //#region Uploader

    let fileOver = false
    let uploadProgress: null | { done: number, from: number } = null
    let uploadPercentage = 0

    const onDrop = async (files: File[]) => {

        for (const i in files) {

            uploadProgress = {
                done: +i,
                from: files.length
            }
            uploadPercentage = 0

            const data = new FormData()
            data.append('file', files[i])

            await new Promise(resolve => {
                var ajax = new XMLHttpRequest();
                ajax.upload.addEventListener("progress", e => {
                    uploadPercentage = Math.round((e.loaded / e.total) * 100)
                    console.log({uploadPercentage})
                    // console.log("Uploaded " + e.loaded + " bytes of " + e.total + " (" + (e.loaded / e.total) * 100 + ")")
                }, false);
                ajax.addEventListener("load", resolve, false);
                ajax.addEventListener("error", () => console.log("Error"), false);
                ajax.addEventListener("abort", () => console.log("Aborted"), false);
                ajax.open("POST", `/api/group/${$page.params.group}/media`);
                ajax.send(data);
            })

        }
    
        fileOver = false
        uploadProgress = null

        invalidate("media-and-tags")
    }

    //#endregion  

</script>

<main>

    <section id="navigationSection">
        <NavigationSection/>
    </section>

    <section id="imageGallerySection" >

        <DropFile
            onDrop={onDrop}
            onEnter={() => {
                fileOver = true
                visibleMedium.set(null)
            }}
            onLeave={() => fileOver = false}
        >

            {#if fileOver || uploadProgress != null}
                
                <div class="dropZone">
                    <Icon path={mdiFileUpload} size={3}/>
                    {#if uploadProgress}
                        <span>uploading {uploadProgress?.done} out of {uploadProgress?.from} ({uploadPercentage}%)</span>
                    {:else}
                        <span>Drop to upload</span>
                    {/if}
                </div>

            {:else}

                <ImageGrid />

            {/if}
            
        </DropFile>

    </section>

    {#if $actionBar}
        <section class="actionBar">
            <svelte:component this={actionBars[$actionBar]} />
        </section>
    {:else}
        {#if $visibleMedium}
            <section id="mediaPlayerSection" style={$isFullscreen ? 'grid-column: 1 / span 3' : ''}>
                <Toolbar />
                <MediaViewer />
            </section>
        {/if}
    {/if}

</main>

<style lang="scss">
    main {
        display: flex;

        height: 100vh;

        #navigationSection {
            width: 234px;
        }

        #imageGallerySection {
            padding: 1em;
            min-width: 350px;
            flex-grow: 1;

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

            background: hsl(0, 0%, 19%);
            overflow-y: auto;
        }

        #mediaPlayerSection {
            max-width: 960px;
            flex-grow: 2;
        }

        .actionBar {
            width: 64px;
        }

        // section {
        //     box-shadow: inset -0.7px 0 0 rgba($color: #fff, $alpha: 0.15);

            

        //     // Image viewer
        //     &:nth-child(2) {
        //         max-height: 100vh;
        //     }

        // }
    }
</style>