<script>
  import "../styles/app.scss"

  import { browser } from "$app/environment"
  import { controller, settings } from "$lib/stores"

  import Controller from "./Controller.svelte"

  $: browser && (() => (document.body.className = $settings.theme))()
</script>

<Controller bind:this={$controller} />

<slot />
