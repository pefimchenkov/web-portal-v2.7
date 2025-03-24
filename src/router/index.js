import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index'),
        meta: {
          rule: 'Public'
        }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/',
        component: () => import('@/views/dashboard'),
        name: 'Dashboard',
        meta: {
          rule: 'Public',
          affix: true,
          title: 'Рабочий стол',
          icon: 'dashboard'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/auth/Login'),
    hidden: true,
    meta: {
      rule: 'Public'
    }
  },
  {
    path: '/registration',
    name: 'reg',
    hidden: true,
    component: () => import('@/components/auth/Registration'),
    meta: {
      rule: 'Public'
    }
  },
  {
    path: '/profile',
    component: Layout,
    hidden: false,
    children: [
      {
        path: '',
        /* component: () => import('@/views/user/UserProfile'), */
        component: () => import('@/views/profile'),
        name: 'Profile',
        meta: {
          title: 'Профиль',
          rule: 'User',
          roles: ['user'],
          icon: 'user',
          noCache: true
        }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */

export const asyncRoutes = [
  {
    path: '/b2b',
    component: Layout,
    redirect: '/b2b/list_setup',
    alwaysShow: true,
    name: 'b2b',
    meta: {
      title: 'b2b',
      icon: 'b2b',
      rule: 'Manager',
      roles: ['manager', 'serviceManager']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/b2b/list_setup.vue'),
        name: 'b2b-list',
        meta: {
          title: 'Запрос данных',
          rule: 'Manager'
        }
      }
    ]
  },

  {
    path: '/zip',
    component: Layout,
    redirect: '/zip/list',
    alwaysShow: true,
    name: 'zip',
    meta: {
      title: 'ЗИП',
      icon: 'memory',
      rule: 'Engineer',
      roles: ['engineer', 'leadEngineer']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/zip/list'),
        name: 'list',
        meta: {
          title: 'Список ЗИП',
          rule: 'Engineer'
        }
      },
      {
        path: 'specprices',
        component: () => import('@/views/zip/specprices/index.vue'),
        name: 'specprices',
        meta: {
          title: 'Спеццены',
          rule: 'Engineer'
        }
      },
      {
        path: '/zip/sn',
        component: () => import('@/views/zip/sn/index.vue'),
        name: 'sn',
        meta: {
          title: 'Серийные номера',
          rule: 'Engineer'
        }
      },
      {
        path: 'dictionary',
        component: () => import('@/views/zip/dictionary'),
        name: 'dictionary',
        meta: {
          title: 'Справочники ЗИП',
          rule: 'Engineer'
        }
      },
      {
        path: '/zip/:id(\\d+)',
        props: true,
        name: 'zip_detailed',
        hidden: true,
        component: () => import('@/views/zip/detailed/'),
        meta: {
          title: 'ЗИП №',
          rule: 'Engineer'
        }
      }
    ]
  },

  {
    path: '/models',
    component: Layout,
    redirect: '/models/list',
    alwaysShow: true,
    name: 'models',
    meta: {
      title: 'Модели',
      icon: 'model',
      rule: 'Engineer',
      roles: ['engineer', 'leadEngineer']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/models/list.vue'),
        name: 'models_list',
        meta: {
          title: 'Список моделей',
          rule: 'Engineer'
        }
      },
      {
        path: 'dictionary',
        component: () => import('@/views/models/dictionary'),
        name: 'models_dictionary',
        meta: {
          title: 'Справочники моделей',
          rule: 'Engineer'
        }
      }
    ]
  },

  {
    path: '/market',
    component: Layout,
    redirect: '/market/list-setup.vue',
    alwaysShow: true,
    name: 'market',
    meta: {
      title: 'Маркет',
      icon: 'market',
      rule: 'User',
      roles: ['user', 'manager', 'serviceManager', 'engineer', 'leadEngineer']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/market/list-setup.vue'),
        name: 'market_list',
        meta: {
          title: 'Список Маркет',
          rule: 'Manager'
        }
      },
      {
        path: '/orders/list',
        component: () => import('@/views/market/orders/list.vue'),
        name: 'orders_list',
        meta: {
          title: 'Список заказов',
          rule: 'Admin'
        }
      },
      {
        path: '/market/:id',
        component: () => import('@/views/market/detail/index.vue'),
        name: 'market_detailed',
        props: true,
        hidden: true,
        meta: {
          title: 'Позиция в маркете №',
          rule: 'Manager',
          roles: ['manager', 'serviceManager', 'financier', 'engineer', 'leadEngineer']
        }
      }
    ]
  },

  {
    path: '/clients',
    component: Layout,
    redirect: '/clients/list',
    alwaysShow: true,
    props: true,
    name: 'clients',
    meta: {
      title: 'Клиенты',
      icon: 'clients',
      rule: 'Manager',
      roles: ['manager', 'serviceManager', 'financier', 'enginner', 'leadEngineer']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/clients/list'),
        name: 'clients_list',
        meta: {
          title: 'Список клиентов',
          rule: 'Manager'
        }
      },
      {
        path: '/clients/:id',
        props: true,
        name: 'client',
        hidden: true,
        component: () => import('@/views/clients/id'),
        meta: {
          title: 'Клиент №',
          rule: 'Manager'
        }
      }
    ]
  },

  {
    path: '/deals',
    component: Layout,
    redirect: 'deals/list',
    alwaysShow: true,
    name: 'deals',
    meta: {
      title: 'Сделки',
      icon: 'deals',
      rule: 'Financier',
      roles: ['financier', 'superFinancier', 'limitedFinancier']
    },
    children: [
      /* {
        path: 'list',
        component: () => import('@/views/deals/list'),
        name: 'deals_list',
        meta: {
          title: 'Со счетами',
          rule: 'Financier'
        }
      }, */
      {
        path: 'list_no_bills',
        name: 'deals_list_no_bills',
        component: () => import('@/views/deals/list-no-bills'),
        meta: {
          title: 'Без счетов',
          rule: 'Financier'
        }
      },
      {
        path: '/deals/:id/:bill_1c',
        name: 'detailed_deal',
        props: true,
        hidden: true,
        component: () => import('@/views/deals/detailed'),
        meta: {
          title: 'Позиция №',
          rule: 'Financier'
        }
      }
    ]
  },

  {
    path: '/budget',
    component: Layout,
    redirect: 'budget/income/invoices',
    alwaysShow: true,
    name: 'budget',
    meta: {
      title: 'Бюджет',
      icon: 'budget',
      rule: 'FinancierAndManager',
      roles: ['financier', 'superFinancier', 'limitedFinancier', 'manager', 'serviceManager']
    },
    children: [
      {
        path: 'income/invoices',
        name: 'budget_income',
        component: () => import('@/views/budget/income/index_invoices.vue'),
        meta: {
          title: 'Реестр счетов',
          rule: 'FinancierAndManager'
        }
      },
      {
        path: 'income/sales',
        name: 'budget_income_sales',
        component: () => import('@/views/budget/income/index_sales.vue'),
        meta: {
          title: 'Реестр реализаций',
          rule: 'FinancierAndManager'
        }
      },
      {
        path: 'income/payments',
        name: 'budget_income_payments',
        component: () => import('@/views/budget/income/index_payments.vue'),
        meta: {
          title: 'Реестр поступлений',
          rule: 'FinancierAndManager'
        }
      },
      {
        path: 'income/inactive',
        name: 'budget_income_inactive',
        component: () => import('@/views/budget/income/index_inactive.vue'),
        meta: {
          title: 'Неактивные счета',
          rule: 'FinancierAndManager',
        }
      },
      {
        path: 'pays/fact',
        name: 'budget_pays_fact',
        component: () => import('@/views/budget/pays/index_fact.vue'),
        meta: {
          title: 'Фактические расходы',
          rule: 'FinancierAndManager'
        }
      },
      {
        path: 'pays/plan',
        name: 'budget_pays_plan',
        component: () => import('@/views/budget/pays/index_plan.vue'),
        meta: {
          title: 'Планируемые расходы',
          rule: 'FinancierAndManager'
        }
      },
      {
        path: 'plans',
        name: 'budget_plans',
        component: () => import('@/views/budget/plans/index.vue'),
        meta: {
          title: 'Планирование',
          rule: 'Financier'
        }
      },
      {
        path: 'finance',
        name: 'budget_finance',
        component: () => import('@/views/crm/Finance'),
        meta: {
          title: 'Финансы',
          rule: 'Financier'
        }
      }
    ]
  },

  {
    path: '/dictionaries',
    component: Layout,
    redirect: 'dictionaries/tech_properties',
    alwaysShow: true,
    name: 'dictionaries',
    meta: {
      title: 'Справочники',
      icon: 'dictionary',
      rule: 'Engineer',
      roles: ['engineer', 'nom', 'user', 'leadEngineer', 'superFinancier', 'limitedFinancier']
    },
    children: [
      {
        path: 'tech_properties',
        component: () => import('@/views/dictionaries/tech-properties/'),
        name: 'tech_properties',
        meta: {
          title: 'ТX',
          rule: 'Engineer'
        }
      },
      {
        path: 'stock_1c',
        name: 'stock_1c',
        component: () => import('@/views/dictionaries/stock-1c/'),
        meta: {
          title: 'Склад 1С',
          rule: 'Nom'
        }
      },
      {
        path: '/atlas_pro',
        name: 'atlas_pro',
        component: () => import('@/views/atlas-pro/index.vue'),
        meta: {
          title: 'Атлас Про',
          rule: 'User'
        }
      },
      {
        path: '/crm/dictionaries',
        name: 'crm_dict',
        component: () => import('@/views/crm/Dictionaries'),
        meta: {
          title: 'CRM',
          rule: 'Financier'
        }
      },
      {
        path: '/models/dictionary',
        name: 'dictionary_models',
        component: () => import('@/views/models/dictionary'),
        meta: {
          title: 'Справочники Моделей',
          rule: 'Engineer'
        }
      },
      {
        path: '/zip/dictionary',
        name: 'dictionary_zip',
        component: () => import('@/views/zip/dictionary'),
        meta: {
          title: 'Справочники ЗИП',
          rule: 'Engineer'
        }
      }
    ]
  },

  {
    path: '/repairs',
    component: Layout,
    alwaysShow: true,
    redirect: '/repairs/engineers_stock',
    name: 'repairs',
    meta: {
      title: 'Отдел ремонтов',
      icon: 'tools',
      rule: 'Engineer',
      roles: ['engineer', 'leadEngineer']
    },
    children: [
      {
        path: 'planning',
        component: () => import('@/views/repairs/planning/index.vue'),
        name: 'planning',
        props: true,
        meta: {
          title: 'Планирование',
          rule: 'Engineer',
          roles: ['engineer', 'leadEngineer']
        }
      },
      {
        path: 'engineers_stock',
        component: () => import('@/views/engineers-stock/index.vue'),
        name: 'engineers_stock',
        meta: {
          title: 'Склад инженеров',
          rule: 'Engineer',
          roles: ['engineer', 'leadEngineer']
        }
      },
      {
        path: 'expend_zip',
        component: () => import('@/views/repairs/expend-zip/index.vue'),
        name: 'expend_zip',
        props: true,
        meta: {
          title: 'Расход ЗИП',
          rule: 'Engineer',
          roles: ['engineer', 'leadEngineer']
        }
      },
      {
        path: 'divide_parcel',
        component: () => import('@/views/repairs/divide-parcel/index.vue'),
        name: 'divide_parcel',
        props: true,
        meta: {
          title: 'Деление партии',
          rule: 'Engineer',
          roles: ['engineer', 'leadEngineer']
        }
      },
      {
        path: 'disaccembly',
        component: () => import('@/views/repairs/disaccembly/index.vue'),
        name: 'disaccembly',
        props: true,
        meta: {
          title: 'Комлектация',
          rule: 'Engineer',
          roles: ['engineer', 'leadEngineer']
        }
      },
      {
        path: '/engineers_stock/:eng/:id',
        props: true,
        hidden: true,
        name: 'engineers_stock_details',
        component: () => import('@/views/engineers-stock/components/details'),
        meta: {
          title: 'Позиция №',
          rule: 'Engineer'
        }
      }
    ]
  },

  {
    path: '/external-link',
    component: Layout,
    children: [
      {
        path: 'https://atlas-pro24.ru',
        meta: {
          title: 'Сайт Атлас Про',
          icon: 'link',
          rule: 'Public'
        }
      }
    ]
  },

  {
    path: '*',
    component: Layout,
    children: [
      {
        path: '*',
        component: () => import('@/views/error-page/404'),
        hidden: true,
        meta: {
          rule: '*'
        }
      }
    ]
  }

]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
