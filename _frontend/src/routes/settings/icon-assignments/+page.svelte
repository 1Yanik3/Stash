<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import Icon from "$components/Icon.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import TagChip from "$components/Tags/TagChip.svelte"
  import { prompts } from "$lib/controllers/PromptController"

  let { data } = $props()

  const addNewTag = async () => {
    console.log(prompts)
    const { ok, status, statusText, text } = await fetch(
      "/settings/icon-assignments",
      {
        method: "POST",
        body: JSON.stringify({
          tag: await prompts.text("Enter the tag name"),
          // TODO: Preview? (implement as custom prompt type)
          icon: await prompts.text("Enter icon name")
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

<SettingsPageContent title="Icon Assignments">
  {#snippet headerActions()}
    <Button card icon="mdiPlus" on:click={addNewTag}>Add new Tag</Button>
  {/snippet}

  <div class="grid">
    {#each Object.entries(data.tagIcons) as [icon, tags] (icon)}
      <div class="tag">
        <div class="icon">
          <Icon nameAlt={icon} size={2} />
        </div>
        <div>
          <div class="title">
            <span>{icon}</span>
          </div>
          <div class="tags">
            {#each tags as tag}
              <TagChip {tag} forceShowName />
            {/each}
          </div>
        </div>
        <!-- <div class="actions">
            <Button icon="mdiPencil" on:click={() => editTag(tag)} />
            <Button icon="mdiTrashCan" on:click={() => deleteTag(tag)} />
            </div> -->
      </div>
    {/each}
  </div>
</SettingsPageContent>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 300px);
    gap: 1em;
    justify-content: center;

    .tag {
      display: flex;
      border: 1px solid var(--border-color-1);

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 65px;
        padding: 0.5em;

        border-right: 1px solid var(--border-color-1);
      }

      .title {
        padding: 0.5em;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        padding: 0.5em;
      }

      //   .head {
      //     display: flex;
      //     flex-direction: column;
      //     align-items: center;

      //     padding: 0.5em;

      //     border-bottom: 1px solid var(--border-color-1);
      //   }

      //   .label {
      //     padding: 0.5em;
      //   }

      //   .actions {
      //     display: grid;
      //     grid-template-columns: 1fr 1fr;
      //   }
    }
  }
</style>
