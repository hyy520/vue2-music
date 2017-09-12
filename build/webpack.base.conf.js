//此配置文件是vue开发环境的wepack相关配置文件，主要用来处理各种文件的配置

var path = require('path')
var utils = require('./utils')
var config = require('../config')
// vue-loader.conf配置文件是用来解决各种css文件的，定义了诸如css,less,sass之类的和样式有关的loader
var vueLoaderConfig = require('./vue-loader.conf')
// 此函数是用来返回当前目录的平行目录的路径，因为有个'..'
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    // 入口文件是src目录下的main.js
    app: './src/main.js'
  },
  output: {
    // 路径是config目录下的index.js中的build配置中的assetsRoot，也就是dist目录
    path: config.build.assetsRoot,
    // 文件名称这里使用默认的name也就是main
    filename: '[name].js',
    // 上线地址，也就是真正的文件引用路径，如果是production生产环境，其实这里都是 '/'
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    // resolve是webpack的内置选项，顾名思义，决定要做的事情，也就是说当使用 import "jquery"，该如何去执行这件事
    // 情就是resolve配置项要做的，import jQuery from "./additional/dist/js/jquery" 这样会很麻烦，可以起个别名简化操作
    extensions: ['.js', '.vue', '.json'], // 省略扩展名，也就是说.js,.vue,.json文件导入可以省略后缀名，这会覆盖默认的配置，所以要省略扩展名在这里一定要写上
    alias: {
      'src': resolve('src'),
      'common': resolve('src/common'),
      'components': resolve('src/components'),
      'base': resolve('src/base'),
      'api': resolve('src/api')
    }
  },
  // module用来解析不同的模块
  module: {
    rules: [
      // {
      //   test: /\.(js|vue)$/, // 也就是说，对.js和.vue文件在编译之前进行检测，检查有没有语法错误
      //   loader: 'eslint-loader',
      //   enforce: 'pre', // 此选项指定enforce: 'pre'选项可以确保，eslint插件能够在编译之前检测，如果不添加此项，就要把这个配置项放到末尾，确保第一个执行
      //   include: [resolve('src'), resolve('test')], // include选项指明这些目录下的文件要被eslint-loader检测，还有一个exclude表示排除某些文件夹
      //   options: {
      //        // formatter是参数的名称，eslint-friendly-formatter是eslint的一个报告总结插件，也就是说eslint的检测
          
      //     formatter: require('eslint-friendly-formatter')
      //   }
      // },
      {
        test: /\.vue$/, // 对js文件使用babel-loader转码,该插件是用来解析es6等代码
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        // 对图片相关的文件使用 url-loader 插件，这个插件的作用是将一个足够小的文件生成一个64位的DataURL
        // 可能有些老铁还不知道 DataURL 是啥，当一个图片足够小，为了避免单独请求可以把图片的二进制代码变成64位的
        // DataURL，使用src加载，也就是把图片当成一串代码，避免请求，神不神奇？？
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // 限制 10000 个字节以下的图片才使用DataURL
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        // 字体文件处理，和上面一样
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
}
