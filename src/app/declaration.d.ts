declare module '*.module.css' {
  const value: Record<string, string>
  export default value
}

declare module 'gltfjsx' {
  class GLTFStructureLoader {}

  export { GLTFStructureLoader }
}