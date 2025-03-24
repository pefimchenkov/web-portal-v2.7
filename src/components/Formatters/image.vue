<template>
  <el-image
    v-if="row[column]"
    style="width: 100px; margin: 0 auto"
    :src="row[column]"
    :preview-src-list="srcList"
  />
</template>

<script>

export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['row', 'column'],
  data() {
    return {
      srcList: [this.row[this.column]]
    }
  },
  methods: {
    zoom(event) {
      console.log(event)
    }
  },
}
</script>
