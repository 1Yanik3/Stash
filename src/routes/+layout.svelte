<script>
    import "../styles/app.scss";

    import { controller } from "$lib/stores";
    import Controller from "./Controller.svelte";
</script>

<Controller bind:this={$controller} />

<slot />
