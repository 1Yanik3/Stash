<script lang="ts">
  import { page } from "$app/stores"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { createEventDispatcher } from "svelte"
  import type { PageData } from "../../routes/[cluster]/$types"
  import Icon from "$components/Icon.svelte"
  import { tooltip } from "$reusables/tooltip"

  export let tag: string

  $: icon = ($page.data as PageData).tagIcons.find(
    t =>
      t.tag == tag.toLowerCase() ||
      tag.toLowerCase().substring(tag.toLowerCase().lastIndexOf("/") + 1) ==
        t.tag
  )?.icon as keyof typeof possibleIcons

  const dispatch = createEventDispatcher()
</script>

{#key tag}
  <span
    on:click|preventDefault={() => dispatch("click")}
    on:contextmenu|preventDefault={() => dispatch("contextmenu")}
    use:tooltip={{ title: tag, position: "bottom", enabled: !!icon }}
  >
    {#if icon}
      <Icon name={icon} />
    {:else}
      {tag}
    {/if}
  </span>
{/key}

<style lang="scss">
  span {
    background: $color-dark-level-2;
    padding: 0.3em 0.5em;
    margin: 0.15em;
    border: 1px solid $color-dark-level-1;
    border-radius: 3px;

    margin-right: 0.25em;

    cursor: pointer;

    display: flex;
    align-items: center;
  }
</style>
