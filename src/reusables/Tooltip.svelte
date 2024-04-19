<script lang="ts">
  export let title: string
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
  <span>{title}</span>
</div>

<style lang="scss">
  div {
    background: hsl(0, 0%, 11%);
    border: 1px solid hsl(0, 0%, 17%);
    border-radius: 0.35em;
    padding: 0.5em;
    position: absolute;

    display: flex;
    justify-content: center;
    align-items: center;

    &.direction-bottom {
      transform: translateX(-50%);
    }
  }
</style>
