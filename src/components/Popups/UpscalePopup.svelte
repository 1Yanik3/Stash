<script lang="ts">
    import Popup from "../../reusables/Popup.svelte"

    import { visibleMedium } from '$lib/stores'
    import SidebarButton from "../../routes/[cluster]/[group]/SidebarButton.svelte"
    import { mdiBicyclePennyFarthing, mdiBrushVariant, mdiCancel, mdiFloppyVariant } from "@mdi/js"
    import ImageCompare from "../../reusables/ImageCompare.svelte"
    import { Stretch } from 'svelte-loading-spinners'

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

        const blob = await fetch(`/file/${$visibleMedium?.id}`).then(res => res.blob())
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

<Popup title="Shortcuts">
    <main>
        
        {#if isLoading}

            <div class="centered">
                <Stretch color="#ccc" />
            </div>

        {:else if upscalePopup_url_new}

            <section>

                <div class="side">
                    <span>Before</span>

                    <SidebarButton card on:click={() => isVisible = false} icon={mdiCancel}>
                        Keep Old
                    </SidebarButton>
                </div>


                <ImageCompare
                    before={`/file/${$visibleMedium?.id}`}
                    after={upscalePopup_url_new}
                    contain={true}
                />

                <div class="side">
                    <span style="text-align: right">After</span>

                    <SidebarButton card on:click={upscalePopup_keepNewFunction} icon={mdiFloppyVariant}>
                        Keep New
                    </SidebarButton>
                </div>

            </section>


        {:else}

            <div class="centered">
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

    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        padding: 0.5em;

        height: 80vh;
        width: 80vw;

        .centered {
            display: grid;
            gap: 1em;
            justify-content: center;
            align-items: center;
        }

        section {
            display: grid;
            grid-template-columns: 8.5em 1fr 8.5em;

            .side {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
            }
        }

    }
</style>