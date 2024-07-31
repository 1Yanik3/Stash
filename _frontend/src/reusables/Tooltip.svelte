<script lang="ts">
  import type { Readable } from "svelte/store"

  export let title: Readable<string>
  export let x: number
  export let y: number
  export let position: "top" | "bottom" | "left" | "right"
</script>

<div
  style="
    top: {y}px;
    left: {x}px;
  "
  class:direction-top={position == "top"}
  class:direction-bottom={position == "bottom"}
  class:direction-left={position == "left"}
  class:direction-right={position == "right"}
>
  <span>{$title}</span>
</div>

<style lang="scss">
  div {
    position: absolute;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0.5em;

    background: var(--color-dark-level-1);
    border: 1px solid var(--order-color-base);
    border-radius: 0.35em;

    &.direction-bottom {
      transform: translateX(-50%);
    }

    &.direction-right {
      transform: translateY(-50%);
    }
  }
</style>
