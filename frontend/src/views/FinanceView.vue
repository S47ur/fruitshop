<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>财务报表</h1>
        <p>支付拆解、票据与现金流预测一屏掌控。</p>
      </div>
      <div class="page__actions">
        <button class="ghost" @click="exportFinanceReport">导出 CSV</button>
        <button class="ghost" @click="exportFinanceReportPdf">导出 PDF</button>
      </div>
    </header>

    <p v-if="error" class="warning">{{ error }}</p>
    <p v-else-if="loading" class="info">数据加载中...</p>

    <div class="stats-grid">
      <div class="stat">
        <p>待收款</p>
        <strong>{{ formatCurrency(receivables) }}</strong>
      </div>
      <div class="stat">
        <p>待付款</p>
        <strong>{{ formatCurrency(payables) }}</strong>
      </div>
      <div class="stat">
        <p>毛利</p>
        <strong>{{ formatCurrency(grossProfit) }}</strong>
      </div>
      <div class="stat">
        <p>逾期票据</p>
        <strong>{{ overdueInvoices.length }}</strong>
        <small>共 {{ formatCurrency(overdueAmount) }}</small>
      </div>
    </div>

    <div class="layout">
      <PaymentBreakdown :breakdown="paymentBreakdown" />
      <div class="stack">
        <div class="panel">
          <div class="panel__header">
            <p>待收款 TOP</p>
            <span>{{ pendingSales.length }} 单</span>
          </div>
          <ul>
            <li v-for="sale in pendingSales" :key="sale.id">
              <div>
                <strong>{{ sale.customer }}</strong>
                <small>{{ sale.fruit }} · {{ formatCurrency(sale.quantityKg * sale.unitPrice) }}</small>
              </div>
              <button class="mini" :disabled="!canSettleFinance || loading" @click="settleSale(sale.id)">
                收款
              </button>
            </li>
            <li v-if="!pendingSales.length" class="empty">暂无待收款</li>
          </ul>
        </div>
        <div class="panel">
          <div class="panel__header">
            <p>待付款 TOP</p>
            <span>{{ pendingPurchases.length }} 笔</span>
          </div>
          <ul>
            <li v-for="purchase in pendingPurchases" :key="purchase.id">
              <div>
                <strong>{{ purchase.supplier }}</strong>
                <small>{{ purchase.fruit }} · {{ formatCurrency(purchase.quantityKg * purchase.unitCost) }}</small>
              </div>
              <button class="mini" :disabled="!canSettleFinance || loading" @click="settlePurchase(purchase.id)">
                付款
              </button>
            </li>
            <li v-if="!pendingPurchases.length" class="empty">暂无待付款</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel__header">
        <p>资金记事</p>
        <span>记录其他收入/支出</span>
      </div>
      <form class="ledger-form" @submit.prevent="addLedgerEntry">
        <select v-model="ledgerForm.type">
          <option value="income">其他收入</option>
          <option value="expense">其他支出</option>
        </select>
        <input v-model.number="ledgerForm.amount" type="number" min="0" step="0.01" placeholder="金额" />
        <input v-model.trim="ledgerForm.note" placeholder="备注" />
        <button type="submit">记录</button>
      </form>
      <ul class="ledger-list">
        <li v-for="item in ledger" :key="item.id">
          <span>{{ item.time }} · {{ item.note }}</span>
          <strong :class="item.type === 'income' ? 'income' : 'expense'">
            {{ item.type === "income" ? "+" : "-" }}{{ formatCurrency(item.amount) }}
          </strong>
        </li>
        <li v-if="!ledger.length" class="empty">暂无手工记事</li>
      </ul>
    </div>

    <section class="advanced-grid">
      <div class="panel">
        <div class="panel__header">
          <p>票据中心</p>
          <span>{{ invoices.length }} 张</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>发票号</th>
              <th>采购单</th>
              <th>金额</th>
              <th>到期</th>
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
                <span class="chip" :class="invoice.status === 'overdue' ? 'pending' : invoice.status === 'paid' ? 'done' : ''">
                  {{ invoiceStatusCopy[invoice.status] }}
                </span>
              </td>
              <td class="actions">
                <button
                  v-for="status in invoiceStatuses"
                  :key="status.key"
                  type="button"
                  class="mini ghost"
                  :disabled="status.key === invoice.status || !canSettleFinance"
                  @click="changeInvoiceStatus(invoice.id, status.key)"
                >
                  {{ status.label }}
                </button>
              </td>
            </tr>
            <tr v-if="invoicesLoading">
              <td colspan="6" class="empty">票据数据加载中...</td>
            </tr>
            <tr v-else-if="invoicesError">
              <td colspan="6" class="empty">{{ invoicesError }}</td>
            </tr>
            <tr v-else-if="!invoices.length">
              <td colspan="6" class="empty">暂无票据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>账龄分析</p>
          <span>应收/应付</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>桶位</th>
              <th>应收</th>
              <th>应付</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bucket in agingBuckets" :key="bucket.bucket">
              <td>{{ bucket.bucket }}</td>
              <td>{{ formatCurrency(bucket.receivables) }}</td>
              <td>{{ formatCurrency(bucket.payables) }}</td>
            </tr>
            <tr v-if="!agingBuckets.length">
              <td colspan="3" class="empty">暂无账龄数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>现金流预测</p>
          <button class="mini ghost" type="button" @click="refreshForecast">刷新预测</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>流入</th>
              <th>流出</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in cashForecast" :key="entry.date">
              <td>{{ entry.date }}</td>
              <td>{{ formatCurrency(entry.inflow) }}</td>
              <td>{{ formatCurrency(entry.outflow) }}</td>
              <td>{{ entry.notes }}</td>
            </tr>
            <tr v-if="!cashForecast.length">
              <td colspan="4" class="empty">暂无预测</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import PaymentBreakdown from "../components/tables/PaymentBreakdown.vue";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useToastBus } from "../composables/useToastBus";
import { dataGateway } from "../services/dataGateway";
import type { InvoiceStatus, PurchaseInvoice } from "../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const enterprise = useEnterpriseStore();
const { paymentBreakdown, receivables, payables, sales, purchases, grossProfit, loading, error } =
  storeToRefs(store);
const { agingBuckets, cashForecast } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

type RemoteInvoice = Awaited<ReturnType<typeof dataGateway.listInvoices>> extends Array<infer T>
  ? T
  : never;

const invoices = ref<PurchaseInvoice[]>([]);
const invoicesLoading = ref(false);
const invoicesError = ref<string | null>(null);

const pendingSales = computed(() => sales.value.filter((item) => item.status === "pending").slice(0, 5));
const pendingPurchases = computed(() => purchases.value.filter((item) => item.status === "pending").slice(0, 5));

const overdueInvoices = computed(() => invoices.value.filter((invoice) => invoice.status === "overdue"));
const overdueAmount = computed(() => overdueInvoices.value.reduce((sum, invoice) => sum + invoice.amount, 0));

const canSettleFinance = computed(() => auth.hasPermission("finance.write"));

const ledger = ref<{ id: string; type: "income" | "expense"; amount: number; note: string; time: string }[]>([]);
const ledgerForm = reactive({ type: "income", amount: 0, note: "" });

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;

const invoiceStatuses = [
  { key: "matched", label: "已匹配" },
  { key: "paid", label: "已支付" },
  { key: "overdue", label: "标记逾期" }
] as const;

const invoiceStatusCopy: Record<InvoiceStatus, string> = {
  pending: "待收票",
  matched: "已匹配",
  paid: "已支付",
  overdue: "已逾期"
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const addLedgerEntry = () => {
  if (!ledgerForm.amount || !ledgerForm.note) return;
  ledger.value.unshift({
    id: createId(),
    type: ledgerForm.type as "income" | "expense",
    amount: ledgerForm.amount,
    note: ledgerForm.note,
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  });
  ledgerForm.amount = 0;
  ledgerForm.note = "";
  notifySuccess("已记录一条资金记事");
};

const settleSale = async (id: string) => {
  if (!canSettleFinance.value) return;
  try {
    await store.settleSale(id);
    notifySuccess("收款完成");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "收款失败");
  }
};

const settlePurchase = async (id: string) => {
  if (!canSettleFinance.value) return;
  try {
    await store.settlePurchase(id);
    notifySuccess("付款完成");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "付款失败");
  }
};

const normalizeInvoiceStatus = (status: string): InvoiceStatus => {
  const allowed: InvoiceStatus[] = ["pending", "matched", "paid", "overdue"];
  if (status === "draft") return "pending";
  return allowed.includes(status as InvoiceStatus) ? (status as InvoiceStatus) : "pending";
};

const normalizeInvoice = (invoice: RemoteInvoice): PurchaseInvoice => ({
  id: invoice.id,
  poId: invoice.salesOrderId,
  storeId: invoice.storeId,
  salesOrderId: invoice.salesOrderId,
  amount: invoice.amount,
  taxAmount: Number((invoice.amount * 0.09).toFixed(2)),
  dueDate: invoice.dueDate,
  status: normalizeInvoiceStatus(invoice.status)
});

let invoiceRequestId = 0;
const loadInvoices = async () => {
  const storeId = store.currentStoreId || auth.activeStoreId;
  if (!storeId) {
    invoices.value = [];
    invoicesError.value = "请选择门店后查看票据";
    invoicesLoading.value = false;
    return;
  }
  const requestId = ++invoiceRequestId;
  invoicesLoading.value = true;
  invoicesError.value = null;
  try {
    const remoteList = await dataGateway.listInvoices(storeId);
    if (invoiceRequestId !== requestId) return;
    invoices.value = remoteList.map((item) => normalizeInvoice(item));
  } catch (err) {
    if (invoiceRequestId !== requestId) return;
    invoicesError.value = err instanceof Error ? err.message : "票据数据加载失败";
    invoices.value = [];
  } finally {
    if (invoiceRequestId === requestId) {
      invoicesLoading.value = false;
    }
  }
};

watch(
  () => [auth.activeStoreId, store.currentStoreId],
  () => {
    loadInvoices();
  },
  { immediate: true }
);

const changeInvoiceStatus = async (id: string, status: InvoiceStatus) => {
  if (!canSettleFinance.value) return;
  try {
    await dataGateway.updateInvoiceStatus(id, status);
    await loadInvoices();
    notifySuccess("票据状态已更新");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "更新失败");
  }
};

const refreshForecast = async () => {
  await enterprise.simulateForecast();
  notifySuccess("已刷新现金流预测");
};

import { exportToPdf } from "../utils/exportUtils";

// ...existing code...

const exportFinanceReport = () => {
  const header = ["待收款", "待付款", "毛利", "时间"];
  const summaryRow = [receivables.value, payables.value, grossProfit.value, new Date().toISOString()];
  const breakdownRows = paymentBreakdown.value.map((entry) => [
    entry.method,
    entry.incoming,
    entry.outgoing,
    entry.net
  ]);
  const csv = [header, summaryRow, ["方式", "收入", "支出", "净流入"], ...breakdownRows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportFinanceReportPdf = () => {
  const header = ["Method", "Incoming", "Outgoing", "Net"];
  const rows = paymentBreakdown.value.map((entry) => [
    entry.method,
    entry.incoming.toFixed(2),
    entry.outgoing.toFixed(2),
    entry.net.toFixed(2)
  ]);
  exportToPdf("Finance Report", header, rows, `finance-${new Date().toISOString().slice(0, 10)}.pdf`);
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

.ghost {
  border: 1px solid #cbd5f5;
  border-radius: 999px;
  background: transparent;
  padding: 10px 18px;
  cursor: pointer;
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
  font-size: 24px;
  margin-top: 6px;
}

.layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
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
  border-radius: 8px;
  padding: 6px 12px;
  background: #16a34a;
  color: white;
  cursor: pointer;
}

.mini.ghost {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.mini:disabled {
  background: #bbf7d0;
  color: #166534;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #94a3b8;
}

.warning {
  border: 1px dashed #cbd5f5;
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  color: #475569;
  background: #f8fafc;
}

.info {
  border: 1px dashed #bfdbfe;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.08);
}

.ledger-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.ledger-form select,
.ledger-form input {
  border: 1px solid #cbd5f5;
  border-radius: 10px;
  padding: 10px 12px;
}

.ledger-form button {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.ledger-list li {
  background: transparent;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 0;
}

.ledger-list strong.income {
  color: #16a34a;
}

.ledger-list strong.expense {
  color: #dc2626;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
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

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: #f1f5f9;
  color: #475569;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
