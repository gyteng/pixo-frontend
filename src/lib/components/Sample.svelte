<script>
  import { onMount } from 'svelte';
  // import { ls } from '$lib/localStorage'
  import HistoryImage from '$lib/components/HistoryImage.svelte';
  
  export let historyItems = [];
  let windowWidth;
  let windowHeight;
  $: maxItems = getMaxItemsByWindowSize(windowWidth, windowHeight);
  $: placeholders = Array(maxItems).fill(null);

  function getMaxItemsByWindowSize(width, height) {
    if (!width || !height) return 6;
    let result = 1;
    if (width >= 960) {
      result = result * 4;
    } else {
      result = result * 3;
    }
    if (height >= 750) {
      result = result * 3;
    } else {
      result = result * 2;
    }
    return result;
  }

  // const history = ls('history_v0', []);
  
  onMount(() => {
    // historyItems = $history;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    const handleResize = () => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="history-container">
  <div class="history-grid">
    {#each placeholders as _, index}
      <div class="history-item {!historyItems[index] ? 'empty-item' : ''}"
        on:click={() => {
          window.location.href = `/img/${historyItems[index].code}`;
        }}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            window.location.href = `/img/${historyItems[index].code}`;
          }
        }}
        aria-label="点击查看历史记录图片"
        tabindex="0"
        role="button">
        {#if historyItems[index]}
          <HistoryImage
            src={`/api/image?usage=ai_generated&code=${historyItems[index].code}`}
            alt="历史记录图片 {index + 1}"
            width="100%"
            height="100%"
          ></HistoryImage>
          <div class="history-item-name">{historyItems[index].name}</div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .history-container {
    width: 100%;
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

  @media (min-width: 960px) {
    .history-container {
      max-width: 480px;
    }
  }
  
  .history-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 0.5rem;
    margin-top: 1rem;
  }

  @media (min-width: 960px) {
    .history-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .history-item {
    position: relative;
    aspect-ratio: 1/1;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .history-item-name {
    position: absolute;
    right: 3px;
    bottom: 3px;
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.8);
    padding: 2px 5px;
    border-radius: 7px;
    font-size: 0.8em;
  }

  .history-item.empty-item {
    box-shadow: none;
    cursor: default;
  }
  
  .history-item {
    transition: transform 0.2s ease-in-out;
  }

  .history-item:hover {
    transform: scale(1.05);
  }
</style>