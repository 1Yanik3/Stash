<script lang="ts">
  import {
    activeSortingMethod,
    activeSetMethod,
    controller,
    settings,
    traverse,
    mediaTypeFilter,
    favouritesOnly,
    seed
  } from "$lib/stores"
  import { invalidate } from "$app/navigation"
  import { page } from "$app/stores"
  import { setMethods, sortingMethods } from "../../types"

  import type { LayoutData } from "./$types"
  import Button from "$components/Button.svelte"
  $: pageData = $page.data as LayoutData
</script>

<main
  class:mobile={$settings.mobileLayout}
  class:windowControlsSpacer={$settings.windowControlsSpacer}
>
  <section>
    {#if $settings.windowControlsSpacer}
      <span style="height: 1.5em; pointer-events: none" />
    {/if}

    <Button
      hidden={!$settings.mobileLayout}
      disabled={["collection", "stories"].includes(pageData.cluster?.type)}
      on:click={() => {
        activeSortingMethod.set(
          sortingMethods[
            (sortingMethods.indexOf($activeSortingMethod) + 1) %
              sortingMethods.length
          ]
        )
        invalidate("media-and-tags")
      }}
      on:contextmenu={({ detail }) => {
        detail.preventDefault()
        seed.set(Math.random())
      }}
      icon={$activeSortingMethod.icon}
    >
      Sorting Method
    </Button>

    <Button
      hidden={!$settings.mobileLayout}
      disabled={pageData.cluster?.type == "stories"}
      on:click={() => {
        traverse.set(!$traverse)
      }}
      icon={$traverse ? "mdiHook" : "mdiHookOff"}
    >
      Traverse
    </Button>

    <Button
      hidden={!$settings.mobileLayout}
      disabled={["collection", "stories"].includes(pageData.cluster?.type)}
      on:click={() => {
        activeSetMethod.set(
          setMethods[
            (setMethods.indexOf($activeSetMethod) + 1) % setMethods.length
          ]
        )
      }}
      icon={$activeSetMethod.icon}
    >
      Set Method ({$activeSetMethod.title})
    </Button>

    {#if $mediaTypeFilter == ""}
      <Button
        hidden={!$settings.mobileLayout}
        icon="mdiMultimedia"
        on:click={() => {
          mediaTypeFilter.set("image")
        }}
      >
        Image
      </Button>
    {:else if $mediaTypeFilter == "image"}
      <Button
        hidden={!$settings.mobileLayout}
        icon="mdiImageOutline"
        on:click={() => {
          mediaTypeFilter.set("video")
        }}
      >
        Image
      </Button>
    {:else if $mediaTypeFilter == "video"}
      <Button
        hidden={!$settings.mobileLayout}
        icon="mdiVideoOutline"
        on:click={() => {
          mediaTypeFilter.set("")
        }}
      >
        Image
      </Button>
    {/if}

    <Button
      hidden={!$settings.mobileLayout}
      icon={$favouritesOnly ? "mdiStar" : "mdiStarOutline"}
      on:click={() => {
        favouritesOnly.set(!$favouritesOnly)
      }}
    >
      Favourited
    </Button>
  </section>

  <section>
    {#each pageData.clusters.sort((a, b) => a.sortOrder - b.sortOrder) as c}
      <Button
        hidden={!$settings.mobileLayout}
        iconNoTyping={c.icon}
        href="/{c.name}"
        active={c.id == pageData.cluster?.id}
      >
        {c.name}
      </Button>
    {/each}
  </section>

  <section>
    {#if !$settings.mobileLayout}
      <Button
        hidden
        icon="mdiKeyboard"
        on:click={() => $controller.setPopup("Shortcuts")}
      />
    {/if}

    <Button
      hidden={!$settings.mobileLayout}
      icon="mdiCog"
      href="/settings"
      active={$page.url.pathname.startsWith("/settings")}
    >
      Settings
    </Button>
  </section>
</main>

<style lang="scss">
  main {
    display: grid;
    justify-content: center;
    align-items: center;
    grid-auto-rows: 1fr;

    &:not(.mobile) {
      & > :first-child {
        align-self: start;
      }
      & > :last-child {
        align-self: end;
      }
    }

    padding-top: 0.5em;
    padding-bottom: 0.5em;

    border-right: 1px solid $border-color-base;

    width: 64px;
    &.windowControlsSpacer {
      width: 77px;
      padding: 1em 0;
    }

    section {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    -webkit-app-region: drag;

    &.mobile {
      width: 100%;
      border-right: none;
      display: block;
      gap: 1em;
      section {
        display: block;
      }
    }
  }
</style>
