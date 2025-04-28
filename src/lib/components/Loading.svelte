<script>
  import Icon from '@iconify/svelte';
  export let loadingBackground = false;

  export let loadingText = '...';
</script>

<div class="loading overlay">
  <div class="icon-container">
    <div class="icon-wrapper" class:hidden={!loadingBackground}>
      <Icon icon="svg-spinners:180-ring-with-bg" width="48" height="48" />
    </div>
    <div class="icon-wrapper" class:hidden={loadingBackground}>
      <Icon icon="svg-spinners:180-ring" width="48" height="48" />
    </div>
  </div>
  <div>
    <p class="loading-text">{loadingText}</p>
  </div>
</div>

<style>
  .hidden {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .loading {
    padding: 20px;
    text-align: center;
    color: #666;
  }

  .loading.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
  }

  .icon-container {
    position: relative;
    width: 48px;
    height: 48px;
  }

  .icon-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>