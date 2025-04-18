<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';

  let heic2any = null;

  export let uploading = false;
  export let previewUrl = null;
  export let code = '';
  export let selectedStyle = null;
  
  let selectedFile = null;
  let errorMessage = '';
  let isBrowser = false;
  const dispatch = createEventDispatcher();
  
  const maxImageSize = 1024;
  const imageQuality = 0.7;

  async function processFile(file) {
    if (!isBrowser || !heic2any) {
      return file;
    }
    // 检查文件类型是否为HEIC
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        // 转换HEIC为JPEG
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        
        // 创建新文件
        return new File(
          [jpegBlob], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg', lastModified: Date.now() }
        );
      } catch (error) {
        console.error('HEIC转换错误:', error);
        errorMessage = 'HEIC图片转换失败，请尝试其他格式';
        throw new Error('HEIC转换失败');
      }
    }
    // 不是HEIC，返回原始文件
    return file;
  }
  
  async function compressImage(file) {
    return new Promise(async (resolve) => {
      try {
        // 先处理可能的HEIC文件
        const processedFile = await processFile(file);
        
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          
          img.onload = () => {
            // 计算新尺寸
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxImageSize) {
                height = Math.round((height * maxImageSize) / width);
                width = maxImageSize;
              }
            } else {
              if (height > maxImageSize) {
                width = Math.round((width * maxImageSize) / height);
                height = maxImageSize;
              }
            }
            
            // 创建Canvas并绘制调整后的图像
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为Blob
            canvas.toBlob(
              (blob) => {
                // 为压缩后的Blob添加文件名属性
                const compressedFile = new File([blob], processedFile.name, {
                  type: processedFile.type,
                  lastModified: Date.now()
                });
                resolve(compressedFile);
                canvas.remove();
              },
              processedFile.type,
              imageQuality
            );
          };
          
          img.onerror = () => {
            // 图片加载失败，直接返回处理过的文件
            resolve(processedFile);
          };
        };
      } catch (error) {
        console.error('压缩图片失败:', error);
        // 出错时返回原文件
        resolve(file);
      }
    });
  }

  async function createPreviewUrl(file) {
    if (!isBrowser) return null;
    
    try {
      // 检查是否为HEIC文件并需要转换
      if ((file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) && heic2any) {
        try {
          // 转换HEIC为JPEG用于预览
          const jpegBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          return URL.createObjectURL(jpegBlob);
        } catch (error) {
          console.error('HEIC转换预览错误:', error);
          errorMessage = 'HEIC图片预览失败';
          // 如果转换失败，尝试直接显示（可能不支持）
          return URL.createObjectURL(file);
        }
      } else {
        // 非HEIC文件直接创建URL
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('创建预览URL错误:', error);
      return null;
    }
  }

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      previewUrl = await createPreviewUrl(file);
      dispatch('preview', { url: previewUrl });
    }
    if (selectedFile) {
      uploadImage();
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  }
  
  function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  }
  
  async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      selectedFile = files[0];
      previewUrl = await createPreviewUrl(selectedFile);
      dispatch('preview', { url: previewUrl });
    } else {
      errorMessage = '请拖放图片文件';
    }
    if (selectedFile) {
      uploadImage();
    }
  }

  function addHistory(code) {
    if (!localStorage) {
      return;
    }
    const history = JSON.parse(localStorage.getItem('history_v0')) || [];
    if (history.includes(code)) {
      history.splice(history.indexOf(code), 1);
    }
    if (history.length >= 9) {
      history.pop();
    }
    history.unshift(code);
    localStorage.setItem('history_v0', JSON.stringify(history));
  }

  async function handlePaste(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        selectedFile = file;
        previewUrl = await createPreviewUrl(file);
        dispatch('preview', { url: previewUrl });
        break;
      }
    }
    if (selectedFile) {
      uploadImage();
    }
  }
  
  async function uploadImage() {
    if (!selectedFile) {
      console.error('没有选择文件');
      return;
    }
    
    try {
      uploading = true;
      errorMessage = '';
      dispatch('uploadstart');
      
      const formData = new FormData();
      formData.append('image', await compressImage(selectedFile));
      formData.append('style', selectedStyle);

      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Code': code
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传失败');
      }
      addHistory(code);
      dispatch('uploadsuccess');
    } catch (error) {
      errorMessage = `上传失败: ${error.message}`;
      dispatch('uploaderror', { error: errorMessage });
    } finally {
      uploading = false;
      dispatch('uploadend');
    }
  }
  
  onMount(async () => {
    isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      try {
        const module = await import('heic2any');
        heic2any = module.default;
        window.addEventListener('paste', handlePaste);
      } catch (error) {
        console.error('无法加载 heic2any:', error);
      }
    }
  });

  onDestroy(() => {
    if (previewUrl && isBrowser) {
      URL.revokeObjectURL(previewUrl);
    }
    if (isBrowser) {
      window.removeEventListener('paste', handlePaste);
    }
  });
</script>

<div class="upload-section">
  {#if !uploading && !previewUrl}
    <div 
      class="drop-area"
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      role="button"
      aria-label="Drag and drop your image here"
      tabindex="0"
    >
      <div class="file-input-wrapper">
        <label for="image-upload" class="file-label">
          <Icon icon="lucide:plus" width="48" height="48" />
          选择、拖拽或粘贴图片文件
          <input 
            type="file" 
            id="image-upload" 
            accept="image/*" 
            on:change={handleFileSelect} 
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  {/if}
  
  {#if previewUrl}
    <div class="preview-container">
      <img src={previewUrl} alt="预览图" class="image-preview" />
    </div>
  {/if}
</div>

<style>
  .upload-section {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .file-input-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .file-label {
    padding: 20px 25px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 4px dashed #ccc;
    border-radius: 8px;
  }

  .file-label:hover {
    background-color: #f0f0f0;
  }
  
  input[type="file"] {
    display: none;
  }
  
  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .image-preview {
    width: 100%;
    max-width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }

</style>