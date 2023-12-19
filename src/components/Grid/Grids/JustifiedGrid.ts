import { JustifiedGrid as GridClass } from "@egjs/grid"

import Grid from "../Grid.svelte"

let JustifiedGrid: any

if (typeof Grid === "object") {
  JustifiedGrid = Grid
} else {
  JustifiedGrid = class JustifiedGrid extends Grid {
    constructor(options: any) {
      options.props.GridClass = GridClass
      super(options)
    }
  }
}
export { JustifiedGrid }
