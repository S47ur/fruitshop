<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>库存预警</h1>
        <p>掌握库存价值、批次保质与调拨执行。</p>
      </div>
      <div class="page__actions">
        <button class="ghost" @click="generateStocktake">导出 CSV</button>
        <button class="ghost" @click="generateStocktakePdf">导出 PDF</button>
      </div>
    </header>

    <p v-if="error" class="warning">{{ error }}</p>
    <p v-else-if="loading" class="info">数据加载中...</p>

    <div class="stats-grid">
      <div class="stat">
        <p>库存总价值</p>
        <strong>{{ formatCurrency(totalInventoryValue) }}</strong>
      </div>
      <div class="stat">
        <p>预警品类</p>
        <strong>{{ reorderAlerts.length }} 项</strong>
      </div>
      <div class="stat">
        <p>库存周转</p>
        <strong>{{ inventoryTurnoverDisplay }}</strong>
      </div>
      <div class="stat">
        <p>临期批次</p>
        <strong>{{ expiringBatchCount }}</strong>
        <small>含滞留/临期</small>
      </div>
    </div>

    <div class="layout">
      <InventoryTable />
      <div class="stack">
        <div class="panel">
          <div class="panel__header">
            <p>预警补货</p>
            <span>{{ reorderAlerts.length }} 个待处理</span>
          </div>
          <ul>
            <li v-for="item in reorderAlerts" :key="item.fruit">
              <div>
                <strong>{{ item.fruit }}</strong>
                <small>剩余 {{ item.onHandKg }}kg · 预警 {{ item.reorderLevelKg }}kg</small>
              </div>
              <button
                class="mini"
                :disabled="loading || !canWriteInventory"
                @click="handleReorder(item.fruit)"
              >
                一键补货
              </button>
            </li>
            <li v-if="!reorderAlerts.length" class="empty">全部库存安全</li>
          </ul>
        </div>

        <form class="panel" @submit.prevent="saveReorderLevel">
          <p class="panel__header">调整预警线</p>
          <label>
            品类
            <select v-model="form.fruit">
              <option v-for="item in inventory" :key="item.fruit" :value="item.fruit">{{ item.fruit }}</option>
            </select>
          </label>
          <label>
            安全库存 (kg)
            <input v-model.number="form.level" type="number" min="5" step="1" />
          </label>
          <button type="submit" class="primary" :disabled="loading || !canWriteInventory">
            保存预警线
          </button>
          <p v-if="hint" class="hint" :class="hintType">{{ hint }}</p>
        </form>
      </div>
    </div>

    <section class="advanced-grid">
      <div class="panel">
        <div class="panel__header">
          <p>批次 & 保质</p>
          <span>{{ batches.length }} 条</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>批次号</th>
              <th>商品</th>
              <th>仓库</th>
              <th>数量</th>
              <th>到期</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="batch in batches" :key="batch.id">
              <td>{{ batch.lotNo }}</td>
              <td>{{ productName(batch.productId) }}</td>
              <td>{{ warehouseName(batch.warehouseId) }}</td>
              <td>{{ batch.quantityKg }}kg</td>
              <td>{{ batch.expiryDate }}</td>
              <td>
                <span class="chip" :class="batch.status !== 'normal' ? 'pending' : 'done'">
                  {{ batchStatusCopy[batch.status] }}
                </span>
              </td>
            </tr>
            <tr v-if="!batches.length">
              <td colspan="6" class="empty">暂无批次</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>盘点/调整</p>
          <span>{{ adjustments.length }} 条记录</span>
        </div>
        <form class="inline-form" @submit.prevent="handleRecordAdjustment">
          <select v-model="adjustmentForm.warehouseId" required>
            <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
          </select>
          <select v-model="adjustmentForm.productId" required>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
          <input v-model.number="adjustmentForm.beforeQty" type="number" min="0" placeholder="盘点前" />
          <input v-model.number="adjustmentForm.afterQty" type="number" min="0" placeholder="盘点后" />
          <input v-model.trim="adjustmentForm.reason" placeholder="原因" />
          <button type="submit" class="mini" :disabled="!canAdjustInventory">提交调整</button>
        </form>
        <ul>
          <li v-for="item in adjustments" :key="item.id">
            <div>
              <strong>{{ productName(item.productId) }}</strong>
              <small>{{ warehouseName(item.warehouseId) }} · {{ item.reason }}</small>
            </div>
            <div class="diff">
              <span>{{ item.beforeQty }} → {{ item.afterQty }}</span>
              <small>{{ formatTime(item.time) }}</small>
            </div>
          </li>
          <li v-if="!adjustments.length" class="empty">暂无盘点记录</li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>调拨任务</p>
          <span>{{ transfers.length }} 单</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>单号</th>
              <th>从/至</th>
              <th>商品</th>
              <th>数量</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in transfers" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ warehouseName(order.fromWarehouseId) }} → {{ warehouseName(order.toWarehouseId) }}</td>
              <td>{{ productName(order.productId) }}</td>
              <td>{{ order.quantityKg }}kg</td>
              <td>
                <span class="chip">{{ transferStatusCopy[order.status] }}</span>
              </td>
              <td>
                <button
                  class="mini ghost"
                  type="button"
                  :disabled="order.status === 'completed' || !canWriteInventory"
                  @click="handleProgressTransfer(order.id)"
                >
                  推进
                </button>
              </td>
            </tr>
            <tr v-if="!transfers.length">
              <td colspan="6" class="empty">暂无调拨单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import InventoryTable from "../components/tables/InventoryTable.vue";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useToastBus } from "../composables/useToastBus";
import type { TransferStatus } from "../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const enterprise = useEnterpriseStore();
const { inventory, reorderAlerts, totalInventoryValue, inventoryTurnover, loading, error } = storeToRefs(store);
const { batches, adjustments, transfers, warehouses, products, expiringBatchCount } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

const form = reactive({
  fruit: inventory.value[0]?.fruit || "火龙果",
  level: inventory.value[0]?.reorderLevelKg || 50
});

const adjustmentForm = reactive({
  warehouseId: warehouses.value[0]?.id ?? "",
  productId: products.value[0]?.id ?? "",
  beforeQty: 0,
  afterQty: 0,
  reason: "盘点调整"
});

const hint = ref("");
const hintType = ref<"success" | "error">("success");

const canWriteInventory = computed(() => auth.hasPermission("inventory.write"));
const canAdjustInventory = computed(() => auth.hasPermission("inventory.adjust"));

watch(
  inventory,
  (lines) => {
    if (!lines.length) return;
    if (!lines.some((line) => line.fruit === form.fruit)) {
      form.fruit = lines[0].fruit;
      form.level = lines[0].reorderLevelKg;
    }
  },
  { immediate: true }
);

watch(
  [warehouses, products],
  () => {
    adjustmentForm.warehouseId = warehouses.value[0]?.id ?? "";
    adjustmentForm.productId = products.value[0]?.id ?? "";
  },
  { immediate: true }
);

const inventoryTurnoverDisplay = computed(() =>
  inventoryTurnover.value == null ? "—" : `${inventoryTurnover.value.toFixed(1)} 次`
);

const formatCurrency = (value: number | null | undefined) => `¥${(value ?? 0).toFixed(2)}`;
const formatTime = (value: string) => new Date(value).toLocaleString("zh-CN", { hour12: false });

const batchStatusCopy: Record<string, string> = {
  normal: "正常",
  expiring: "临期",
  hold: "滞留"
};

const transferStatusCopy: Record<TransferStatus, string> = {
  draft: "草稿",
  approved: "已审批",
  "in-transit": "在途",
  completed: "完成",
  shipped: "已发货",
  received: "已收货"
};

const productName = (id: string) => products.value.find((item) => item.id === id)?.name ?? "-";
const warehouseName = (id: string) => warehouses.value.find((item) => item.id === id)?.name ?? "-";

const resetHint = () => {
  setTimeout(() => {
    hint.value = "";
  }, 2500);
};

const handleReorder = async (fruit: string) => {
  if (!canWriteInventory.value) {
    hintType.value = "error";
    hint.value = "当前账户无补货权限";
    resetHint();
    return;
  }
  await store.triggerReorder(fruit);
  hintType.value = "success";
  hint.value = `${fruit} 已提交自动补货`;
  resetHint();
};

const saveReorderLevel = async () => {
  if (!canWriteInventory.value) {
    hintType.value = "error";
    hint.value = "当前账户无库存维护权限";
    resetHint();
    return;
  }
  await store.updateReorderLevel(form.fruit, form.level);
  hintType.value = "success";
  hint.value = `${form.fruit} 的安全库存已更新`;
  resetHint();
};

const handleRecordAdjustment = async () => {
  if (!canAdjustInventory.value) {
    notifyError("无盘点权限");
    return;
  }
  try {
    const record = await store.recordAdjustment({
      productId: adjustmentForm.productId,
      warehouseId: adjustmentForm.warehouseId,
      beforeQty: adjustmentForm.beforeQty,
      afterQty: adjustmentForm.afterQty,
      reason: adjustmentForm.reason
    });
    await enterprise.recordAdjustment({
      id: record.id,
      time: record.time,
      warehouseId: record.warehouseId,
      productId: record.productId,
      reason: record.reason,
      beforeQty: record.beforeQty,
      afterQty: record.afterQty,
      operator: record.operator,
      inventoryId: record.inventoryId,
      deltaKg: record.deltaKg
    });
    notifySuccess("已记录盘点调整");
    adjustmentForm.beforeQty = 0;
    adjustmentForm.afterQty = 0;
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "记录失败");
  }
};

const handleProgressTransfer = async (id: string) => {
  try {
    await enterprise.progressTransfer(id);
    notifySuccess("调拨状态已推进");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "推进失败");
  }
};

import { exportToPdf } from "../utils/exportUtils";

// ...existing code...

const generateStocktake = () => {
  const header = ["品类", "库存kg", "成本", "库存价值", "预警线"];
  const rows = inventory.value.map((item) => [
    item.fruit,
    item.onHandKg,
    item.unitCost,
    (item.onHandKg * item.unitCost).toFixed(2),
    item.reorderLevelKg
  ]);
  const csv = [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stocktake-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateStocktakePdf = () => {
  const header = ["Fruit", "Stock (kg)", "Cost", "Value", "Reorder Level"];
  const rows = inventory.value.map((item) => [
    item.fruit,
    item.onHandKg,
    item.unitCost,
    (item.onHandKg * item.unitCost).toFixed(2),
    item.reorderLevelKg
  ]);
  exportToPdf("Stocktake Report", header, rows, `stocktake-${new Date().toISOString().slice(0, 10)}.pdf`);
};

</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page__actions button {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
  background: rgba(8, 47, 73, 0.15);
  color: #0f172a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.07);
}

.stat strong {
  display: block;
  font-size: 22px;
  margin-top: 6px;
}

.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
}

li small {
  color: #94a3b8;
  display: block;
}

.mini {
  border: none;
  border-radius: 10px;
  padding: 6px 12px;
  background: #f97316;
  color: white;
  cursor: pointer;
}

.mini.ghost {
  background: rgba(249, 115, 22, 0.15);
  color: #c2410c;
}

.mini:disabled {
  background: #fed7aa;
  color: #a16207;
  cursor: not-allowed;
}

form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

select,
input {
  border: 1px solid #cbd5f5;
  border-radius: 12px;
  padding: 10px 12px;
}

button.primary {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: #0ea5e9;
  color: white;
  cursor: pointer;
}

button.primary:disabled {
  background: #bfdbfe;
  cursor: not-allowed;
}

.hint {
  margin-top: 10px;
  color: #0ea5e9;
}

.hint.error {
  color: #dc2626;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.inline-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: #f1f5f9;
  color: #475569;
}

.diff {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: right;
}

.empty {
  text-align: center;
  color: #94a3b8;
}

.warning {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(248, 113, 113, 0.12);
  color: #b91c1c;
}

.info {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
