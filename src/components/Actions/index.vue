<template>
  <el-dropdown trigger="click" style="cursor: pointer" @command="handleCommand">
    <span>
      <i class="el-icon-more" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <template
        v-for="action in actions || state.defaultActions"
      >
        <el-dropdown-item
          v-if="hasAccess(action.access)"
          :key="action.name"
          :command="{ action: action.name, row: props.row }"
        >
          {{ action.text }}
        </el-dropdown-item>
      </template>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script setup>
import { reactive, getCurrentInstance } from "vue";

const props = defineProps(["row", "actions"]);
const emit = defineEmits([]);

const app = getCurrentInstance()?.proxy;


const state = reactive({
  defaultActions: [
    { name: "update", text: "Редактировать" },
    { name: "remove", text: "Удалить" },
  ],
});

function hasAccess(roles) {
  if (!roles) return true
  if (Array.isArray(roles)) {
    return roles.some(role => app.$acl.check(role));
  }
  return app.$acl.check(roles);
}

function handleCommand(data) {
  emit(data.action, data.row);
}
</script>

