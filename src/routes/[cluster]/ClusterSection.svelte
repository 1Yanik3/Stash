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
  import { page } from "$app/stores"
  import { setMethods, sortingMethods } from "../../types"

  import type { LayoutData } from "./$types"
  import Button from "$components/Button.svelte"
  import { derived } from "svelte/store"
  $: pageData = $page.data as LayoutData
</script>

<main
  class:mobile={$settings.mobileLayout}
  class:windowControlsSpacer={$settings.windowControlsSpacer}
>
  <section>
    {#if $settings.windowControlsSpacer}
      <span style=" pointer-events: none;height: 1.5em" />
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

        // TODO: Do I need to invalidate the Media as well?
        // TODO: Invalidate Tags
      }}
      on:contextmenu={({ detail }) => {
        detail.preventDefault()
        seed.set(Math.random())
      }}
      icon={$activeSortingMethod.icon}
      tooltip={{
        title: derived(
          activeSortingMethod,
          $activeSortingMethod => $activeSortingMethod.title
        ),
        position: "right"
      }}
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
      tooltip={{
        title: derived(traverse, $traverse =>
          $traverse ? "Traversing" : "Not Traversing"
        ),
        position: "right"
      }}
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
      tooltip={{
        title: derived(
          activeSetMethod,
          $activeSetMethod => $activeSetMethod.title
        ),
        position: "right"
      }}
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
        tooltip={{
          title: "All Media",
          position: "right"
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
        tooltip={{
          title: "Only Images",
          position: "right"
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
        tooltip={{
          title: "Only Videos",
          position: "right"
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
      tooltip={{
        title: derived(favouritesOnly, $favouritesOnly =>
          $favouritesOnly ? "Only Favourited" : "All Media"
        ),
        position: "right"
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
    <Button
      hidden
      icon="mdiBellOutline"
      on:click={() => $controller.setPopup("Shortcuts")}
    />

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
      href="/settings/general"
      active={$page.url.pathname.startsWith("/settings")}
    >
      Settings
    </Button>
  </section>
</main>

<style lang="scss">
  main {
    display: grid;
    grid-auto-rows: 1fr;
    align-items: center;
    justify-content: center;

    width: 64px;
    padding-top: 0.5em;
    padding-bottom: 0.5em;

    border-right: 1px solid $border-color-base;

    -webkit-app-region: drag;

    &:not(.mobile) {
      & > :first-child {
        align-self: start;
      }

      & > :last-child {
        align-self: end;
      }
    }

    &.windowControlsSpacer {
      width: 77px;
      padding: 1em 0;
    }

    section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    &.mobile {
      display: block;
      gap: 1em;
      width: 100%;
      border-right: none;

      section {
        display: block;
      }
    }
  }
</style>
