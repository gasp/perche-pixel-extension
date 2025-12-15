import { resolve } from 'node:path'
import { copyFileSync } from 'node:fs'
import { makeEntryPointPlugin } from '@extension/hmr'
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config'
import { IS_DEV } from '@extension/env'
import { build } from 'vite'
import { build as buildTW } from 'tailwindcss/lib/cli/build'

const rootDir = resolve(import.meta.dirname)
const srcDir = resolve(rootDir, 'src')
const matchesDir = resolve(srcDir, 'matches')

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(
  ([name, entry]) => ({
  name,
  config: withPageConfig({
    mode: IS_DEV ? 'development' : undefined,
    resolve: {
      alias: {
        '@src': srcDir,
          '@': resolve(rootDir, '..', '..', 'packages', 'pixel-editor', 'src'),
      },
    },
    publicDir: resolve(rootDir, 'public'),
    plugins: [IS_DEV && makeEntryPointPlugin()],
    build: {
      lib: {
        name: name,
        formats: ['iife'],
        entry,
        fileName: name,
      },
      outDir: resolve(rootDir, '..', '..', 'dist', 'content-ui'),
        emptyOutDir: false, // Don't empty - multiple builds write to same dir
    },
    }),
  }),
)

const builds = configs.map(async ({ name, config }) => {
  const folder = resolve(matchesDir, name)
  const tempCssOutput = resolve(rootDir, 'dist', name, 'index.css')
  const finalCssOutput = resolve(rootDir, '..', '..', 'dist', 'content-ui', `${name}.css`)
  
  const args = {
    ['--input']: resolve(folder, 'index.css'),
    ['--output']: tempCssOutput,
    ['--config']: resolve(rootDir, 'tailwind.config.ts'),
    ['--watch']: IS_DEV,
  }
  await buildTW(args)
  //@ts-expect-error This is hidden property into vite's resolveConfig()
  config.configFile = false
  await build(config)
  
  // Copy the Tailwind-processed CSS to the final location (after Vite build)
  copyFileSync(tempCssOutput, finalCssOutput)
})

await Promise.all(builds)
