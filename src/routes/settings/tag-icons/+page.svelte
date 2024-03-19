<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation"
  import Icon from "$components/Icon.svelte"
  import { controller } from "$lib/stores"
  import SidebarButton from "../../[cluster]/SidebarButton.svelte"
  import type { PageData } from "./$types"

  export let data: PageData

  const addNewTag = async () => {
    const { ok, status, statusText, text } = await fetch(
      "/settings/tag-icons",
      {
        method: "POST",
        body: JSON.stringify({
          tag: await $controller.prompt().text("Enter the tag name"),
          // TODO: Preview? (implement as custom prompt type)
          icon: await $controller.prompt().text("Enter icon name")
        })
      }
    )

    if (!ok) {
      console.error("Failed to delete tag:", { status, statusText, text })
      window.alert("ERROR: Failed to delete tag (check console for details)")
    } else {
      invalidateAll()
    }
  }

  const deleteTag = async (tag: string) => {
    const { ok, status, statusText, text } = await fetch(
      "/settings/tag-icons",
      {
        method: "DELETE",
        body: JSON.stringify({
          tag
        })
      }
    )

    if (!ok) {
      console.error("Failed to delete tag:", { status, statusText, text })
      window.alert("ERROR: Failed to delete tag (check console for details)")
    } else {
      invalidateAll()
    }
  }
</script>

<!-- TODO: Tab for custom pack -->

<main>
  <div class="actions">
    <SidebarButton card icon="mdiPlus" on:click={addNewTag}>
      Add new Tag
    </SidebarButton>
    <!-- TODO: Edit Button -->
  </div>

  <div class="table">
    {#each data.tagIcons as { tag, icon }}
      {tag}
      <Icon name={icon} />
      <input bind:value={icon} readonly />
      <div class="entryActions">
        <SidebarButton icon="mdiTrashCan" on:click={() => deleteTag(tag)} />
      </div>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;

    .actions {
      display: flex;
      gap: 0.5em;
      align-self: flex-end;
    }

    .table {
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      gap: 0.25em 0.5em;
      align-items: center;

      .entryActions {
        display: flex;
        gap: 0.5em;
        align-items: center;
        margin-left: -0.5em;
      }
    }
  }
</style>
