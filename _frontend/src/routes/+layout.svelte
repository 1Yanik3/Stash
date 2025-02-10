<script lang="ts">
  import "../styles/app.scss"

  import { browser } from "$app/environment"
  import { controller, settings } from "$lib/stores.svelte"

  import Controller from "./Controller.svelte"
  import { onMount } from "svelte"

  let { children } = $props()

  onMount(() => {
    browser && (() => (document.body.className = $settings.theme))()
  })
</script>

<Controller bind:this={$controller} />

{@render children?.()}
