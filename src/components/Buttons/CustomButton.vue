<template>
  <button
    type="button"
    :class="[
      'custom-button',
      type,
      { 'is-disabled': disabled },
      { 'is-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Иконка перед текстом -->
    <span v-if="icon && !isLoading" class="button-icon-left">
      <i :class="['el-icon-' + icon]"></i>
    </span>

    <!-- Иконка загрузки -->
    <span v-if="loading" class="button-icon-loading">
      <i class="el-icon-loading"></i>
    </span>

    <!-- Текст кнопки -->
    <span v-if="!loading" :class="{ 'text-primary': type === 'primary' }">
      <slot />
    </span>

    <!-- Иконка справа -->
    <span v-if="icon && !isLoading" class="button-icon-right">
      <i :class="['el-icon-' + icon]"></i>
    </span>
  </button>
</template>

<script setup>

import { watch, ref } from "vue"

// Props
const props = defineProps({
  // Тип кнопки: primary, success, warning, danger
  type: {
    type: String,
    default: 'primary'
  },
  // Иконка (например, 'Upload')
  icon: {
    type: String,
    default: ''
  },
  // Состояние загрузки
  loading: {
    type: Boolean,
    default: false
  },
  // Запрет на нажатие
  disabled: {
    type: Boolean,
    default: false
  }
})

let isLoading = ref(false)

// Эмит событий (если нужно передать события родителю)
const emit = defineEmits(['click', 'update:loading'])

// Обработчик клика
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

watch(() => props.loading, (val) => {
  isLoading.value = val
})


</script>

<style lang="scss" scoped>
.custom-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;

  // Основной стиль
  &.primary {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;

    &:hover:not(:disabled) {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }

    &:active:not(:disabled) {
      background-color: #337ecc;
      border-color: #337ecc;
    }
  }

  // Тип success
  &.success {
    background-color: #67c23a;
    color: #fff;
    border-color: #67c23a;

    &:hover:not(:disabled) {
      background-color: #85ce61;
      border-color: #85ce61;
    }
  }

  // Тип warning
  &.warning {
    background-color: #e6a23c;
    color: #fff;
    border-color: #e6a23c;

    &:hover:not(:disabled) {
      background-color: #ebb563;
      border-color: #ebb563;
    }
  }

  // Тип danger
  &.danger {
    background-color: #f56c6c;
    color: #fff;
    border-color: #f56c6c;

    &:hover:not(:disabled) {
      background-color: #f78989;
      border-color: #f78989;
    }
  }

  // Тип plain (прозрачный)
  &.plain {
    background-color: #fff;
    border-color: #dcdfe6;
    color: #606266;

    &:hover:not(:disabled) {
      background-color: #f4f4f5;
      color: #909399;
    }
  }

  // Запрет
  .is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: #e6e6e6;
    color: #909399;
    border-color: #e6e6e6;

    &:hover {
      background-color: #e6e6e6;
      cursor: not-allowed;
    }
  }
}

// Иконки
.button-icon-left,
.button-icon-right {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  margin-left: 8px;

  i {
    font-size: 16px;
    line-height: 1;
  }
}

// Иконка загрузки
.is-loading {
  .el-icon-loading {
    animation: loading-rotate 2s linear infinite;
    animation: loading-pulse 1.5s ease-in-out infinite;
    animation: loading-reverse 1.5s ease-in-out infinite reverse;
    animation-fill-mode: both;
  }
}

@keyframes loading-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes loading-pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

@keyframes loading-reverse {
  0% { transform: translateX(0); }
  50% { transform: translateX(1); }
  100% { transform: translateX(0); }
}
</style>