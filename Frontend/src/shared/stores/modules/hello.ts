// this store is defined using setup stores
// more information go to https://pinia.vuejs.org/core-concepts/#Setup-Stores

import { defineStore } from 'pinia'

export const useHelloStore = defineStore('hello', () => {
  const hello = ref('Hello World')

  const sayHello = computed(() => {
    return `${hello.value} from Pinia Store`
  })

  return {
    hello,
    sayHello,
  }
})
