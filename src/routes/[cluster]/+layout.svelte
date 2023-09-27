<script lang="ts">
    import { isFullscreen, isStoryFullScreen, settings } from '$lib/stores'
    import MobileBottomBar from '../../components/MobileBottomBar.svelte';

    import ClusterSection from './ClusterSection.svelte';

</script>

<main class:mobile={$settings.mobileLayout}>
    
    {#if !$settings.mobileLayout}
    <section style={$isFullscreen || $isStoryFullScreen ? 'display: none' : ''}>
        <ClusterSection/>
    </section>
    {/if}

    <slot/>

    {#if $settings.mobileLayout}
    <MobileBottomBar/>
    {/if}

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

        &.mobile {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
            height: 100vh;
        }
    }
</style>