import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueI18n from 'vue-i18n'
import router from './router'
import VueTimeago from 'vue-timeago'
// import VueAuthenticate from 'vue-authenticate'
import { VueMasonryPlugin } from 'vue-masonry'
import Toasted from 'vue-toasted'
import _ from 'lodash'
import ActionCableVue from 'actioncable-vue'

Vue.router = router
Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: 'error',
    connectionUrl: process.env.VUE_APP_SOCKET_URL,
    connectImmediately: true
})

// Vue.use(VueAuthenticate, {
//   baseUrl: 'http://localhost:3000', // Your API domain
  
//   providers: {
//     facebook: {
//       clientId: '163602387889379',
//       redirectUri: 'http://localhost:8080/auth/callback' // Your client app URL
//     }
//   }
// })

Vue.use(Toasted)
Vue.use(VueMasonryPlugin)

Vue.use(VueAxios, axios)
Vue.use(VueI18n)
Vue.config.productionTip = false
Vue.axios.defaults.baseURL = process.env.VUE_APP_API_URL


Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'lv', // Default locale
  locales: {
    'lv': require('date-fns/locale/lv'),
    'ru': require('date-fns/locale/ru'),
    'en': require('date-fns/locale/en-GB')
  }
})

Vue.use(require('@websanova/vue-auth'), {
  authRedirect: {path: '/' },
  // tokenExpired: false,
  auth: require('@websanova/vue-auth/drivers/auth/devise.js'),
  // auth: require('./drivers/devise_oauth.js'),
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
  rolesVar: 'roles',
  loginData: { url: Vue.axios.defaults.baseURL + '/terminal_auth/sign_in', method: 'POST', redirect: '/' },
  logoutData: { url: Vue.axios.defaults.baseURL + '/terminal_auth/sign_out', method: 'DELETE', redirect: '/login' },
  refreshData: {
    enabled: true,
    url: Vue.axios.defaults.baseURL + '/terminal_auth/validate_token', method: 'GET',
    interval: 5,
  },
  parseUserData: function (data) {
    // console.log('parseUserData:')
    // console.log('setting store to')
    // console.log(data)
    // store.commit('changeLocation', data.data.attributes.location_id)

    // if (data.data) {
    //   data.roles = data.data.attributes.roles
    // // console.log(data)
    // }
    return data
  },
  fetchData: {
   url: Vue.axios.defaults.baseURL + '/auth/validate_token', 
   method: 'GET',
   enabled: true
  }
})

const translations = require('./translations').translations

const i18n = new VueI18n({
  locale: 'lv',
  messages: translations
})

if (localStorage.locale) {
  i18n.locale = localStorage.getItem('locale')
} else {
  localStorage.setItem('locale', 'lv')
}

new Vue({
  router,
  i18n,
  store,
  render: h => h(App),
  created () {
    axios.interceptors.response.use((response) => {
      return response
    }, function (error) {
      if (error.response) {
        if (error.response.status === 403) {
          // console.log('403 error')
        } 
        else if (error.response.status === 422 || error.response.status === 401) {
          if (error.response.data.errors.full_messages) {
            error.message = error.response.data.errors.full_messages.join('; ')
          } else {
            const errorMessages = _.map(error.response.data.errors, function (e) {
              if (e.source) {
                return e.source.parameter + ' ' + e.detail
              } else if (e.title) {
                return e.title
              }
            })
            error.message = errorMessages.join('; ')
          }
        } 
        else {
          // console.log('unknown error:')
          // console.log(error)
        }
      }
      let duration = 5000
      if (error.message === 'Network Error') {
        error.message = 'Network error - perhaps the API is not reachable?'
        duration = null
      }

      if (!/auth\/validate_token$/.test(error.config.url)) {
        Vue.toasted.error('Oops! Something went wrong: ' + error.message, {
          position: 'bottom-center',
          fullWidth: true,
          fitToScreen: true,
          closeOnSwipe: true,
          duration: duration
        })
      }
      return Promise.reject(error)
    })
  }
}).$mount('#app')
