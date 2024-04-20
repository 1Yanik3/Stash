<script lang="ts">
  import Popup from "$reusables/Popup.svelte"
  import Sidebar from "./components/Sidebar.svelte"
  import Jobs from "./tabs/jobs.svelte"
  import Statistics from "./tabs/statistics.svelte"

  let activeTab = "general"
</script>

<Popup title="Settings">
  <main>
    <Sidebar bind:activeTab />

    <section>
      {#if activeTab == "jobs"}
        <Jobs />
      {/if}

      {#if activeTab == "statistics"}
        <Statistics />
      {/if}
    </section>
  </main>
</Popup>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 23em;
    width: 640px;

    section {
      overflow: scroll;
      gap: 2em;
      padding: 1em;
    }
  }
</style>
