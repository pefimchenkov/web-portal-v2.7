import Vue from 'vue'
import { AclInstaller, AclCreate, AclRule } from 'vue-acl'
import 'regenerator-runtime/runtime'
import router from './router'
import store from './store'

Vue.use(AclInstaller)

export default new AclCreate({
  initial: 'public',
  notfound: '/forbidden',
  router,
  acceptLocalRules: true,
  globalRules: {
    Admin: new AclRule('admin').generate(),
    Financier: new AclRule('financier').or('superFinancier').or('limitedFinancier').or('admin').generate(),
    FinancierAndManager: new AclRule('financier').or('superFinancier').or('limitedFinancier').or('serviceManager').or('manager').or('admin').generate(),
    SuperFinancier: new AclRule('superFinancier').or('admin').generate(),
    Crm: new AclRule('crm').or('admin').generate(),
    Nom: new AclRule('nom').or('admin').generate(),
    Order: new AclRule('order').or('admin').generate(),
    Agent: new AclRule('agent').or('admin').generate(),
    OnlyAgent: new AclRule('agent').generate(),
    Manager: new AclRule('manager').or('engineer').or('leadEngineer').or('serviceManager').or('financier').or('admin').generate(),
    ServiceManager: new AclRule('serviceManager').or('financier').or('admin').generate(),
    LeadEngineer: new AclRule('leadEngineer').or('admin').generate(),
    Engineer: new AclRule('engineer').or('leadEngineer').or('admin').generate(),
    User: new AclRule('user').or('financier').or('engineer').or('manager').or('leadEngineer').or('serviceManager').or('superFinancier').or('limitedFinancier').or('admin').generate(),
    Public: new AclRule('public').or('user').or('financier').or('engineer').or('manager').or('leadEngineer').or('serviceManager').or('superFinancier').or('limitedFinancier').or('admin').generate(),
  },
  middleware: async acl => {
    const userRole = await store.getters.userRole
    if (userRole.length > 0) acl.change(userRole)
  }
})
