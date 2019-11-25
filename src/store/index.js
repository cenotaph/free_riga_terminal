import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'anonymous cat',
    colour: '#333',
    quarter: 1,
    location: 2,
    human: false
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
    },

    changeHuman (state, newType) {
      state.human = newType
    }

  },
  actions: {
  },
  modules: {
  }
})
