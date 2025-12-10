import { createApp } from 'vue'
import '@/shared/styles/tailwind.css'
import App from './App.vue'
import store from '@/shared/stores'
import router from '@/shared/routers/index.route'
import 'preline/preline'
// 1. Import Element Plus & Styles
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. Import Remix Icon
import 'remixicon/fonts/remixicon.css'

// 3. Import Tailwind (Tetap dipakai untuk utility layout biar cepat)
import '@/shared/styles/tailwind.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.mount(document.body)
