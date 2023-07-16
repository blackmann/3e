'use strict'

import { build, context } from 'esbuild'

/** @type {import('esbuild').BuildOptions} */
const config = {
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  platform: 'node',
  mainFields: ['module', 'main'],
  format: 'cjs',
  entryPoints: ['./src/extension.ts', './src/app/index.tsx'],
  outdir: './out',
  external: ['vscode'],
}

if (process.argv.includes('--watch')) {
  const ctx = await context({ ...config })
  ctx.watch()
} else {
  await build(config)
}
