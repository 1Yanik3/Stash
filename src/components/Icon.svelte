<script lang="ts">
    import { possibleIcons } from "$lib/possibleIcons";
    import { settings } from "../lib/stores";
    export let name: keyof typeof possibleIcons | null = null;
    export let nameAlt: string = "";
    const possibleIconsAlt = possibleIcons as any;

    export let size: number | string = 1;
    export let color: any = null;

    // size
    if (Number(size)) size = Number(size);

    const getStyles = () => {
        const styles = [];

        if (size !== null) {
            const width = typeof size === "string" ? size : `${size * 1.5}rem`;
            styles.push(["width", width]);
            styles.push(["height", width]);
        }

        if ($settings.eink) {
            styles.push(["filter", "#444"]);
        } else {
            // @ts-ignore
            styles.push(["fill", color !== null ? color : "currentColor"]);
        }

        return styles.reduce((cur, item) => {
            return `${cur} ${item[0]}:${item[1]};`;
        }, "");
    };

    // @ts-ignore
    $: style = getStyles(size, color);
</script>

{#if (name || nameAlt).startsWith("mdi")}
    <svg viewBox="0 0 24 24" {style}>
        <path d={possibleIconsAlt[name || nameAlt]} />
    </svg>
{:else if (name || nameAlt).startsWith("extra")}
    <svg style="position: absolute; width: 0; height: 0" aria-hidden="true">
        <symbol
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 135.5 135.5"
            id={name || nameAlt}
        >
            {@html possibleIconsAlt[name || nameAlt]}
        </symbol>
    </svg>
    <svg viewBox="0 0 20 20" {style}>
        <use xlink:href="#{name || nameAlt}" stroke="#FFF" />
    </svg>
{:else}
    INVALID ICON
{/if}

<style>
    svg {
        vertical-align: middle;
    }
</style>
