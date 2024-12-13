<script lang="ts">
  type T = $$Generic<Record>

  interface Props {
    headers?: string[] | null;
    data: T[];
    borderless?: boolean;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    headers = null,
    data,
    borderless = false,
    children
  }: Props = $props();
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
        {@render children?.({ entry, i, })}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  tr {
    position: relative;
  }
</style>
