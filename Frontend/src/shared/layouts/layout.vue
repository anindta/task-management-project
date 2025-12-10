<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import LayoutDefault from '@/layouts/default.vue'

const layout = shallowRef(LayoutDefault)
const route = useRoute()

watch(
  () => route.meta,
  async (meta) => {
    try {
      const component = meta && await import(/* @vite-ignore */ `./${meta.layout}.vue`)
      layout.value = component?.default.name || LayoutDefault
    }
    catch (e) {
      layout.value = LayoutDefault
    }
  },
  { immediate: true },
)
</script>

<template>
  <component :is="layout || 'div'">
    <router-view />
  </component>
</template>
