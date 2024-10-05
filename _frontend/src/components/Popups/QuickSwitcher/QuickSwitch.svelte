<script lang="ts">
  import Icon from "$components/Icon.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"

  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  const promise = (async () => {
    return tagsController.tags_flat
  })()
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["tag"]}
  onselected={d => {
    mediaController.filters.selectedTags = [d]
  }}
>
  {#snippet children(result)}
    <span class="result-tag">
      {#if result.icon}
        <Icon name={result.icon} size={0.75} />
      {/if}
      {result.tag}
    </span>
    <span>{result.count}</span>
  {/snippet}
</FuzzyPopupTemplate>

<style>
  .result-tag {
    text-transform: capitalize;
    display: flex;
    gap: 0.4em;
    align-items: center;
  }
</style>
