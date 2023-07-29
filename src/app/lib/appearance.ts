import type {
  Appearance,
  ExtensionState,
  MaterialType,
  TimeUnit,
} from '../../types'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { signal } from '@preact/signals-react'
import { vscode } from './vscode'

const appearance = signal<Appearance>({
  environmentPreset: 'city',
  materialType: 'normal',
  timeUnit: 'ms',
  wireframe: false,
})

function toggleWireframe() {
  const enabled = appearance.value.wireframe
  appearance.value = { ...appearance.value, wireframe: !enabled }
}

function selectMaterialType(t: MaterialType) {
  appearance.value = { ...appearance.value, materialType: t }
}

function setEnvironmentPreset(p: PresetsType) {
  appearance.value = { ...appearance.value, environmentPreset: p }
}

function alternateTimeUnit() {
  const unit: TimeUnit = appearance.peek().timeUnit === 's' ? 'ms' : 's'

  appearance.value = { ...appearance.value, timeUnit: unit }
}

function activate() {
  const fn = (e: MessageEvent) => {
    if (e.data.type === 'restore-state') {
      const state: ExtensionState = e.data.state
      if (state?.appearance) {
        appearance.value = { ...appearance.value, ...state.appearance }
      }
    }

    appearance.subscribe((value) => {
      vscode.postMessage({ appearance: value, type: 'save-state' })
    })
  }

  window.addEventListener('message', fn)

  return () => window.removeEventListener('message', fn)
}

export default appearance
export {
  activate,
  alternateTimeUnit,
  selectMaterialType,
  setEnvironmentPreset,
  toggleWireframe,
}
export type { MaterialType }
