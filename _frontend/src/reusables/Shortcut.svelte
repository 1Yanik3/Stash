<script lang="ts">
  interface Props {
    alt?: boolean
    opt?: boolean
    meta?: boolean
    control?: boolean
    shift?: boolean
    modifier?: "alt" | "opt" | "meta" | "control" | "shift" | null
    key: string
    action: Function
  }

  let {
    alt = false,
    opt = false,
    meta = false,
    control = false,
    shift = false,
    modifier = null,
    key,
    action
  }: Props = $props()

  let handler = (e: KeyboardEvent) => {
    if (
      (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) &&
      modifier != "control" &&
      modifier != "meta"
    ) {
      return
    }

    if (
      alt || opt || modifier == "alt" || modifier == "opt"
        ? !e.altKey
        : e.altKey
    )
      return

    if (shift || modifier == "shift" ? !e.shiftKey : e.shiftKey) return

    if (
      control || meta || modifier == "control" || modifier == "meta"
        ? !(e.metaKey || e.ctrlKey)
        : e.metaKey
    )
      return

    if (key.toLowerCase() != e.key.toLowerCase()) return

    e.preventDefault()
    action()
  }
</script>

<svelte:window onkeydown={handler} />
