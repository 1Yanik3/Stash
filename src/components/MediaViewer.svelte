<script lang="ts">
    import { mdiCalendar, mdiFormTextbox, mdiMoveResize } from "@mdi/js"
    import { serverURL, visibleMedium, detailsVisible, settings, controller, imageSuffixParameter, isFullscreen } from "$lib/stores"
    import Icon from "mdi-svelte"
    import { invalidateAll } from "$app/navigation";

    let mediaElement: HTMLElement
    let imageElement: HTMLElement
    let isZoomedIn = false
    $: if (mediaElement && (imageElement || video) &&
            (isZoomedIn || !isZoomedIn)
        ) {
        if (isZoomedIn) {
            mediaElement.style.marginLeft = `${(imageElement || video).getBoundingClientRect().width / 2}px`
            mediaElement.style.marginTop = `${(imageElement || video).getBoundingClientRect().height / 2}px`

            mediaElement.parentElement?.scrollTo(
                (imageElement || video).getBoundingClientRect().width,
                (imageElement || video).getBoundingClientRect().height
            )
        } else {
            mediaElement.style.marginLeft = `0`
            mediaElement.style.marginTop = `0`
        }
    }

    let video: HTMLVideoElement

    export let guest = false

    function toIsoString(date: Date) {
        const pad = (num: number) => (num < 10 ? '0' : '') + num;

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            ' ' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds())
    }
</script>

{#if $visibleMedium}

<main class:detailsVisible={$detailsVisible} class:fullscreen={$isFullscreen}>
    {#if $detailsVisible}
        <div id="details">
            {#key $visibleMedium}

                <span
                style="grid-column: span 2; cursor: pointer"
                on:mousedown={async () => {
                    if (!$visibleMedium)
                        return

                    const newName = await $controller.prompt("Enter new name:", $visibleMedium.name)
                    if (newName) {
                        $visibleMedium.name = newName
                        fetch(`/api/media/${$visibleMedium.id}/rename`, {
                            method: "PUT",
                            body: JSON.stringify({
                                name: newName
                            })
                        })
                        invalidateAll();
                    }
                }}
                >
                    <Icon path={mdiFormTextbox}/>
                    <span>{$visibleMedium.name}</span>
                </span>

                <span>
                    <Icon path={mdiMoveResize}/>
                    <span>{$visibleMedium.width}x{$visibleMedium.height}</span>
                </span>

                <span>
                    <Icon path={mdiCalendar}/>
                    <span>{toIsoString(new Date($visibleMedium.date))}</span>
                </span>
        
            {/key}
        </div>
    {/if}
    
    <div id="media" bind:this={mediaElement} class:darkened={$isFullscreen}
        on:click={e => {
            if ($settings.mobileNavigationButtons) {
                const { width } = (imageElement || video).getBoundingClientRect()
                
                if (e.offsetX < width/2)
                    $controller.goToPreviousMedia()
                if (e.offsetX > width/2)
                    $controller.goToNextMedia()
            }
        }}
    >
        {#if $visibleMedium.type.startsWith("image")}
    
            <img
                bind:this={imageElement}
                src={`${$serverURL}/${guest ? 'guest-file' : 'file'}/${$visibleMedium.id}${$imageSuffixParameter}`}
                crossorigin="use-credentials"
                alt={$visibleMedium.name}
                class:isZoomedIn
                on:click={e => {
                    if (!$settings.mobileNavigationButtons)
                        isZoomedIn = !isZoomedIn
                }}
            >
    
        {:else if $visibleMedium.type.startsWith("video")}
    
            <video
                src={`${$serverURL}/${guest ? 'guest-file' : 'file'}/${$visibleMedium.id}`}
                controls
                autoplay
                bind:this={video}
                on:playing={() => {
                    if (video.duration <= 3)
                        video.loop = true
                }}
                crossorigin="use-credentials"
            ><track kind="captions"/></video>
    
        {:else}
            <span>{$visibleMedium.name}</span>
        {/if}
    </div>
</main>

{/if}

<style lang="scss">
    #details {
        padding: 0.7em;
        background: #131313;
        box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);

        display: grid;
        gap: 0.5em;
        grid-template-columns: 1fr 1fr;
        // grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));

        & > span {
            display: flex;
            justify-content: center;
            align-items: center;
            span { margin-left: 0.5em }
        }
    }

    main {
        // TODO: Make more elegant
        height: calc(100vh - 40.5px);
        display: grid;
        grid-template-rows: 1fr;
        &.detailsVisible {
            grid-template-rows: auto 1fr;
        }
        overflow: scroll;
    }

    #media {
        position: relative;

        background: #202020;
        &.darkened {
            background: #000;
        }

        width: 100%;
        height: calc(100vh - 40.5px);

        display: flex;

            
        img {
            cursor: zoom-in;
        }
        
        img, video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;

            position: absolute;
            margin: auto;

            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        img.isZoomedIn {
            cursor: zoom-out;
            max-width: 200%;
            max-height: 200%;
        }
    }

    main.fullscreen {
        &, #media {
            height: 100%;
        }
    }

</style>