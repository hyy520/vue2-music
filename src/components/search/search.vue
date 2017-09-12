<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <div class="hot-key"> <!--搜索热词-->
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length"> <!--搜索历史纪录数据-->
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest @listScroll="blurInput" @select="saveSearch" ref="suggest" :query="query"></suggest>
    </div>
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <router-view></router-view> <!--挂载二级路由-->
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'  // 搜索框组件
  import SearchList from 'base/search-list/search-list'
  import Scroll from 'base/scroll/scroll'
  import Confirm from 'base/confirm/confirm'
  import Suggest from 'components/suggest/suggest'
  import {getHotKey} from 'api/search'  // 获取热门搜索关键字
  import {ERR_OK} from 'api/config'
  import {playlistMixin, searchMixin} from 'common/js/mixin'
  import {mapActions} from 'vuex'

  export default {
    mixins: [playlistMixin, searchMixin],  // 混入
    data() {
      return {
        hotKey: []
      }
    },
    computed: {
      shortcut() {  // scroll滚动高度是根据hotKey和searchHistory两块内容撑开的，但由于这两块内容都是异步获取的；所以在此concat以下，无论哪个数据发生变化，就重新计算高度
        return this.hotKey.concat(this.searchHistory)
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh() //重新计算高度
      },
      showConfirm() {
        this.$refs.confirm.show()  //调用confirm 组件中的show方法
      },
      _getHotKey() { // 获取热门搜索 关键字
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10) // 取前10条
          }
        })
      },
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    watch: {
      query(newQuery) { //监测query的变化，若没newQuery，则重新刷新shortcut，使其能够滚动      	 
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      SearchList,
      Scroll,
      Confirm,
      Suggest
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>