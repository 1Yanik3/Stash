<script lang="ts">
  import "../styles/app.scss"

  import { onMount } from "svelte"

  import { browser } from "$app/environment"
  import { controller, settings } from "$lib/stores.svelte"

  import Controller from "./Controller.svelte"

  let { children } = $props()

  onMount(() => {
    browser && (() => (document.body.className = $settings.theme))()
  })
</script>

<Controller bind:this={$controller} />

{@render children?.()}
