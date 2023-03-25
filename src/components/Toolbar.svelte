<script lang="ts">
    import { serverURL, cluster, visibleMedium, detailsVisible, isFullscreen, imageSuffixParameter } from '$lib/stores'
    import { browser } from '$app/environment'

    import Icon from 'mdi-svelte'
    import { mdiClose, mdiFileReplaceOutline, mdiFullscreen, mdiInformationOutline, mdiOpenInNew, mdiResize } from '@mdi/js'
    import selectFiles from 'select-files'

    import Shortcut from '../reusables/Shortcut.svelte';
    import UpscalePopup from './Popups/UpscalePopup.svelte';
    import type { Tags } from '@prisma/client';

    const handleKeyDown = (e: KeyboardEvent) => {
        const value: string = (e.target as any).value
        if (e.key == "Enter" && value) {

            fetch(`/api/media/${$visibleMedium?.id}/tag`, {
                method: "PUT",
                body: JSON.stringify({
                    name: value
                })
            })
            .then(() => {
                const tmp = $visibleMedium
                tmp?.tags.push({
                    id: -1,
                    name: value
                })
                visibleMedium.set(tmp)

                // TODO: increase count of tags in sidebar
            })
            .catch(console.error)

        }
    }
    
    const removeTagFromMedia = (tag: Tags) => {
        
        fetch(`/api/media/${$visibleMedium?.id}/tag/${tag.name}`, {
            method: "DELETE"
        })
        .then(() => {

            if (!$visibleMedium) return
            const tmp = $visibleMedium
            tmp.tags = tmp.tags.filter(t => t.name != tag.name)
            visibleMedium.set(tmp)

        })
    }


    (window as any).test = () => imageSuffixParameter.set(`?${Math.random().toString(16).substring(2, 8)}`);
    const replaceMedia = (newMedia: Blob) => {
        const data = new FormData()
        data.append('file', new File([newMedia], $visibleMedium?.name || "newImage.jpg", {
            type: newMedia.type
        }))

        fetch(`/api/media/${$visibleMedium?.id}/replace`, {
            method: "PUT",
            body: data
        })
        .then(async () => {

            // reload image in viewer
            imageSuffixParameter.set(`?${Math.random().toString(16).substring(2, 8)}`);

            // visibleMedium.update()
            // // This seems to ignore the history pushes
            // window.location.reload()

        })
    }

    let upscalePopup_open = false

    const replaceWithLocalMedia = () => {
        if (!browser) return

        selectFiles({ }).then(files => {
            if (files && files[0])
                replaceMedia(files[0])
        });

    }

    $: console.log($visibleMedium)
    
</script>

<!-- Toggle Fullscreen -->
<Shortcut key="f" action={() => {
    isFullscreen.set(!$isFullscreen)
}} />

{#key $visibleMedium}
    <UpscalePopup bind:isVisible={upscalePopup_open} {replaceMedia}/>
{/key}

<main style="min-width: calc(100% - 4em)" class:fullscreen={$isFullscreen}>
    <section>

        <button on:click={() => visibleMedium.set(null)}>
            <Icon path={mdiClose} size={0.8}/>
        </button>

        <button on:click={() => {
            isFullscreen.set(!$isFullscreen)
            if ($isFullscreen) {
                document.documentElement.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }}>
            <Icon path={mdiFullscreen} size={0.8}/>
        </button>

        <button on:click={() => detailsVisible.set(!$detailsVisible)}>
            <Icon path={mdiInformationOutline} size={0.8}/>
        </button>

    </section>

    <div>
        {#each $visibleMedium?.tags || [] as tag}
            <span
                class="tag"
                on:contextmenu|preventDefault={() => {
                    removeTagFromMedia(tag)
                }}
            >{tag.name}</span>
        {/each}
        {#if $cluster.type != "collection"}
            <input type="text" on:keydown|stopPropagation={handleKeyDown}>
        {/if}
    </div>

    <section>

        <button on:click={replaceWithLocalMedia}>
            <Icon path={mdiFileReplaceOutline} size={0.8}/>
        </button>

        <button on:click={() => upscalePopup_open = true}>
            <Icon path={mdiResize} size={0.8}/>
        </button>

        <button on:click={() => window.open(`${serverURL}/file/${$visibleMedium?.id}`, "_blank")}>
            <Icon path={mdiOpenInNew} size={0.8}/>
        </button>

    </section>

</main>

<style lang="scss">
    main {
        box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        padding: 0.35em;

        display: flex;
        justify-content: space-between;
        align-items: center;

        div {
            display: flex;
            .tag {
                background: hsl(0, 0%, 25%);
                padding: 0.3em 0.5em;
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

        &.fullscreen {
            box-shadow: none;
            position: absolute;
            z-index: 5;
            left: 0;
            top: 0;

            div, section:last-child, button:not(:nth-child(2)) {
                display: none;
            }
        }
    }
</style>