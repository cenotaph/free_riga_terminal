<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <h2 class="title">Succesfully signed into Facebook</h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  beforeCreate () {
    if (this.$route.query.auth_token) {
      let oauth_token = 'Bearer;' + this.$route.query.auth_token + ';' +  this.$route.query.client_id + ';' + this.$route.query.uid + ';' +  this.$route.query.expiry
      // console.log('got token on start, setting to ')
      // console.log(oauth_token)  
      let token = this.$auth.token(null, oauth_token)
      this.$auth.options.fetchData.url = this.axios.defaults.baseURL + '/auth/validate_token'
      this.$auth.options.logoutData.url =  this.axios.defaults.baseURL + '/auth/sign_out'
      // console.log('fetchdata: ')
      // console.log(this.$auth.options.fetchData)
      if (this.$auth.check()) {
        // console.log('already has user object')
        // console.log(this.$auth.user())
      } else if (this.$auth.ready()) { 
        // console.log('validating token')
        // console.log(token)
        this.$auth.refresh({
          url: this.axios.defaults.baseURL + '/auth/validate_token',           
          success: function (resp) {
            // console.log('refreshed!')

            let setUser = {token: token, data: resp.data.data}
            this.$auth.user(setUser.data)
            this.$store.commit('changeLocation', setUser.data.attributes.location_id)
            this.$store.commit('changeName', setUser.data.attributes.name)
            this.$store.commit('changeQuarter', setUser.data.attributes.quarter_id)
            this.$store.commit('changeHuman', true)
            // console.log(this.$auth.user())
            this.$auth.watch.authenticated = true
            // console.log('ready is: ')
            // console.log(this.$auth.ready())
            // console.log('user is: ' )
            // console.log(this.$auth.user())
            this.$parent.$emit('update-user', this.$auth.user())
            this.$router.push('/')
          },
          error: function (err) {
            // console.log('uh-uh')
            // console.log(err)
          }
        })
      }
      else {
        console.log('not ready')
      }
    } else {
      this.$auth.options.fetchData.url = this.axios.defaults.baseURL + '/auth/validate_token'
    }
  // console.log('here is user')
  // console.log(this.$auth.user())
  // this.$parent.$emit('update-user', this.$auth.user())
  // this.$router.push('/')
  }
}

</script>