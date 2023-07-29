import { CameraState, ExtensionState } from '../../types'
import { signal } from '@preact/signals-react'
import { vscode } from './vscode'

const cameraState = signal<CameraState | undefined>(undefined)

function setCameraState(state?: CameraState) {
  cameraState.value = state
}

function saveCameraState(camera: CameraState) {
  vscode.postMessage({ camera, type: 'save-state' })
}

function activate() {
  const fn = (e: MessageEvent) => {
    if (e.data?.type !== 'restore-state') {
      return
    }

    const state: ExtensionState = e.data.state || {}
    setCameraState(state.camera)
  }

  window.addEventListener('message', fn)

  function deactivate() {
    window.removeEventListener('message', fn)
  }

  return deactivate
}

export default cameraState

export { activate, setCameraState, saveCameraState }
