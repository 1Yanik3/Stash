<script lang="ts">
  import type { Media } from "@prisma/client/wasm"

  import { goto, invalidateAll } from "$app/navigation"
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Table from "$components/Table.svelte"
  import Toggle from "$components/Toggle.svelte"
  import Popup from "$reusables/Popup.svelte"

  import type { PageData } from "./$types"
  import type { DuplicatesMergeServerPutRequestData } from "./merge/+server"

  export let data: PageData

  const dateFormatter = (input: string) =>
    new Date(input).toLocaleString("en-ca", { hour12: false }).replace(",", "")

  const attributesToTransfer: {
    attr: keyof Media
    name: string
    selectedIndex: number
    formatter?: (value: any) => string
  }[] = [
    { attr: "id", name: "ID / File", selectedIndex: 0 },
    { attr: "name", name: "Name", selectedIndex: -1 },
    { attr: "clustersId", name: "Clusters ID", selectedIndex: -1 },
    { attr: "favourited", name: "Favourited", selectedIndex: -1 },
    {
      attr: "createdDate",
      name: "Created Date",
      selectedIndex: -1,
      formatter: dateFormatter
    },
    {
      attr: "date",
      name: "Date",
      selectedIndex: -1,
      formatter: dateFormatter
    },
    {
      attr: "groupedIntoNamesId",
      name: "Grouped Into Names ID",
      selectedIndex: -1
    },
    {
      attr: "specialFilterAttribute",
      name: "Special Filter Attribute",
      selectedIndex: -1
    }
  ]

  let tags = [
    ...new Set(
      data.duplicate_media
        .flatMap(m => m.tags.map(t => ({ id: t.id, tag: t.tag })))
        .map(o => JSON.stringify(o))
    )
  ].map(s => JSON.parse(s))

  $: attributesToTransfer.forEach((a, i) => {
    if (
      data.duplicate_media.every(
        m => m[a.attr] === data.duplicate_media[0][a.attr]
      )
    ) {
      attributesToTransfer[i].selectedIndex = 0
    }
  })

  const getValueToKeep = (
    attribute: (typeof attributesToTransfer)[number]["attr"]
  ) => {
    const dominantObject = attributesToTransfer.find(a => a.attr === attribute)
    if (!dominantObject) throw new Error("Attribute not found!")
    return data.duplicate_media[dominantObject.selectedIndex][attribute] as any
  }
</script>

<Popup title="Merge" on:close={() => goto("/settings/duplicates")}>
  <main>
    <div class="row">
      <span>Tags</span>
      <div style="display: flex">
        {#each tags as tag}
          <span class="tag">{tag.tag}</span>
        {/each}
      </div>
    </div>
    <Table borderless data={data.duplicate_media} let:entry let:i>
      <td>
        {#if entry.type.startsWith("image")}
          <img
            src={`${$page.data.serverURL}/file/${entry.id}`}
            alt={entry.id}
            crossorigin="use-credentials"
          />
        {:else if entry.type.startsWith("video")}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video controls>
            <source
              src={`${$page.data.serverURL}/file/${entry.id}`}
              type={entry.type}
            />
          </video>
        {:else}
          <span>ERROR: Unknown format!</span>
        {/if}
      </td>
      <td>
        {#each attributesToTransfer as { attr, name, selectedIndex, formatter }, j}
          <div
            class="row"
            class:disabled={data.duplicate_media.every(
              m => m[attr] === data.duplicate_media[0][attr]
            )}
          >
            <span class:disabled={selectedIndex != -1}>{name}</span>
            {#if formatter}
              <span class:disabled={selectedIndex != -1}
                >{formatter(entry[attr])}</span
              >
            {:else}
              <span class:disabled={selectedIndex != -1}>{entry[attr]}</span>
            {/if}
            <div class="div">
              <Toggle
                state={selectedIndex == i}
                enable={() => {
                  attributesToTransfer[j].selectedIndex = i
                  console.log(attributesToTransfer[j])
                }}
                disable={() => {
                  attributesToTransfer[j].selectedIndex = -1
                }}
              />
            </div>
          </div>
        {/each}
      </td>
    </Table>
  </main>

  <svelte:fragment slot="actionsLeft">
    <Button
      card
      icon="mdiDebugStepOver"
      onclick={() => {
        fetch(`${$page.url.href}/ignore`, {
          method: "PUT"
        })
          .then(async () => {
            await invalidateAll()
            goto("/settings/duplicates")
          })
          .catch(e => {
            console.error(e)
            window.alert("An error occurred!")
          })
      }}
    >
      Ignore
    </Button>
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    {#key attributesToTransfer}
      <Button
        card
        icon="mdiSourceMerge"
        highlighted
        onclick={() => {
          fetch(`${$page.url.href}/merge`, {
            method: "PUT",
            body: JSON.stringify({
              idToKeep: getValueToKeep("id"),
              idsToRemove: data.duplicate_media
                .filter((_, i) => i != attributesToTransfer[0].selectedIndex)
                .map(m => m.id),
              attributesToKeep: {
                clustersId: getValueToKeep("clustersId"),
                createdDate: getValueToKeep("createdDate"),
                date: getValueToKeep("date"),
                favourited: getValueToKeep("favourited"),
                groupedIntoNamesId: getValueToKeep("groupedIntoNamesId"),
                name: getValueToKeep("name"),
                specialFilterAttribute: getValueToKeep(
                  "specialFilterAttribute"
                ),
                tags: tags.map(t => t.id)
              }
            } satisfies DuplicatesMergeServerPutRequestData)
          })
          //   .then(async () => {
          //     await invalidateAll()
          //     goto("/settings/duplicates")
          //   })
          //   .catch(e => {
          //     console.error(e)
          //     window.alert("An error occurred!")
          //   })
        }}
      >
        Merge
      </Button>
    {/key}
  </svelte:fragment>
</Popup>

<style lang="scss">
  main {
    overflow: scroll;
    max-height: calc(100vh - 250px);
  }

  td:nth-child(1) {
    padding: 0;
    padding-right: 1rem;

    img,
    video {
      width: 200px;
    }
  }

  td:nth-child(2) {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .row {
      display: grid;
      grid-template-columns: 150px 1fr auto;
      gap: 1rem;
      align-items: center;

      &.disabled {
        pointer-events: none;
        opacity: 0.5;
      }

      .disabled {
        opacity: 0.5;
      }
    }
  }

  .tag {
    display: flex;
    align-items: center;

    cursor: pointer;

    margin: 0.15em;
    padding: 0.3em 0.5em;

    background: var(--color-dark-level-2);
    border: 1px solid var(--color-dark-level-1);
    border-radius: 3px;
  }
</style>
