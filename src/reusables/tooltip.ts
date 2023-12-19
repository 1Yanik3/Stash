import Tooltip from "./Tooltip.svelte"

export function tooltip(element: HTMLElement) {
  let div
  let title: string
  let tooltipComponent: Tooltip
  function mouseEnter(event: MouseEvent) {
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    // title = element.getAttribute('title');
    title = "asd"
    element.removeAttribute("title")

    tooltipComponent = new Tooltip({
      props: {
        title: title,
        x: element.getBoundingClientRect().x + 35,
        y: element.getBoundingClientRect().y
      },
      target: document.body
    })
  }
  function mouseMove(event: MouseEvent) {
    // tooltipComponent.$set({
    // 	x: event.pageX,
    // 	y: event.pageY,
    // })
  }
  function mouseLeave() {
    tooltipComponent.$destroy()
    // NOTE: restore the `title` attribute
    element.setAttribute("title", title)
  }

  element.addEventListener("mouseenter", mouseEnter)
  element.addEventListener("mouseleave", mouseLeave)
  element.addEventListener("mousemove", mouseMove)

  return {
    destroy() {
      element.removeEventListener("mouseenter", mouseEnter)
      element.removeEventListener("mouseleave", mouseLeave)
      element.removeEventListener("mousemove", mouseMove)
    }
  }
}
