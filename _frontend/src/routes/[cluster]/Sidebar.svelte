<script lang="ts">
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Select from "$components/Select.svelte"
  import { settings } from "$lib/stores"

  import type { PageData } from "./$types"
  import SidebarFilterSection from "./SidebarFilterSection.svelte"
  import SidebatTagsSection from "./SidebarTagsSection.svelte"

  $: pageData = $page.data as PageData

  let showFilters = false
</script>

{#if $page.data.cluster.type != "stories"}
  <main class:mobile={$settings.mobileLayout}>
    <div class="header">
      <Select
        onchange={(name) => {
          goto(`/${name}`)
        }}
        value={$page.data.cluster.name}
        options={pageData.clusters.map(c => ({
          value: c.name,
          name: c.name,
          icon: c.icon as any
        }))}
        width={-1}
        allowMouseWheel
      />
      <Button
        icon="mdiCog"
        href="/settings/general"
        active={$page.url.pathname.startsWith("/settings")}
        noMargin
        styleOverride="margin-left: 1rem"
      />
      <Button
        icon="mdiFilter"
        onclick={() => {
          showFilters = !showFilters
        }}
        active={showFilters}
        noMargin
      />
    </div>

    {#if showFilters}
      <div class="filters">
        <SidebarFilterSection />
      </div>
    {/if}

    <div class="tags-section">
      <SidebatTagsSection />
    </div>
  </main>
{/if}

<style lang="scss">
  main {
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 250px;
    height: 100vh;

    background: var(--color-dark-level-1);
    border-right: 1px solid var(--border-color-base);

    .filters {
      padding-bottom: 0.5rem;
    }

    .tags-section {
      flex-grow: 1;
      border-top: 1px solid var(--border-color-base);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &.mobile {
      width: 100%;
      height: 80vh;
      border: none;
    }

    .header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      padding: 0.5rem;
    }
  }
</style>
