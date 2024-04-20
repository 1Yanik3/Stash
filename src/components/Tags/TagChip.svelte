<script lang="ts">
  import { page } from "$app/stores"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { createEventDispatcher } from "svelte"
  import type { PageData } from "../../routes/[cluster]/$types"
  import Icon from "$components/Icon.svelte"
  import { tooltip } from "$reusables/tooltip"
  import getIconForTagName from "$lib/getIconForTagName"

  export let tag: string
  const icon = getIconForTagName(tag)

  const dispatch = createEventDispatcher()
</script>

{#key tag}
  <span
    on:click|preventDefault={() => dispatch("click")}
    on:contextmenu|preventDefault={() => dispatch("contextmenu")}
    use:tooltip={{ title: tag, position: "bottom", enabled: !!icon }}
  >
    {#if icon}
      <Icon name={$icon} />
    {:else}
      {tag}
    {/if}
  </span>
{/key}

<style lang="scss">
  span {
    cursor: pointer;

    display: flex;
    align-items: center;

    margin: 0.15em;
    margin-right: 0.25em;
    padding: 0.3em 0.5em;

    background: $color-dark-level-2;
    border: 1px solid $color-dark-level-1;
    border-radius: 3px;
  }
</style>
