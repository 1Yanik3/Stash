import type { Action } from "svelte/action"

const imageRetry: Action<HTMLImageElement> = node => {
    let remainingAttempts = 3
    let timeoutDuration = 500

    const retry = () => {
        if (remainingAttempts-- < 0) return

        setTimeout(() => {
            node.src =
                node.src + `?${Math.random().toString(16).substring(2, 8)}`
        }, timeoutDuration)

        timeoutDuration *= 3
    }

    node.addEventListener("error", retry)

    $effect(() => {
        // setup goes here

        return () => {
            node.removeEventListener("error", retry)
        }
    })
}

export default imageRetry
