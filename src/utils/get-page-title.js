import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Веб портал ТСД ГРУПП'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
