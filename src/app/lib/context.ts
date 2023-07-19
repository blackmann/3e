import { signal } from '@preact/signals-react'
import { vscode } from './vscode'

const context = signal({
  blobUrl: <string | undefined>undefined,
  glb: <any>null,
})

function setBlobUrl(url: string) {
  context.value = { ...context.value, blobUrl: url }
}

function setGlb(glb: any) {
  context.value = { ...context.value, glb }
}

function activate() {
  const fn = (e: MessageEvent) => {
    if (e.data?.type !== 'glb') {
      return
    }

    const url = URL.createObjectURL(new Blob([e.data.blob as Uint8Array]))
    setBlobUrl(url)
  }

  window.addEventListener('message', fn)

  function deactivate() {
    window.removeEventListener('message', fn)
  }

  return deactivate
}

export default context
export { activate, setBlobUrl, setGlb }
