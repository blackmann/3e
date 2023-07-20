import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  DoubleSide,
  Group,
  Material,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
} from 'three'
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
import AnimationController from '../lib/animation-controller'

interface RenderMeshProps {
  url: string
}

type ParsedObject3D = Object3D & { material?: Material }

type GLTFResults = GLTF & {
  nodes: {
    [key: string]: ParsedObject3D
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
  scene: Group
  getMaterial: (name: string) => Material | undefined
  nodes: Record<string, ParsedObject3D>
}

function ObjectRender({ getMaterial, scene, nodes }: ObjectRenderProps) {
  const { scene: appScene } = useThree()

  React.useEffect(() => {
    Object.values(nodes).forEach((node) => {
      node.material = getMaterial(node.name)
    })

    appScene.add(scene)

    return () => {
      appScene.remove(scene)
    }
  }, [getMaterial, scene])

  return null
}

function Mesh({ url }: RenderMeshProps) {
  const gltf = useGLTF(url) as GLTFResults
  const { nodes, scene } = gltf
  const { wireframe, materialType } = appearance.value

  const originalMaterialsIndexRef = React.useRef<
    Record<string, Material | undefined>
  >({})
  const materialsIndexRef = React.useRef<Record<string, Material>>({})
  const mixerRef = React.useRef<THREE.AnimationMixer>()

  const getMaterial = React.useCallback(
    (name: string) => {
      if (!originalMaterialsIndexRef.current[name]) {
        originalMaterialsIndexRef.current[name] = nodes[name].material
      }

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
          return originalMaterialsIndexRef.current[name]
        }

        default:
          return normalMaterial
      }
    },
    [wireframe, materialType, nodes]
  )

  React.useEffect(() => {
    const sceneNodes = []

    DEBUG: console.log('gltf', gltf)

    for (const [name, properties] of Object.entries(nodes)) {
      if (properties.uuid === scene.uuid) {
        continue
      }

      const material = originalMaterialsIndexRef.current[name]

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

    vscode.postMessage({
      scene: { nodes: sceneNodes.sort((a, b) => a.name.localeCompare(b.name)) },
      type: 'scene',
    })
  }, [nodes, scene])

  const showLights =
    !wireframe && ['basic', 'basic-randomized'].includes(materialType)

  const showEnvironment = materialType === 'textured'

  return (
    <>
      <ObjectRender getMaterial={getMaterial} nodes={nodes} scene={scene} />

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

function _Delegate({ url, controller }: RenderMeshProps & Props) {
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

  useFrame(({}, delta) => {
    controller?.forward(delta)
  })

  return <Mesh url={url} />
}

interface Props {
  controller?: AnimationController
}

function Viewer({ controller }: Props) {
  const url = context.value.blobUrl

  return (
    <Canvas>
      {url && <_Delegate controller={controller} url={url} />}

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
