import store from '@/store';
/* 
if (!store.getters.jira_users.length) {
  console.log('filters', !store.getters.jira_users.length) 
  store.dispatch('fetchJiraUsers')
} 
*/

/* возвращает displayName по email или username */
export function getUserName(name) {
  if (!name) return
  const user = store.getters.jira_users.find(user => user.user_name === name || user.email === name)
  return user
    ? user.display_name
    : name
}

/* Возвращает email по displayName */
export function getUserEmail(displayname) {
  const user = store.getters.jira_users.find(user => (user.display_name === displayname || user.user_name === displayname))
  return user
    ? user.email
    : displayname
}
