<script lang="ts">
    import { controller, isFullscreen, isStoryFullScreen } from '$lib/stores'
    
    import Controller from '../../Controller.svelte'

    import ClusterSection from './ClusterSection.svelte';

</script>

<Controller bind:this={$controller}/>

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