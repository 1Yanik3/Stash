<script lang="ts">
  import { onMount } from "svelte"

  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Select from "$components/Select.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { settings, windowControlsSpacerVisible } from "$lib/stores"

  import type { PageData } from "./$types"
  import SidebatTagsSection from "./SidebarTagsSection.svelte"

  $: pageData = $page.data as PageData
</script>

{#if $page.data.cluster.type != "stories"}
  <main
    class:mobile={$settings.mobileLayout}
    class:windowControlsSpacerVisible={$windowControlsSpacerVisible}
  >
    <div class="header">
      <Select
        onchange={name => {
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
    </div>

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
    flex-shrink: 0;

    width: 250px;
    height: 100vh;

    background: var(--color-dark-level-1);

    -webkit-app-region: drag;

    .tags-section {
      flex-grow: 1;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-color-base);
      border-right: 1px solid var(--border-color-base);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &.mobile {
      width: 100%;
      height: 80vh;
      border: none;
    }

    &.windowControlsSpacerVisible {
      padding-top: 1.5rem;
    }

    .header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      padding: 0.5rem;
    }
  }
</style>
