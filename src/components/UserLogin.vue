<template>
  <section class="section">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">{{ $t("message.sign_in_user") }}</h1>
        </div>
      </div>
    </section>
    <section class="section" v-if="!loading">
      <div class="container">
        <div class="columns">
          <div class="column is-one-third">
            <button class="button is-primary" @click="facebook">
              {{ $t("message.sign_in_facebook") }}
            </button>
          </div>
        </div>
        <div class="columns">
          <div class="column is-two-thirds">
            <h2 class="subtitle">{{ $t("message.sign_in_with_password") }}
              <button class="button is-secondary">
                <router-link :to="{name: 'Register'}">{{ $t("message.register_account") }}</router-link>
              </button>
            </h2>
            <form v-on:submit.prevent="login()">
                <div class="field">
                  <label class="label">Your email:</label>
                  <input v-model="data.body.login" type="text" class="input"/>
                </div>
                <div class="field">
                  <label class="label">Password:</label>
                  <input v-model="data.body.password" class="input" type="password" />
                </div>
<!--                 <div class="field">
                  <input v-model="data.rememberMe" type="checkbox" /><label class="label">Remember Me</label>
                </div> -->
                <div class="field">
                  <div class="control">
                    <button class="button is-success" type="submit">Login</button>
                  </div>
                </div>
              <div v-show="error" style="color:red; word-wrap:break-word;">{{ error  }}</div>
            </form>
          </div>
        </div>
      </div>
    </section>
    <section v-else>
      <div class="loading">
        <img src="@/assets/images/fr_spin.gif" />
      </div>
    </section>
  </section>
</template>

<script>
export default {
  data() {
    return {
      context: 'login context',

        data: {
          body: {
            login: '',
            password: ''
          },
          rememberMe: false,
          fetchUser: false
        },
        loading: true,
        error: null
      };
    },

    mounted() {
      this.loading = false
      window.onscroll = () => { }
    },
    methods: {

      facebook () {
        this.loading = true
        window.location.href = process.env.VUE_APP_FACEBOOK_SIGNIN
      },
      login() {
        this.loading = true
        this.$auth.options.loginData.url = this.axios.defaults.baseURL + '/auth/sign_in'
        this.$auth.options.logoutData.url =  this.axios.defaults.baseURL + '/auth/sign_out'
        this.$auth.options.fetchData.url = this.axios.defaults.baseURL + '/auth/validate_token'
        this.$auth.options.refreshData.url = this.axios.defaults.baseURL + '/auth/validate_token'        
        let redirect = this.$auth.redirect();
        // console.log(redirect)
        this.$auth.login({
          data: this.data.body, // Axios
          rememberMe:this.data.rememberMe,
          redirect: false, // {name: redirect ? redirect.from.name : 'Home'},
          fetchUser: false// this.data.fetchUser,
        })
        .then((resp) => {
          this.loading = false
          // console.log('response in login:')
          // console.log(resp)
          this.$auth.user(resp.data.data)
          this.$store.commit('changeLocation', resp.data.data.attributes.location_id)
          this.$store.commit('changeName', resp.data.data.attributes.name)
          this.$store.commit('changeQuarter', resp.data.data.attributes.quarter_id)
          this.$store.commit('changeHuman', true)
          this.$parent.$emit('update-user', this.$auth.user())
          this.$router.push('/')
          // console.log('success ' + this.context);
        }, (res) => {
          // console.log('error ' + this.context);
          this.error = res.data;
        })
        .catch((err) => {
          // console.log('error: ' )
          // console.log(err)
        });
      }
    }
  }
</script>
