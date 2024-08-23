<script lang="ts">
  type T = $$Generic<Record>

  export let headers: string[] | null = null
  export let data: T[]
  export let borderless = false
</script>

<table class:borderless>
  {#if headers}
    <thead>
      <tr>
        {#each headers as header}
          <th>{header}</th>
        {/each}
      </tr>
    </thead>
  {/if}
  <tbody>
    {#each data as entry, i}
      <tr>
        <slot {entry} {i} />
      </tr>
    {/each}
  </tbody>
</table>

<style>
  tr {
    position: relative;
  }
</style>
