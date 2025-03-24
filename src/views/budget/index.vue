<template>
  <div>
    <budget-list v-if="$route.name === 'budget_list'" />
    <budget-list-prev v-if="$route.name === 'budget_list_prev'" />
    <pays-list v-if="$route.name === 'pays_list'" />
    <budget-chart v-if="$route.name === 'budget_plans'" />
  </div>
</template>

<script>

import BudgetList from '../../components/crm/BudgetList'
import BudgetListPrev from '../../components/crm/BudgetListPrev'
import PaysList from '../../components/crm/PaysList'
import BudgetChart from '../../components/crm/BudgetChart'

export default {
  components: {
    BudgetList,
    BudgetListPrev,
    PaysList,
    BudgetChart
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
