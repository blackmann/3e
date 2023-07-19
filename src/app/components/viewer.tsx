import {
  AnimationClip,
  BufferGeometry,
  DoubleSide,
  Euler,
  Material,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import cameraState, { setCameraState } from '../lib/camera'
import context, { setGlb } from '../lib/context'
import type { GLTF } from 'three-stdlib'
import React from 'react'
import appearance from '../lib/appearance'
import { vscode } from '../lib/vscode'

interface RenderMeshProps {
  url: string
}

interface RenderNode {
  animations: AnimationClip[]
  geometry?: BufferGeometry
  children?: RenderNode[]
  isMesh: boolean
  material: Material
  name: string
  parent?: Object3D
  position: Vector3
  rotation: Euler
  type: 'Mesh' | 'Object3D' | (string & {})
}

type GLTFResults = GLTF & {
  nodes: {
    [key: string]: RenderNode
  }
}

const normalMaterial = new MeshNormalMaterial({ side: DoubleSide })
const wireframeMaterial = new MeshBasicMaterial({
  color: '#f0f0f0',
  wireframe: true,
})
const basicMaterial = new MeshStandardMaterial({
  color: '#555',
  roughness: 1,
  side: DoubleSide,
})

interface ObjectRenderProps {
  name: string
  properties: RenderNode
  getMaterial: (name: string) => Material
}

function ObjectRender({ getMaterial, name, properties }: ObjectRenderProps) {
  const { x, y, z } = properties.position
  const position = [x, y, z] as const

  const { x: a, y: b, z: c } = properties.rotation
  const commonProps = {
    key: name,
    parent: properties.parent,
    position: position,
    rotation: new Euler(a, b, c),
  }

  switch (properties.type) {
    case 'SkinnedMesh':
    case 'Mesh': {
      return (
        <mesh
          {...commonProps}
          geometry={properties.geometry}
          material={getMaterial(name)}
        />
      )
    }

    case 'Object3D': {
      return <object3D {...commonProps} />
    }

    default: {
      DEBUG: console.warn(`type ${properties.type} unhandled`)
      DEBUG: console.log(properties)
      return null
    }
  }
}

function Mesh({ url }: RenderMeshProps) {
  const gltf = useGLTF(url) as GLTFResults
  const { nodes } = gltf
  const { wireframe, materialType } = appearance.value
  const materialsIndexRef = React.useRef<Record<string, Material>>({})

  const getMaterial = React.useCallback((name: string) => {
    if (wireframe) {
      return wireframeMaterial
    }

    switch (materialType) {
      case 'basic': {
        return basicMaterial
      }

      case 'basic-randomized': {
        if (!materialsIndexRef.current[name]) {
          materialsIndexRef.current[name] = new MeshStandardMaterial({
            color: randomColor(),
            roughness: 1,
            side: DoubleSide,
          })
        }

        return materialsIndexRef.current[name]
      }

      case 'textured': {
        nodes[name].material.side = DoubleSide
        return nodes[name].material
      }

      default:
        return normalMaterial
    }
  }, [wireframe, materialType])

  React.useEffect(() => {
    const sceneNodes = []
    const { nodes } = gltf

    DEBUG: console.log('gltf', gltf)

    for (const [name, properties] of Object.entries(nodes)) {
      if (!properties.isMesh) {
        continue
      }

      sceneNodes.push({
        material: {
          name: properties.material.name,
          type: properties.material.type,
        },
        name,
      })
    }

    setGlb(gltf)

    vscode.postMessage({
      scene: { nodes: sceneNodes.sort((a, b) => a.name.localeCompare(b.name)) },
      type: 'scene',
    })
  }, [gltf])

  const showLights =
    !wireframe && ['basic', 'basic-randomized'].includes(materialType)

  const showEnvironment = materialType === 'textured'

  return (
    <>
      <group>
        {Object.entries(nodes).map(([name, properties]) => {
          return (
            <ObjectRender key={name} {...{ getMaterial, name, properties }} />
          )
        })}
      </group>

      {showLights && (
        <>
          <ambientLight intensity={1} position={[0, 2, 0]} />
          <pointLight intensity={2} position={[-2, 4, 2]} />
          <pointLight intensity={1} position={[2, 5, -2]} />
        </>
      )}

      {showEnvironment && (
        <Environment preset={appearance.value.environmentPreset} />
      )}
    </>
  )
}

function _Delegate({ url }: RenderMeshProps) {
  const { camera } = useThree()
  const stateRestoredRef = React.useRef(false)

  React.useEffect(() => {
    const state = cameraState.peek()
    if (stateRestoredRef.current || !state) {
      return
    }

    const {
      position: [x, y, z],
      rotation: [a, b, c],
    } = state

    camera.rotation.set(a, b, c)
    camera.position.set(x, y, z)

    stateRestoredRef.current = true
  }, [camera])

  React.useEffect(() => {
    const interval = setInterval(() => {
      const { x, y, z } = camera.position
      const { x: a, y: b, z: c } = camera.rotation

      // maybe call this when a change actually occurs?
      setCameraState({ position: [x, y, z], rotation: [a, b, c] })
    }, 1000)

    return () => clearInterval(interval)
  }, [camera])

  return <Mesh url={url} />
}

function Viewer() {
  const url = context.value.blobUrl

  return (
    <Canvas>
      {url && <_Delegate url={url} />}

      <OrbitControls />
      <GizmoHelper>
        <GizmoViewport axisColors={['#ff004c', '#5fa600', '#0086ea']} />
      </GizmoHelper>
    </Canvas>
  )
}

const colors = ['#608871', '#a88398', '#9b768a', '#557c7d', '#929775']

function randomColor() {
  const i = Math.floor(Math.random() * colors.length)
  return colors[i]
}

export default Viewer
