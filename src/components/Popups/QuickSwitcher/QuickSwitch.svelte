<script lang="ts">
  import { page } from "$app/stores"
  import { selectedTags } from "../../../lib/stores"
  import type { PageData } from "../../../routes/[cluster]/$types"
  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  $: pageData = $page.data as PageData
  $: data = (async () => {
    return await pageData.streamed_page.tags
  })()
</script>

<FuzzyPopupTemplate
  promise={data}
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
