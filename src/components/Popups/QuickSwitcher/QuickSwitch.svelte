<script lang="ts">
  import { get } from "svelte/store"
  import { controller, selectedTags } from "$lib/stores"
  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  const promise = (async () => {
    return get($controller?.tagsController?.tags)
  })()
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["tag"]}
  let:result
  on:selected={({ detail }) => {
    // goto(`/${detail.cluster.name}/${detail.id}`)
    selectedTags.set([detail.tag.join("/").toLowerCase()])
  }}
>
  <span>{result.tag.join("/")}</span>
  <span>{result.direct_count}</span>
</FuzzyPopupTemplate>
