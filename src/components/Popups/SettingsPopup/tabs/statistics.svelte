<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import Icon from "../../../Icon.svelte"
  import { page } from "$app/stores"
  import type { PageData } from "../../../../routes/[cluster]/$types"
  import type { $Enums } from "@prisma/client"

  $: pageData = $page.data as PageData

  // TODO: Make this type dynamic?
  let data: {
    media_count: number
    clusters: {
      id: number
      name: string
      icon: string
      type: $Enums.ClusterType
      media_count: number
    }[]
  } = {
    media_count: -1,
    clusters: []
  }

  onMount(async () => {
    data = await (await fetch("/api/global/statistics")).json()
  })
</script>

<main in:fade>
  <div class="header">
    <span>Media Count</span>
    <span></span>
    <!-- <span>Storage Usage</span> -->
    <span class="bigNumber"> {data.media_count} </span>
    <!-- <span class="bigNumber"> 56.2 GB </span> -->
  </div>

  {#each data.clusters as c}
    <section>
      <div>
        <Icon nameAlt={c.icon} size={1.5} />
        <b>{c.name}</b>
      </div>

      <div>
        <span>
          {#if c.type == "stories"}
            Stories
          {:else}
            Media
          {/if} Count
        </span>
        <span class="bigNumber">
          {c.media_count}
        </span>
        <!-- <span style="margin-top: 1em">Storage Usage</span>
                <span class="bigNumber"> 10.2 GB </span> -->
        <span>​</span>
        <span>​</span>
      </div>
    </section>
  {/each}
</main>

<style lang="scss">
  .bigNumber {
    font-size: 1.5em;
  }

  .header {
    display: grid;
    grid-template-columns: 1fr auto;
    margin: 1em;
    margin-bottom: 2em;

    .bigNumber {
      font-size: 2.75em;
    }
  }

  section {
    display: grid;
    grid-template-columns: 1fr auto;

    margin-top: 1em;
    padding: 1em;

    background: hsl(0, 0%, 7%);
    border: 1px solid hsl(0, 0%, 17%);
    border-radius: 0.6em;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

    b {
      font-size: 1.5em;
    }

    div {
      // display: grid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
</style>
