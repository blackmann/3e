# 3e

Next level 3d workflow inside VSCode.

![Screen record](assets/screen-record.gif)

🎺 This project is not intended to modify 3d objects; like modeling, texturing, UV-unwrapping, etc. It's only a viewer with other helper features so you don't need to open other software (like Blender, etc.) to debug.

[Install from VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=degreat.3e)

## Features

- Export to JSX (using [gltfjsx](https://github.com/pmndrs/gltfjsx))
- Look dev (with NormalMaterial, Basic Material and Textured) + HDRIs
- Wireframe mode
- Scene outliner

## Todo

- [x] Restore zoom and position on reopen
- [ ] Camera config (far, near, fov)
- [ ] Settings (default material color, roughness, etc., camera settings, default components path (relative) etc.)
- [ ] Wireframe config panel
- [ ] Material and environment config panels
- [ ] Outliner-Viewer selection sync
- [ ] Animation player
- [ ] GLTF formats
- [ ] FBX/OBJ formats?
- [ ] Custom HDR
- [ ] Light theme experience*
- [ ] Export to JSX options

> Create an issue for feature request

## Philosophy

When getting into WebGL (or graphics development), the barrier is too high and thick: you need to know how to use a number of software (Blender, Substance Painter, etc.), understand some jargons/concepts (UV unwrapping, shaders, GLBs/FBX/etc.) and be ready to fail a lot on very trivial things.

> I'm not dismissing that things take time to learn. I'm advocating that we make things easier to learn. No benefit is lost.

If we can start building [creative/developer] experiences that ease beginner introductions, we'll notice a flood of creative ideas and output. This is evident in the space of frontend development with React, etc. and backend development with Node, etc.
