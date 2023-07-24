import AnimationController from './animation-controller'
import type { ParsedGLTFResults } from '../../types'
import React from 'react'
import { signal } from '@preact/signals-react'
import { useGLTF } from '@react-three/drei'
import { vscode } from './vscode'

interface AppContext {
  blobUrl?: string
  controller?: AnimationController
  glb?: ParsedGLTFResults
  selectedObject?: string
}

const context = signal<AppContext>({})

function setBlobUrl(url: string) {
  context.value = { ...context.value, blobUrl: url }
}

function setGlb(glb: ParsedGLTFResults) {
  context.value = { ...context.value, glb }
}

function setController(controller: AnimationController) {
  context.value = { ...context.value, controller }
}

function setSelectedObject(selectedObject?: string) {
  context.value = { ...context.value, selectedObject }
}

function activate() {
  const fn = (e: MessageEvent) => {
    switch (e.data?.type) {
      case 'glb': {
        const url = URL.createObjectURL(new Blob([e.data.blob as Uint8Array]))
        setBlobUrl(url)

        return
      }

      case 'select': {
        setSelectedObject(e.data?.name)
      }
    }
  }

  window.addEventListener('message', fn)

  function deactivate() {
    window.removeEventListener('message', fn)
  }

  return deactivate
}

function useReadyContext(url: string) {
  const gltf = useGLTF(url) as ParsedGLTFResults

  React.useMemo(() => {
    const sceneNodes = []
    const { animations, nodes, scene } = gltf
    if (!gltf.__originalMaterials) {
      gltf.__originalMaterials = {}
    }

    // eslint-disable-next-line no-unused-labels
    DEBUG: console.log('gltf', gltf)

    for (const [name, properties] of Object.entries(nodes)) {
      if (properties.uuid === scene.uuid) {
        continue
      }

      const material = properties.material
      gltf.__originalMaterials[name] = material

      sceneNodes.push({
        material: {
          name: material?.name,
          type: material?.type,
        },
        name,
        type: properties.type,
      })
    }

    setGlb(gltf)
    animations.length &&
      setController(new AnimationController(animations, scene))

    vscode.postMessage({
      scene: { nodes: sceneNodes.sort((a, b) => a.name.localeCompare(b.name)) },
      type: 'scene',
    })
  }, [gltf])
}

export default context
export { activate, setSelectedObject, setBlobUrl, setGlb, useReadyContext }
