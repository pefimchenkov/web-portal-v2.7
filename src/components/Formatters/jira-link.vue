<template>
  <span>
    <a
      v-for="item of dataParser(row[column])"
      :key="item"
     :href="link + item"
     target="_blank">
     {{ item }}<br>
    </a>
  </span>
</template>

<script>

import { jira_url } from '@/settings'

export default {
  name: 'JiraLink',
  props: ['url', 'column', 'row'],
  methods: {
    dataParser(data) {
      if (data) return data.split(',').map(i => i.trim())
    }
  },

  computed: {
    link() {
      return (this.url || jira_url);
    }
  }
}
</script>
