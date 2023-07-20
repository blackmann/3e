'use strict'

import { build, context } from 'esbuild'
import cssModules from 'esbuild-css-modules-plugin'
import path from 'path'

const prod = process.env.NODE_ENV === 'production'

/** @type {import('esbuild').BuildOptions} */
const base = {
  bundle: true,
  dropLabels: prod ? ['DEBUG'] : [],
  format: 'cjs',
  mainFields: ['module', 'main'],
  minify: prod,
  plugins: [
    cssModules({
      generateScopedName: function (name, filename, css) {
        var i = css.indexOf('.' + name)
        var line = css.substring(0, i).split(/[\r\n]/).length
        var file = path.basename(filename, '.css')

        return '_' + file.replace('.', '-') + '_' + line + '_' + name
      },
    }),
  ],
  sourcemap: process.env.NODE_ENV !== 'production',
}

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
  ...base,
  entryPoints: ['./src/extension.ts'],
  external: ['vscode'],
  outdir: './out',
  platform: 'node',
}

/** @type {import('esbuild').BuildOptions} */
const appConfig = {
  ...base,
  entryPoints: ['./src/app/index.tsx'],
  loader: {
    '.ttf': 'dataurl',
  },
  minify: true,
  outdir: './out/app',
  platform: 'browser',
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
