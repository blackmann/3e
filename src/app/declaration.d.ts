declare module '*.module.css' {
  const value: Record<string, string>
  export default value
}

type VectorOrEuler = [number, number, number]

interface CameraState {
  position: VectorOrEuler
  rotation: VectorOrEuler
}

interface ExtensionState {
  camera?: CameraState
}

// declare module 'gltfjsx' {
//   import { GLTF } from 'three-stdlib'
//   function parse(fileName: string, gltf: GLTF, options: {}): void

//   export { parse }
// }
