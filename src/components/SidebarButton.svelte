<script lang="ts">
    import type { Group } from 'src/types'

    import { mdiPound } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import { page } from '$app/stores'

    export let group: Group | null = null
    export let target: Group | null = null

    export let icon: string = mdiPound
    export let active: boolean | null = null
    export let count: number | null = null
    export let indent: number = 0
</script>

<a href={group && target ? `?c=${(new URL($page.url)).searchParams.get("c") || 1}&g=${target.id}` : ""}
style={`padding-left: ${0.75 + indent}em`}
class={active || (group && target && group.id == target.id) ? "active" : ""}
on:click={() => {

    if (active != null) {
        // is a tag button
        active = !active
    }
    else {
        // is a group button
        group = target
    }

}}
>

    <div class="section">

        <!-- @ts-ignore -->
        <div class="spacer"><Icon path={icon} size={"1.25em"}/></div>
        <span><slot/></span>

    </div>

    {#if count != null}
        <div class="section" style="filter: opacity(0.6)">

            <span>{count}</span>

        </div>
    {/if}

</a>

<style lang="scss">
    a {
        font-weight: 200;
        text-decoration: none;

        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0.5em 0.75em;
        margin-right: 1px;

        transition: background 150ms;

        &:hover {
            background: hsl(0, 0%, 22%);
        }
        &.active {
            background: hsl(0, 0%, 26%);
        }

        .section {
            display: flex;
            align-items: center;

            .spacer { margin-right: 0.35em }
            span { font-weight: 200 }
        }
    }
</style>