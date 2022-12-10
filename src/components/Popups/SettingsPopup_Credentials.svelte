<script lang="ts">
    import { ClusterType } from "@prisma/client"

    import Icon from "mdi-svelte"
    import * as icons from "@mdi/js"
    import SidebarButton from "../SidebarButton.svelte"

    console.log(Object.values(ClusterType))
</script>

<main>
    {#each new Array(2) as _}
        <div class="credential">
            <Icon path={icons[`mdi${"Key"}`]}/>
            <span>Test 123</span>
            <span><Icon path={icons.mdiTrashCanOutline} size={0.8}/></span>
        </div>
    {/each}
    <SidebarButton card icon={icons.mdiPlus}>
        Create new
    </SidebarButton>
</main>

<style lang="scss">
    main {
        display: grid;
        gap: 0.5em;

        .credential {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 0.5em;
            align-items: center;

            padding: 0.5em;
            background: hsl(0, 0%, 7%);
            border-radius: 0.6em;
            border: 1px solid hsl(0, 0%, 17%);
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

            span:last-child {
                cursor: pointer;

                transition: filter 200ms;
                &:hover {
                    filter: brightness(1.2);
                }
            }
        }
    }
</style>