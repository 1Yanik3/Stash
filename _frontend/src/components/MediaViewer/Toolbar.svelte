<script lang="ts">
  import selectFiles from "select-files"

  import { browser } from "$app/environment"
  import { page } from "$app/stores"
  import MediaViewer_replaceVideoThumbnail from "$lib/client/MediaViewer_replaceVideoThumbnail"
  import {
    controller,
    imageSuffixParameter,
    isFullscreen,
    settings,
    visibleMedium
  } from "$lib/stores"
  import Dropdown from "$reusables/Dropdown.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"
  import Button from "../Button.svelte"
  import Icon from "../Icon.svelte"
  import TagChip from "../Tags/TagChip.svelte"
  import TagInputField from "../Tags/TagInputField.svelte"

  // import UpscalePopup from './Popups/UpscalePopup.svelte';
  $: pageData = $page.data as PageData

  let dropdownVisible = false

  const addTagToMedia = (value: string) => {
    fetch(`/api/media/${$visibleMedium?.id}/tag`, {
      method: "PUT",
      body: JSON.stringify({
        name: value
      })
    })
      .then(() => {
        const isInUnsorted =
          $visibleMedium?.tags.length == 1 &&
          $visibleMedium?.tags[0] == "show_unsorted"

        const tmp = $visibleMedium
        tmp?.tags.push(value)
        visibleMedium.set(tmp)

        if (isInUnsorted) {
          removeTagFromMedia("show_unsorted")
        } else {
          // TODO: Do I need to invalidate the Media as well?
          // TODO: Invalidate Tags
        }
      })
      .catch(console.error)
  }

  const removeTagFromMedia = (tag: string) => {
    fetch(`/api/media/${$visibleMedium?.id}/tag`, {
      method: "DELETE",
      body: JSON.stringify({
        name: tag
      })
    }).then(() => {
      if (!$visibleMedium) return
      const tmp = $visibleMedium
      tmp.tags = tmp.tags.filter(t => t != tag)
      visibleMedium.set(tmp)

      // TODO: Do I need to invalidate the Media as well?
      // TODO: Invalidate Tags
    })
  }

  ;(window as any).test = () =>
    imageSuffixParameter.set(`?${Math.random().toString(16).substring(2, 8)}`)
  const replaceMedia = (newMedia: Blob) => {
    const data = new FormData()
    data.append(
      "file",
      new File([newMedia], $visibleMedium?.name || "newImage.jpg", {
        type: newMedia.type
      })
    )

    fetch(`/api/media/${$visibleMedium?.id}/replace`, {
      method: "PUT",
      body: data
    }).then(async () => {
      // reload image in viewer
      imageSuffixParameter.set(`?${Math.random().toString(16).substring(2, 8)}`)

      // visibleMedium.update()
      // // This seems to ignore the history pushes
      // window.location.reload()
    })
  }

  const replaceWithLocalMedia = () => {
    if (!browser) return

    selectFiles({}).then(files => {
      if (files && files[0]) replaceMedia(files[0])
    })
  }

  const replaceThumbnail = () => {
    if (!browser) return
    MediaViewer_replaceVideoThumbnail()
  }
</script>

<!-- Toggle Fullscreen -->
<Shortcut
  key="f"
  action={() => {
    isFullscreen.set(!$isFullscreen)
  }}
/>

<!-- {#key $visibleMedium}
    <UpscalePopup bind:isVisible={upscalePopup_open} {replaceMedia}/>
{/key} -->

<Shortcut
  meta
  key="i"
  action={() => {
    $controller.setPopup("Media Details")
  }}
/>

<main
  class:fullscreen={$isFullscreen}
  class:windowControlsSpacer={$settings.windowControlsSpacer}
>
  <section>
    <button on:click={() => visibleMedium.set(null)}>
      <Icon name="mdiClose" size={0.8} />
    </button>
  </section>

  <div>
    <button
      on:click={() => {
        fetch(`/api/media/${$visibleMedium?.id}/favourited`, {
          method: "PUT",
          body: JSON.stringify({
            favourited: !$visibleMedium?.favourited
          })
        })
          .then(() => {
            if (!$visibleMedium) return
            const tmp = $visibleMedium
            tmp.favourited = !$visibleMedium?.favourited
            visibleMedium.set(tmp)

            // TODO: Do I need to invalidate the Media as well?
            // TODO: Invalidate Tags
          })
          .catch(console.error)
      }}
    >
      {#if $visibleMedium?.favourited}
        <Icon name="mdiStar" size={0.8} />
      {:else}
        <Icon name="mdiStarOutline" size={0.8} />
      {/if}
    </button>
    {#each $visibleMedium?.tags || [] as tag (tag)}
      <TagChip {tag} on:contextmenu={() => removeTagFromMedia(tag)} />
    {/each}
    {#if pageData.cluster.type != "collection" || $visibleMedium?.tags.length != 1}
      <TagInputField
        on:selected={({ detail }) => addTagToMedia(detail.toLowerCase())}
      />
    {/if}
  </div>

  <section>
    <button
      on:click={() => {
        isFullscreen.set(!$isFullscreen)
        if ($isFullscreen) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }}
    >
      <Icon name="mdiFullscreen" size={0.8} />
    </button>

    <button
      on:click={() => {
        dropdownVisible = !dropdownVisible
      }}
    >
      <Icon name="mdiDotsVertical" size={0.8} />
    </button>
  </section>
</main>

<Dropdown visible={dropdownVisible} top={44} right={8}>
  <Button
    icon="mdiInformationOutline"
    on:click={() => {
      $controller.setPopup("Media Details")
      dropdownVisible = false
    }}
  >
    Show Details
  </Button>

  <Button
    icon="mdiFileReplace"
    on:click={() => {
      replaceWithLocalMedia()
      dropdownVisible = false
    }}
  >
    Replace file content
  </Button>

  <!-- TODO: Timestamp picker (in frontend, using video element) -->
  {#if $visibleMedium?.type.startsWith("video")}
    <Button
      icon="mdiFileReplaceOutline"
      on:click={() => {
        replaceThumbnail()
        dropdownVisible = false
      }}
    >
      Replace file thumbnail
    </Button>
  {/if}

  <!-- <button on:click={() => upscalePopup_open = true}>
    <Icon name="mdiResize" size={0.8}/>
  </button> -->

  <Button
    icon="mdiDownload"
    href="/api/media/{$visibleMedium?.id}/download"
    download
  >
    Download
  </Button>

  <Button
    icon="mdiOpenInNew"
    on:click={() => {
      window.open(
        `${$page.data.serverURL}/file/${$visibleMedium?.id}`,
        "_blank"
      )
      dropdownVisible = false
    }}
  >
    Open in new tab
  </Button>
</Dropdown>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    justify-content: space-between;

    min-width: calc(100% - 4em);
    padding: 0.35em;

    background: var(--color-dark-level-1);
    border-bottom: 1px solid var(--border-color-base);

    // TODO: Still make click interractions possible even with dragging
    // -webkit-app-region: drag;

    div {
      display: flex;
    }

    section {
      display: flex;
      align-items: center;

      div {
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;
      }

      button {
        outline: none;
      }
    }

    &.fullscreen {
      position: absolute;
      z-index: 5;
      top: 0;
      right: 0;

      justify-content: right;

      background: none;
      border-bottom: none;
      box-shadow: none;

      &.windowControlsSpacer {
        left: 4.625em;
      }

      div,
      section {
        display: none;
      }

      section:last-of-type {
        display: flex;

        :last-child {
          display: none;
        }
      }
    }
  }
</style>
