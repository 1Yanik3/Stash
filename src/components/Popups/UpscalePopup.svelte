<script lang="ts">
    import Popup from "../../reusables/Popup.svelte"

    import { serverURL, cluster, visibleMedium } from '../../stores'
    import SidebarButton from "../SidebarButton.svelte"
    import { mdiBicyclePennyFarthing, mdiBrushVariant } from "@mdi/js"

    export let isVisible = true
    export let replaceMedia: (newMedia: Blob) => void

    let upscalePopup_url_new = ""
    let upscalePopup_blob_new: Blob
    let isLoading = false

    let upscalePopup_keepNewFunction = () => {}

    const startUpscale = async (type: "normal" | "anime") => {
        isLoading = true

        async function blobToBase64(blob: Blob):Promise<string> {
            return new Promise((resolve, _) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
            })
        }

        const blob = await fetch(`${serverURL}/${$cluster.id}/file/${$visibleMedium?.id}`).then(res => res.blob())
        const image = (await blobToBase64(blob)).split(",", 2)[1]

        fetch(`https://upscale.hera.lan/`, {
            method: "POST",
            body: JSON.stringify({
                extension: $visibleMedium?.type.split("/")[1],
                type,
                image
            }),
            headers: { "content-type": "application/json" }
        })
        .then(async res => {
            upscalePopup_blob_new = await res.blob()
            const image = await blobToBase64(upscalePopup_blob_new)
            upscalePopup_url_new = image

            upscalePopup_keepNewFunction = async () => {
                replaceMedia(upscalePopup_blob_new)
                isVisible = false
            }

            isLoading = false
        })
    }
</script>

<Popup title="Shortcuts" bind:visible={isVisible}>
    <main>

        <section>
    
            <h1>Original</h1>
    
            <img src={`${serverURL}/${$cluster.id}/file/${$visibleMedium?.id}`} alt=""/>

            <button on:click={() => isVisible = false}>
                Keep Old
            </button>
    
        </section>
    
        <section>
    
            <h1>New</h1>
    
            {#if isLoading}

                <div id="action">
                    <span>Loading...</span>
                </div>

            {:else if upscalePopup_url_new}

                <img src={upscalePopup_url_new} alt=""/>

            {:else}

                <div id="action">
                    <div>
                        <SidebarButton card on:click={() => startUpscale("normal")} icon={mdiBicyclePennyFarthing}>
                            Normal Upscale
                        </SidebarButton>
                        <SidebarButton card on:click={() => startUpscale("anime")} icon={mdiBrushVariant}>
                            Anime Upscale
                        </SidebarButton>
                    </div>
                </div>

            {/if}
        
            <button on:click={upscalePopup_keepNewFunction}>
                Keep New
            </button>
    
        </section>

    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5em;
        padding: 0.5em;

        h1 { margin: 0 0 0.5em 0 }

        section {
            width: 100%;

            img, #action {
                width: 100%;
                height: 450px;
                object-fit: contain;

            }
            #action {
                display: flex;
                justify-content: center;
                align-items: center;

                div {
                    display: grid;
                }
            }
        }
    }
</style>