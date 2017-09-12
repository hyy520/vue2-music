<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive> <!--主要用于保留组件状态或避免重新渲染-->
      <router-view></router-view>
    </keep-alive>
    <player></player> <!-- 播放器组件 -->
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header'
  import Player from 'components/player/player'
  import Tab from 'components/tab/tab'

  export default {
    components: {
      MHeader,
      Player,
      Tab
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  
  #app
    color: $color-theme
</style>
