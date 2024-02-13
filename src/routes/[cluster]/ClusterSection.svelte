<script lang="ts">
  import {
    activeSortingMethod,
    activeSetMethod,
    controller,
    settings,
    traverse,
    mediaTypeFilter
  } from "$lib/stores"
  import { invalidate } from "$app/navigation"
  import { page } from "$app/stores"
  import { setMethods, sortingMethods } from "../../types"

  import type { LayoutData } from "./$types"
  import SidebarButton from "./SidebarButton.svelte"
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

    <SidebarButton
      hidden={!$settings.mobileLayout}
      disabled={["collection", "stories"].includes(pageData.cluster.type)}
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
        invalidate("media-and-tags")
      }}
      icon={$activeSortingMethod.icon}
    >
      Sorting Method
    </SidebarButton>

    {#if $mediaTypeFilter == ""}
      <SidebarButton
        hidden={!$settings.mobileLayout}
        icon="mdiMultimedia"
        on:click={() => {
          mediaTypeFilter.set("image")
          invalidate("media-and-tags")
        }}
      >
        Image
      </SidebarButton>
    {:else if $mediaTypeFilter == "image"}
      <SidebarButton
        hidden={!$settings.mobileLayout}
        icon="mdiImageOutline"
        on:click={() => {
          mediaTypeFilter.set("video")
          invalidate("media-and-tags")
        }}
      >
        Image
      </SidebarButton>
    {:else if $mediaTypeFilter == "video"}
      <SidebarButton
        hidden={!$settings.mobileLayout}
        icon="mdiVideoOutline"
        on:click={() => {
          mediaTypeFilter.set("")
          invalidate("media-and-tags")
        }}
      >
        Image
      </SidebarButton>
    {/if}

    <SidebarButton
      hidden={!$settings.mobileLayout}
      disabled={pageData.cluster.type == "stories"}
      on:click={() => {
        traverse.set(!$traverse)
        invalidate("media-and-tags")
      }}
      icon={$traverse ? "mdiHook" : "mdiHookOff"}
    >
      Traverse
    </SidebarButton>

    <SidebarButton
      hidden={!$settings.mobileLayout}
      disabled={["collection", "stories"].includes(pageData.cluster.type)}
      on:click={() => {
        activeSetMethod.set(
          setMethods[
            (setMethods.indexOf($activeSetMethod) + 1) % setMethods.length
          ]
        )
        invalidate("media-and-tags")
      }}
      icon={$activeSetMethod.icon}
    >
      Set Method ({$activeSetMethod.title})
    </SidebarButton>
  </section>

  <section>
    {#each pageData.clusters.sort((a, b) => a.sortOrder - b.sortOrder) as c}
      <SidebarButton
        hidden={!$settings.mobileLayout}
        iconNoTyping={c.icon}
        href="/{c.name}"
        active={c.id == pageData.cluster.id}
      >
        {c.name}
      </SidebarButton>
    {/each}
  </section>

  <section>
    {#if !$settings.mobileLayout}
      <SidebarButton
        hidden
        icon="mdiKeyboard"
        on:click={() => $controller.setPopup("Shortcuts")}
      />
    {/if}

    <SidebarButton
      hidden={!$settings.mobileLayout}
      icon="mdiCog"
      on:click={() => $controller.setPopup("Settings")}
    >
      Settings
    </SidebarButton>
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

    span.disabled {
      pointer-events: none;
      filter: opacity(0.5);
    }

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
