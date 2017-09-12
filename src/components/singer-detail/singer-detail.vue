<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {getSingerDetail} from 'api/singer' // 获取歌手详细数据
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import {mapGetters} from 'vuex'  // 取数据提供的语法糖
  import MusicList from 'components/music-list/music-list'

  export default {
    data(){
      return {
        songs:[]  // 歌曲列表
      }
    },
    computed: { 
      title(){  // 标题
        return this.singer.name
      },       
      bgImage(){   // 背景图
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'  // 对应到store/getters.js 里的singer (获取到列表页点击的歌手对应详细数据)
      ])
    },
    created(){
      this._getDetail()      
    },
    methods:{
      _getDetail() {
        if (!this.singer.id) {  // 这里的this.singer数据 是通过vuex获取的，所以在歌手详情页刷新的话会获取不到数据，在此做判断做回退操作(边距数据的处理)
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)            
          }
        })
      },
      _normalizeSongs(list) {  // 数据处理
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components:{
      MusicList
    }  
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>