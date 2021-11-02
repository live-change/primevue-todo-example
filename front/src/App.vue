<template>
  <main>
    <router-view v-slot="{ Component }">
      <loading-zone>
        <template v-slot:loading>
          <div class="loading">Loading! Please wait!</div>
        </template>
        <working-zone>
          <template v-slot:working>
            <div class="loading">Working! Please wait!</div>
          </template>
          <component :is="Component" />
        </working-zone>
      </loading-zone>
    </router-view>
  </main>
</template>

<script>
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import 'primeicons/primeicons.css'

import { useMeta, useActiveMeta } from 'vue-meta'

export default {
  setup () {
    const { meta } = useMeta({
      title: 'Live Change Framework Example',
      meta: [
        { charset: 'utf-8' }
      ],
      htmlAttrs: {
        lang: 'en',
        amp: true
      }
    })
    const metadata = useActiveMeta()
    return { metadata }
  },
  metaInfo() {
    return {
      title: 'Live Change Framework Example',
      htmlAttrs: {
        lang: 'en',
        amp: true
      }
    }
  },
  reactive: {
    session: ['session', 'currentSession']
  },
  computed: {
    api() {
      return this.$api
    }
  }
}
</script>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
nav {
  border-bottom: 1px solid gray;
  text-align: center;
  display: block;
  margin-bottom: 20px;
  padding: 10px;
}
.loading, .working {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
