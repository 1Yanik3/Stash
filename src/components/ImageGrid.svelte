<script lang="ts">

    import { tags, media, cluster, group } from "../stores"

    import ImageGridCollection from './ImageGrid_Collection.svelte'
    import ImageGridPage from './ImageGrid_Page.svelte'
    import { fade } from "svelte/transition"

    const pageSize = 50

</script>

{#if $cluster.type == "collection" && $group.id == -3}

    <ImageGridCollection/>

{:else}

    {#key [ $media, $tags ]}
    <div transition:fade={{ duration: 120 }}>

        {#each (new Array(Math.ceil($media.length / pageSize))) as _, i}
            <ImageGridPage media={$media.slice(i * pageSize, (i + 1) * pageSize)} {i} />
        {/each}
        
    </div>
    {/key}

{/if}

<style lang="scss">
    
    div {
        display: grid;
        gap: 14px;
    }

</style>