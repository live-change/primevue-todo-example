import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory
} from 'vue-router'

const routes = [
  { name: 'index', path: '/', component: () => import("./Index.vue") },
]

export async function sitemap(route, api) {
  route({ name: 'index' })
}

export function createRouter() {
  const router = _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes
  })
  return router
}
