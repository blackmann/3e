import { signal } from '@preact/signals-react'

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

export default context
export { setBlobUrl, setGlb }
