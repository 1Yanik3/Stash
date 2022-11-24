/**
 * egjs-grid
 * Copyright (c) 2021-present NAVER Corp.
 * MIT license
 */
import Grid from './Grid.svelte'
import { GRID_METHODS } from '@egjs/grid'

export default /*#__PURE__*/ (() => {
  const prototype = Grid.prototype

  if (prototype) {
    GRID_METHODS.forEach(name => {
      if (name in prototype) {
        return
      }
      //  @ts-ignore
      prototype[name] = function (...args) {
        //  @ts-ignore
        const self = this.getInstance()
        const result = self[name](...args)

        if (result === self) {
          return this
        } else {
          return result
        }
      }
    })
  }
  return Grid
})()