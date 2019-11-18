import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueI18n from 'vue-i18n'
import VueTimeago from 'vue-timeago'
import { VueMasonryPlugin } from 'vue-masonry'
import Toasted from 'vue-toasted'
import _ from 'lodash'
import ActionCableVue from 'actioncable-vue'

Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: 'error',
    connectionUrl: 'ws://localhost:3000/cable',
    connectImmediately: true
})
Vue.use(Toasted)
Vue.use(VueMasonryPlugin)
Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'lv', // Default locale
  locales: {
    'lv': require('date-fns/locale/lv'),
    'ru': require('date-fns/locale/ru'),
    'en': require('date-fns/locale/en-GB')
  }
})

Vue.use(VueAxios, axios)
Vue.use(VueI18n)
Vue.config.productionTip = false
Vue.axios.defaults.baseURL = process.env.VUE_APP_API_URL

const translations = {
  en: {
    message: {
      past: 'Past (this has happened)',
      present: 'Present (this is happening)',
      future: 'Future (this should happen)',
      past_status: 'Completed',
      present_status: 'In progress',
      future_status: 'Not yet started',
      comments: 'Comments',
      Task: 'Task',
      signed_in_as: 'Signed in as ',
      new_post: 'New post',
      posting_as: 'Posting as',
      post_a_new_task: 'Post a new task',
      post_blurb: 'Tell about something you did, something being done, or something that needs doing.',
      which_quarter: 'Which quarter?',
      which_location: 'Where at?',
      whats_going_on: 'What\'s going on? [write in at least one language]',
      task_status: 'Task status',
      new_name: 'New name:',
      mood: 'Mood',
      what_mood_are_you_in: 'What mood are you in?',
      where_are_you: 'Where are you?',
      choose_whether: 'Choose whether this is ...',
      discuss: 'Discuss',
      change: 'Change',
      submit_comment: 'Post comment',
      see_all: 'see all...',
      see_less: 'see fewer...',
      Comment: 'Comment',
      end_of_data: 'There are no more items to load.',
      no_location: 'Nowhere specific',
      what_do_you_want_to_say: 'What do you want to say?'
    }
  },
  lv: {
    message: {
      past: 'Paveikts',
      present: 'Pprocesā',
      future: 'Gaida uzsākšanu',
      past_status: 'paveikts',
      present_status: 'procesā',
      future_status: 'Nav vēl uzsākts',
      comments: 'Komentāri',
      Task: 'Uzdevums',
      signed_in_as: 'Iežurnālējies kā',
      new_post: 'Jauns ieraksts',
      posting_as: 'Publicēja:',
      post_a_new_task: 'Publicēt jaunu uzdevumu',
      post_blurb: 'Pastāsti par to, ko paveici vai kas būtu jāpaveic',
      which_quarter: 'Kurš kvartāls?',
      which_location: 'Atrašanās vieta',
      whats_going_on: 'Kas notiek?',
      task_status: 'Uzdevuma statuss',
      new_name: 'Jauns vārds:',
      mood: 'Noskaņojums',
      what_mood_are_you_in: 'Kāds Tev ir noskaņojums?',
      where_are_you: 'Kur Tu esi?',
      choose_whether: 'Izvēlne',
      discuss: 'Diskusijas',
      change: 'Change',
      submit_comment: 'Post comment',
      see_all: 'see all...',
      see_less: 'see fewer...',
      Comment: 'Comment',
      end_of_data: 'There are no more items to load.',
      no_location: 'Nowhere specific',
      what_do_you_want_to_say: 'What do you want to say?'
    }
  },
  ru: {
    message: {
      past: 'Past (this has happened)',
      present: 'Present (this is happening)',
      future: 'Future (this should happen)',
      past_status: 'Completed',
      present_status: 'In progress',
      future_status: 'Not yet started',
      comments: 'Comments',
      Task: 'Task',
      signed_in_as: 'Signed in as ',
      new_post: 'New post',
      posting_as: 'Posting as',
      post_a_new_task: 'Post a new task',
      post_blurb: 'Tell about something you did, something being done, or something that needs doing.',
      which_quarter: 'Which quarter?',
      which_location: 'Where at?',
      whats_going_on: 'What\'s going on? [write in at least one language]',
      task_status: 'Task status',
      new_name: 'New name:',
      mood: 'Mood',
      what_mood_are_you_in: 'What mood are you in?',
      where_are_you: 'Where are you?',
      choose_whether: 'Choose whether this is ...',
      discuss: 'Discuss',
      change: 'Change',
      submit_comment: 'Post comment',
      see_all: 'see all...',
      see_less: 'see fewer...',
      Comment: 'Comment',
      end_of_data: 'There are no more items to load.',
      no_location: 'Nowhere specific',
      what_do_you_want_to_say: 'What do you want to say?'
    }
  }
}

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
  i18n,
  store,
  render: h => h(App),
  created( ) {
    axios.interceptors.response.use((response) => {
      return response
    }, function (error) {
      if (error.response) {
        if (error.response.status === 403) {
          console.log('403 error')
        } 
        else if (error.response.status === 422) {
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
          console.log('unknown error')
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
