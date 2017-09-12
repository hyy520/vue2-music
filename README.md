# vue-music

> Vue.js 打造高级实战——音乐 App

## 项目树

├── README.md
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── dev-client.js
│   ├── dev-server.js
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   └── prod.env.js
├── index.html
├── package.json
├── prod.server.js
├── src
│   ├── App.vue
│   ├── api  =======================================================================  接口获取
│   │   ├── config.js               调取接口所需公共配置
│   │   ├── rank.js                 排行接口数据
│   │   ├── recommend.js            推荐接口数据
│   │   ├── search.js               搜索接口数据
│   │   ├── singer.js               歌手接口数据
│   │   └── song.js                 歌曲接口数据
│   ├── base  ======================================================================= 基础组件库(基础组件是不会写很多业务逻辑在里面的，它只要告诉外部的业务逻辑组件被点击的是什么，被删除的是什么等；然后把对应的item传出去)
│   │   ├── confirm                 确认框 ****
│   │   │   └── confirm.vue
│   │   ├── listview                类通讯录组件 *****
│   │   │   └── listview.vue
│   │   ├── loading                 加载中 ****
│   │   │   ├── loading.gif
│   │   │   └── loading.vue
│   │   ├── no-result               无数据 ****
│   │   │   ├── no-result.vue
│   │   │   ├── no-result@2x.png
│   │   │   └── no-result@3x.png
│   │   ├── progress-bar            进度条
│   │   │   └── progress-bar.vue
│   │   ├── progress-circle         进度圈
│   │   │   └── progress-circle.vue
│   │   ├── scroll                  滚动 *****
│   │   │   └── scroll.vue
│   │   ├── search-box              搜索框 ***
│   │   │   └── search-box.vue
│   │   ├── search-list             搜索历史纪录列表
│   │   │   └── search-list.vue
│   │   ├── slider                  banner切换 ***
│   │   │   └── slider.vue
│   │   ├── song-list               歌曲列表
│   │   │   ├── first@2x.png
│   │   │   ├── first@3x.png
│   │   │   ├── second@2x.png
│   │   │   ├── second@3x.png
│   │   │   ├── song-list.vue
│   │   │   ├── third@2x.png
│   │   │   └── third@3x.png
│   │   ├── switches                switch ***
│   │   │   └── switches.vue
│   │   └── top-tip                 顶部提示（添加歌曲成功时提示）***
│   │       └── top-tip.vue
│   ├── common  ======================================================================  公共的字体图标、图片、js、stylus
│   │   ├── fonts
│   │   │   ├── music-icon.eot
│   │   │   ├── music-icon.svg
│   │   │   ├── music-icon.ttf
│   │   │   └── music-icon.woff
│   │   ├── image
│   │   │   └── default.png
│   │   ├── js
│   │   │   ├── cache.js           缓存（搜索历史、播放历史等）
│   │   │   ├── config.js          播放模式配置
│   │   │   ├── dom.js             操作dom的基本方法函数
│   │   │   ├── jsonp.js           jsonp封装
│   │   │   ├── mixin.js           混合（混合插入需要的组件，避免重复开发－－> 本项目中用于当存在迷你播放器时挡住底部列表bug的细节处理等）
│   │   │   ├── singer.js          歌手数据处理
│   │   │   ├── song.js            歌曲数据处理
│   │   │   └── util.js            工具、方法
│   │   └── stylus
│   │       ├── base.styl
│   │       ├── icon.styl
│   │       ├── index.styl
│   │       ├── mixin.styl
│   │       ├── reset.styl
│   │       └── variable.styl
│   ├── components  ================================================================   业务组件库
│   │   ├── add-song               添加歌曲到队列
│   │   │   └── add-song.vue
│   │   ├── disc                   歌单详情页(recommend的二级分页）--> 1:左滑动画效果 2:vuex－>mapGetters接收数据 -->子组件：music-list
│   │   │   └── disc.vue
│   │   ├── m-header               头部组件
│   │   │   ├── logo@2x.png
│   │   │   ├── logo@3x.png
│   │   │   └── m-header.vue
│   │   ├── music-list             歌曲列表(推荐、歌手、排行详情页) --> 样式头部bg-image的设置、滚动时背景图的缩放、高斯模糊的实现等 -->子组件：scroll/song-list/loading
│   │   │   └── music-list.vue
│   │   ├── player                 播放器
│   │   │   └── player.vue
│   │   ├── playlist               播放列表(点击mini播放器右侧弹出的列表）
│   │   │   └── playlist.vue
│   │   ├── rank                   排名
│   │   │   └── rank.vue
│   │   ├── recommend              推荐页 -->banner图片切换，图片懒加载，loading加载中，vuex运用，mixins混入 -->子组件：scroll/slider/loading
│   │   │   └── recommend.vue
│   │   ├── search                 搜索  -->子组件：search-box/scroll/search-list/suggest/confirm
│   │   │   └── search.vue
│   │   ├── singer                 歌手页面 -->1、vuex->mapMutations 2、playlistMixin混入   -->子组件：list-view
│   │   │   └── singer.vue
│   │   ├── singer-detail          歌手详情
│   │   │   └── singer-detail.vue 
│   │   ├── suggest                搜索结果
│   │   │   └── suggest.vue
│   │   ├── tab                    tab ***
│   │   │   └── tab.vue
│   │   ├── top-list               排行详情列表页
│   │   │   └── top-list.vue
│   │   └── user-center            用户中心
│   │       └── user-center.vue
│   ├── main.js
│   ├── router
│   │   └── index.js
│   └── store
│       ├── actions.js         //      6、放异步操作或对mutations的封装（处理mutations无法处理的业务）
│       ├── getters.js         //      3、对数据的一些映射
│       ├── index.js           //      1、入口
│       ├── mutation-types.js  //      4、放置方法名 ( 定义修改动作 )
│       ├── mutations.js       //      5、操作state数据（ 修改数据－－> 定义怎么样对这些数据进行修改的逻辑 ）
│       └── state.js           //      2、state：数据---用来存放组件之间共享的数据。他跟组件的data选项类似，只不过data选项是用来存放组件的私有数据
└── static
    ├── 1.png
    ├── 2.png
    ├── 3.png
    ├── 4.png
    └── 5.png



## 项目截图

![image](https://github.com/songhaoreact/vue-music/blob/master/static/1.png)

![image](https://github.com/songhaoreact/vue-music/blob/master/static/2.png)

![image](https://github.com/songhaoreact/vue-music/blob/master/static/3.png)

![image](https://github.com/songhaoreact/vue-music/blob/master/static/4.png)

![image](https://github.com/songhaoreact/vue-music/blob/master/static/5.png)


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
