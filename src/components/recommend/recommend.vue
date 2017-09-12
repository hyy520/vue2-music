<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slide-wrapper">        
          <slider>
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="loadImage" :src="item.picUrl"> <!-- 当fastclick 跟bscroll的click事件冲突，导致无法点击； 此时增加class="needsclick"使得能够点击，这是fastclick 里的技巧 -->
              </a>
            </div>
          </slider>
        </div> 
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"> <!-- 图片懒加载 -->
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>      
    </scroll> 
    <router-view></router-view> <!--对应二级路由的容器-->    
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'     //滚动组件
  import Loading from 'base/loading/loading'  //加载中
  import Slider from 'base/slider/slider'     //banner切换
  import {getRecommend, getDiscList} from 'api/recommend'  // 数据获取
  import {playlistMixin} from 'common/js/mixin'
  import {ERR_OK} from 'api/config'           //接口数据获取成功状态返回码
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [],
        discList: []
      }
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      _getRecommend() {   // 获取轮播图数据
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider            
          }
        })
      },
      _getDiscList() {   // 获取热门歌单数据
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      selectItem(item) { // 点击进入详情页 disc组件
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },
      loadImage() { // 监听图片加载，当第一张banner图片加载出来时，调用scroll的refresh方法,不然不能保证dom是已经渲染好的（需要计算高度），当数据变化时，需要重新refrash
        if (!this.checkloaded) {  // 限制，防止多次调用执行（常用的小技巧）
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>