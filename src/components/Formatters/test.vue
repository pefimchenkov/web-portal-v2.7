<script>
export default {
  props: ['row', 'column', 'url', 'jql', 'jql_query'],
  render(h) {
    return h('div', this.jql_query)
  }

}
</script>