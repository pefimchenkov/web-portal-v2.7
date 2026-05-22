<template>
  <div class="auth-page">
    <form class="auth-form" @submit.prevent="handleLogin">
      <h2>Вход</h2>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <label>
        Email
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>

      <label>
        Пароль
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>

      <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'; // Vue 2.7: Composition API встроен
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router/composables'; // vue-router 3.x

export default {
  name: 'LoginView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const form = ref({ email: '', password: '' });
    const loading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;
      try {
        await store.dispatch('auth/login', form.value);
        
        // Редирект на исходную страницу или на /dashboard
        const redirect = route.query.redirect || '/dashboard';
        router.push(redirect);
      } catch (err) {
        error.value = err.response?.data?.message || 'Ошибка входа';
      } finally {
        loading.value = false;
      }
    };

    return { form, loading, error, handleLogin };
  },
};
</script>
