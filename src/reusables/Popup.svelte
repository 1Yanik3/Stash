

<main>
    <slot/>
</main>

<style lang="scss">
    main {
        position: fixed;

        $margin: 5em;
        $padding: 3em;

        width: calc(100% - #{$margin * 2} - #{$padding * 2});
        height: calc(100% - #{$margin * 2} - #{$padding * 2});
        margin: $margin;
        padding: $padding;


        left: 0;
        top: 0;

        background: hsl(0, 0%, 13%);
        border: 1px solid hsl(0, 0%, 50%);
    }
</style>