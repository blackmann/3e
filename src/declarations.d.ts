type NodeType = 'Mesh' | 'Bone' | 'Object3D' | 'SkinnedMesh' | (string & {})

interface MeshRep {
  material: {
    name?: string
    type: string
  }
  name: string
  type: NodeType
}

interface Scene {
  nodes: MeshRep[]
}
