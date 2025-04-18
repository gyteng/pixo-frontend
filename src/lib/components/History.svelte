<script>
  import { onMount } from 'svelte';
  
  let historyItems = [];
  const maxItems = 6;
  const placeholders = Array(maxItems).fill(null);
  
  onMount(() => {
    try {
      const historyData = localStorage.getItem('history_v0');
      if (historyData) {
        const parsedData = JSON.parse(historyData);
        historyItems = Array.isArray(parsedData) ? parsedData.slice(0, maxItems) : [];
        console.log('历史记录:', historyItems);
      }
    } catch (error) {
      console.error('读取历史记录失败:', error);
      historyItems = [];
    }
  });
  
  function handleImageError(event) {
    if (event.target.src.includes('ai_generated')) {
      event.target.src = event.target.src.replace('ai_generated', 'user_uploaded');
    }
  }
</script>

<div class="history-container">
  <div class="history-grid">
    {#each placeholders as _, index}
      <div class="history-item {!historyItems[index] ? 'empty-item' : ''}">
        {#if historyItems[index]}
          <img 
            src="/api/image?usage=ai_generated&code={historyItems[index]}" 
            alt="历史记录图片 {index + 1}" 
            on:error={handleImageError}
            on:click={() => {
              window.location.href = `/img/${historyItems[index]}`;
            }}
          />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .history-container {
    width: 100%;
    /* padding: 1rem; */
    margin: 15px;
    max-width: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 720px) {
    .history-container {
      max-width: 280px;
    }
  }
  
  .history-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .history-item {
    aspect-ratio: 1/1;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .history-item.empty-item {
    box-shadow: none;
    cursor: default;
  }
  
  .history-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease-in-out;
  }
  
  .history-item:hover img {
    transform: scale(1.05);
  }
</style>