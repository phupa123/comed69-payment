/**
 * Universal Multi-Provider Image & File Uploader + File Management Engine
 * Supports:
 * 1. ImgBB (Free, Instant, 32MB limit, no expiration)
 * 2. Cloudinary (Direct Unsigned / Preset / API Key & Delete Management)
 * 3. FreeImage.host API (Free image host, permanent)
 * 4. Catbox.moe (Free, permanent file & image host, no account required)
 * 
 * Features:
 * - Automatic Failover (ลองเจ้าสำรองอัตโนมัติหากเจ้าแรกมีปัญหา)
 * - File History & Management System (บันทึกประวัติไฟล์ ดึงไฟล์ ดาวน์โหลด และสั่งลบไฟล์)
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'COMED_MULTI_STORAGE_CONFIG_V1';
  const FILES_LOG_KEY = 'COMED_UPLOADED_FILES_CATALOG_V1';

  // Default keys and fallbacks
  const DEFAULT_CONFIG = {
    activeProvider: 'auto', // 'auto' | 'imgbb' | 'cloudinary' | 'freeimage' | 'catbox'
    
    // 1. ImgBB API Key
    imgbbApiKey: localStorage.getItem('COMED_IMGBB_KEY') || '6d207e02198a847aa5ad8ac504ff3463',

    // 2. Cloudinary Config
    cloudinaryCloudName: localStorage.getItem('COMED_CLOUDINARY_NAME') || 'demo',
    cloudinaryUploadPreset: localStorage.getItem('COMED_CLOUDINARY_PRESET') || 'docs_upload_example_preset',
    cloudinaryApiKey: localStorage.getItem('COMED_CLOUDINARY_API_KEY') || '',
    cloudinaryApiSecret: localStorage.getItem('COMED_CLOUDINARY_API_SECRET') || '',

    // 3. FreeImage API Key
    freeimageApiKey: localStorage.getItem('COMED_FREEIMAGE_KEY') || '6d207e02198a847aa5ad8ac504ff3463',

    // 4. Catbox Userhash
    catboxUserHash: localStorage.getItem('COMED_CATBOX_HASH') || ''
  };

  class MultiCloudUploader {
    constructor() {
      this.config = this.loadConfig();
      this.fileCatalog = this.loadFileCatalog();
    }

    loadConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
      } catch (e) {
        return { ...DEFAULT_CONFIG };
      }
    }

    saveConfig(newCfg) {
      this.config = { ...this.config, ...newCfg };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }

    loadFileCatalog() {
      try {
        const saved = localStorage.getItem(FILES_LOG_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    saveFileCatalog() {
      localStorage.setItem(FILES_LOG_KEY, JSON.stringify(this.fileCatalog.slice(0, 500)));
    }

    addToFileCatalog(record) {
      this.fileCatalog.unshift(record);
      this.saveFileCatalog();
    }

    getAllFiles() {
      return this.fileCatalog;
    }

    deleteFromCatalog(fileId) {
      this.fileCatalog = this.fileCatalog.filter(f => f.id !== fileId);
      this.saveFileCatalog();
    }

    /**
     * Upload an image file with multi-provider failover
     * @param {File|Blob|string} fileInput - File object or Base64 DataURL
     * @param {Object} options - { onProgress: function(percent, statusText), preferredProvider: string, customName: string }
     * @returns {Promise<{url: string, provider: string, publicId: string, success: boolean}>}
     */
    async upload(fileInput, options = {}) {
      const onProgress = options.onProgress || (() => {});
      const preferred = options.preferredProvider || this.config.activeProvider || 'auto';
      const fileName = options.customName || (fileInput.name ? fileInput.name : ('file_' + Date.now()));

      let fileObj = fileInput;
      let base64Clean = '';

      // Convert Base64 DataURL to File if needed
      if (typeof fileInput === 'string' && fileInput.startsWith('data:')) {
        base64Clean = fileInput.split(',')[1] || fileInput;
        fileObj = this.dataURLtoFile(fileInput, 'upload_' + Date.now() + '.png');
      }

      let providers = [];
      if (preferred !== 'auto') {
        providers.push(preferred);
      }
      
      const allList = ['imgbb', 'freeimage', 'catbox', 'cloudinary'];
      for (const p of allList) {
        if (!providers.includes(p)) providers.push(p);
      }

      let lastError = null;

      for (const provider of providers) {
        try {
          onProgress(25, `กำลังเชื่อมต่อ ${this.getProviderName(provider)}...`);
          let uploadResult = null;

          if (provider === 'imgbb') {
            uploadResult = await this.uploadToImgBB(fileObj, base64Clean);
          } else if (provider === 'freeimage') {
            uploadResult = await this.uploadToFreeImage(fileObj, base64Clean);
          } else if (provider === 'catbox') {
            uploadResult = await this.uploadToCatbox(fileObj);
          } else if (provider === 'cloudinary') {
            uploadResult = await this.uploadToCloudinary(fileObj);
          }

          if (uploadResult && uploadResult.url) {
            onProgress(100, `อัปโหลดสำเร็จผ่าน ${this.getProviderName(provider)}!`);

            // Save to File Catalog for Full Management
            const fileItem = {
              id: 'FILE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              name: fileName,
              url: uploadResult.url,
              provider: provider,
              publicId: uploadResult.publicId || '',
              deleteToken: uploadResult.deleteToken || '',
              size: fileObj.size || 0,
              type: fileObj.type || 'image/png',
              uploadedAt: new Date().toLocaleString('th-TH')
            };
            this.addToFileCatalog(fileItem);

            return {
              url: uploadResult.url,
              provider: provider,
              publicId: uploadResult.publicId || '',
              fileItem: fileItem,
              success: true
            };
          }
        } catch (err) {
          console.warn(`[MultiUploader] Provider ${provider} failed:`, err);
          lastError = err;
          onProgress(40, `${this.getProviderName(provider)} ไม่ตอบสนอง กำลังสลับตัวสำรอง...`);
        }
      }

      throw new Error("ไม่สามารถอัปโหลดไฟล์ผ่านบริการใดๆ ได้: " + (lastError?.message || "Unknown error"));
    }

    /**
     * 1. ImgBB Upload
     */
    async uploadToImgBB(fileObj, base64Clean) {
      const apiKey = this.config.imgbbApiKey || '6d207e02198a847aa5ad8ac504ff3463';
      const formData = new FormData();
      if (base64Clean) {
        formData.append('image', base64Clean);
      } else {
        formData.append('image', fileObj);
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.data && json.data.url) {
        return {
          url: json.data.display_url || json.data.url,
          publicId: json.data.id || '',
          deleteToken: json.data.delete_url || ''
        };
      }
      throw new Error(json?.error?.message || "ImgBB upload rejected");
    }

    /**
     * 2. FreeImage.host API
     */
    async uploadToFreeImage(fileObj, base64Clean) {
      const apiKey = this.config.freeimageApiKey || '6d207e02198a847aa5ad8ac504ff3463';
      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('action', 'upload');
      formData.append('format', 'json');

      if (base64Clean) {
        formData.append('source', base64Clean);
      } else {
        formData.append('source', fileObj);
      }

      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.image && json.image.url) {
        return {
          url: json.image.display_url || json.image.url,
          publicId: json.image.name || ''
        };
      }
      throw new Error(json?.error?.message || "FreeImage upload rejected");
    }

    /**
     * 3. Catbox.moe API
     */
    async uploadToCatbox(fileObj) {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      if (this.config.catboxUserHash) {
        formData.append('userhash', this.config.catboxUserHash);
      }
      formData.append('fileToUpload', fileObj);

      const targetUrl = 'https://corsproxy.io/?url=' + encodeURIComponent('https://catbox.moe/user/api.php');
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: formData
      });

      const text = (await response.text()).trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        return {
          url: text.replace('http://', 'https://'),
          publicId: text.split('/').pop()
        };
      }
      throw new Error("Catbox response error: " + text);
    }

    /**
     * 4. Cloudinary Unsigned Upload
     */
    async uploadToCloudinary(fileObj) {
      const cloudName = this.config.cloudinaryCloudName || 'demo';
      const preset = this.config.cloudinaryUploadPreset || 'docs_upload_example_preset';
      
      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('upload_preset', preset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.secure_url) {
        return {
          url: json.secure_url,
          publicId: json.public_id || ''
        };
      }
      throw new Error(json?.error?.message || "Cloudinary upload rejected");
    }

    /**
     * Delete File Operation
     */
    async deleteFile(fileItem) {
      if (!fileItem) return false;

      // 1. If Cloudinary with API Credentials
      if (fileItem.provider === 'cloudinary' && this.config.cloudinaryApiKey && this.config.cloudinaryApiSecret && fileItem.publicId) {
        try {
          const timestamp = Math.round(new Date().getTime() / 1000);
          const cloudName = this.config.cloudinaryCloudName;
          const apiKey = this.config.cloudinaryApiKey;
          const apiSecret = this.config.cloudinaryApiSecret;

          const toSign = `public_id=${fileItem.publicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = await this.sha1(toSign);

          const formData = new FormData();
          formData.append('public_id', fileItem.publicId);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp);
          formData.append('signature', signature);

          await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
            method: 'POST',
            body: formData
          });
        } catch (e) {
          console.warn("Cloudinary delete error:", e);
        }
      }

      // Remove from catalog
      this.deleteFromCatalog(fileItem.id);
      return true;
    }

    async sha1(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    getProviderName(p) {
      switch (p) {
        case 'imgbb': return 'ImgBB API';
        case 'freeimage': return 'FreeImage.host API';
        case 'catbox': return 'Catbox.moe';
        case 'cloudinary': return 'Cloudinary CDN';
        default: return 'Auto Smart Cloud';
      }
    }

    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
  }

  // Expose global instance
  window.MultiCloudUploader = new MultiCloudUploader();

})(window);
