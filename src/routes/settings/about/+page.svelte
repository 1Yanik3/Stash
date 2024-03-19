<div class="wrapper">
  <main>
    <div class="details">
      <img src="/icons/web/icon-512-maskable.png" alt="" />
      <b>Stash</b>
      <span>By <a href="https://ant.lgbt/">ConfusedAnt</a></span>
    </div>

    <p class="description">
      A featureful tag based library to <br /> organise your media collections
    </p>
  </main>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    main {
      display: flex;
      flex-direction: column;
      align-items: center;

      .details {
        display: grid;
        grid-template-columns: auto 1fr;

        img {
          height: 4em;
          border-radius: 0.65em;
          grid-row: span 2;
          margin-right: 0.75em;
        }

        b {
          font-size: 1.5em;
        }
      }
    }
  }
</style>
