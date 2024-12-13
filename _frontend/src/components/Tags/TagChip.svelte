<script lang="ts">
  import Icon from "$components/elements/Icon.svelte"
  import tagsController from "$lib/controllers/TagsController.svelte"

  let {
    tag,
    forceShowName = false,
    compact = false,
    onclick = () => {},
    oncontextmenu = () => {}
  }: {
    tag: number
    forceShowName?: boolean
    compact?: boolean
    onclick?: (e: MouseEvent) => void
    oncontextmenu?: (e: MouseEvent) => void
  } = $props()

  let _tag = $derived(tagsController.tagMap[tag])
</script>

{#key _tag}
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
    {#if _tag && _tag.icon && !forceShowName}
      <Icon name={_tag.icon} size={compact ? 0.9 : 1} />
    {:else}
      {_tag?.tag}
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
