<script lang="ts">
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { prompts } from "$lib/controllers/PromptController"
  import {
    controller,
    thumbnailSuffixParameter,
    visibleMedium
  } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"

  import Button from "../Button.svelte"
  import Icon from "../Icon.svelte"

  function toIsoString(date: Date) {
    const pad = (num: number) => (num < 10 ? "0" : "") + num

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    )
  }

  const rename = async (suggestedName = $visibleMedium?.name) => {
    if (!$visibleMedium) return

    const newName = await prompts.text("Enter new name", suggestedName)
    if (newName) {
      $visibleMedium.name = newName
      fetch(`/api/media/${$visibleMedium.id}/rename`, {
        method: "PUT",
        body: JSON.stringify({
          name: newName
        })
      })
    }
  }
</script>

<Popup title="Media Details" on:close={() => $controller.setPopup(null)}>
  {#if $visibleMedium}
    <main>
      <div>
        <Icon name="mdiFormTextbox" />
        <span>{$visibleMedium.name}</span>
        {#if $visibleMedium.name.endsWith(".mp4")}
          <Button
            icon="mdiCreation"
            noMargin
            on:click={async () => {
              if (!$visibleMedium) return

              const request = await fetch("/api/ai/prompt", {
                method: "POST",
                body: JSON.stringify({
                  prompt: `
                    extract the plain title from this filename.
                    - Answer inline, without quotation marks.
                    - Do not output extra commentary or description.
                    - Do not output the production company, studio, category, resolutions, or other metadata.
                    - If the title is in caps, convert it to title case.
                    - If the filename mentions the names of people, add all of them to the end in brackets separated by a comma, so that the end result looks something like this: "<TITLE> (<PERSON 1>, <PERSON 2>)".
                    - Except if you only have names and no title, output the names in the same format but without the brackets.
                    "${$visibleMedium.name}"
                  `.replace(/^\s+|\s+$/gm, "")
                })
              })

              if (!request.ok) {
                console.error(await request.text())
                window.alert("Failed to get title from filename")
                return
              }

              rename(await request.text())
            }}
          />
        {/if}
        <Button
          icon="mdiPencil"
          noMargin
          on:click={() => {
            if (!$visibleMedium) return
            rename($visibleMedium.name)
          }}
        />
      </div>

      <section>
        <div>
          <b>Metadata</b>
          <div>
            <Button
              icon="mdiImageRefresh"
              noMargin
              on:click={() => {
                fetch(`/api/media/${$visibleMedium?.id}/thumbnail/reset`).then(
                  () =>
                    setTimeout(
                      () =>
                        thumbnailSuffixParameter.set({
                          mediaId: $visibleMedium?.id,
                          suffix: Math.random().toString(16).substring(2, 8)
                        }),
                      200
                    )
                )
              }}
            />
            <Button
              icon="mdiReload"
              noMargin
              on:click={() => {
                fetch(`/api/media/${$visibleMedium?.id}/metadata/reload`).then(
                  () => {
                    // TODO: Reload does not work
                    mediaController.updateMedia()
                  }
                )
              }}
            />
          </div>
        </div>

        <div>
          <Icon name="mdiIdentifier" />
          <span>{$visibleMedium.id}</span>
        </div>

        <div>
          <Icon name="mdiMoveResize" />
          <span>{$visibleMedium.width}x{$visibleMedium.height}</span>
        </div>

        <div>
          <Icon name="mdiCalendar" />
          <span>{toIsoString(new Date($visibleMedium.date))}</span>
        </div>
      </section>
    </main>
  {/if}
</Popup>

<style lang="scss">
  main {
    display: grid;
    gap: 0.75em;
    padding: 1em;

    div {
      display: flex;
      gap: 0.5em;
      align-items: center;

      span {
        flex-grow: 1;
      }
    }

    section {
      display: grid;
      gap: 1em;

      div:first-child {
        justify-content: space-between;
        margin-right: 0;
        margin-bottom: -10px;

        b {
          font-size: 1.1em;
          font-weight: 500;
        }
      }
      //   div {
      //     margin: 0 1em;
      //   }
    }
  }
</style>
