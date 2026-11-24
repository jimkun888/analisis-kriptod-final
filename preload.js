const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nativeGet', (url) => ipcRenderer.invoke('get', url));
