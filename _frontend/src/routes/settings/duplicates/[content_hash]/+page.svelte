<script lang="ts">
  import type { Media } from "@prisma/client"

  import { goto, invalidateAll } from "$app/navigation"
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Table from "$components/Table.svelte"
  import Toggle from "$components/Toggle.svelte"
  import Popup from "$reusables/Popup.svelte"

  import type { PageData } from "./$types"

  export let data: PageData

  const dateFormatter = (input: string) =>
    new Date(input).toLocaleString("en-ca", { hour12: false }).replace(",", "")

  const attributesToTransfer: {
    attr: keyof Media
    name: string
    selectedIndex: number
    formatter?: (value: any) => string
  }[] = [
    { attr: "id", name: "ID / File", selectedIndex: -1 },
    { attr: "name", name: "Name", selectedIndex: -1 },
    { attr: "clustersId", name: "Clusters ID", selectedIndex: -1 },
    { attr: "favourited", name: "Favourited", selectedIndex: -1 },
    { attr: "tags", name: "Tags", selectedIndex: -1 },
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
    { attr: "countAttribute", name: "Count Attribute", selectedIndex: -1 }
  ]

  $: attributesToTransfer.forEach((a, i) => {
    if (
      data.duplicate_media.every(
        m => m[a.attr] === data.duplicate_media[0][a.attr]
      )
    ) {
      attributesToTransfer[i].selectedIndex = 0
    }
  })
</script>

<Popup title="Merge" on:close={() => goto("/settings/duplicates")}>
  <main>
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
          <div class="row" class:disabled={selectedIndex != i}>
            <span>{name}</span>
            {#if formatter}
              <span>{formatter(entry[attr])}</span>
            {:else}
              <span>{entry[attr]}</span>
            {/if}
            <div class="div">
              <Toggle
                state={selectedIndex == i}
                on:enable={() => {
                  attributesToTransfer[j].selectedIndex = i
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
      on:click={() => {
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
    <Button
      card
      icon="mdiSourceMerge"
      disabled={!attributesToTransfer.some(a => a.selectedIndex != -1)}
      highlighted
      on:click={() => {
        console.log({
          update: Object.fromEntries(
            attributesToTransfer.map(a => [
              a.attr,
              data.duplicate_media[a.selectedIndex][a.attr]
            ])
          ),
          delete: data.duplicate_media
            .filter((_, i) => i != attributesToTransfer[i].selectedIndex)
            .map(({ id }) => id)
        })
        throw new Error("Not implemented")
      }}
    >
      Merge
    </Button>
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

      &.disabled div {
        pointer-events: none;
        opacity: 0.5;
      }

      &:not(.disabled) span {
        opacity: 0.5;
      }
    }
  }
</style>
