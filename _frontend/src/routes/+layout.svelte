<script>
  import "../styles/app.scss"

  import { controller, settings } from "$lib/stores"
  import Controller from "./Controller.svelte"
  import { browser } from "$app/environment"

  $: browser && (() => (document.body.className = $settings.theme))()
</script>

<Controller bind:this={$controller} />

<slot />
