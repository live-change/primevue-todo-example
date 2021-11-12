import path from 'path'
import vuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import findFreePorts from "find-free-ports"

export default defineConfig(async ({ command, mode }) => {
  return {
    server: {
      hmr: {
        port: (await findFreePorts())[0]
      }
    },
    plugins: [
      vuePlugin({
        template: {
          // compilerOptions: {
          //   whitespace: "preserve",
          // },
        },
      })
    ],
    build: {
      minify: false,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    ssr: {
      external: [
        '@live-change/dao',
        '@live-change/vue-api',
        '@live-change/vue-api-session',
        'debug',
        'vite'
      ],
      noExternal: [
        'vue-meta',
        '@live-change/vue3-components',
        '@live-change/dao-vue3',
        '@live-change/vue3-ssr'
      ]
    },
    optimizeDeps: {
      include: [
        '@live-change/vue-api',
        '@live-change/vue-api-session',
        '@live-change/dao',
        '@live-change/dao-sockjs',
        '@live-change/dao-websocket',
        'debug'
      ]
    },

    resolve: {
      alias: [
        { find: 'debug', replacement: 'debug/src/browser.js' },
        { find: 'universal-websocket-client', replacement: 'universal-websocket-client/browser.js' },
        { find: 'sockjs-client', replacement: 'sockjs-client/dist/sockjs.min.js' }
      ],
    },
    resolvers: [{
      fileToRequest (filePath) {
        console.log('@@@', filePath);
        if (filePath.startsWith(srcPath)) {
          return `/@/${path.relative(srcPath, filePath)}`;
        }
      },
      requestToFile (publicPath) {
        if (publicPath.startsWith('/@/')) {
          return path.join(srcPath, publicPath.replace(/^\/@\//, ''));
        }
      },
    }],
  }
})
