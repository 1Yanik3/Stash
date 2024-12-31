<script lang="ts">
  interface Props {
    visible?: boolean
    top?: number | null
    right?: number | null
    bottom?: number | null
    left?: number | null
    position?: "absolute" | "fixed"
    width?: "unset" | number
    children?: import("svelte").Snippet
  }

  let {
    visible = true,
    top = null,
    right = null,
    bottom = null,
    left = null,
    position = "fixed",
    width = "unset",
    children
  }: Props = $props()

  let style = $derived(
    (() => {
      let style = ""
      if (top != null) style += `top: ${top}px;`
      if (right != null) style += `right: ${right}px;`
      if (bottom != null) style += `bottom: ${bottom}px;`
      if (left != null) style += `left: ${left}px;`
      return style
    })()
  )
</script>

<main
  style:display={visible ? "block" : "none"}
  {style}
  style:position
  id="dropdownContainer"
  style:width={width == "unset" ? "unset" : `${width}px`}
>
  <div class="moreActionsDropdown">
    {@render children?.()}
  </div>
</main>

<style lang="scss">
  main {
    z-index: 10;

    // padding: 5px 0;

    background: var(--color-dark-level-base);
    border: 1px solid var(--border-color-1);
    border-radius: 0.5em;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 3px 9px 0px,
      rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
  }
</style>
