import { createApp } from 'vue'
import App from './App.vue'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import ui from '@nuxt/ui/vue-plugin'
import { initializeApp } from 'firebase/app'
import router from './router' // Добавляем импорт роутера
import './assets/base.css'
const app = createApp(App)

const firebaseConfig = {
  apiKey: 'AIzaSyC9-l2RebDdKeqG3lv0LoSS_SqA9JypVg0',
  authDomain: 'revue-da226.firebaseapp.com',
  projectId: 'revue-da226',
  storageBucket: 'revue-da226.firebasestorage.app',
  messagingSenderId: '303884171683',
  appId: '1:303884171683:web:b0bf4c89f2a7e03b958216',
  measurementId: 'G-MPJ6N35BT8',
}

initializeApp(firebaseConfig)

app.use(autoAnimatePlugin)
app.use(ui)
app.use(router) // Добавляем роутер здесь

app.mount('#app')
