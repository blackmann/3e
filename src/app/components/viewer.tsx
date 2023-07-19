import {
  AnimationClip,
  BufferGeometry,
  DoubleSide,
  Euler,
  Material,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
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

interface MeshProps {
  url: string
}

type GLTFResults = GLTF & {
  nodes: {
    [key: string]: {
      material: Material
      animations: AnimationClip[]
      isMesh: boolean
      geometry: BufferGeometry
      position: Vector3
      rotation: Euler
    }
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

function Mesh({ url }: MeshProps) {
  const gltf = useGLTF(url) as GLTFResults
  const { camera } = useThree()
  const { nodes } = gltf
  const { wireframe, materialType } = appearance.value
  const materialsIndexRef = React.useRef<Record<string, Material>>({})

  const stateRestoredRef = React.useRef(false)

  function getMaterial(name: string) {
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
  }

  React.useEffect(() => {
    if (stateRestoredRef.current || !cameraState.value) {
      return
    }

    const {
      position: [x, y, z],
      rotation: [a, b, c],
    } = cameraState.value

    camera.rotation.set(a, b, c)
    camera.position.set(x, y, z)

    stateRestoredRef.current = true
  }, [camera, cameraState.value])

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
      scene: { nodes: sceneNodes },
      type: 'scene',
    })

    const interval = setInterval(() => {
      const { x, y, z } = camera.position
      const { x: a, y: b, z: c } = camera.rotation
      setCameraState({ position: [x, y, z], rotation: [a, b, c] })
    }, 1000)

    return () => clearInterval(interval)
  }, [gltf, camera])

  const showLights =
    !wireframe && ['basic', 'basic-randomized'].includes(materialType)

  const showEnvironment = materialType === 'textured'

  return (
    <>
      <group>
        {Object.entries(nodes).map(([name, properties]) => {
          if (!properties.geometry) {
            return null
          }

          const { x, y, z } = properties.position
          const position = [x, y, z] as const

          const { x: a, y: b, z: c } = properties.rotation
          return (
            <mesh
              geometry={properties.geometry}
              key={name}
              material={getMaterial(name)}
              position={position}
              rotation={[a, b, c]}
            ></mesh>
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

function Viewer() {
  const url = context.value.blobUrl

  return (
    <Canvas>
      {url && <Mesh url={url} />}

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
