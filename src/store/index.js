import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'anonymous cat',
    colour: '#333',
    quarter: 1,
    location: 2
  },
  mutations: {
    changeColour (state, newColour) {
      state.colour = newColour
    },
    changeLocation (state, newLocation) {
      state.location = newLocation
    },

    changeQuarter (state, newQuarter) {
      state.quarter = newQuarter
    },

    changeName (state, newName) {
      state.name = newName
    }
  },
  actions: {
  },
  modules: {
  }
})
