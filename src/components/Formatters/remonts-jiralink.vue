<template>
  <span>
    <span v-if="typeof row[column].color === 'function'" :style="`${row[column].color()}`">

    <el-tooltip v-if="jql_query_remonts" class="item" content="Нажмите для перехода в фильтр JIRA" effect="light" placement="top">
      <div
        @click="open(jql_query_remonts)"
        class="link"
      >
        {{ row[column].data }}
      </div>
      </el-tooltip>

      <div v-else>
        {{ row[column].data }}
      </div>

    </span>
    <span v-else :style="`color: ${row[column].color}`">

    <el-tooltip v-if="jql_query_remonts" class="item" content="Нажмите для перехода в фильтр JIRA" effect="light" placement="top">
      <div
        @click="open(jql_query_remonts)"
        class="link"
      >
        {{ row[column].data }}
      </div>
    </el-tooltip>

    <div v-else>
        {{ row[column].data }}
      </div>
    </span>
  </span>
</template>

<script>

export default {
  name: 'RemontsJiraLink',

  props: ['row', 'column', 'jql_query_remonts'],

  methods: {
    open(data) {
      window.open(
        data,
        '_blank'
      )
    }
  },
}
</script>

<style lang="scss">
  .link {
    cursor: pointer;
  }
</style>
