import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { signal } from '@preact/signals-react'

type MaterialType = 'normal' | 'basic' | 'basic-randomized' | 'textured'

const appearance = signal({
  environmentPreset: <PresetsType>'city',
  materialType: <MaterialType>'textured',
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

export default appearance
export { selectMaterialType, setEnvironmentPreset, toggleWireframe }
export type { MaterialType }
