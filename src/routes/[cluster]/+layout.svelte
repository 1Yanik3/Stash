<script lang="ts">
    import { isFullscreen, isStoryFullScreen } from '$lib/stores'

    import ClusterSection from './ClusterSection.svelte';

</script>

<main>
    
    <section style={$isFullscreen || $isStoryFullScreen ? 'display: none' : ''}>
        <ClusterSection/>
    </section>

    <slot/>

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: auto 1fr;

        height: 100vh;
        width: 100%;

        section {
            display: flex;            
        }
    }
</style>