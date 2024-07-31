<script lang="ts">
  export let title: string | null = null

  export let justify = false
  export let horizontal = false
</script>

<div class:justified={justify} class:horizontal>
  {#if title}
    <div style="display: flex;justify-content: space-between">
      {#if title}
        <span>{title}</span>
      {/if}
    </div>
  {/if}

  <slot />
</div>

<style lang="scss">
  div.justified {
    display: flex;
    justify-content: space-between;
    margin: 0.5em;
  }

  div.horizontal {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-width: 100%;
    margin-top: 0.5em;
  }

  span {
    display: block;
    margin: 0.5em 0.75em;
    font-weight: 200;
    filter: opacity(0.65);
  }
</style>
