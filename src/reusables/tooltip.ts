import Tooltip from "./Tooltip.svelte"

export function tooltip(
  element: HTMLElement,
  options: { title: string; position: "top" | "bottom" | "left" | "right", enabled?: boolean }
) {
  let tooltipComponent: Tooltip

  const distanceFromElement = 3

  const mouseEnter = (event: MouseEvent) => {
    if (options.enabled === false) return

    let x = element.getBoundingClientRect().x
    let y = element.getBoundingClientRect().y

    if (options.position == "bottom") {
      y += element.getBoundingClientRect().height + distanceFromElement
      x += element.getBoundingClientRect().width / 2
    }

    // TODO: Other directions

    tooltipComponent = new Tooltip({
      props: {
        title: options.title,
        position: options.position,
        x,
        y
      },
      target: document.body
    })
  }

  const mouseLeave = () => {
    tooltipComponent.$destroy()
  }

  element.addEventListener("mouseenter", mouseEnter)
  element.addEventListener("mouseleave", mouseLeave)

  return {
    destroy() {
      element.removeEventListener("mouseenter", mouseEnter)
      element.removeEventListener("mouseleave", mouseLeave)
    }
  }
}
