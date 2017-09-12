<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background"> <!--背景图-->
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back"> <!--返回按钮-->
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1> <!--歌曲名字-->
          <h2 class="subtitle" v-html="currentSong.singer"></h2> <!--歌手-->
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper"> <!--cd旋转-->
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines"> <!--歌词部分-->
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text" :class="{'current': currentLineNum ===index}" v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span><!--歌曲已播放时间-->
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar><!--进度条-->
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span><!--歌曲总的时长-->
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode"><!--播放模式-->
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls"><!--上一首-->
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls"><!--播放、暂停切换-->
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls"><!--下一首-->
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right"><!--收藏-->
              <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon"> <!--旋转小图-->
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text"> 
          <h2 class="name" v-html="currentSong.name"></h2><!--歌曲名字-->
          <p class="desc" v-html="currentSong.singer"></p><!--歌手名字-->
        </div>
        <div class="control"> <!--播放、暂停控件-->
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i> <!--@click.stop 阻止冒泡-->
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist"> <!--显示播放列表-->
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist> <!--播放列表-->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio> <!--音乐播放通过audio实现，歌曲在播放时会派发@timeupdate 事件-->
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation' // 第三方动画插件
  import {prefixStyle} from 'common/js/dom' //前缀
  import ProgressBar from 'base/progress-bar/progress-bar' //条状进度条
  import ProgressCircle from 'base/progress-circle/progress-circle' // 圆圈进度条
  import {playMode} from 'common/js/config'
  import Lyric from 'lyric-parser' // 歌词的解析（作者自己写的一个包）
  import Scroll from 'base/scroll/scroll'
  import {playerMixin} from 'common/js/mixin'
  import Playlist from 'components/playlist/playlist'

  const transform = prefixStyle('transform') //前缀
  const transitionDuration = prefixStyle('transitionDuration') //前缀

  export default {
    mixins: [playerMixin],  // 混入
    data() {
      return {
        songReady: false,  // 歌曲ready, 可以播放了 (快速点击切换歌曲时会报错)
        currentTime: 0,  // 当前时间
        radius: 32, // 半径
        currentLyric: null, // 当前歌曲的歌词
        currentLineNum: 0,  // 当前歌词所在的行
        currentShow: 'cd',  // 当前显示的状况（cd或歌词）
        playingLyric: ''  // 当前所播放到的歌词（在cd下显示）
      }
    },
    computed: {
      cdCls() { //大小cd样式,用于控制cd是旋转还是不旋转
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {  //（主播放控件）根据播放状态，显示不同对应播放按钮（播放/暂停）
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {  //（底部播放控件）根据播放状态，显示不同对应播放按钮（播放/暂停）
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() { // 不能点击
        return this.songReady ? '' : 'disable'
      },
      percent() {  // 歌曲已播放的比例
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([  // mapGetters是一个数组,在computed中引入
        'currentIndex',
        'fullScreen',
        'playing'
      ])
    },
    created() {
      this.touch = {}  // 放在created中是因为不需要添加getter和setter
    },
    methods: {
      back() { // 点击显示迷你播放器
        this.setFullScreen(false)
      },
      open() { // 点击显示全屏播放器
        this.setFullScreen(true)
      },
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      enter(el, done) {  // 1、vue为我们提供的钩子函数，用于实现特定动画效果。用js实现css3的动画效果
        const {x, y, scale} = this._getPosAndScale() // 对象解构赋值        
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`  // 放大再缩小
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        animations.registerAnimation({  // 注册
          name: 'move',
          animation,
          presets: {
            duration: 400, // 间隔
            easing: 'linear' // 线性缓动
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)  //运行  done回调函数执行的时候则跳到 afterEnter()
      },
      afterEnter() { // 2、vue为我们提供的钩子函数，用于实现特定动画效果
        animations.unregisterAnimation('move')  // 取消注册
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) { // 3、vue为我们提供的钩子函数，用于实现特定动画效果
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()        
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)  //监听 transitionend事件
      },
      afterLeave() { // 4、vue为我们提供的钩子函数，用于实现特定动画效果
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      togglePlaying() { // 播放/暂停
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)  // 然后去watch里监听playing的变化
        if (this.currentLyric) {
          this.currentLyric.togglePlay()  // toggle play state
        }
      },
      end() { // audio本身没有切换到下一首歌的功能，当我们把进度条拉到末尾，歌曲就会结束播放，不会自动播放下一首。这时就要通过audio派发的end事件来做处理
        if (this.mode === playMode.loop) { // 假如是单曲循环
          this.loop()
        } else { // 否则播放下一首
          this.next()
        }
      },
      loop() {  // 单曲循环
        this.$refs.audio.currentTime = 0  // 从头开始播放
        this.$refs.audio.play()
        this.setPlayingState(true)
        if (this.currentLyric) {
          this.currentLyric.seek(0) //seek to correspond starTime 查找到相应的播放时间点
        }
      },
      next() { // 下一首
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) { // 当播放到最后一首
            index = 0
          }
          this.setCurrentIndex(index)  // currentIndex发生变化，currentSong相应发生更改
          if (!this.playing) { // 暂停状态下点击下一首歌
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      prev() {  // 上一首
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {   // 表示在往第一首歌往前退，所以会变为最后一首歌
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      ready() {  // （为用户快速点击所做的处理）audio 上触发，表示只有this.songReady = true时才可以播放， 歌曲ok
        this.songReady = true
        this.savePlayHistory(this.currentSong) //存储播放纪录
      },
      error() { // （为用户快速点击所做的处理）audio 上触发，当网络出现错误或下一首歌不存在时触发
        this.songReady = true
      },
      updateTime(e) {  //audio对象派发的timeupdate事件的回调函数（用于获取音乐播放的当前进度时间）
        this.currentTime = e.target.currentTime
      },
      format(interval) {  //时间格式转化
        interval = interval | 0  // |0操作符，向下取整         
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      onProgressBarChange(percent) {  // 通过 progress-bar组件派发过来的进度条改变事件
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime  // 把当前进度时间传给audio, 使其从这个时间点继续播放
        if (!this.playing) { //当歌曲停止播放的时候拖动，拖动完歌曲自动播放
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)  // 拖动进度条歌词也跟着滚动到对应时间所在的位置
        }
      },
      getLyric() {  // 调取歌词数据
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)  // https://github.com/ustbhuangyi/lyric-parser
          if (this.playing) {  // 如果歌曲正在播放
            this.currentLyric.play()  // 调用play方法; play the lyric
          }
        }).catch(() => { // 获取不到歌词的情况
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {  // （回调）当歌词切换到下一行时执行 （this hanlder called when lineNum change）
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]  // 大于5行滚动
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      showPlaylist() {
        this.$refs.playlist.show()  //调用playlist的show方法
      },
      // ====================================================
      middleTouchStart(e) { //touch开始（类似process-bar组件）
        this.touch.initiated = true  // 表示已经初始化过了
        // 用来判断是否是一次移动
        this.touch.moved = false
        const touch = e.touches[0]        
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]        
        const deltaX = touch.pageX - this.touch.startX  // X轴的滑动距离
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) { // 当纵轴的偏移大于横轴的偏移时，不应该去左右移动          
          return
        }
        if (!this.touch.moved) {
          this.touch.moved = true
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0 // 时间
        this.$refs.middleL.style.opacity = 1 - this.touch.percent // 透明度越来越小
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        if (!this.touch.moved) {
          return
        }
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {  // 从右向左滑
          if (this.touch.percent > 0.1) { // 当滑动距离大于10%
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {   // 从左向右滑
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300 // 动画时间
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      //=====================================================
      _pad(num, n = 2) {  // 个位数前面补0
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      _getPosAndScale() { // 获取位置和缩放比，用于动画(大小CD过渡)
        const targetWidth = 40  // 目标宽度, 左下角小圆圈图
        const paddingLeft = 40  // 左部偏移
        const paddingBottom = 30 // 底部偏移
        const paddingTop = 80 // 大CD距离顶部的高度
        const width = window.innerWidth * 0.8  //  大CD的宽度
        const scale = targetWidth / width   // 缩小比例
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom  //（这里的Y轴跟我们平时的y轴刚好相反，所以是正数）
        return {
          x,
          y,
          scale
        }
      },
      // mapMutations\mapActions映射  在methods中引入
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong(newSong, oldSong) { // 监听歌曲的变化
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {  // 切换播放模式的过程中，会监听到currentSong的改变，导致暂停的歌曲再次播放，这里需做判断拦截歌曲播放
          return
        }
        if (this.currentLyric) { // 在切换歌曲的时候，若存在上一个this.currentLyric，则应该执行stop()
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {  // 监听播放状态，控制音乐播放、暂停
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()  // play()  pause()都是audio实例的方法
        })
      },
      fullScreen(newVal) {  // 监听全屏
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh()
          }, 20)
        }
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite  // cd旋转
              &.pause
                animation-play-state: paused  // 停止旋转
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>