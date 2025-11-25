<template>
  <form class="data-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <div>
        <p class="title">销售出库</p>
        <p class="desc">登记零售/团购订单，同时扣减库存与确认收款</p>
      </div>
      <button type="submit" :disabled="submitting || loading || !canSubmit">生成销售单</button>
    </div>

    <div class="grid">
      <label>
        出库日期
        <input v-model="form.date" type="date" required />
      </label>
      <label>
        客户名称
        <input v-model="form.customer" type="text" placeholder="如：社区团购A站" required />
      </label>
      <label>
        品类
        <select v-model="form.fruit" required>
          <option v-for="fruit in fruitOptions" :key="fruit" :value="fruit">{{ fruit }}</option>
        </select>
      </label>
      <label>
        数量(kg)
        <input v-model.number="form.quantityKg" type="number" min="1" step="0.1" required />
      </label>
      <label>
        售价(元/kg)
        <input v-model.number="form.unitPrice" type="number" min="0" step="0.1" required />
      </label>
      <label>
        收款方式
        <select v-model="form.paymentMethod">
          <option value="cash">现金</option>
          <option value="card">刷卡</option>
          <option value="mobile">移动支付</option>
          <option value="transfer">银行转账</option>
        </select>
      </label>
    </div>
    <p v-if="hint" class="hint" :class="hintType">{{ hint }}</p>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useToastBus } from "../../composables/useToastBus";
import type { InventoryItem, PaymentMethod, SettlementStatus } from "../../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const { inventory, loading } = storeToRefs(store);
const { notifySuccess, notifyError } = useToastBus();

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  date: today,
  customer: "",
  fruit: inventory.value[0]?.fruit || "火龙果",
  quantityKg: 10,
  unitPrice: 32,
  paymentMethod: "mobile" as PaymentMethod,
  status: "pending" as SettlementStatus
});

const fruitOptions = computed(() => inventory.value.map((line: InventoryItem) => line.fruit));

const hint = ref("");
const hintType = ref<"success" | "error">("success");
const submitting = ref(false);
const canSubmit = computed(() => auth.hasPermission("sales.write"));

watch(
  inventory,
  (list) => {
    if (!list.length) return;
    if (!list.some((item) => item.fruit === form.fruit)) {
      form.fruit = list[0].fruit;
    }
  },
  { immediate: true }
);

const resetHint = () => {
  setTimeout(() => {
    hint.value = "";
  }, 2500);
};

const handleSubmit = async () => {
  if (!canSubmit.value) {
    hintType.value = "error";
    hint.value = "当前账户无销售登记权限";
    notifyError("当前账户无销售登记权限");
    resetHint();
    return;
  }
  submitting.value = true;
  hint.value = "";
  try {
    await store.addSale({ ...form });
    hintType.value = "success";
    hint.value = `${form.customer || "客户"} 销售出库完成`;
    notifySuccess(`${form.customer || "客户"} 销售出库完成`);
    form.customer = "";
    form.quantityKg = 10;
    form.unitPrice = 32;
    form.status = "pending";
    resetHint();
  } catch (err) {
    hintType.value = "error";
    hint.value = err instanceof Error ? err.message : "操作失败";
    notifyError(hint.value);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.data-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.title {
  margin: 0;
  font-weight: 600;
}

.desc {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

input,
select {
  border: 1px solid #cbd5f5;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f8fafc;
}

button {
  border: none;
  border-radius: 999px;
  background: #0ea5e9;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin: 12px 0 0;
  color: #0ea5e9;
  font-size: 13px;
}

.hint.error {
  color: #dc2626;
}
</style>
