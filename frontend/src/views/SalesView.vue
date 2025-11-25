<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>销售管理</h1>
        <p>跟踪零售/团购订单、报价与促销策略。</p>
      </div>
      <div class="page__actions">
        <button class="ghost" @click="exportSales">导出销售清单</button>
        <button class="primary" :disabled="!canWriteSales || loading" @click="generateDemoSale">
          快速生成订单
        </button>
      </div>
    </header>

    <p v-if="error" class="warning">{{ error }}</p>
    <p v-else-if="loading" class="info">数据加载中...</p>

    <div class="stats-grid">
      <div class="stat">
        <p>今日销售额</p>
        <strong>{{ formatCurrency(todayRevenue) }}</strong>
        <small>含所有渠道</small>
      </div>
      <div class="stat">
        <p>待收款</p>
        <strong>{{ formatCurrency(receivables) }}</strong>
        <small>待结 {{ pendingSales.length }} 单</small>
      </div>
      <div class="stat">
        <p>报价管道</p>
        <strong>{{ formatCurrency(activeQuoteValue) }}</strong>
        <small>{{ quotePipeline }} 份生效</small>
      </div>
      <div class="stat">
        <p>生效合同</p>
        <strong>{{ contracts.length }}</strong>
        <small>覆盖 {{ contractedCustomers }} 个大客户</small>
      </div>
    </div>

    <div class="layout">
      <SalesForm />
      <div class="panel">
        <div class="filters">
          <input v-model.trim="keyword" placeholder="搜索客户/品类" />
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
              <th>客户</th>
              <th>品类</th>
              <th>数量</th>
              <th>金额</th>
              <th>支付方式</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in filteredSales" :key="line.id">
              <td>{{ line.id }}</td>
              <td>{{ line.customer }}</td>
              <td>{{ line.fruit }}</td>
              <td>{{ line.quantityKg }}kg</td>
              <td>{{ formatCurrency(line.quantityKg * line.unitPrice) }}</td>
              <td>{{ paymentMap[line.paymentMethod] }}</td>
              <td>
                <span class="chip" :class="line.status === 'settled' ? 'done' : 'pending'">
                  {{ line.status === "settled" ? "已收款" : "待收款" }}
                </span>
              </td>
              <td>
                <button
                  class="mini"
                  :disabled="line.status === 'settled' || loading || !canWriteSales"
                  @click="markCollected(line.id)"
                >
                  {{ line.status === "settled" ? "完成" : "确认收款" }}
                </button>
              </td>
            </tr>
            <tr v-if="!filteredSales.length">
              <td colspan="8" class="empty">暂无符合条件的销售单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section class="advanced-grid">
      <div class="panel">
        <div class="panel__header">
          <p>报价单管道</p>
          <span>{{ quotes.length }} 份</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>编号</th>
              <th>客户</th>
              <th>有效期</th>
              <th>金额</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="quote in quotes" :key="quote.id">
              <td>{{ quote.id }}</td>
              <td>{{ customerName(quote.customerId) }}</td>
              <td>{{ quote.validFrom }} ~ {{ quote.validTo }}</td>
              <td>{{ formatCurrency(quote.totalAmount) }}</td>
              <td>
                <span class="chip" :class="`status-${quote.status}`">{{ quoteStatusCopy[quote.status] }}</span>
              </td>
              <td class="actions">
                <button
                  v-for="status in quoteStatuses"
                  :key="status.key"
                  class="mini ghost"
                  type="button"
                  :disabled="status.key === quote.status || !canApproveSales"
                  @click="handleQuoteStatus(quote.id, status.key)"
                >
                  {{ status.label }}
                </button>
                <button
                  v-if="quote.status === 'accepted'"
                  class="mini"
                  type="button"
                  :disabled="!canApproveSales"
                  @click="handleActivateContract(quote.id)"
                >
                  生成合同
                </button>
              </td>
            </tr>
            <tr v-if="quotesLoading">
              <td colspan="6" class="empty">报价数据加载中...</td>
            </tr>
            <tr v-else-if="quotesError">
              <td colspan="6" class="empty">{{ quotesError }}</td>
            </tr>
            <tr v-else-if="!quotes.length">
              <td colspan="6" class="empty">暂无报价记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>合同履约</p>
          <span>{{ contracts.length }} 份</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>合同号</th>
              <th>客户</th>
              <th>渠道</th>
              <th>周期</th>
              <th>结算</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contract in contracts" :key="contract.id">
              <td>{{ contract.id }}</td>
              <td>{{ customerName(contract.customerId) }}</td>
              <td>{{ contract.channel }}</td>
              <td>{{ contract.startDate }} ~ {{ contract.endDate }}</td>
              <td>{{ paymentMap[contract.settlementMethod] }}</td>
              <td><span class="chip">{{ contractStatusCopy[contract.status] }}</span></td>
            </tr>
            <tr v-if="!contracts.length">
              <td colspan="6" class="empty">暂无合同</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>促销策略</p>
          <span>{{ activePromotionCount }} 个生效</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>范围</th>
              <th>审批</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in promotions" :key="promo.id">
              <td>{{ promo.name }}</td>
              <td>{{ promo.type }}</td>
              <td>{{ promo.scope.join("、") }}</td>
              <td>{{ promo.approvalStatus }}</td>
              <td>
                <span class="chip" :class="promo.active ? 'done' : 'pending'">
                  {{ promo.active ? "已启用" : "未启用" }}
                </span>
              </td>
              <td>
                <button class="mini ghost" type="button" :disabled="!canApproveSales" @click="togglePromotion(promo.id)">
                  {{ promo.active ? "下架" : "启用" }}
                </button>
              </td>
            </tr>
            <tr v-if="!promotions.length">
              <td colspan="6" class="empty">暂无促销策略</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>渠道结算</p>
          <span>{{ channelConfigs.length }} 个渠道</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>渠道</th>
              <th>账期(天)</th>
              <th>扣率</th>
              <th>结算方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="channel in channelConfigs" :key="channel.id">
              <td>{{ channel.name }}</td>
              <td>{{ channel.settlementDays }}</td>
              <td>{{ formatPercent(channel.feeRate) }}</td>
              <td>{{ channel.splitMode === "gross" ? "含税" : "净额" }}</td>
            </tr>
            <tr v-if="!channelConfigs.length">
              <td colspan="4" class="empty">暂无渠道配置</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import SalesForm from "../components/forms/SalesForm.vue";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useToastBus } from "../composables/useToastBus";
import { dataGateway } from "../services/dataGateway";
import type { ContractStatus, PaymentMethod, QuoteStatus, Sale, SalesQuote } from "../stores/types";

const store = useInventoryStore();
const auth = useAuthStore();
const enterprise = useEnterpriseStore();
const { sales, receivables, loading, error } = storeToRefs(store);
const { contracts, promotions, channelConfigs, partners, quotes: enterpriseQuotes } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

const keyword = ref("");
const paymentFilter = ref<PaymentMethod | "all">("all");

type RemoteQuote = Awaited<ReturnType<typeof dataGateway.listQuotes>> extends Array<infer T> ? T : never;

interface QuoteDisplay {
  id: string;
  salesOrderId: string;
  customerId: string;
  channel: string;
  status: QuoteStatus;
  version: number;
  validFrom: string;
  validTo: string;
  totalAmount: number;
}

const quotes = ref<QuoteDisplay[]>([]);
const quotesLoading = ref(false);
const quotesError = ref<string | null>(null);

const paymentMap: Record<PaymentMethod, string> = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const normalizeQuoteStatus = (status: string): QuoteStatus => {
  if (status === "open") return "sent";
  const allowed: QuoteStatus[] = ["draft", "sent", "accepted", "rejected", "expired"];
  return allowed.includes(status as QuoteStatus) ? (status as QuoteStatus) : "draft";
};

const normalizeQuote = (remote: RemoteQuote, sale?: Sale): QuoteDisplay => {
  const fallbackDate = sale?.date ?? new Date().toISOString().slice(0, 10);
  const validTo = remote.validUntil ?? fallbackDate;
  const validFrom = sale?.date ?? fallbackDate;
  const baseAmount = sale ? sale.quantityKg * sale.unitPrice : 0;
  const discountRate = remote.discountRate ?? 0;
  const totalAmount = round2(baseAmount * (1 - discountRate));
  return {
    id: remote.id,
    salesOrderId: remote.salesOrderId,
    customerId: sale?.customerId ?? sale?.customer ?? remote.salesOrderId,
    channel: sale?.channel ?? "渠道",
    status: normalizeQuoteStatus(remote.status),
    version: remote.version ?? 1,
    validFrom,
    validTo,
    totalAmount: totalAmount || baseAmount
  };
};

const quoteStatusCopy: Record<QuoteStatus, string> = {
  draft: "草稿",
  sent: "已发送",
  accepted: "已接受",
  rejected: "已拒绝",
  expired: "已过期"
};

const syncEnterpriseQuotes = (list: QuoteDisplay[]) => {
  enterpriseQuotes.value = list.map((quote) => ({
    id: quote.id,
    salesOrderId: quote.salesOrderId,
    customerId: quote.customerId,
    channel: quote.channel,
    status: quote.status,
    version: quote.version,
    validFrom: quote.validFrom,
    validTo: quote.validTo,
    totalAmount: quote.totalAmount,
    lines: [
      {
        productId: "remote",
        quantityKg: 0,
        unitPrice: quote.totalAmount,
        discountPercent: 0
      }
    ]
  })) as SalesQuote[];
};

let quoteRequestId = 0;
const loadQuotes = async () => {
  if (!sales.value.length) {
    quotes.value = [];
    quotesError.value = null;
    quotesLoading.value = false;
    syncEnterpriseQuotes([]);
    return;
  }
  const requestId = ++quoteRequestId;
  quotesLoading.value = true;
  quotesError.value = null;
  try {
    const fetchTasks = sales.value.map((sale) =>
      dataGateway
        .listQuotes(sale.id)
        .then((remoteQuotes) => remoteQuotes.map((remote) => normalizeQuote(remote, sale)))
    );
    const fetched = await Promise.all(fetchTasks);
    if (quoteRequestId !== requestId) return;
    const normalized = fetched.flat().sort((a, b) => b.validTo.localeCompare(a.validTo));
    quotes.value = normalized;
    syncEnterpriseQuotes(normalized);
  } catch (err) {
    if (quoteRequestId !== requestId) return;
    quotesError.value = err instanceof Error ? err.message : "报价数据加载失败";
    quotes.value = [];
    syncEnterpriseQuotes([]);
  } finally {
    if (quoteRequestId === requestId) {
      quotesLoading.value = false;
    }
  }
};

watch(
  sales,
  (list) => {
    if (!list.length) {
      quotes.value = [];
      syncEnterpriseQuotes([]);
      return;
    }
    loadQuotes();
  },
  { immediate: true }
);

const contractStatusCopy: Record<ContractStatus, string> = {
  pending: "待生效",
  active: "执行中",
  closed: "已结束"
};

const quoteStatuses = [
  { key: "sent", label: "发送" },
  { key: "accepted", label: "接受" },
  { key: "rejected", label: "拒绝" }
] as const;

const filteredSales = computed(() =>
  sales.value.filter((item) => {
    const matchesKeyword = keyword.value
      ? [item.customer, item.fruit].some((field) => field.includes(keyword.value))
      : true;
    const matchesPayment = paymentFilter.value === "all" || item.paymentMethod === paymentFilter.value;
    return matchesKeyword && matchesPayment;
  })
);

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const todayRevenue = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return sales.value
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + item.quantityKg * item.unitPrice, 0);
});

const pendingSales = computed(() => sales.value.filter((item) => item.status === "pending"));

const averagePrice = computed(() => {
  if (!sales.value.length) return 0;
  const totalQty = sales.value.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalAmount = sales.value.reduce((sum, item) => sum + item.quantityKg * item.unitPrice, 0);
  return totalAmount / (totalQty || 1);
});

const activeQuoteValue = computed(() =>
  quotes.value
    .filter((quote) => ["draft", "sent", "accepted"].includes(quote.status))
    .reduce((sum, quote) => sum + quote.totalAmount, 0)
);

const quotePipeline = computed(() =>
  quotes.value.filter((quote) => ["draft", "sent", "accepted"].includes(quote.status)).length
);

const contractedCustomers = computed(
  () => new Set(contracts.value.filter((ctr) => ctr.status === "active").map((ctr) => ctr.customerId)).size
);

const activePromotionCount = computed(() => promotions.value.filter((promo) => promo.active).length);

const canWriteSales = computed(() => auth.hasPermission("sales.write"));
const canApproveSales = computed(() => auth.hasPermission("sales.approval"));

const customerName = (id: string) => partners.value.find((partner) => partner.id === id)?.name ?? id ?? "-";

const markCollected = async (id: string) => {
  if (!canWriteSales.value) return;
  try {
    await store.settleSale(id);
    notifySuccess("销售单已确认收款");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "确认收款失败");
  }
};

const handleQuoteStatus = async (id: string, status: QuoteStatus) => {
  if (!canApproveSales.value) return;
  try {
    await dataGateway.updateQuoteStatus(id, status);
    await loadQuotes();
    notifySuccess("报价状态已更新");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "更新失败");
  }
};

const handleActivateContract = async (quoteId: string) => {
  if (!canApproveSales.value) return;
  try {
    await enterprise.activateContractFromQuote(quoteId, "transfer");
    notifySuccess("已生成合同草稿");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "生成失败");
  }
};

const togglePromotion = async (id: string) => {
  if (!canApproveSales.value) return;
  try {
    await enterprise.togglePromotion(id);
    notifySuccess("促销状态已切换");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "操作失败");
  }
};

const exportSales = () => {
  const header = ["单号", "客户", "品类", "数量", "金额", "支付方式", "状态", "日期"];
  const rows = sales.value.map((item) => [
    item.id,
    item.customer,
    item.fruit,
    `${item.quantityKg}kg`,
    (item.quantityKg * item.unitPrice).toFixed(2),
    paymentMap[item.paymentMethod],
    item.status === "settled" ? "已收款" : "待收款",
    item.date
  ]);
  const csv = [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateDemoSale = async () => {
  if (!canWriteSales.value) return;
  const customers = ["社区团购B站", "商超渠道", "线上商城"];
  const fruits = ["牛油果", "榴莲", "蓝莓"];
  try {
    await store.addSale({
      date: new Date().toISOString().slice(0, 10),
      customer: customers[Math.floor(Math.random() * customers.length)],
      fruit: fruits[Math.floor(Math.random() * fruits.length)],
      quantityKg: 5 + Math.round(Math.random() * 20),
      unitPrice: Math.round((25 + Math.random() * 40) * 10) / 10,
      paymentMethod: "mobile",
      status: "pending"
    });
    notifySuccess("测试销售单已创建");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "创建销售单失败");
  }
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

.page__actions {
  display: flex;
  gap: 12px;
}

button.primary,
button.ghost {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
}

button.primary {
  background: #1d4ed8;
  color: white;
}

button.primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

button.ghost {
  background: rgba(37, 99, 235, 0.15);
  color: #1d4ed8;
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
  margin: 6px 0;
}

.stat small {
  color: #94a3b8;
}

.layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 18px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.filters {
  display: flex;
  gap: 12px;
}

.filters input,
.filters select {
  flex: 1;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  padding: 10px 12px;
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

.chip.pending {
  background: rgba(248, 113, 113, 0.15);
  color: #dc2626;
}

.chip.done {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.chip[class*="status-"] {
  text-transform: capitalize;
}

.mini {
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  background: #0ea5e9;
  color: white;
  cursor: pointer;
}

.mini.ghost {
  background: rgba(14, 165, 233, 0.15);
  color: #0284c7;
}

.mini:disabled {
  background: #bfdbfe;
  color: #64748b;
  cursor: not-allowed;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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
