import { signal } from '@preact/signals-react'
import { vscode } from './vscode'

type VectorOrEuler = [number, number, number]

interface CameraState {
  position: VectorOrEuler
  rotation: VectorOrEuler
}

interface State {
  camera?: CameraState
}

const context = signal({
  blobUrl: <string | undefined>undefined,
  glb: <any>null,
})

const cameraState = signal<CameraState | undefined>(undefined)

function setBlobUrl(url: string) {
  context.value = { ...context.value, blobUrl: url }
}

function setGlb(glb: any) {
  context.value = { ...context.value, glb }
}

function setCameraState(state?: CameraState) {
  cameraState.value = state
}

function activate() {
  const fn = (e: MessageEvent) => {
    switch (e.data?.type) {
      case 'glb': {
        const url = URL.createObjectURL(new Blob([e.data.blob as Uint8Array]))
        setBlobUrl(url)
        break
      }

      case 'restore-state': {
        // Reference @State 🡡 for structure
        const state: State = e.data.state || {}
        setCameraState(state.camera)
      }
    }
  }

  window.addEventListener('message', fn)
  vscode.postMessage({ type: 'ready' })

  cameraState.subscribe((camera) => {
    vscode.postMessage({ camera, type: 'save-state' })
  })

  function deactivate() {
    window.removeEventListener('message', fn)
  }

  return deactivate
}

export default context
export { cameraState, activate, setBlobUrl, setGlb, setCameraState }
