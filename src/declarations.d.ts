interface MeshRep {
  material: {
    name?: string
    type: string
  },
  name: string
}

interface Scene {
  nodes: MeshRep[]
}