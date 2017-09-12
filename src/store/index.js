import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'  // http://es6.ruanyifeng.com/#docs/module#%E6%A8%A1%E5%9D%97%E7%9A%84%E6%95%B4%E4%BD%93%E5%8A%A0%E8%BD%BD
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production' // vuex调试工具

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})