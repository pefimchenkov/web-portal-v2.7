<template>
  <div class="board-column">
    <div class="board-column-header">
      {{ headerText }}
    </div>
    <draggable
      :list="list"
      v-bind="$attrs"
      class="board-column-content"
      :set-data="setData"
    >
      <template v-if="list.length > 0">
        <div v-for="(element,i) in list" :key="i" class="board-item">
          <div style="display: flex; justify-content: space-between">
            <div style="font-weight: 600; width: 30%">{{ element.Remont }}</div><span style="color: #d74700">{{ '[' + (element.group[0]?.nomer || 'нет номера') + ']' }}</span>
            <div style="text-align: center; width: 50%" v-html="element.status ? colorStatus(element.status[0]) : ''" />
            <i 
              v-if="element.group.every(i => (i.marked !== 1)) && (element.group.length !== 0)"
              class="el-icon-check" style="text-align: end;  width: 10%"
            />
          </div>
          <span v-if="element.group.length === 0">В данном ремонте ЗИП отсутствует</span>

          <div v-for="(item, idx) of sortedItems(element.group)" :key="idx" style="line-height: 1.1em">
            <span>
              {{ '[' + item.id + '] ' }}
            </span>
            <span v-if="item.marked === 0" :style="`color: #4A9FF9`">
              {{ item.Type + ' (' + item.ArtF + ')' }} - {{ item.q }} шт.
            </span>
            <span v-else :style="`color: ${item.marked === 2 ? '#000' : '#666666'}`">
              {{ item.Type + ' (' + item.ArtF + ')' }} - {{ item.q }} шт.
            </span>
          </div>
          <div class="text-end"><el-checkbox v-model="element.checked" /></div>

        </div>

      </template>

      <template v-else>
        <div class="board-item">
          Нет доступных ремонтов.
        </div>
      </template>

    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'DragKanbanDemo',

  components: {
    draggable
  },

  props: {
    headerText: {
      type: String,
      default: 'Заголовок'
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },

  mounted() {
  },

  methods: {
    setData(dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    },

    sortedItems(data) {
      return data.slice().sort((a, b) => (b.marked - a.marked))
    },

    colorStatus(status) {
      switch (true) {
        case status === 'Закрыт': return `<span style="color: green">${status}</span>`
        case status === 'Открыт': return `<span style="color: #0052cc">${status}</span>`
        case status === 'Диагностика': return `<span style="color: #0052cc">${status}</span>`
        case status === 'Ремонт': return `<span style="color: #0052cc">${status}</span>`
        case status === 'Ремонт завершён': return `<span style="color: green">${status}</span>`
        case status === 'Диагностика завершена': return `<span style="color: green">${status}</span>`
        default: return status
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.board-column {
  min-width: 450px;
  min-height: 100px;
  height: auto;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 3px;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    padding: 0 20px;
    text-align: center;
    background: #333;
    color: #fff;
    border-radius: 3px 3px 0 0;
  }

  .board-column-content {
    height: auto;
    overflow: hidden;
    border: 10px solid transparent;
    min-height: 60px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: center;

    .board-item {
      cursor: pointer;
      width: 100%;
     /*  height: 64px; */
      height: 100%;
      margin: 5px 0;
      background-color: #fff;
      text-align: left;
      /* line-height: 54px; */
      line-height: 2em;
      padding: 5px 10px;
      box-sizing: border-box;
      box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.2);
    }
  }
}
</style>

