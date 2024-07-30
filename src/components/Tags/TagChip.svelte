<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Icon from "$components/Icon.svelte"
  import { tooltip } from "$reusables/tooltip"
  import getIconForTagName from "$lib/getIconForTagName"

  export let tag: string
  export let forceShowName = false
  export let compact = false
  const icon = getIconForTagName(tag)

  const dispatch = createEventDispatcher()
</script>

{#key tag}
  <span
    class:compact
    on:click|preventDefault={() => dispatch("click")}
    on:contextmenu|preventDefault={() => dispatch("contextmenu")}
    use:tooltip={{
      title: tag,
      position: "bottom",
      enabled: $icon != "mdiFolderOutline" && $icon != "mdiFolderHidden"
    }}
  >
    {#if $icon != "mdiFolderOutline" && $icon != "mdiFolderHidden" && !forceShowName}
      <Icon name={$icon} size={compact ? 0.9 : 1} />
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

    &.compact {
      cursor: default;
      padding: 0.25em 0.4em;
    }
  }
</style>
