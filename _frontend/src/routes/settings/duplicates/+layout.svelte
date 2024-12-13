<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"

  import type { LayoutData } from "./$types"

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();
</script>

<SettingsPageContent title="Duplicates">
  <Table data={data.duplicates} >
    {#snippet children({ entry })}
        <td>
        {#each entry.media_ids as id}
          <img
            src={`${$page.data.serverURL}/api/media/${id}/thumbnail`}
            alt={id}
            crossorigin="use-credentials"
          />
        {/each}

        <div class="actions">
          <Button
            icon="mdiSourceMerge"
            card
            noMargin
            href={`/settings/duplicates/${entry.content_hash}`}
          >
            Merge
          </Button>
          <Button
            card
            noMargin
            icon="mdiDebugStepOver"
            onclick={() => {
              fetch(`${$page.url.href}/${entry.content_hash}/ignore`, {
                method: "PUT"
              })
                .then(() => invalidateAll())
                .catch(e => {
                  console.error(e)
                  window.alert("An error occurred!")
                })
            }}>Ignore</Button
          >
        </div>
      </td>
          {/snippet}
    </Table>

  {@render children?.()}
</SettingsPageContent>

<style lang="scss">
  td {
    display: flex;
    gap: 0.5rem;

    img {
      height: 98.05px;
    }
  }

  .actions {
    position: absolute;
    top: 50%;
    right: 7px;
    transform: translateY(-50%);

    display: grid;
  }
</style>
