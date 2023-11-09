<script lang="ts">
    import {
        controller,
        detailsVisible,
        imageSuffixParameter,
        isFullscreen,
        settings,
        visibleMedium,
    } from "$lib/stores";
    import Icon from "./Icon.svelte";
    import { page } from "$app/stores";

    let imageElement: HTMLElement;
    let isZoomedIn = false;

    let video: HTMLVideoElement;

    function toIsoString(date: Date) {
        const pad = (num: number) => (num < 10 ? "0" : "") + num;

        return (
            date.getFullYear() +
            "-" +
            pad(date.getMonth() + 1) +
            "-" +
            pad(date.getDate()) +
            " " +
            pad(date.getHours()) +
            ":" +
            pad(date.getMinutes()) +
            ":" +
            pad(date.getSeconds())
        );
    }
</script>

{#if $visibleMedium}
    <main
        class:detailsVisible={$detailsVisible}
        class:fullscreen={$isFullscreen}
    >
        {#if $detailsVisible}
            <div id="details">
                {#key $visibleMedium}
                    <span
                        style="grid-column: span 2; cursor: pointer"
                        on:mousedown={async () => {
                            if (!$visibleMedium) return;

                            const newName = await $controller.prompt(
                                "Enter new name:",
                                $visibleMedium.name
                            );
                            if (newName) {
                                $visibleMedium.name = newName;
                                fetch(
                                    `/api/media/${$visibleMedium.id}/rename`,
                                    {
                                        method: "PUT",
                                        body: JSON.stringify({
                                            name: newName,
                                        }),
                                    }
                                );
                            }
                        }}
                    >
                        <Icon name="mdiFormTextbox" />
                        <span>{$visibleMedium.name}</span>
                    </span>

                    <span>
                        <Icon name="mdiMoveResize" />
                        <span
                            >{$visibleMedium.width}x{$visibleMedium.height}</span
                        >
                    </span>

                    <span>
                        <Icon name="mdiCalendar" />
                        <span>{toIsoString(new Date($visibleMedium.date))}</span
                        >
                    </span>
                {/key}
            </div>
        {/if}

        <div
            id="media"
            class:darkened={$isFullscreen}
            class:isZoomedIn
            on:click={(e) => {
                if ($settings.touchNavigationButtons) {
                    const { width } = (
                        imageElement || video
                    ).getBoundingClientRect();

                    if (e.offsetX < width / 2) $controller.goToPreviousMedia();
                    if (e.offsetX > width / 2) $controller.goToNextMedia();
                }
            }}
        >
            {#if $visibleMedium.type.startsWith("image")}
                <img
                    bind:this={imageElement}
                    src={`${$page.data.serverURL}/file/${$visibleMedium.id}${$imageSuffixParameter}`}
                    crossorigin="use-credentials"
                    alt={$visibleMedium.name}
                    class:isZoomedIn
                    on:click={(e) => {
                        if (!$settings.touchNavigationButtons)
                            isZoomedIn = !isZoomedIn;
                    }}
                />
            {:else if $visibleMedium.type.startsWith("video")}
                <video
                    src={`${$page.data.serverURL}/file/${$visibleMedium.id}`}
                    controls
                    autoplay
                    bind:this={video}
                    on:playing={() => {
                        if (video.duration <= 5) video.loop = true;
                    }}
                    crossorigin="use-credentials"
                    ><track kind="captions" /></video
                >
            {:else}
                <span>{$visibleMedium.name}</span>
            {/if}
        </div>
    </main>
{/if}

<style lang="scss">
    #details {
        padding: 0.7em;
        background: $color-dark-level-1;
        border-bottom: 1px solid $border-color-base;

        display: grid;
        gap: 0.5em;
        grid-template-columns: 1fr 1fr;
        // grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));

        & > span {
            display: flex;
            justify-content: center;
            align-items: center;
            span {
                margin-left: 0.5em;
            }
        }
    }

    main {
        // TODO: Make more elegant
        height: calc(100vh - 42px);
        border-left: 1px solid $border-color-base;
        display: grid;
        grid-template-rows: 1fr;
        &.detailsVisible {
            grid-template-rows: auto 1fr;
        }
        overflow: scroll;
    }

    #media {
        background: $color-dark-level-base;
        &.darkened {
            background: #000;
        }

        width: 100%;
        height: calc(100vh - 42px);

        display: flex;
        &.isZoomedIn {
            align-items: baseline;
        }

        img {
            cursor: zoom-in;
        }

        img,
        video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        img.isZoomedIn {
            cursor: zoom-out;
            max-width: unset;
            max-height: unset;
        }
    }

    main.fullscreen {
        & {
            height: 100%;
        }
        #media {
            height: 100%;

            img,
            video {
                height: 100vh;
                width: 100vw;
                max-height: 100vh;
                max-width: 100vw;
            }
        }
    }
</style>
