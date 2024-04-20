<script lang="ts">
  export let title: string
</script>

<main>
  <h1>{title}</h1>
  <div class="actions">
    <slot />
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    justify-content: space-between;

    h1 {
      margin-top: 0;
    }

    .actions {
      display: flex;
      gap: 0.5em;
      justify-content: flex-end;
      height: max-content;
    }
  }
</style>
