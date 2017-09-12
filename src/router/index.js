import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

//路由懒加载(每个组件都异步加载)
//当打包构建应用时，Javascript 包会变得非常大，影响页面加载。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，这样就更加高效了。
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'  // 指定跳转地址
    },
    {
      path: '/recommend',
      component: Recommend,
      children:[
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children:[    // 二级路由
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children:[    
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children:[    // 二级路由
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
