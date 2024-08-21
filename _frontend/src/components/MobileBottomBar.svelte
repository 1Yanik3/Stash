<script lang="ts">
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import {
    activeSetMethod,
    controller,
    favouritesOnly,
    mediaTypeFilter,
    selectedTags,
    traverse
  } from "$lib/stores"
  import Dropdown from "$reusables/Dropdown.svelte"
  import Popup from "$reusables/Popup.svelte"

  import type { PageData } from "../routes/[cluster]/$types"
  import SidebarFilterSection from "../routes/[cluster]/SidebarFilterSection.svelte"
  import SidebarTagsSection from "../routes/[cluster]/SidebarTagsSection.svelte"
  import Button from "./Button.svelte"
  import Icon from "./Icon.svelte"

  $: pageData = $page.data as PageData

  let clusterSelectionDropdownVisible = false
  let filtersSelectionDropdownVisible = false
  let menuDropdownVisible = false
  let tagsSheetOpen = false

  $: filterCount =
    ($traverse ? 1 : 0) +
    ($activeSetMethod.title == "AND" ? 1 : 0) +
    ($mediaTypeFilter ? 1 : 0) +
    ($favouritesOnly ? 1 : 0)
</script>

{#if clusterSelectionDropdownVisible}
  <Dropdown bottom={84} left={8}>
    {#each pageData.clusters.sort((a, b) => a.sortOrder - b.sortOrder) as c}
      <Button
        iconNoTyping={c.icon}
        href="/{c.name}"
        active={c.id == pageData.cluster?.id &&
          !$page.url.pathname.startsWith("/settings")}
        on:click={() => (clusterSelectionDropdownVisible = false)}
      >
        {c.name}
      </Button>
    {/each}
  </Dropdown>
{/if}

{#if tagsSheetOpen}
  <Popup
    bottomSheet
    onclose={() => {
      tagsSheetOpen = false
    }}
  >
    <SidebarTagsSection />
  </Popup>
{/if}

{#if filtersSelectionDropdownVisible}
  <Dropdown bottom={84} right={8}>
    <SidebarFilterSection />
  </Dropdown>
{/if}

{#if menuDropdownVisible}
  <Dropdown bottom={84} right={8}>
    <Button
      icon="mdiCog"
      href="/settings/general"
      on:click={() => (menuDropdownVisible = false)}
    >
      Settings
    </Button>

    <Button
      icon="mdiConsole"
      on:click={() => {
        $controller.setPopup("Quick Actions")
        menuDropdownVisible = false
      }}
    >
      Quick Actions
    </Button>

    <Button
      icon="mdiMagnify"
      on:click={() => {
        $controller.setPopup("Quick Switch")
        menuDropdownVisible = false
      }}
      on:click={() => (menuDropdownVisible = false)}
    >
      Quick Switch
    </Button>
  </Dropdown>
{/if}

<main>
  <!-- Cluster Selection -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if $page.url.pathname.startsWith("/settings")}
    <div class="button" onmousedown={() => goto("/")}>
      <div class="iconContainer">
        <div class="icon">
          <Icon name="mdiArrowLeft" />
        </div>
      </div>
      <span class="label">
        Go Back
      </span>
    </div>
  {:else}
    <div
      class="button"
      class:active={!$page.url.pathname.startsWith("/settings")}
      onmousedown={() =>
        (clusterSelectionDropdownVisible = !clusterSelectionDropdownVisible)}
    >
      <div class="iconContainer">
        <div class="icon">
          <Icon
            nameAlt={pageData.clusters.find(c => c.id == pageData.cluster?.id)
              ?.icon}
          />
        </div>
      </div>
      <span class="label">
        {pageData.clusters.find(c => c.id == pageData.cluster?.id)?.name}
      </span>
    </div>
  {/if}

  <!-- Tags Section -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="button" onmousedown={() => (tagsSheetOpen = !tagsSheetOpen)}>
    <div class="iconContainer">
      <div class="icon">
        <Icon name="mdiTagMultiple" />
      </div>
      {#if $selectedTags.length > 0}
        <div class="dot">
          <span>{$selectedTags.length}</span>
        </div>
      {/if}
    </div>
    <span class="label"> Tags </span>
  </div>

  <!-- Filter Section -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="button"
    class:active={filterCount}
    onmousedown={() =>
      (filtersSelectionDropdownVisible = !filtersSelectionDropdownVisible)}
  >
    <div class="iconContainer">
      <div class="icon">
        <Icon name="mdiFilter" />
      </div>
      {#if filterCount}
        <div class="dot">
          <span>{filterCount}</span>
        </div>
      {/if}
    </div>
    <span class="label"> Filters </span>
  </div>

  <!-- Menu Section -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="button"
    class:active={$page.url.pathname.startsWith("/settings")}
    onmousedown={() => (menuDropdownVisible = !menuDropdownVisible)}
  >
    <div class="iconContainer">
      <div class="icon">
        <Icon name="mdiMenu" />
      </div>
    </div>
    <span class="label"> Menu </span>
  </div>
</main>

<style lang="scss">
  @use "sass:color";

  main {
    // TODO: Make dynamic
    $background-color: color.mix(#1c1c1c, #303030, 50%);

    display: flex;
    gap: 8px;
    justify-content: space-between;

    padding: 0 20px;

    background: $background-color;

    .button {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      padding-top: 12px;
      padding-bottom: 16px;

      .iconContainer {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 64px;
        height: 32px;

        border-radius: 16px;

        .icon {
          opacity: 90%;
        }

        .dot {
          position: absolute;
          top: -4px;
          right: 4px;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 16px;
          height: 16px;

          background: #bbb;
          border-radius: 8px;

          span {
            font-size: 12px;
            font-weight: 500;
            color: #000;
          }
        }
      }

      .label {
        font-size: 12px;
        font-weight: 500;
        line-height: 12px;
        opacity: 90%;
      }

      &.active {
        .label {
          font-weight: 700;
          opacity: 90%;
        }

        .iconContainer {
          background: color.adjust($color: $background-color, $lightness: 10%);

          .icon {
            opacity: 100%;
          }
        }
      }
    }
  }
</style>
