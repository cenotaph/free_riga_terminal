import Vue from 'vue'
import Router from 'vue-router'
import TerminalLogin from '@/components/TerminalLogin.vue'
import UserLogin from '@/components/UserLogin.vue'
import Register from '@/components/Register.vue'
import Facebook from '@/components/Facebook.vue'
import Registered from '@/components/Registered.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/terminal',
      name: 'TerminalLogin',
      component: TerminalLogin,
      meta: { auth: false }
    },
    {
      path: '/facebook',
      name: 'Facebook',
      component: Facebook,
      meta: { auth: false }
    },    
    {
      path: '/sign_in',
      name: 'UserLogin',
      component: UserLogin,
      meta: { auth: false }
    },    
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { auth: false }
    },
    {
      path: '/registered',
      name: 'Registered',
      component: Registered,
      meta: { auth: false }
    }    
  ]
})