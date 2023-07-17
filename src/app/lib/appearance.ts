import { signal } from '@preact/signals-react'

type MaterialType =
  | 'normal'
  | 'basic'
  | 'basic-randomized'
  | 'textured'

const appearance = signal({
  materialType: <MaterialType>'basic-randomized',
  wireframe: false,
})

function toggleWireframe() {
  const enabled = appearance.value.wireframe
  appearance.value = { ...appearance.value, wireframe: !enabled }
}

function selectMaterialType(t: MaterialType) {
  appearance.value = { ...appearance.value, materialType: t }
}

export default appearance
export { selectMaterialType, toggleWireframe }
export type { MaterialType }
