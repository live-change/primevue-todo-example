import { createApp } from './main'
import { clientApi } from '@live-change/vue3-ssr/clientApi.js'
import apiSession from '@live-change/vue-api-session'

window.api = clientApi({
  use: [ apiSession ]
})

const { app, router } = createApp(api)

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  const instance = app.mount('#app', true)
  app._container._vnode = instance.$.vnode
})
