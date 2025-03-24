<template functional>
  <span>
    <span v-if="typeof props.row[props.column].color === 'function'" :style="`${props.row[props.column].color()}`">{{ props.row[props.column].data }}</span>
    <span v-else :style="`color: ${props.row[props.column].color}`">{{ props.row[props.column].data }}</span>
  </span>
</template>

<script>

export default {
  name: 'Coloration',
}
</script>
