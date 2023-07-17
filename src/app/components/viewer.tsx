import {
  DoubleSide,
  Material,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
} from 'three'
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import appearance from '../lib/appearance'
import { vscode } from '../lib/vscode'

interface MeshProps {
  url: string
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
  const { nodes } = useGLTF(url)
  const { wireframe, materialType } = appearance.value
  const materialsIndexRef = React.useRef<Record<string, Material>>({})

  const getMaterial = React.useCallback(
    (name) => {
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
    },
    [wireframe, materialType]
  )

  React.useEffect(() => {
    const sceneNodes = []

    for (const [name, properties] of Object.entries(nodes)) {
      if (properties.type !== 'Mesh') {
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

    vscode.postMessage({
      scene: { nodes: sceneNodes },
      type: 'scene',
    })
  }, [nodes])

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
  const [url, setUrl] = React.useState<string>()

  React.useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data?.type === 'glb') {
        const url = URL.createObjectURL(new Blob([e.data.blob as Uint8Array]))
        setUrl(url)
      }
    }

    window.addEventListener('message', fn)
    vscode.postMessage({ type: 'ready' })

    return () => window.removeEventListener('message', fn)
  }, [])

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
