import Vue from 'vue'
import Vuetify from 'vuetify'
import Element from 'element-ui'
import VueWorker from 'vue-worker'
// import enLang from 'element-ui/lib/locale/lang/en'
import ruLocaleEl from 'element-ui/lib/locale/lang/ru-RU'
import Cookies from 'js-cookie'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import './styles/element-variables.scss'
import '@/styles/index.scss'
import 'element-ui/lib/theme-chalk/index.css'
import '@/icons'

import App from './App'
import JsonExcel from 'vue-json-excel'
import VueTinyLazyloadImg from 'vue-tiny-lazyload-img'

import router from './router'
import store from './store'
import { initApp } from './utils/initapp.js'

import '@/permission'
import acl from './acl'


Vue.use(Vuetify)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: ruLocaleEl
})
Vue.use(VueWorker)
Vue.use(VueTinyLazyloadImg)
Vue.component('DownloadExcel', JsonExcel)

Vue.config.productionTip = false

export const eventBus = new Vue();

const opts = {
  theme: {
    dark: false
  },
  icons: {
    iconfont: 'mdi'
  }
}


new Vue({

  el: '#app',
  router,
  acl,
  store,
  vuetify: new Vuetify(opts),
  /* provide: {
    vueWorker: VueWorker,
   }, */
  created() { initApp() },
  render: h => h(App)

}).$mount('#app')
