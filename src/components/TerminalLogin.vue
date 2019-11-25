<template>
  <section class="section">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">{{ $t("message.terminal_signin") }}</h1>
        </div>
      </div>
    </section>
    <section class="section" v-if="!loading">
      <div class="container">
        <div class="columns">
          <div class="column is-half">    
            <form v-on:submit.prevent="login()">
                <div class="field">
                  <label class="label">Terminal name:</label>
                  <input v-model="data.body.login" type="text" class="input"/>
                </div>
                <div class="field">
                  <label class="label">Password:</label>
                  <input v-model="data.body.password" class="input" type="password" />
                </div>
    <!--             <div class="field">
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
          loading: true,
          body: {
            login: '',
            password: ''
          },
          rememberMe: false,
          fetchUser: false
        },
        error: null
      };
    },

    mounted() {
      window.onscroll = () => { }
      this.loading = false
    },
    methods: {
      login() {
        this.loading = true
        let redirect = this.$auth.redirect();
        // console.log(redirect)
        this.$auth.options.loginData.url = this.axios.defaults.baseURL + '/terminal_auth/sign_in'
        this.$auth.options.logoutData.url =  this.axios.defaults.baseURL + '/terminal_auth/sign_out'
        this.$auth.options.fetchData.url = this.axios.defaults.baseURL + '/terminal_auth/validate_token'
        this.$auth.options.refreshData.url = this.axios.defaults.baseURL + '/terminal_auth/validate_token'  
        this.$auth.login({
          data: this.data.body, // Axios
          rememberMe:this.data.rememberMe,
          redirect: false, // {name: redirect ? redirect.from.name : 'Home'},
          fetchUser: false// this.data.fetchUser,
        })
        .then((resp) => {
          this.loading = false
          if (resp.status === 200) {
            // console.log('response in login:')
            // console.log(resp)
            this.$auth.user(resp.data.data)
            this.$store.commit('changeLocation', resp.data.data.attributes.location_id)
            this.$store.commit('changeName', 'anonymous cat')
            this.$store.commit('changeQuarter', resp.data.data.attributes.quarter_id)
            this.$store.commit('changeHuman', false)
            this.$parent.$emit('update-user', this.$auth.user())
          }
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
