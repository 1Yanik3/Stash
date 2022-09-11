<script lang="ts">
    export let keys: {
        alt?: boolean
        opt?: boolean

        meta?: boolean
        control?: boolean

        shift?: boolean
        key: string
    }

    export let action: Function

    let handler = (e: KeyboardEvent) => {

        if (
            (keys.alt || keys.opt) &&
            !e.altKey
        ) return

        if (
            keys.shift &&
            !e.shiftKey
        ) return

        if (
            (keys.control || keys.meta) &&
            !(e.metaKey || e.ctrlKey)
        ) return

        if (keys.key != e.key)
            return

        e.preventDefault()
        action()
    }

</script>

<svelte:window on:keydown={handler}/>

<!-- // export const shortcut = (node: HTMLElement, params: any) => {
//     let handler: (e: KeyboardEvent) => void;
//     const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
//         removeHandler();
//         if (!params)
//             return;
//         handler = (e) => {
//             if ((!!params.alt != e.altKey) ||
//                 (!!params.shift != e.shiftKey) ||
//                 (!!params.control != (e.ctrlKey || e.metaKey)) ||
//                 params.code != e.code)
//                 return;
//             e.preventDefault();
//             params.callback ? params.callback() : node.click();
//         };
//         window.addEventListener('keydown', handler);
//     };
//     setHandler();
//     return {
//         update: setHandler,
//         destroy: removeHandler,
//     };
// }; -->