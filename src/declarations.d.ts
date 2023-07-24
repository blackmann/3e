declare module '*.module.css' {
  const value: Record<string, string>
  export default value
}

interface H {
  tall: boolean
}

// declare module 'gltfjsx' {
//   import { GLTF } from 'three-stdlib'
//   function parse(fileName: string, gltf: GLTF, options: {}): void

//   export { parse }
// }
