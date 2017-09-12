<template>
  <div class="singer" ref="singer">
		<list-view @select="selectSinger" :data="singers" ref="list"></list-view>
		<router-view></router-view> <!-- 挂载子路由-->
  </div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import Singer from 'common/js/singer'
  import {ERR_OK} from 'api/config'
  import ListView from 'base/listview/listview'
  import {mapMutations} from 'vuex'  // vuex提供的语法糖,对Mutations进行一层封装
  import {playlistMixin} from 'common/js/mixin'

  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {  //playlistMixin 中关联事件
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh() // 调用listview组件里的refresh事件
      },
    	selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer)  // 等于执行了mutations.js里的对应方法
      },
      _getSingerList() {   // 获取歌手数据
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)            
          }
        })
      },
      _normalizeSinger(list) { // 数据聚合整理［热门，a,b,c,d...］
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })
        // 为了得到有序列表，我们需要处理 map
        let ret = []
        let hot = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      // 对象映射(把对mutations的修改映射成一个方法名 setSinger)
      ...mapMutations({  
        setSinger: 'SET_SINGER'   
      })      
    },
    components:{
    	ListView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
