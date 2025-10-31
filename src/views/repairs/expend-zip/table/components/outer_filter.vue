<template>
  <div style="width: 50%">
    <el-skeleton animated style="width: 75%">
      <template slot="template">
        <div style="display: flex; align-items: center; justify-items: space-between">
        <el-skeleton-item
            v-if="!periods.length"
            variant="text"
            style="width: 30%; height: 20px; margin: 0 10px"
          />
          <el-select
            v-else
            v-model="filters.period"
            class="mr-2"
            size="mini"
            clearable
            placeholder="Период"
            value-key="name"
            style="min-width: 120px;"
          >
            <el-option
              v-for="item in periods"
              :key="item.id"
              :value="item"
              :label="item.name"
              :options="item"
            >
              {{ item.name }}
            </el-option>
          </el-select>
          <el-skeleton-item
            v-if="!clients.length"
            variant="text"
            style="width: 30%; height: 20px; margin: 0 10px"
          />
          <el-select
            v-else
            v-model="filters.clients"
            class="mr-2"
            size="mini"
            collapse-tags
            clearable
            filterable
            multiple
            placeholder="Клиенты"
            style="min-width: 120px;"
          >
            <el-option v-for="item in filteredClients" :key="item?.ID" :value="item?.NAME" />
          </el-select>

          <el-skeleton-item
            v-if="!engineers.length"
            variant="text"
            style="width: 30%; height: 20px; margin: 0 10px"
          />
          <el-select
            v-else
            v-model="filters.engineer"
            collapse-tags
            class="mr-2"
            clearable
            filterable
            size="mini"
            placeholder="Инженер"
            style="min-width: 120px;"
          >
            <el-option
              v-for="item in filteredEngineers"
              :key="item?.user_name"
              :value="item?.display_name"
            />
          </el-select>

          <el-select
            v-model="filters.type"
            class="mr-2"
            collapse-tags
            size="mini"
            placeholder="Тип"
            style="min-width: 120px;"
          >
            <el-option v-for="item in types" :key="item.id" :value="item.value" :label="item.name" />
          </el-select>

          <el-button type="primary" size="mini" class="ml-5" @click="getData(1)">
            Фильтр
          </el-button>
          <el-button
            v-if="counter > 0"
            type="info"
            size="mini"
            class="ml-5"
            @click="getData(0)"
          >
            Сбросить
          </el-button>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
export default {
  props: {
    periods: {
      type: Array,
      default: () => {},
    },
    clients: {
      type: Array,
      default: () => [],
    },
    engineers: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      filters: {
        period: null,
        clients: [],
        models: [],
        type: null,
        engineer: null,
      },
      counter: null,
      types: [
        { id: 1, name: 'Ремонты', value: 'rem' },
        { id: 2, name: 'Продажи', value: 'sale' },
      ]
    };
  },

  computed: {
    filteredEngineers() {
      return this.engineers.filter(eng => eng)
    },
    filteredClients() {
      return this.clients.filter(client => client)
    },

  },

  methods: {
    getData(counter) {
      if (counter === 0) {
        this.filters.period = null;
        this.filters.clients = [];
        this.filters.engineer = null;
        this.filters.type = null;
      }
      const client_ids = this.filters.clients.map(
        (name) => this.clients.find((i) => i?.NAME === name)?.ID
      );

      const engineer = this.engineers.find(
        (user) => user?.display_name === this.filters.engineer
      )?.user_name;

      this.$emit("getData", { clients: client_ids, engineer, type: this.filters.type, period: this.filters.period?.value, period_number: this.filters.period?.id });
      this.counter = counter;
    },
  },
};
</script>

<style lang="scss"></style>
