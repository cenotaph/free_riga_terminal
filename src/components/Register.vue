<template>
  <div class="container">
    <form v-on:submit.prevent="registerAccount">
      <div class="columns">
        <div class="column">
          <label class="label">{{ $t("message.your_email") }}</label>
          <input type="text" class="input" v-model="newUser.email">
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <label class="label">{{ $t("message.your_name") }}</label>
          <input type="text" class="input" v-model="newUser.name">
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <label class="label">{{ $t("message.your_nickname") }}</label>
          <input type="text" class="input" v-model="newUser.nickname">
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <label class="label">{{ $t("message.home_location") }}</label>
        </div>
      </div>
      <div class="columns">
        <div class="column is-half">
          <div class="select">
            <label class="label">{{ $t("message.which_quarter") }}</label>
            <select v-model="selectedQuarter" @change="getLocations">
              <option v-for="quarter in quarters" :value="quarter.id" :key="quarter.id">{{ quarter.attributes.name }}</option>
            </select>
          </div>
        </div>
        <div class="column is-half">
          <div class="select">
            <label class="label">{{ $t("message.which_location") }}</label>
            <select v-model="newUser.location_id">
              <option v-for="location in locations" :value="location.id" :key="location.id">{{ location.attributes.name }}</option>
            </select>
          </div>
        </div>        
      </div>
      <div class="columns">
        <div class="column">
          <label class="label">{{ $t("message.enter_password") }}</label>
          <input type="password" class="input" v-model="newUser.password">
          <label class="label">{{ $t("message.confirm_password") }}</label>
          <input type="password" class="input" v-model="newUser.password_confirmation">
        </div>
      </div>


      <div class="columns">
        <div class="column">
          <vue-recaptcha 
            ref="recaptcha"
            @verify="onVerify"
            @expired="onExpired"
            :sitekey="recaptchaSiteKey"></vue-recaptcha>

          <input type="submit" class="button is-primary" :value="$t('message.register')">
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha'

export default {
  data() {
    return {
      selectedQuarter: null,
      quarters: [],
      locations: [],
      newUser: {},
      recaptchaSiteKey: process.env.VUE_APP_RECAPTCHA_SITE_KEY
    }
  },
  components: { 
    VueRecaptcha 
  },
  mounted () {

    this.axios.get('/v1/quarters/')
      .then((resp) => {
        this.quarters = resp.data.data
        
      })

  },
  methods: {
    registerAccount () {
      this.newUser.confirm_success_url = process.env.VUE_APP_SITE_URL + '/sign_in'
      this.axios.post('/auth', this.newUser)
        .then((response) => {
          if (response.status === 200) {
            this.$router.push({ name: 'Registered' })
          }
        })
    },
    getLocations () {
      this.axios.get('/v1/quarters/' + this.selectedQuarter  + '/locations' )
        .then((locs) => {
          this.locations = locs.data.data
        })
    },
    onSubmit: function () {
      this.$refs.invisibleRecaptcha.execute()
    },
    onVerify: function (response) {
      console.log('Verify: ' + response)
    },
    onExpired: function () {
      console.log('Expired')
    },
    resetRecaptcha () {
      this.$refs.recaptcha.reset() // Direct call reset method
    }
  }
}
</script>