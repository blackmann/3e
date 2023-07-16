'use strict'

import { context, build } from 'esbuild'

/** @type {import('esbuild').BuildOptions} */
const base = {
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  format: 'cjs',
  mainFields: ['module', 'main'],
}

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
  ...base,
  platform: 'node',
  entryPoints: ['./src/extension.ts'],
  external: ['vscode'],
  outdir: './out',
}

/** @type {import('esbuild').BuildOptions} */
const appConfig = {
  ...base,
  entryPoints: ['./src/app/index.tsx'],
  platform: 'browser',
  outdir: './out/app',
  minify: true,
}

try {
  if (process.argv.includes('--watch')) {
    console.log('[watch] build started')

    await (await context(extensionConfig)).watch()
    await (await context(appConfig)).watch()

    console.log('[watch] build finished')
  } else {
    await build(extensionConfig)
    await build(appConfig)
  }
} catch (error) {
  if (error) {
    error.errors?.forEach((error) =>
      console.error(
        `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
      )
    ) || console.log(error)
  }

  process.stderr.write(error.stderr)
  process.exit(1)
}
