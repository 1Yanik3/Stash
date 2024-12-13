<script lang="ts">
  import { run } from 'svelte/legacy';

  import "../styles/app.scss"

  import { browser } from "$app/environment"
  import { controller, settings } from "$lib/stores"

  import Controller from "./Controller.svelte"
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  run(() => {
    browser && (() => (document.body.className = $settings.theme))()
  });
</script>

<Controller bind:this={$controller} />

{@render children?.()}
