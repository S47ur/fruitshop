<template>
  <div class="register-page">
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
      <p class="panel__title">用户注册</p>
      <form @submit.prevent="handleSubmit">
        <label>
          用户名
          <input 
            v-model.trim="form.username" 
            placeholder="请输入用户名" 
            autocomplete="username"
            required 
          />
        </label>
        <label>
          姓名
          <input 
            v-model.trim="form.name" 
            placeholder="请输入真实姓名" 
            required 
          />
        </label>
        <label>
          密码
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="至少6位密码" 
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>
        <label>
          确认密码
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="再次输入密码" 
            autocomplete="new-password"
            required 
          />
        </label>
        <label>
          邀请码
          <input 
            v-model.trim="form.inviteCode" 
            placeholder="店主请输入 ADMIN888" 
          />
          <small class="hint">拥有邀请码可获得店主权限</small>
        </label>
        <button type="submit" class="primary" :disabled="loading">
          {{ loading ? "注册中..." : "立即注册" }}
        </button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
        <div class="form-footer">
          <span>已有账号？</span>
          <RouterLink to="/login" class="link">立即登录</RouterLink>
        </div>
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

const form = reactive({
  username: "",
  name: "",
  password: "",
  confirmPassword: "",
  inviteCode: ""
});

const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const handleSubmit = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  // 前端校验
  if (!form.username || form.username.length < 3) {
    errorMsg.value = "用户名至少需要3个字符";
    return;
  }
  if (!form.name) {
    errorMsg.value = "请输入真实姓名";
    return;
  }
  if (form.password.length < 6) {
    errorMsg.value = "密码至少需要6位";
    return;
  }
  if (form.password !== form.confirmPassword) {
    errorMsg.value = "两次输入的密码不一致";
    return;
  }

  loading.value = true;
  try {
    await auth.register({
      username: form.username,
      password: form.password,
      name: form.name,
      inviteCode: form.inviteCode
    });
    successMsg.value = "注册成功！正在跳转登录页...";
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "注册失败，请稍后再试";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
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
  max-width: 480px;
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

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.hint {
  color: #64748b;
  font-size: 12px;
  font-weight: 400;
}

button.primary {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #1d4ed8;
}

.error {
  color: #dc2626;
  font-size: 14px;
  margin: 0;
}

.success {
  color: #16a34a;
  font-size: 14px;
  margin: 0;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
}

.link {
  color: #2563eb;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .register-page {
    padding: 32px 20px;
  }
}
</style>
