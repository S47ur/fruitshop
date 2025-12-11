<template>
  <div class="login-page">
    <section class="hero">
      <h1>鲜果智控</h1>
      <p>统一管理采购、销售、库存、资金，让门店运营更轻松。</p>
      <ul>
        <li>实时库存与预警提醒</li>
        <li>多支付方式资金拆解</li>
        <li>采购销售一体化流水</li>
      </ul>
    </section>
    <section class="panel">
      <div class="panel__title-row">
        <p class="panel__title">账户登录</p>
        <button type="button" class="text-link" @click="goRegister">注册新账号</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <label>
          预置账号
          <select v-model="selectedPreset" @change="applyPreset">
            <option v-for="preset in presets" :key="preset.value" :value="preset.value">
              {{ preset.label }}
            </option>
          </select>
        </label>
        <label>
          账号
          <input v-model.trim="form.username" placeholder="fruitboss" autocomplete="username" />
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" placeholder="密码" autocomplete="current-password" />
        </label>
        <div class="form-foot">
          <label class="remember">
            <input v-model="form.remember" type="checkbox" />
            记住我
          </label>
          <button type="button" class="ghost" @click="fillDemo">一键填充体验账号</button>
        </div>
        <button type="submit" class="primary" :disabled="auth.loading">
          {{ auth.loading ? "登录中..." : "立即进入" }}
        </button>
        <p v-if="auth.error" class="error">{{ auth.error }}</p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

const router = useRouter();
const auth = useAuthStore();

const presets = [
  { value: "", label: "选择预置账号" },
  { value: "fruitboss", label: "fruitboss / 123456 · 店主", username: "fruitboss", password: "123456" },
  { value: "cashier", label: "cashier / 888888 · 收银", username: "cashier", password: "888888" },
  { value: "admin", label: "admin / admin123 · 店主", username: "admin", password: "admin123" }
];

const form = reactive({
  username: "",
  password: "",
  remember: true
});

const selectedPreset = ref("");

const applyPreset = () => {
  const preset = presets.find((p) => p.value === selectedPreset.value && p.username);
  if (!preset) return;
  form.username = preset.username as string;
  form.password = preset.password as string;
};

const fillDemo = () => {
  selectedPreset.value = "fruitboss";
  applyPreset();
};

const goRegister = () => {
  const redirect = router.currentRoute.value.fullPath;
  router.push({ path: "/register", query: { redirect } });
};

const handleSubmit = async () => {
  try {
    await auth.login({ username: form.username, password: form.password });
    const redirect = (router.currentRoute.value.query.redirect as string) || "/";
    router.replace(redirect);
  } catch (err) {
    // error handled in store
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  background: linear-gradient(135deg, #0f172a, #1e293b);
  padding: 60px;
  gap: 32px;
  color: white;
}

.hero {
  max-width: 480px;
}

.hero h1 {
  font-size: 48px;
  margin: 0 0 12px 0;
}

.hero p {
  color: rgba(255, 255, 255, 0.8);
}

.hero ul {
  margin-top: 24px;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.panel {
  background: white;
  color: #0f172a;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
}

.panel__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 500;
}

input[type="text"],
input[type="password"],
input:not([type]) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 16px;
}

select {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 16px;
  background: white;
}

.form-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button.primary {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.ghost {
  background: transparent;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.4);
  border-radius: 999px;
  padding: 6px 14px;
}

button.text-link {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 0;
}

.remember {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 400;
}

.error {
  color: #dc2626;
  font-size: 14px;
}

@media (max-width: 720px) {
  .login-page {
    padding: 32px 20px;
  }
}
</style>
