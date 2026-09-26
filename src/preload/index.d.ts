import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openMarkdownFile: () => Promise<{
        filePath: string
        content: string
      } | null>
    }
  }
}
