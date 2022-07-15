<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let once = false;
  export let top = 0;
  export let bottom = 0;
  export let left = 0;
  export let right = 0;

  let intersecting = false;
  let container: any;

  onMount(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

      const observer = new IntersectionObserver(entries => {
        intersecting = entries[0].isIntersecting;
        if (intersecting && once) {
          observer.unobserve(container);
        }
      }, {
        rootMargin
      });

      observer.observe(container);
      return () => observer.unobserve(container);
    }

    // // The following is a fallback for older browsers
    // function handler() {
    //   if (intersecting && once) {
    //     return
    //   }

    //   const bcr = container.getBoundingClientRect();

    //   // TODO: Make it, so some images above and below are also loaded (for smoother scrolling)
    //   intersecting = (
    //     (bcr.bottom + bottom) > 0 &&
    //     (bcr.right + right) > 0 &&
    //     (bcr.top - top) < window.innerHeight &&
    //     (bcr.left - left) < window.innerWidth
    //   );

    //   if (intersecting && once) {
    //     window.removeEventListener('scroll', handler);
    //   }
    // }

    // setInterval(handler, 50)
    // window.addEventListener('scroll', handler)
    // return () => window.removeEventListener('scroll', handler)
  });

</script>

  
<div bind:this={container} on:click={() => dispatch("click")}>
  <slot {intersecting}></slot>
</div>