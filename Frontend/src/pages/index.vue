<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useHelloStore } from '@/shared/stores/modules/hello'

const store = useHelloStore()
const { sayHello } = storeToRefs(store)
</script>

<template>
  <h3>{{ sayHello }}</h3>
</template>
