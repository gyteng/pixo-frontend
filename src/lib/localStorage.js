import { writable } from 'svelte/store';

/**
 * 创建一个与 localStorage 绑定的 Svelte store
 * @param {string} key - localStorage 的键名
 * @param {any} initialValue - 初始值（如果localStorage中没有值）
 * @returns {import('svelte/store').Writable<any>} - Svelte writable store
 */
export function ls(key, initialValue) {
  // 检查是否在浏览器环境
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  // 从 localStorage 获取存储的值，或使用初始值
  const storedValueStr = isBrowser ? localStorage.getItem(key) : null;
  const storedValue = storedValueStr ? JSON.parse(storedValueStr) : initialValue;

  // 创建 Svelte 的 writable store
  const store = writable(storedValue);
  
  // 当 store 值变化时，自动更新 localStorage
  if (isBrowser) {
    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}