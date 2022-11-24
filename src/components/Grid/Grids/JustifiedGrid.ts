import Grid from "../Grid.svelte";
import { JustifiedGrid as GridClass } from "@egjs/grid";

let JustifiedGrid: any;

if (typeof Grid === "object") {
  JustifiedGrid = Grid;
} else {
  JustifiedGrid = class JustifiedGrid extends Grid {
    constructor(options: any) {
      options.props.GridClass = GridClass;
      super(options);
    }
  }
}
export { JustifiedGrid };