import { processImage } from './processor.js';

export class UploadManager {
  constructor() {
    this.files = [];
    this.activeIdx = 0;
    this.onFilesChanged = null;
    // Mirrors the current slider values so addFiles always processes at the active grid size
    this.currentSettings = {
      gridSize: 16,
      contrast: 0,
      maxColors: 8,
      bgTolerance: 40,
      squareMode: false
    };
  }

  setupUI(dropZoneEl, fileInputEl, fileListEl, errorEl) {
    this.dropZoneEl = dropZoneEl;
    this.fileInputEl = fileInputEl;
    this.fileListEl = fileListEl;
    this.errorEl = errorEl;

    dropZoneEl.addEventListener('click', () => fileInputEl.click());
    fileInputEl.addEventListener('change', (e) => {
      if (e.target.files.length) this.addFiles(Array.from(e.target.files));
      fileInputEl.value = '';
    });

    dropZoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZoneEl.classList.add('drag');
    });
    dropZoneEl.addEventListener('dragleave', () => dropZoneEl.classList.remove('drag'));
    dropZoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneEl.classList.remove('drag');
      if (e.dataTransfer.files.length) this.addFiles(Array.from(e.dataTransfer.files));
    });
  }

  addFiles(newFiles) {
    this.errorEl.textContent = '';
    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        this.errorEl.textContent = 'ERR: "' + file.name + '" NOT SUPPORTED';
        return;
      }
      if (this.files.find(f => f.name === file.name && f.size === file.size)) return;

      const fileObj = {
        name: file.name,
        size: file.size,
        dataUrl: null,
        pixelData: null,
        thumbnail: null,
        gridW: null,
        gridH: null,
        status: 'pending'
      };
      this.files.push(fileObj);
      const idx = this.files.length - 1;

      const reader = new FileReader();
      reader.onload = (e) => {
        fileObj.dataUrl = e.target.result;
        // Use the active settings so pixelData gridSize matches previewManager.gridSize
        this.processFile(idx, { ...this.currentSettings });
      };
      reader.onerror = () => {
        fileObj.status = 'err';
        this.render();
      };
      reader.readAsDataURL(file);
    });
    this.render();
  }

  async processFile(idx, settings = {}) {
    const fileObj = this.files[idx];
    const gridSize = settings.gridSize || 16;
    const contrast = settings.contrast || 0;
    const maxColors = settings.maxColors || 8;
    const bgTolerance = settings.bgTolerance != null ? settings.bgTolerance : 40;
    const squareMode = settings.squareMode || false;

    // Tag each call so stale results from a superseded gridSize are discarded
    const token = Symbol();
    fileObj._processToken = token;

    try {
      const result = await processImage(fileObj.dataUrl, gridSize, contrast, maxColors, bgTolerance, squareMode);

      // Discard if a newer processFile call superseded this one
      if (fileObj._processToken !== token) return;

      fileObj.pixelData = result.pixelData;
      fileObj.thumbnail = result.thumbnail;
      fileObj.gridW = result.gridW;
      fileObj.gridH = result.gridH;
      fileObj.status = 'ok';
      this.render();
      if (this.onFilesChanged) this.onFilesChanged();
    } catch (e) {
      if (fileObj._processToken !== token) return;
      fileObj.status = 'err';
      this.render();
    }
  }

  reprocessAll(settings) {
    this.currentSettings = { ...settings };
    this.files.forEach((f, i) => {
      if (f.dataUrl) {
        f.status = 'pending';
        this.processFile(i, settings);
      }
    });
  }

  render() {
    if (!this.files.length) {
      this.fileListEl.innerHTML = '';
      return;
    }

    this.fileListEl.innerHTML = this.files.map((f, i) =>
      '<div class="file-item' + (i === this.activeIdx ? ' active' : '') + '" data-idx="' + i + '">' +
        (f.thumbnail ? '<img class="file-thumb" src="' + f.thumbnail + '">' : '<div class="file-thumb-empty"></div>') +
        '<div class="file-info">' +
          '<div class="fname">' + f.name + '</div>' +
          '<div class="fmeta">' + (f.size ? (f.size / 1024).toFixed(1) + ' KB' : '') + '</div>' +
        '</div>' +
        '<span class="file-status ' + f.status + '">' + (f.status === 'ok' ? 'READY' : f.status === 'err' ? 'ERR' : '...') + '</span>' +
        '<button class="file-remove" data-remove="' + i + '">DEL</button>' +
      '</div>'
    ).join('');

    this.fileListEl.querySelectorAll('.file-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.file-remove')) return;
        this.activeIdx = parseInt(el.dataset.idx);
        this.render();
        if (this.onFilesChanged) this.onFilesChanged();
      });
    });

    this.fileListEl.querySelectorAll('.file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.files.splice(parseInt(btn.dataset.remove), 1);
        if (this.activeIdx >= this.files.length) this.activeIdx = Math.max(0, this.files.length - 1);
        this.render();
        if (this.onFilesChanged) this.onFilesChanged();
      });
    });
  }

  getActiveFile() {
    return this.files[this.activeIdx];
  }

  getReadyFiles() {
    return this.files.filter(f => f.status === 'ok');
  }

  clear() {
    this.files = [];
    this.activeIdx = 0;
    this.render();
    this.errorEl.textContent = '';
  }
}
