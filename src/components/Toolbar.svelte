<script lang="ts">

    import { serverURL, cluster, visibleMedium } from '../stores'
    import { browser } from '$app/env'

    import Icon from 'mdi-svelte'
    import { mdiClose, mdiFileReplaceOutline, mdiFullscreen, mdiInformationOutline, mdiOpenInNew, mdiResize, mdiTrashCanOutline } from '@mdi/js'
    import selectFiles from 'select-files'

    import Popup from '../reusables/Popup.svelte'

    export let isFullscreen: boolean 

    const handleKeyDown = (e: KeyboardEvent) => {
        const value: string = (e.target as any).value
        if (e.key == "Enter" && value) {

            fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/tag`, {
                method: "PUT",
                body: JSON.stringify({
                    Name: value
                })
            })
            .then(() => {
                const tmp = $visibleMedium
                tmp?.tags.push(value)
                visibleMedium.set(tmp)

                // TODO: increase count of tags in sidebar
            })
            .catch(console.error)

        }
    }
    
    const removeTagFromMedia = (tag: string) => {
        
        fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/tag/${tag}`, {
            method: "DELETE"
        })
        .then(() => {

            if (!$visibleMedium) return
            const tmp = $visibleMedium
            tmp.tags = tmp.tags.filter(t => t != tag)
            visibleMedium.set(tmp)

        })
    }

    const replaceMedia = (newMedia: Blob) => {
        const data = new FormData()
        data.append('file', new File([newMedia], $visibleMedium?.name || "newImage.jpg", {
            type: newMedia.type
        }))

        fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/replace`, {
            method: "PUT",
            body: data
        })
        .then(async () => {

            // visibleMedium.update()
            // // This seems to ignore the history pushes
            // window.location.reload()

        })
    }

    let upscalePopup_open = false
    let upscalePopup_url_old = ""
    let upscalePopup_url_new = ""
    let upscalePopup_keepNewFunction = () => {}

    // TODO: Make nicer
    const startUpscale = () => {
        if (!browser) return

        upscalePopup_open = true
        upscalePopup_url_old = `${serverURL}/${$cluster.id}/file/${$visibleMedium?.id}`

        fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/upscale`, {
            method: "POST"
        })
        .then(res => res.json())
        .then(response => {

            const { output_url } = response
            upscalePopup_url_new = output_url

            upscalePopup_keepNewFunction = async () => {

                // get image
                const response = await fetch(upscalePopup_url_new)
                const image = await response.blob()
                replaceMedia(image)

            }

        })
    }

    const replaceWithLocalMedia = () => {
        if (!browser) return

        selectFiles({ }).then(files => {
            if (files && files[0])
                replaceMedia(files[0])
        });

    }
    

</script>

{#if upscalePopup_open}
    <Popup>
    <div class="popupContent">
    
        <div>
    
            <h1>Original</h1>
    
            <img src={upscalePopup_url_old} alt=""/>
    
            <button on:click={() => upscalePopup_open = false}>
                Keep Old
            </button>
    
        </div>
    
        <div>
    
            <h1>New</h1>
    
            <img src={upscalePopup_url_new} alt=""/>
        
            <button on:click={upscalePopup_keepNewFunction}>
                Keep New
            </button>
    
        </div>
    
    </div>
    </Popup>
{/if}

<main style="min-width: calc(100% - 4em)">
    <section>

        <div on:click={() => visibleMedium.set(null)}>
            <Icon path={mdiClose}/>
        </div>

        <div on:click={() => isFullscreen = !isFullscreen}>
            <Icon path={mdiFullscreen}/>
        </div>

        <div>
            <Icon path={mdiInformationOutline} size={0.8}/>
        </div>

    </section>

    <!-- <span>{visibleMedium?.name}</span> -->
    <div>
        {#each $visibleMedium?.tags || [] as tag}
            <span
                class="tag"
                on:contextmenu|preventDefault={() => {
                    removeTagFromMedia(tag)
                }}
            >{tag}</span>
        {/each}
        <input type="text" on:keydown={handleKeyDown}>
    </div>

    <section>

        <!-- <div>
            <Icon path={mdiTrashCanOutline} size={0.8}/>
        </div> -->

        <div on:click={replaceWithLocalMedia}>
            <Icon path={mdiFileReplaceOutline} size={0.8}/>
        </div>

        <div on:click={startUpscale}>
            <Icon path={mdiResize} size={0.8}/>
        </div>

        <div on:click={() => window.open(`${serverURL}/${$cluster.id}/file/${$visibleMedium?.id}`, "_blank")}>
            <Icon path={mdiOpenInNew} size={0.8}/>
        </div>

    </section>

</main>

<style lang="scss">
    main {
        box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        padding: 0.35em;

        display: flex;
        justify-content: space-between;
        align-items: center;

        & > div {
            display: flex;
            .tag {
                background: rgb(104, 104, 1);
                padding: 0.15em 0.4em;
                margin: 0.15em;
                box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
                border-radius: 3px;

                margin-right: 0.25em;

                cursor: pointer;
            }
            input {
                margin-left: 0.25em;
                width: 2em;

                transition: width 200ms;

                &:focus {
                    width: 7em;
                }
            }
        }

        section {

            display: flex;
            align-items: center;
            
            div {
                height: 30px;
                width: 30px;

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
            }

        }
    }

    .popupContent {
        display: grid;
        gap: 2em;
        grid-template-columns: 1fr 1fr;

        img {
            width: 100%;
            height: 500px;
            object-fit: contain;
        }
    }
</style>