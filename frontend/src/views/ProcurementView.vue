<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>采购管理</h1>
        <p>掌控供应商到货、票据与审批链，确保补货如期到仓。</p>
      </div>
      <div class="page__actions">
        <button class="ghost" @click="exportPurchases">导出采购明细</button>
        <button class="primary" :disabled="!canWriteProcurement || loading" @click="generateDemoPurchase">
          快速生成测试单
        </button>
      </div>
    </header>

    <p v-if="error" class="warning">{{ error }}</p>
    <p v-else-if="loading" class="info">数据加载中...</p>

    <div class="stats-grid">
      <div class="stat">
        <p>近30天采购额</p>
        <strong>{{ formatCurrency(monthlyProcurement) }}</strong>
        <small>覆盖 {{ supplierCount }} 个供应商</small>
      </div>
      <div class="stat">
        <p>待付货款</p>
        <strong>{{ formatCurrency(payables) }}</strong>
        <small>待结 {{ pendingBills.length }} 笔</small>
      </div>
      <div class="stat">
        <p>均价</p>
        <strong>{{ averageCost.toFixed(2) }} 元/kg</strong>
        <small>按所有采购单计算</small>
      </div>
    </div>

    <div class="layout">
      <PurchaseForm />
      <div class="panel">
        <div class="filters">
          <input v-model.trim="keyword" placeholder="搜索供应商/品类" />
          <select v-model="paymentFilter">
            <option value="all">全部支付方式</option>
            <option value="cash">现金</option>
            <option value="card">刷卡</option>
            <option value="mobile">移动支付</option>
            <option value="transfer">银行转账</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>单号</th>
              <th>供应商</th>
              <th>品类</th>
              <th>数量</th>
              <th>金额</th>
              <th>付款方式</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in filteredPurchases" :key="line.id">
              <td>{{ line.id }}</td>
              <td>{{ line.supplier }}</td>
              <td>{{ line.fruit }}</td>
              <td>{{ line.quantityKg }}kg</td>
              <td>{{ formatCurrency(line.quantityKg * line.unitCost) }}</td>
              <td>{{ paymentMap[line.paymentMethod] }}</td>
              <td>
                <span class="chip" :class="line.status === 'settled' ? 'done' : 'pending'">
                  {{ line.status === "settled" ? "已付款" : "待付款" }}
                </span>
              </td>
              <td>
                <button
                  class="mini"
                  :disabled="line.status === 'settled' || loading || !canWriteProcurement"
                  @click="markPaid(line.id)"
                >
                  {{ line.status === "settled" ? "完成" : "标记已付" }}
                </button>
              </td>
            </tr>
            <tr v-if="!filteredPurchases.length">
              <td colspan="8" class="empty">暂无符合条件的采购单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section class="advanced-grid">
      <div class="panel lifecycle">
        <div class="panel__header">
          <p>采购订单生命周期</p>
          <span>审批＋跟踪</span>
        </div>
        <div class="kanban">
          <div v-for="column in kanbanColumns" :key="column.key" class="kanban__column">
            <div class="kanban__header">
              <strong>{{ column.label }}</strong>
              <small>{{ column.orders.length }}</small>
            </div>
            <article v-for="order in column.orders" :key="order.id" class="kanban__card">
              <div class="card-row">
                <span>{{ order.id }}</span>
                <span>¥{{ formatNumber(order.totalAmount) }}</span>
              </div>
              <div class="card-row faint">
                <span>到货 {{ order.expectedDate }}</span>
                <span>账期 {{ order.paymentTermDays }} 天</span>
              </div>
              <ul>
                <li v-for="line in order.lines" :key="line.productId">
                  {{ line.fruit }} · {{ line.quantityKg }}kg
                </li>
              </ul>
              <button type="button" class="mini" :disabled="!canAdvanceOrder(column.key)" @click="advanceLifecycle(order.id)">
                推进
              </button>
            </article>
            <p v-if="!column.orders.length" class="kanban__empty">暂无</p>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel__header">
          <p>入库拆分</p>
          <span>{{ shipments.length }} 批</span>
        </div>
        <form class="inline-form" @submit.prevent="handleScheduleShipment">
          <select v-model="shipmentForm.poId" required>
            <option disabled value="">选择采购单</option>
            <option v-for="order in advancedOrders" :key="order.id" :value="order.id">
              {{ order.id }} · {{ order.status }}
            </option>
          </select>
          <input v-model="shipmentForm.date" type="date" required />
          <input v-model.number="shipmentForm.quantity" type="number" min="0" placeholder="下发数量" required />
          <input v-model.number="shipmentForm.accepted" type="number" min="0" placeholder="实收" required />
          <input v-model.number="shipmentForm.damaged" type="number" min="0" placeholder="损耗" />
          <button type="submit" class="mini ghost" :disabled="enterprise.loading">拆分批次</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>批次</th>
              <th>采购单</th>
              <th>数量</th>
              <th>损耗</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in shipments" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.poId }}</td>
              <td>{{ item.acceptedKg }}/{{ item.quantityKg }}kg</td>
              <td>{{ item.damagedKg }}kg</td>
              <td>
                <select v-model="item.status" @change="updateShipment(item.id, item.status)">
                  <option value="scheduled">在途</option>
                  <option value="arrived">到货</option>
                  <option value="stored">入库</option>
                  <option value="hold">滞留</option>
                </select>
              </td>
            </tr>
            <tr v-if="!shipments.length">
              <td colspan="5" class="empty">暂无拆分记录</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <div class="panel__header">
          <p>票据管理</p>
          <span>票货匹配</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>发票号</th>
              <th>采购单</th>
              <th>金额</th>
              <th>到期日</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>{{ invoice.id }}</td>
              <td>{{ invoice.poId }}</td>
              <td>{{ formatCurrency(invoice.amount) }}</td>
              <td>{{ invoice.dueDate }}</td>
              <td>
                <span class="chip" :class="invoice.status === 'paid' ? 'done' : invoice.status === 'overdue' ? 'pending' : ''">
                  {{ invoiceStatusCopy[invoice.status] }}
                </span>
              </td>
              <td class="actions">
                <button
                  v-for="status in invoiceStatuses"
                  :key="status.key"
                  type="button"
                  class="mini ghost"
                  :disabled="invoice.status === status.key"
                  @click="changeInvoiceStatus(invoice.id, status.key)">
                  {{ status.label }}
                </button>
              </td>
            </tr>
            <tr v-if="!invoices.length">
              <td colspan="6" class="empty">暂无票据信息</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <p>采购审批链</p>
        <span>依据基础资料</span>
      </div>
      <ul class="flow-list">
        <li v-for="step in procurementFlow?.steps" :key="step.id">
          <strong>{{ roleCopy[step.role] }}</strong>
          <span>阈值 ¥{{ formatNumber(step.threshold) }}</span>
        </li>
        <li v-if="!procurementFlow">
          <span class="empty">尚未配置审批流</span>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import PurchaseForm from "../components/forms/PurchaseForm.vue";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useToastBus } from "../composables/useToastBus";
import type { InvoiceStatus, PaymentMethod, ShipmentStatus, UserRole } from "../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const enterprise = useEnterpriseStore();
const { purchases, payables, loading, error } = storeToRefs(store);
const { purchaseOrders: advancedOrders, shipments, invoices, approvalFlows } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

const keyword = ref("");
const paymentFilter = ref<PaymentMethod | "all">("all");

const paymentMap: Record<PaymentMethod, string> = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const filteredPurchases = computed(() =>
  purchases.value.filter((item) => {
    const matchesKeyword = keyword.value
      ? [item.supplier, item.fruit].some((field) => field.includes(keyword.value))
      : true;
    const matchesPayment = paymentFilter.value === "all" || item.paymentMethod === paymentFilter.value;
    return matchesKeyword && matchesPayment;
  })
);

const monthlyProcurement = computed(() => {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return purchases.value
    .filter((item) => new Date(item.date).getTime() >= cutoff)
    .reduce((sum, item) => sum + item.quantityKg * item.unitCost, 0);
});

const supplierCount = computed(() => new Set(purchases.value.map((item) => item.supplier)).size);

const averageCost = computed(() => {
  if (!purchases.value.length) return 0;
  const totalQty = purchases.value.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalAmount = purchases.value.reduce((sum, item) => sum + item.quantityKg * item.unitCost, 0);
  return totalAmount / (totalQty || 1);
});

const pendingBills = computed(() => purchases.value.filter((item) => item.status === "pending"));

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;
const formatNumber = (value: number) => value.toLocaleString("zh-CN");

const canWriteProcurement = computed(() => auth.hasPermission("procurement.write"));

const markPaid = async (id: string) => {
  if (!canWriteProcurement.value) return;
  try {
    await store.settlePurchase(id);
    notifySuccess("采购单已标记付款");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "标记失败，请稍后重试");
  }
};

const exportPurchases = () => {
  const header = ["单号", "供应商", "品类", "数量", "金额", "支付方式", "状态", "日期"];
  const rows = purchases.value.map((item) => [
    item.id,
    item.supplier,
    item.fruit,
    `${item.quantityKg}kg`,
    (item.quantityKg * item.unitCost).toFixed(2),
    paymentMap[item.paymentMethod],
    item.status === "settled" ? "已付款" : "待付款",
    item.date
  ]);
  const csv = [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `purchases-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateDemoPurchase = async () => {
  if (!canWriteProcurement.value) return;
  const fruits = ["麒麟瓜", "耙耙柑", "草莓"];
  const targetFruit = fruits[Math.floor(Math.random() * fruits.length)];
  const quantity = 30 + Math.round(Math.random() * 50);
  try {
    await store.addPurchase({
      date: new Date().toISOString().slice(0, 10),
      supplier: `${targetFruit} 联采基地`,
      fruit: targetFruit,
      quantityKg: quantity,
      unitCost: Math.round((12 + Math.random() * 10) * 10) / 10,
      paymentMethod: "transfer",
      status: "pending"
    });
    notifySuccess(`${targetFruit} 测试采购单已创建`);
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "创建测试单失败");
  }
};

const lifecycleStatuses = [
  { key: "draft", label: "草稿" },
  { key: "approved", label: "审批通过" },
  { key: "ordered", label: "已下单" },
  { key: "receiving", label: "到货" },
  { key: "stored", label: "入库" },
  { key: "reconciled", label: "对账" },
  { key: "paid", label: "付款完成" }
];

const kanbanColumns = computed(() =>
  lifecycleStatuses.map((status) => ({
    ...status,
    orders: advancedOrders.value.filter((order) => order.status === status.key)
  }))
);

const canAdvanceOrder = (statusKey: string) => statusKey !== "paid";

const advanceLifecycle = async (id: string) => {
  try {
    await enterprise.advancePurchaseOrder(id);
    notifySuccess("已推进采购订单");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "推进失败");
  }
};

type ShipmentFormState = {
  poId: string;
  date: string;
  quantity: number;
  accepted: number;
  damaged: number;
};

const shipmentForm = reactive<ShipmentFormState>({
  poId: "",
  date: new Date().toISOString().slice(0, 10),
  quantity: 200,
  accepted: 200,
  damaged: 0
});

watch(
  advancedOrders,
  (orders) => {
    if (!orders.length) {
      shipmentForm.poId = "";
      return;
    }
    if (!orders.some((order) => order.id === shipmentForm.poId)) {
      shipmentForm.poId = orders[0].id;
    }
  },
  { immediate: true }
);

watch(
  () => [shipmentForm.quantity, shipmentForm.accepted, shipmentForm.damaged],
  () => {
    shipmentForm.accepted = Math.min(shipmentForm.accepted, shipmentForm.quantity);
    shipmentForm.damaged = Math.min(shipmentForm.damaged, shipmentForm.quantity);
  }
);

const handleScheduleShipment = () => {
  if (!shipmentForm.poId) {
    notifyError("请选择采购单");
    return;
  }
  enterprise.scheduleShipment({
    poId: shipmentForm.poId,
    date: shipmentForm.date,
    quantityKg: shipmentForm.quantity,
    acceptedKg: shipmentForm.accepted,
    damagedKg: shipmentForm.damaged,
    status: "scheduled"
  });
  notifySuccess("新的入库批次已拆分");
  shipmentForm.quantity = 200;
  shipmentForm.accepted = 200;
  shipmentForm.damaged = 0;
};

const updateShipment = (id: string, status: ShipmentStatus) => {
  enterprise.updateShipmentStatus(id, status);
  notifySuccess("批次状态已更新");
};

const invoiceStatuses = [
  { key: "pending", label: "待收票" },
  { key: "matched", label: "已匹配" },
  { key: "paid", label: "已支付" },
  { key: "overdue", label: "已逾期" }
] as const;

const invoiceStatusCopy: Record<InvoiceStatus, string> = invoiceStatuses.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {} as Record<InvoiceStatus, string>);

const changeInvoiceStatus = (id: string, status: InvoiceStatus) => {
  enterprise.updateInvoiceStatus(id, status);
  notifySuccess("票据状态已更新");
};

const procurementFlow = computed(() => approvalFlows.value.find((flow) => flow.documentType === "采购订单"));

const roleCopy: Record<UserRole, string> = {
  owner: "老板",
  manager: "店长",
  cashier: "收银",
  auditor: "审计"
};

</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.page__actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat {
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem;
  background: #fff;
}

.layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 1rem;
  align-items: flex-start;
}

.panel {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #f1f1f1;
  padding-bottom: 0.5rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.filters input,
.filters select,
select,
input {
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #f4f4f4;
}

.chip.done {
  background: #e5f8ed;
  color: #118a45;
}

.chip.pending {
  background: #fff5d9;
  color: #c18400;
}

.mini {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.advanced-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.advanced-grid .lifecycle {
  grid-column: 1 / -1;
}

.kanban {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.kanban__column {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 0.5rem;
  background: #fafafa;
}

.kanban__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.kanban__card {
  background: #fff;
  border-radius: 10px;
  padding: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.5rem;
}

.kanban__empty {
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
}

.card-row.faint {
  color: #888;
  font-size: 0.8rem;
}

.inline-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.25rem;
}

.flow-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.flow-list li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 140px;
  padding: 0.5rem 0.75rem;
  border: 1px dashed #e1e1e1;
  border-radius: 10px;
}

.empty {
  text-align: center;
  color: #999;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }
}
</style>
