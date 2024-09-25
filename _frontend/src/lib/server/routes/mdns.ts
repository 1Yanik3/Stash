// @ts-nocheck

import mDnsSd from "node-dns-sd"

export type FCastDevice = {
  address: string
}

export const discoverFcastDevices = async () =>
  new Promise<FCastDevice[]>((resolve, reject) => {
    mDnsSd
      .discover({
        name: "_fcast._tcp.local"
      })
      .then(device_list => {
        resolve(device_list)
      })
      .catch(error => {
        reject(error)
      })
  })
