<template>
  <div class="panel">
    <div class="panel__header">
      <div>
        <p class="title">最新业务流水</p>
        <p class="desc">采购、销售及其支付方式一目了然</p>
      </div>
      <button class="ghost" @click="viewAll">查看全部</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>类型</th>
          <th>单号</th>
          <th>品类</th>
          <th>数量(kg)</th>
          <th>金额(元)</th>
          <th>付款方式</th>
          <th>日期</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>
            <span class="chip" :class="row.type === '采购' ? 'purchase' : 'sale'">{{ row.type }}</span>
          </td>
          <td>{{ row.id }}</td>
          <td>{{ row.fruit }}</td>
          <td>{{ row.quantityKg }}</td>
          <td>{{ row.amount.toFixed(2) }}</td>
          <td>{{ paymentMap[row.paymentMethod] }}</td>
          <td>{{ row.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useInventoryStore } from "../../stores/useInventoryStore";
import type { PaymentMethod, Purchase, Sale } from "../../stores/types";

const paymentMap: Record<PaymentMethod, string> = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const store = useInventoryStore();
const { purchases, sales } = storeToRefs(store);
const router = useRouter();

const rows = computed(() => {
  const purchaseRows = purchases.value.slice(0, 4).map((line: Purchase) => ({
    type: "采购",
    id: line.id,
    fruit: line.fruit,
    quantityKg: line.quantityKg,
    amount: line.quantityKg * line.unitCost,
    paymentMethod: line.paymentMethod,
    date: line.date
  }));
  const saleRows = sales.value.slice(0, 4).map((line: Sale) => ({
    type: "销售",
    id: line.id,
    fruit: line.fruit,
    quantityKg: line.quantityKg,
    amount: line.quantityKg * line.unitPrice,
    paymentMethod: line.paymentMethod,
    date: line.date
  }));
  return [...saleRows, ...purchaseRows].slice(0, 6);
});

const viewAll = () => {
  router.push({ name: "finance" });
};
</script>

<style scoped>
.panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

button.ghost {
  border: 1px solid #cbd5f5;
  background: transparent;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

th {
  color: #94a3b8;
  font-weight: 500;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.purchase {
  background: rgba(14, 165, 233, 0.15);
  color: #0284c7;
}

.sale {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}
</style>
