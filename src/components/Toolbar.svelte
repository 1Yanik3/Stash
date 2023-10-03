<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { controller, detailsVisible, imageSuffixParameter, isFullscreen, settings, visibleMedium } from '$lib/stores';
    import { mdiClose, mdiFileReplace, mdiFileReplaceOutline, mdiFullscreen, mdiInformationOutline, mdiOpenInNew } from '@mdi/js';
    import selectFiles from 'select-files';
    import Shortcut from '../reusables/Shortcut.svelte';
    import type { PageData } from '../routes/[cluster]/$types';
    import Icon from './Icon.svelte';
    // import UpscalePopup from './Popups/UpscalePopup.svelte';
    $: pageData = $page.data as PageData

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
                tmp?.tags.push(value)
                visibleMedium.set(tmp)

                // TODO: increase count of tags in sidebar
            })
            .catch(console.error)

        }
    }
    
    const removeTagFromMedia = (tag: string) => {
        
        fetch(`/api/media/${$visibleMedium?.id}/tag/${tag}`, {
            method: "DELETE"
        })
        .then(() => {

            if (!$visibleMedium) return
            const tmp = $visibleMedium
            tmp.tags = tmp.tags.filter(t => t != tag)
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

    const replaceWithLocalMedia = () => {
        if (!browser) return

        selectFiles({ }).then(files => {
            if (files && files[0])
                replaceMedia(files[0])
        });

    }

    const replaceThumbnail = () => {
        if (!browser) return

        $controller.setPopup("Replace Video Thumbnail")
    }

</script>

<!-- Toggle Fullscreen -->
<Shortcut key="f" action={() => {
    isFullscreen.set(!$isFullscreen)
}} />

<!-- {#key $visibleMedium}
    <UpscalePopup bind:isVisible={upscalePopup_open} {replaceMedia}/>
{/key} -->

<main class:fullscreen={$isFullscreen} class:windowControlsSpacer={$settings.windowControlsSpacer}>
    <section>

        <button on:click={() => visibleMedium.set(null)}>
            <Icon name="mdiClose" size={0.8}/>
        </button>

        <button on:click={() => {
            isFullscreen.set(!$isFullscreen)
            if ($isFullscreen) {
                document.documentElement.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }}>
            <Icon name="mdiFullscreen" size={0.8}/>
        </button>

        <button on:click={() => detailsVisible.set(!$detailsVisible)}>
            <Icon name="mdiInformationOutline" size={0.8}/>
        </button>

    </section>

    <div>
        {#each $visibleMedium?.tags || [] as tag}
            <span
                class="tag"
                on:contextmenu|preventDefault={() => removeTagFromMedia(tag)}
            >{tag}</span>
        {/each}
        <input type="text" on:keydown|stopPropagation={handleKeyDown}>
    </div>

    <section>

        <button on:click={replaceWithLocalMedia} title="Replace file content">
            <Icon name="mdiFileReplace" size={0.8}/>
        </button>

        <!-- TODO: Timestamp picker (in frontend, using video element) -->
        {#if $visibleMedium?.type.startsWith("video")}
            <button on:click={replaceThumbnail} title="Replace file thumbnail">
                <Icon name="mdiFileReplaceOutline" size={0.8}/>
            </button>
        {/if}

        <!-- <button on:click={() => upscalePopup_open = true}>
            <Icon name="mdiResize" size={0.8}/>
        </button> -->

        <button on:click={() => window.open(`${$page.data.serverURL}/file/${$visibleMedium?.id}`, "_blank")}>
            <Icon name="mdiOpenInNew" size={0.8}/>
        </button>

    </section>

</main>

<style lang="scss">
    main {
        border-left: 1px solid hsl(0, 0%, 22%);
        border-bottom: 1px solid hsl(0, 0%, 22%);
        padding: 0.35em;
        min-width: calc(100% - 4em);

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
            &.windowControlsSpacer {
                left: 4.625em;
            }
            top: 0;

            div, section:last-child, button:not(:nth-child(2)) {
                display: none;
            }
        }
    }
</style>