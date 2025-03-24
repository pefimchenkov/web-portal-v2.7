import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth.js' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  NProgress.start()

  document.title = getPageTitle(to.meta.title)
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: from.fullPath })
      NProgress.done()
    } else {
      if (!store.getters.userRole) {
        try {
          const roles = await store.dispatch('getUserRole')
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          router.addRoutes(accessRoutes)
          // next({ ...to, replace: true })
          router.push({ ...to, replace: true })
        } catch (error) {
            await store.dispatch('LogoutUser')
            Message.error(error || 'Ошибка')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (to.path === '/registration') {
        next()
      } else {
        next(`/login`)
      }
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
