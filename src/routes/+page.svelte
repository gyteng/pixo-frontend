<script>
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import History from '$lib/components/History.svelte';
  import Sample from '$lib/components/Sample.svelte';
  import ImageToggle from '$lib/components/ImageToggle.svelte';
  import { ls } from '$lib/localStorage'
  
  let redeemCode = '';
  let loading = false;
  let hasFreeCode = true;

  function toGithub() {
    window.location = 'https://github.com/gyteng/pixo-frontend';
  }

  function handleKeyDownToGithub(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toGithub();
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleRedeem();
    }
  }

  async function getFreeCode() {
    try {
      const response = await fetch('/api/code/free', {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();
      if (result.success && !redeemCode) {
        redeemCode = result.code;
      }
    } catch (error) {
      throw new Error('Failed to fetch free code');
    }
  }
  
  async function handleRedeem() {
    try {
      loading = true;
      if (hasFreeCode || !redeemCode || !redeemCode.trim()) {
        await getFreeCode();
      }
      const params = new URLSearchParams();
      params.append('code', redeemCode.trim());
      const response = await fetch(`/api/code/status?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();
      if (result.success) {
        goto(`/img/${redeemCode.trim()}`);
      } else {
        redeemCode = '';
      }
    } catch (error) {
      redeemCode = '';
    } finally {
      hasFreeCode = false;
      loading = false;
    }
  }

  async function fetchSamples() {
    try {
      const response = await fetch('/api/sample');
      if (!response.ok) {
        throw new Error('网络错误');
      }
      const data = await response.json();
      sample.update(current => {
        return data?.value || [];
      });
      samples = $sample;
    } catch (err) {
      console.error('获取示例列表失败:', err);
    }
  }

  let showHistory = true;
  function handleImageToggle(event) {
    showHistory = event.detail.showHistory;
  }
  const sample = ls('sample_v0', []);
  let samples = [];

  onMount(() => {
    fetchSamples();
  });
</script>

<div class="github-icon"
  on:click={toGithub}
  on:keydown={handleKeyDownToGithub}
  tabindex="0"
  role="button"
  aria-label="GitHub Repository">
  <Icon icon="octicon:mark-github-16" width="16" height="16" />
</div>
<div class="container">
  <div class="title">Pixo</div>
  <div class="sub-title">基于 GPT-4o 的图片风格转换器</div>
  <div class="redeem-container">
    <div class="redeem-border"
         class:redeem-border-free-code={hasFreeCode}
         on:click={hasFreeCode ? handleRedeem : null}
         on:keydown={hasFreeCode ? handleRedeem : null}
         role="button"
         tabindex={hasFreeCode ? "0" : undefined}
    >
      <div class="input-group">
        {#if hasFreeCode}
          <div>开始转换</div>
        {:else}
          <input
            type="text" 
            tabindex="0"
            bind:value={redeemCode}
            on:keypress={handleKeyPress}
            placeholder="请输入兑换码"
            disabled={hasFreeCode}
          />
        {/if}
        <button on:click={handleRedeem}>
          {#if loading}
            <Icon color="#333" icon="svg-spinners:3-dots-fade" width="40" height="40" />
          {:else}
            <Icon color="#333" icon="tabler:chevron-right" width="40" height="40" />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <ImageToggle
    bind:showHistory={showHistory} 
    on:toggle={handleImageToggle} 
  />

  <div class="history-container">
    {#if showHistory}
      <History />
    {:else}
      <Sample bind:historyItems={samples}/>
    {/if}
  </div>
</div>

<style>
  .github-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #ffffff;
  }
  
  .container .title {
    user-select: none;
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .container .sub-title {
    user-select: none;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #666;
  }

  .redeem-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 500px;
    height: 120px;
    margin: 10px 0 20px 0;
  }

  .redeem-border {
    border-radius: 20px;
    border: 1px solid #ddd;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
    max-width: 360px;
    height: 105px;
    transition: all 0.3s ease-in-out;
  }

  .redeem-border-free-code {
    width: 150px;
    height: 65px;
    border-radius: 30px;
    cursor: pointer;
  }

  .redeem-border-free-code:hover {
    background-color: #f3f3f3;
  }
  
  .input-group {
    display: flex;
    margin: 1rem 0;
    justify-content: center;
    align-items: center;
  }
  
  .input-group > input {
    flex: 1;
    font-size: 1.2em;
    padding: 0.5rem;
    border: 0px;
    outline: none;
    border-radius: 4px 0 0 4px;
    width: 100%;
    color: #666;
  }

  .input-group > div {
    font-size: 1.2em;
    color: #4a4a4a;
    padding: 0 0 2px 10px;
  }

  .input-group > input:disabled {
    background-color: #FFF;
    cursor: pointer;
  }

  .input-group input::placeholder {
    color: #999;
  }
  
  button {
    padding: 0.3rem 1rem;
    width: 55px;
    height: 55px;
    background-color: #FFF;
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  button:hover {
    background-color: #EEE;
  }

  .redeem-border-free-code button {
    background-color: unset;
  }

  .redeem-border-free-code button:hover {
    background-color: unset;
  }

  .history-container {
    height: 280px;
  }
</style>
