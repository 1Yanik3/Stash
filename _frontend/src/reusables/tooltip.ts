import { mount } from "svelte"
import { get, readable, type Readable } from "svelte/store"

import { settings } from "$lib/stores.svelte"

import Tooltip from "./Tooltip.svelte"

export function tooltip(
  element: HTMLElement,
  options: {
    title: string | Readable<string>
    position: "top" | "bottom" | "left" | "right"
    enabled?: boolean
  }
) {
  let tooltipComponent: Tooltip

  const distanceFromElement = 3

  const mouseEnter = (event: MouseEvent) => {
    if (options.enabled === false) return
    if (!get(settings).tooltipEnabled) return

    let x = element.getBoundingClientRect().x
    let y = element.getBoundingClientRect().y

    if (options.position == "bottom") {
      y += element.getBoundingClientRect().height + distanceFromElement
      x += element.getBoundingClientRect().width / 2
    }

    if (options.position == "right") {
      y += element.getBoundingClientRect().height / 2
      x += element.getBoundingClientRect().width + distanceFromElement
    }

    // TODO: Other directions

    tooltipComponent = mount(Tooltip, {
      props: {
        title:
          typeof options.title == "string"
            ? readable(options.title)
            : options.title,
        position: options.position,
        x,
        y
      },
      target: document.body
    })
  }

  const mouseLeave = () => {
    try {
      tooltipComponent.$destroy()
    } catch {}
  }

  element.addEventListener("mouseenter", mouseEnter)
  element.addEventListener("mouseleave", mouseLeave)

  // TODO: Close tooltip if the element get's destroyed

  return {
    destroy() {
      element.removeEventListener("mouseenter", mouseEnter)
      element.removeEventListener("mouseleave", mouseLeave)
    }
  }
}
