import { DoubleSide, MeshBasicMaterial, MeshNormalMaterial } from 'three'
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  Wireframe,
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
const wireframeMaterial = new MeshBasicMaterial({color: '#f0f0f0', wireframe: true})

function Mesh({ url }: MeshProps) {
  const { nodes } = useGLTF(url)

  return (
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
            material={appearance.value.wireframe ? wireframeMaterial : normalMaterial}
            position={position}
            rotation={[a, b, c]}
          ></mesh>
        )
      })}
    </group>
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

export default Viewer
