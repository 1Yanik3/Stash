<script lang="ts">
  import type { Readable } from "svelte/store"

  interface Props {
    title: Readable<string>;
    x: number;
    y: number;
    position: "top" | "bottom" | "left" | "right";
  }

  let {
    title,
    x,
    y,
    position
  }: Props = $props();
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
