<script>
    import "../app.scss";

    import { controller, settings } from "$lib/stores";
    import Controller from "./Controller.svelte";
</script>

<Controller bind:this={$controller} />

<div class:eink={$settings.eink}>
    <slot />
</div>

<style>
    .eink {
        background: #fff;
    }
</style>
