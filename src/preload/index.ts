import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
/**
 * 安全桥。以后 React 页面想调用本地能力，比如保存文件、读取文件，都要通过它
 * 不能在页面开放node权限和使用fs
 * React 页面
  -> preload 暴露安全 API
  -> 主进程执行文件操作
  -> 返回结果给页面
 */
const api = {
  openMarkdownFile: () => ipcRenderer.invoke('markdown:openFile')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
