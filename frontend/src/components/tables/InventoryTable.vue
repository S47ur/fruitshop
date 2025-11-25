<template>
  <div class="panel">
    <div class="panel__header">
      <div>
        <p class="title">库存监控</p>
        <p class="desc">现存量、成本与预警线实时展示</p>
      </div>
      <span class="badge">{{ safeInventory.length }} 个品类</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>品类</th>
          <th>在库(kg)</th>
          <th>均价(元/kg)</th>
          <th>库存价值(元)</th>
          <th>预警线(kg)</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in safeInventory" :key="item.id ?? item.fruit">
          <td>{{ item.fruit }}</td>
          <td>{{ formatNumber(item.onHandKg) }}</td>
          <td>{{ formatCurrency(item.unitCost) }}</td>
          <td>{{ calcInventoryValue(item) }}</td>
          <td>{{ formatNumber(item.reorderLevelKg) }}</td>
          <td>
            <span class="chip" :class="getChipClass(item)">
              {{ isBelowThreshold(item) ? "需补货" : "安全" }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useInventoryStore } from "../../stores/useInventoryStore";
import type { InventoryItem } from "../../stores/types";

const store = useInventoryStore();
const { inventory } = storeToRefs(store);

const safeInventory = computed<InventoryItem[]>(() => inventory.value ?? []);

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const formatNumber = (value: unknown) => toNumber(value).toFixed(2);
const formatCurrency = (value: unknown) => toNumber(value).toFixed(2);

const calcInventoryValue = (item: InventoryItem) => {
  const qty = toNumber(item.onHandKg);
  const cost = toNumber(item.unitCost);
  return (qty * cost).toFixed(2);
};

const isBelowThreshold = (item: InventoryItem) => toNumber(item.onHandKg) <= toNumber(item.reorderLevelKg);
const getChipClass = (item: InventoryItem) => (isBelowThreshold(item) ? "danger" : "safe");
</script>

<style scoped>
.panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.badge {
  background: #f1f5f9;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  color: #94a3b8;
  font-weight: 500;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.chip.safe {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.chip.danger {
  background: rgba(248, 113, 113, 0.15);
  color: #dc2626;
}
</style>
