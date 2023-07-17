import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import { vscode } from '../lib/vscode'
import { MeshNormalMaterial, DoubleSide } from 'three'

interface MeshProps {
  url: string
}

const normalMaterial = new MeshNormalMaterial({ side: DoubleSide })

function Mesh({ url }: MeshProps) {
  const { nodes } = useGLTF(url)

  return (
    <group>
      {Object.entries(nodes).map(([name, props]) => {
        const { x, y, z } = props.position
        const position = [x, y, z] as const

        const { x: a, y: b, z: c } = props.rotation
        return (
          <mesh
            key={name}
            geometry={props.geometry}
            material={normalMaterial}
            position={position}
            rotation={[a, b, c]}
          />
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
