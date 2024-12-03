<script lang="ts">
  import Icon from "./Icon.svelte"

  export let key: string
  export let compact = false

  const iconOverwrites: any = {
    escape: "mdiKeyboardEsc",
    f1: "mdiKeyboardF1",
    f2: "mdiKeyboardF2",
    f3: "mdiKeyboardF3",
    f4: "mdiKeyboardF4",
    f5: "mdiKeyboardF5",
    f6: "mdiKeyboardF6",
    f7: "mdiKeyboardF7",
    f8: "mdiKeyboardF8",
    f9: "mdiKeyboardF9",
    f10: "mdiKeyboardF10",
    f11: "mdiKeyboardF11",
    f12: "mdiKeyboardF12",
    backspace: "mdiBackspaceOutline",
    tab: "mdiKeyboardTab",
    caps: "mdiKeyboardCaps",
    enter: "mdiKeyboardReturn",
    shift: "mdiAppleKeyboardShift",
    shiftR: "mdiAppleKeyboardShift",
    control: "mdiAppleKeyboardControl",
    option: "mdiAppleKeyboardOption",
    command: "mdiAppleKeyboardCommand",
    meta: "mdiAppleKeyboardCommand",
    space: "mdiKeyboardSpace",
    arrowLeft: "mdiArrowLeft",
    arrowUp: "mdiArrowUp",
    arrowDown: "mdiArrowDown",
    arrowRight: "mdiArrowRight"
  }
</script>

<main class:compact>
  {#if iconOverwrites[key]}
    <Icon name={iconOverwrites[key]} size={compact ? 0.55 : 0.7} />
  {:else}
    <span>{key}</span>
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 1.75em;
    height: 1.75em;
    margin-left: 0.25em;

    background: hsl(0, 0%, 7%);
    border: 1px solid hsl(0, 0%, 17%);
    border-radius: 5px;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

    &.compact {
      width: 1.25em;
      height: 1.25em;
      margin-left: 0.2em;
      border-radius: 4px;
    }
  }
</style>
