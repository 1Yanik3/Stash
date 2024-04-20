<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation"
  import Icon from "$components/Icon.svelte"
  import { controller } from "$lib/stores"
  import Button from "$components/Button.svelte"
  import type { PageData } from "./$types"
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"

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
      console.error("Failed to add tag:", { status, statusText, text })
      window.alert("ERROR: Failed to add tag (check console for details)")
    } else {
      invalidateAll()
    }
  }

  const editTag = async (tag: string) => {
    throw new Error("Not implemented")
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

<SettingsPageHeader title="Icon Assignments">
  <Button card icon="mdiPlus" on:click={addNewTag}>Add new Tag</Button>
</SettingsPageHeader>

<div class="grid">
  {#each Object.entries(data.tagIcons) as [icon, tags] (icon)}
    <div class="tag">
      <div class="head">
        <Icon nameAlt={icon} size={2} />
        <span>{icon}</span>
      </div>
      {#each tags as tag}
        <span class="label">{tag}</span>
      {/each}
      <!-- <div class="actions">
          <Button icon="mdiPencil" on:click={() => editTag(tag)} />
          <Button icon="mdiTrashCan" on:click={() => deleteTag(tag)} />
        </div> -->
    </div>
  {/each}
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5em;

    .tag {
      $tagWidth: 120px;

      display: grid;
      width: $tagWidth;
      border: 1px solid $border-color-1;

      .head {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 0.5em;

        border-bottom: 1px solid $border-color-1;
      }

      .label {
        padding: 0.5em;
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
</style>
