import {
  BoxGeometry,
  Color,
  DoubleSide,
  Group,
  Material,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Mesh as ThreeMesh,
  Vector2,
} from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, OutlinePass, RenderPass } from 'three-stdlib'
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from '@react-three/drei'
import cameraState, { saveCameraState } from '../lib/camera'
import context, { useReadyContext } from '../lib/context'
import type { ParsedObject3D } from '../../types'
import React from 'react'
import appearance from '../lib/appearance'

interface RenderMeshProps {
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

interface ObjectRenderProps {
  scene: Group
  getMaterial: (name: string) => Material | undefined
  nodes: Record<string, ParsedObject3D>
}

function ObjectRender({ getMaterial, scene, nodes }: ObjectRenderProps) {
  const { scene: appScene, camera, gl, size } = useThree()

  const [composer, outlinePass] = React.useMemo(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(appScene, camera))

    const outlinePass = new OutlinePass(new Vector2(0, 0), appScene, camera)
    outlinePass.edgeStrength = 8
    outlinePass.visibleEdgeColor.set('#ff0000')

    const cube = new ThreeMesh(
      new BoxGeometry(1, 0.5),
      new MeshNormalMaterial()
    )
    appScene.add(cube)

    outlinePass.selectedObjects = [cube]

    composer.addPass(outlinePass)

    return [composer, outlinePass]
  }, [appScene, camera, gl])

  React.useEffect(() => {
    Object.values(nodes).forEach((node) => {
      node.material = getMaterial(node.name)
    })

    appScene.add(scene)

    return () => {
      appScene.remove(scene)
    }
  }, [appScene, camera, getMaterial, gl, nodes, scene])

  React.useEffect(() => {
    composer.setSize(size.width, size.height)
    outlinePass.setSize(size.width, size.height)
  }, [composer, outlinePass, size])

  React.useEffect(() => {
    const { glb, selectedObject } = context.value
    if (!(selectedObject && glb)) {
      return
    }

    const { nodes } = glb
    const node = nodes[selectedObject]

    outlinePass.selectedObjects = [node]
  }, [context.value])

  useFrame((_, delta) => {
    // const p = gl.autoClear
    // gl.autoClear = false
    // composer.render(delta)

    // gl.autoClear = p
  }, 1)

  return null
}

function Mesh() {
  const {
    nodes,
    scene,
    __originalMaterials: originalMaterials,
  } = context.value.glb!
  const { wireframe, materialType } = appearance.value
  const randomizedMaterialsIndexRef = React.useRef<Record<string, Material>>({})

  const getMaterial = React.useCallback(
    (name: string) => {
      if (wireframe) {
        return wireframeMaterial
      }

      switch (materialType) {
        case 'basic': {
          return basicMaterial
        }

        case 'basic-randomized': {
          if (!randomizedMaterialsIndexRef.current[name]) {
            randomizedMaterialsIndexRef.current[name] =
              new MeshStandardMaterial({
                color: randomColor(),
                roughness: 1,
                side: DoubleSide,
              })
          }

          return randomizedMaterialsIndexRef.current[name]
        }

        case 'textured': {
          return originalMaterials?.[name]
        }

        default:
          return normalMaterial
      }
    },
    [wireframe, materialType, originalMaterials]
  )

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

function _Delegate({ url }: RenderMeshProps) {
  useReadyContext(url)

  const { camera } = useThree()

  React.useEffect(() => {
    const state = cameraState.value

    const {
      position: [x, y, z],
      rotation: [a, b, c],
    } = state

    camera.rotation.set(a, b, c)
    camera.position.set(x, y, z)
  }, [camera])

  React.useEffect(() => {
    const interval = setInterval(() => {
      const { x, y, z } = camera.position
      const { x: a, y: b, z: c } = camera.rotation
      saveCameraState({ position: [x, y, z], rotation: [a, b, c] })
    }, 500)

    return () => clearInterval(interval)
  }, [camera])

  useFrame(({}, delta) => {
    context.peek().controller?.forward(delta)
  })

  // const selected = context.value.glb?.nodes?.[context.value.selectedObject]

  return (
    <>
      <Mesh />
      <OrbitControls />
      <GizmoHelper>
        <GizmoViewport axisColors={['#ff004c', '#5fa600', '#0086ea']} />
      </GizmoHelper>

      {/* <EffectComposer multisampling={0}>
        <Outline selection={selected ? [selected] : []} />
      </EffectComposer> */}
    </>
  )
}

function Viewer() {
  const url = context.value.blobUrl

  return <Canvas>{url && <_Delegate url={url} />}</Canvas>
}

const colors = ['#608871', '#a88398', '#9b768a', '#557c7d', '#929775']

function randomColor() {
  const i = Math.floor(Math.random() * colors.length)
  return colors[i]
}

export default Viewer
