import { signal } from "@preact/signals-react";

const appearance = signal({
  wireframe: false
})

function toggleWireframe() {
  const enabled = appearance.value.wireframe
  appearance.value = {...appearance.value, wireframe: !enabled}
}

export default appearance
export { toggleWireframe }
