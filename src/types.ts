import { Material, Object3D } from "three"
import { GLTF } from "three-stdlib"
import { PresetsType } from "@react-three/drei/helpers/environment-assets"

export type NodeType = 'Mesh' | 'Bone' | 'Object3D' | 'SkinnedMesh' | (string & {})

export interface MeshRep {
  material: {
    name?: string
    type: string
  }
  name: string
  type: NodeType
}

export interface Scene {
  nodes: MeshRep[]
}

export type VectorOrEuler = [number, number, number]

export interface CameraState {
  position: VectorOrEuler
  rotation: VectorOrEuler
}

export interface ExtensionState {
  camera?: CameraState
  appearance?: Appearance
}

export type MaterialType = 'normal' | 'basic' | 'basic-randomized' | 'textured'
export type TimeUnit = 'ms' | 's'

export interface Appearance {
  environmentPreset: PresetsType
  materialType: MaterialType
  wireframe: boolean
  timeUnit: TimeUnit
}

export type ParsedObject3D = Object3D & { material?: Material }

export interface ParsedGLTFResults extends GLTF {
  nodes: {
    [key: string]: ParsedObject3D
  },
  __originalMaterials?: Record<string, Material | undefined>
}

