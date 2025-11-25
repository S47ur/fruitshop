<template>
  <form class="data-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <div>
        <p class="title">采购入库</p>
        <p class="desc">记录供应商到货，实时同步库存与资金流</p>
      </div>
      <button type="submit" :disabled="submitting || loading || !canSubmit">保存采购单</button>
    </div>

    <div class="grid">
      <label>
        下单日期
        <input v-model="form.date" type="date" required />
      </label>
      <label>
        预计到货
        <input v-model="form.eta" type="date" required />
      </label>
      <label>
        供应商
        <select v-model="form.supplierId" required>
          <option v-for="supplier in supplierOptions" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }} · {{ supplier.paymentTermDays }}天账期
          </option>
        </select>
      </label>
      <label>
        商品
        <select v-model="form.productId" required>
          <option v-for="product in productOptions" :key="product.id" :value="product.id">
            {{ product.name }} · {{ product.spec }}
          </option>
        </select>
      </label>
      <label>
        数量(kg)
        <input v-model.number="form.quantityKg" type="number" min="1" step="0.1" required />
      </label>
      <label>
        进价(元/kg)
        <input v-model.number="form.unitCost" type="number" min="0" step="0.1" required />
      </label>
      <label>
        付款方式
        <select v-model="form.paymentMethod">
          <option value="cash">现金</option>
          <option value="card">刷卡</option>
          <option value="mobile">移动支付</option>
          <option value="transfer">银行转账</option>
        </select>
      </label>
      <label class="checkbox-field">
        <input v-model="form.batchRequired" type="checkbox" />
        需要批次追踪
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
import { useEnterpriseStore } from "../../stores/useEnterpriseStore";
import { useToastBus } from "../../composables/useToastBus";
import type { PaymentMethod, SettlementStatus } from "../../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const enterprise = useEnterpriseStore();
const { loading } = storeToRefs(store);
const { partners, products } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

const today = new Date().toISOString().slice(0, 10);

const supplierOptions = computed(() => partners.value.filter((partner) => partner.type === "supplier"));
const productOptions = computed(() => products.value);

const form = reactive({
  date: today,
  eta: today,
  supplierId: supplierOptions.value[0]?.id ?? "",
  productId: productOptions.value[0]?.id ?? "",
  quantityKg: 20,
  unitCost: 12,
  paymentMethod: "transfer" as PaymentMethod,
  batchRequired: false,
  status: "pending" as SettlementStatus
});

const selectedSupplier = computed(() => supplierOptions.value.find((item) => item.id === form.supplierId));
const selectedProduct = computed(() => productOptions.value.find((item) => item.id === form.productId));

const hint = ref("");
const hintType = ref<"success" | "error">("success");
const submitting = ref(false);
const canSubmit = computed(() => auth.hasPermission("procurement.write"));

watch(
  supplierOptions,
  (list) => {
    if (!list.length) {
      form.supplierId = "";
      return;
    }
    if (!list.some((item) => item.id === form.supplierId)) {
      form.supplierId = list[0].id;
    }
  },
  { immediate: true }
);

watch(
  productOptions,
  (list) => {
    if (!list.length) {
      form.productId = "";
      return;
    }
    if (!list.some((item) => item.id === form.productId)) {
      form.productId = list[0].id;
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
    hint.value = "当前账户无采购录入权限";
    notifyError("当前账户无采购录入权限");
    resetHint();
    return;
  }
  if (!form.supplierId || !form.productId) {
    hintType.value = "error";
    hint.value = "请先维护供应商与商品资料";
    notifyError(hint.value);
    resetHint();
    return;
  }
  submitting.value = true;
  hint.value = "";
  try {
    await store.addPurchase({
      date: form.date,
      eta: form.eta,
      supplier: selectedSupplier.value?.name ?? "",
      supplierId: form.supplierId,
      fruit: selectedProduct.value?.name ?? "",
      productId: form.productId,
      quantityKg: form.quantityKg,
      unitCost: form.unitCost,
      paymentMethod: form.paymentMethod,
      batchRequired: form.batchRequired,
      status: form.status
    });
    hintType.value = "success";
    hint.value = `${selectedSupplier.value?.name ?? "供应商"} 到货已登记`;
    notifySuccess(`${selectedSupplier.value?.name ?? "供应商"} 到货已登记`);
    form.quantityKg = 20;
    form.unitCost = 12;
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

.hint {
  margin: 12px 0 0;
  font-size: 13px;
}

.hint.success {
  color: #16a34a;
}

.hint.error {
  color: #dc2626;
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
  background: #22c55e;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
