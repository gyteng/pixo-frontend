<script>
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import History from '$lib/components/History.svelte';
  
  let redeemCode = '';
  let message = '';
  let loading = false;

  function autofocus(node) {
    node.focus();
  }

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
    } catch (error) {}
  }
  
  async function handleRedeem() {
    if (!redeemCode) {
      message = '请输入兑换码';
      return;
    }
    
    message = `正在处理兑换码: ${redeemCode}`;
    loading = true;
    try {
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
        message = '兑换成功！';
        goto(`/img/${redeemCode.trim()}`);
      } else {
        message = `兑换失败: ${result.error}`;
      }
    } catch (error) {
      message = `兑换失败: ${error}`;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    getFreeCode();
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
  <div class="redeem-container">
    <div class="input-group">
      <input 
        type="text" 
        tabindex="0"
        bind:value={redeemCode}
        use:autofocus
        on:keypress={handleKeyPress}
        placeholder="请输入兑换码"
      />
      <button on:click={handleRedeem}>
        {#if loading}
          <Icon color="#333" icon="svg-spinners:3-dots-fade" width="40" height="40" />
        {:else}
          <Icon color="#333" icon="tabler:chevron-right" width="40" height="40" />
        {/if}
      </button>
    </div>
  </div>
  <div class="history-container">
    <History />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    position: relative;
  }

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

  .redeem-container {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    max-width: 500px;
    /* margin: 0 0 40vh 0; */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .input-group {
    display: flex;
    margin: 1rem 0;
  }
  
  .input-group input {
    flex: 1;
    font-size: 1.2em;
    padding: 0.5rem;
    border: 0px;
    outline: none;
    border-radius: 4px 0 0 4px;
    color: #666;
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

  .history-container {
    height: 280px;
  }
</style>
