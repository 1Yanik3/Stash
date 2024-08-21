<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"

  const dispatch = createEventDispatcher()

  export let once = false
  export let top = 0
  export let bottom = 0
  export let left = 0
  export let right = 0
  export let delay = 0
  export let style: string = ""

  let intersecting = false
  let container: Element

  $: if (intersecting) dispatch("intersecting")

  // @ts-ignore
  onMount(async () => {
    if (delay) await new Promise(resolve => setTimeout(resolve, delay))

    if (typeof IntersectionObserver != "undefined" && container) {
      const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`

      const observer = new IntersectionObserver(
        entries => {
          intersecting = entries[0].isIntersecting
          if (intersecting && once) {
            observer.unobserve(container)
          }
        },
        {
          rootMargin,
          // https://stackoverflow.com/questions/54983348/intersectionobserver-rootmargins-positive-and-negative-values-are-not-working/58622945#58622945?newreg=36a94541d1d94aedb3373363975491f0
          root: document.getElementById("imageGallerySection")
        }
      )

      observer.observe(container)
      return () => observer.unobserve(container)
    }
  })
</script>

<div bind:this={container} onclick={e => dispatch("click", e)} {style}>
  <slot {intersecting}></slot>
</div>
