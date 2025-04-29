<script>
  import Image from '$lib/components/Image.svelte';

  export let imageUrl;
  export let altText = "Original image";
  export let rotation = "-7deg";
</script>

<div class="image-container">
  <div class="image-wrapper" style="transform: rotate({rotation})">
    {#if imageUrl}
      <Image src={imageUrl} alt={altText} />
    {/if}
  </div>
</div>

<style>
  .image-container {
    position: absolute;
    top: 10px;
    right: 15px;
    width: 80px;
    height: 80px;
    z-index: 10;
    user-select: none;
  }
  
  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: white;
    padding: 3px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    transform-origin: top right; /* 设置变换原点为右上角 */
  }
  
  .image-wrapper:hover {
    transform: rotate(-3deg) scale(1.55) !important; /* 放大15%并回正 */
    box-shadow: 0 5px 10px rgba(0,0,0,0.2); /* 增强阴影效果 */
    z-index: 20; /* 确保悬停时在最上层 */
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>