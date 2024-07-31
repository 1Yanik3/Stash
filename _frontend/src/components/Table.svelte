<script lang="ts">
  type T = $$Generic<Record>

  export let headers: string[]
  export let data: T[]
</script>

<table>
  <tr>
    {#each headers as header}
      <th>{header}</th>
    {/each}
  </tr>
  {#each data as entry}
    <tr>
      <slot {entry} />
    </tr>
  {/each}
</table>
