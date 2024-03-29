import { renderToString } from 'vue/server-renderer'
import { renderMetaToString } from 'vue-meta/ssr'

import { serverApi } from '@live-change/vue3-ssr/serverApi.js'
import apiSession from '@live-change/vue-api-session'

import { createApp } from './main'

export async function render({ url, dao, windowId }) {
  const api = await serverApi(dao, {
    use: [apiSession]
  })

  const { app, router } = createApp(api)

  // set the router to the desired URL before rendering
  router.push(url)
  await router.isReady()

  // prefetch data
  await api.preFetchRoute(router.currentRoute, router)

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {}
  const html = await renderToString(app, ctx)
  await renderMetaToString(app, ctx)

  const data = api.prerenderCache.cacheData()

  // the SSR manifest generated by Vite contains module -> chunk/asset mapping
  // which we can then use to determine what files need to be preloaded for this
  // request.

  return { html, data, meta: ctx.teleports, modules: ctx.modules }
}
