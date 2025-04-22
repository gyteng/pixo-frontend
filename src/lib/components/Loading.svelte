<script>
  import Icon from '@iconify/svelte';
</script>

<div class="loading overlay">
  <Icon icon="svg-spinners:180-ring-with-bg" width="48" height="48" />
</div>

<style>
  
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
</style>