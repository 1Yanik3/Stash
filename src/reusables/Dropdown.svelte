<script lang="ts">
  export let visible = true
  export let top = 0
  export let right = 0
  export let bottom = 0
  export let left = 0
  export let position: "absolute" | "fixed" = "fixed"

  $: style = (() => {
    let style = ""
    if (top) style += `top: ${top}px;`
    if (right) style += `right: ${right}px;`
    if (bottom) style += `bottom: ${bottom}px;`
    if (left) style += `left: ${left}px;`
    return style
  })()
</script>

<main {style} style:position id="dropdownContainer">
  <div class="moreActionsDropdown" style:display={visible ? "block" : "none"}>
    <slot />
  </div>
</main>

<style lang="scss">
  main {
    z-index: 10;

    padding: 5px 0;

    background: var(--color-dark-level-base);
    border: 1px solid var(--border-color-1);
    border-radius: 0.5em;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 3px 9px 0px,
      rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
  }
</style>
