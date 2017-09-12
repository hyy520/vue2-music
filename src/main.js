import 'babel-polyfill'  // （补丁）对es6的一些api做转译 如：promise
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import 'common/stylus/index.styl'

// 移动端调试插件，一定得放在代码的入口js（微信前端开发，在github上开源）
// import vConsole from 'vconsole'
// console.log('test')

// 解决移动端300毫秒延时
fastclick.attach(document.body)

Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png') // 懒加载默认图片
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
})
