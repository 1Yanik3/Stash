<script lang="ts">
    import { mdiHarddisk, mdiInformationOutline, mdiMoveResize } from "@mdi/js"
    import { serverURL, cluster, visibleMedium, detailsVisible } from "../stores"
    import prettyBytes from "pretty-bytes"
    import Icon from "mdi-svelte"

    let isZoomedIn = false

    const request = (url: string): Promise<any> => new Promise((resolve, reject) => 
        fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/info`)
        .then(e => e.json())
        .then(resolve)
        .catch(reject)
    )

    // @ts-ignore
    const find = (array: [], filter: string, property?: string) => array.find(a => a[filter])[property || filter] || array[0]
</script>

{#if $visibleMedium}

<main class:detailsVisible={$detailsVisible}>
    {#if $detailsVisible}
        <div id="details">
            {#key $visibleMedium}
        
                {#await request(`${serverURL}/${$cluster.id}/media/${$visibleMedium.id}/info`)}
                    <span style="height: 24px"></span>
                {:then details} 
        
                    <span>
                        <Icon path={mdiMoveResize}/>
                        <span>{find(details.streams, "height")}x{find(details.streams, "width")}</span>
                    </span>
                    <span>
                        <Icon path={mdiInformationOutline}/>
                        <span>{find(details.streams, "width", "codec_name")}</span>
                    </span>
                    <span>
                        <Icon path={mdiHarddisk}/>
                        <span>{prettyBytes(+details.format.size)}</span>
                    </span>
        
                {:catch}
                    <span>Something went wrong</span>        
                {/await}
        
            {/key}
        </div>
    {/if}
    
    <div id="media">
        {#if $visibleMedium.type.startsWith("image")}
    
            <img
                src={`${serverURL}/${$cluster.id}/file/${$visibleMedium.id}`}
                alt={$visibleMedium.name}
                class:isZoomedIn
                on:click={e => isZoomedIn = !isZoomedIn}
            >
    
        {:else if $visibleMedium.type.startsWith("video")}
    
            <video
                src={`${serverURL}/${$cluster.id}/file/${$visibleMedium.id}`}
                alt={$visibleMedium.name}
                controls
                autoplay
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
        grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));

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
    }

    #media {
        display: flex;
        justify-content: center;
        align-items: center;

        background: #202020;

        overflow: scroll;
        max-width: 100%;


        img, video {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        img {
            cursor: zoom-in;
        }

        img.isZoomedIn {
            scale: 3;
            cursor: zoom-out;
        }
    }

</style>