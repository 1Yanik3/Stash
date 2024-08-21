<script lang="ts">
  import Icon from "$components/Icon.svelte"
  import getIconForTagName from "$lib/getIconForTagName"

  let {
    tag,
    forceShowName = false,
    compact = false,
    onclick = () => {},
    oncontextmenu = () => {}
  }: {
    tag: string
    forceShowName?: boolean
    compact?: boolean
    onclick: (e: MouseEvent) => void
    oncontextmenu: (e: MouseEvent) => void
  } = $props()

  const icon = getIconForTagName(tag)
</script>

{#key tag}
  <span
    class:compact
    onclick={e => {
      e.preventDefault()
      onclick(e)
    }}
    oncontextmenu={e => {
      e.preventDefault()
      oncontextmenu(e)
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

    background: var(--color-dark-level-2);
    border: 1px solid var(--color-dark-level-1);
    border-radius: 3px;

    &.compact {
      cursor: default;
      padding: 0.25em 0.4em;
    }
  }
</style>
