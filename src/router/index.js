import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '*',
      // 1. 本機
      redirect: '/admin/member' // '/admin/dashBoard'
      // 2. server
      // redirect: '/AdminUI/admin/member'
    },
    {
      // 1. 本機
      path: '/login',
      // 2. server
      // path: '/AdminUI/login',
      name: 'login',
      component: () => import('@/pages/Login')
    },
    {
      // 1. 本機
      path: '/admin',
      // 2. server
      // path: '/AdminUI/admin',
      name: 'homepage',
      component: () => import('@/pages/Home'),
      redirect: '/member', // '/dashBoard',
      children: [
        // {
        //   path: 'dashBoard',
        //   name: 'dashBoard',
        //   meta: { requiresAuth: true }, // 是否要驗證
        //   component: () => import('@/pages/Dashboard')
        // },
        {
          path: 'member',
          name: 'member',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Member')
        },
        {
          path: 'member/:id',
          name: 'memberEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/MemEdit'),
          redirect: 'member/:id',
          children: [
            {
              path: '',
              name: 'memAccountrecords',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/MemAccountrecords')
            },
            {
              path: 'memTransactionrecords',
              name: 'memTransactionrecords',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/MemTransactionrecords')
            },
            {
              path: 'memTicketholder',
              name: 'memTicketholder',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/MemTicketholder')
            }
          ]
        },
        {
          path: 'business',
          name: 'business',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Business')
        },
        {
          path: 'business/:id',
          name: 'businessEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          // component: () => import('@/pages/Tablelist')
          component: () => import('@/pages/BusinessEdit'),
          redirect: 'business/:id',
          children: [
            {
              path: '',
              name: 'businessInfo',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/BusinessInfo')
            },
            {
              path: 'businessCounter',
              name: 'businessCounter',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/BusinessCounter')
            },
            {
              path: 'businessCounter/edit/:bsID',
              name: 'businessCounterEdit',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/BusinessCounterEdit')
            }
          ]
        },
        {
          path: 'shop',
          name: 'shop',
          meta: { requiresAuth: true }, // 是否要驗證
          // component: () => import('@/pages/Tablelist')
          component: () => import('@/pages/Shop'),
          redirect: 'shop',
          children: [
            {
              path: '',
              name: 'shopInfo',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/ShopInfo')
            },
            {
              path: 'companyInfo',
              name: 'companyInfo',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/ShopCompany')
            },
            {
              path: 'shopCate',
              name: 'shopCate',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/ShopCate')
            }
          ]
        },
        {
          path: 'notification',
          name: 'notification',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Notification')
        },
        {
          path: 'notification/:id',
          name: 'notificationEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/NotificationEdit')
        },
        {
          path: 'coupon',
          name: 'coupon',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Coupon')
        },
        {
          path: 'coupon/:id',
          name: 'couponEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/CouponEdit')
        },
        {
          path: 'event',
          name: 'event',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Event')
        },
        {
          path: 'event/:id',
          name: 'eventEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/EventEdit'),
          redirect: 'event/:id',
          children: [
            {
              path: '',
              name: 'eventCsv',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/EventCsv')
            },
            {
              path: 'eventCsvUselessList',
              name: 'eventCsvUselessList',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/EventCsvUselessList')
            },
            {
              path: 'eventCsvOverSendList',
              name: 'eventCsvOverSendList',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/EventCsvOverSendList')
            },
            {
              path: 'eventProgressList',
              name: 'eventProgressList',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/EventProgressList')
            },
            {
              path: 'eventCsvHistory',
              name: 'eventCsvHistory',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/EventCsvHistory')
            }
          ]
        },
        {
          path: 'banner',
          name: 'banner',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Banner')
        },
        {
          path: 'banner/:id',
          name: 'bannerEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/BannerEdit')
        },
        {
          path: 'report',
          name: 'report',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Report'),
          redirect: 'report',
          children: [
            {
              path: '',
              name: 'transDetail',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/ReportTransDetail')
            },
            {
              path: 'reportCoupon',
              name: 'reportCoupon',
              meta: { requiresAuth: true }, // 是否要驗證
              component: () => import('@/pages/ReportCoupon')
            }
          ]
        },
        {
          path: 'forms',
          name: 'forms',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Forms')
        },
        {
          path: 'account',
          name: 'account',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/Account')
        },
        {
          path: 'account/:id',
          name: 'accountEdit',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/AccountEdit')
        },
        {
          path: 'system',
          name: 'system',
          meta: { requiresAuth: true }, // 是否要驗證
          component: () => import('@/pages/System')
        }
      ]
    }
  ]
})
