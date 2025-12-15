import { resolve } from 'node:path'
import { makeEntryPointPlugin } from '@extension/hmr'
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config'
import { IS_DEV } from '@extension/env'
import { build } from 'vite'

const rootDir = resolve(import.meta.dirname)
const srcDir = resolve(rootDir, 'src')
const matchesDir = resolve(srcDir, 'matches')
const injectedDir = resolve(srcDir, 'injected')

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(
  ([name, entry]) =>
    withPageConfig({
      mode: IS_DEV ? 'development' : undefined,
      resolve: {
        alias: {
          '@src': srcDir,
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
        outDir: resolve(rootDir, '..', '..', 'dist', 'content'),
        emptyOutDir: false, // Critical: prevent race condition with concurrent builds
      },
    }),
)

// Add build config for injected script (runs in page context)
const injectedConfig = withPageConfig({
  mode: IS_DEV ? 'development' : undefined,
  resolve: {
    alias: {
      '@src': srcDir,
    },
  },
  build: {
    lib: {
      name: 'mapHijackInjected',
      formats: ['iife'],
      entry: resolve(injectedDir, 'map-hijack-injected.ts'),
      fileName: 'map-hijack-injected',
    },
    outDir: resolve(rootDir, '..', '..', 'dist', 'content'),
    emptyOutDir: false, // Critical: prevent race condition with concurrent builds
  },
})

const builds = [...configs, injectedConfig].map(async config => {
  //@ts-expect-error This is hidden property into vite's resolveConfig()
  config.configFile = false
  await build(config)
})

await Promise.all(builds)
