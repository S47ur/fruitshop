<template>
  <section class="dashboard">
    <div class="filters-bar">
      <div class="filters-group">
        <label for="store-select">门店</label>
        <select id="store-select" v-model="selectedStoreId">
          <option v-for="storeOption in availableStores" :key="storeOption.id" :value="storeOption.id">
            {{ storeOption.name }}
          </option>
        </select>
      </div>
      <div class="filters-group grow">
        <label>时间范围</label>
        <div class="preset-buttons">
          <button
            v-for="option in presetOptions"
            :key="option.value"
            type="button"
            class="preset-button"
            :class="{ active: isPresetActive(option.value) }"
            @click="applyPreset(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <div v-if="showCustomInputs" class="filters-group custom-range">
        <label>自定义区间</label>
        <div class="range-inputs">
          <input type="date" v-model="customStart" @change="handleCustomRangeChange" />
          <span>至</span>
          <input type="date" v-model="customEnd" @change="handleCustomRangeChange" />
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard v-for="card in cards" :key="card.label" :label="card.label" :value="card.value" :sub="card.sub" />
    </div>

    <p v-if="error" class="status error">{{ error }}</p>
    <p v-else-if="loading" class="status">数据加载中...</p>

    <div class="layout-two">
      <InventoryTable />
      <div class="stack">
        <PaymentBreakdown :breakdown="paymentBreakdown" />
        <div class="panel">
          <p class="title">库存预警</p>
          <ul>
            <li v-for="item in reorderAlerts" :key="item.fruit">
              <div>
                <strong>{{ item.fruit }}</strong>
                <span>剩余 {{ item.onHandKg }}kg / 预警 {{ item.reorderLevelKg }}kg</span>
              </div>
              <button :disabled="!canWriteInventory || loading" @click="handleReorder(item.fruit)">
                一键补货
              </button>
            </li>
            <li v-if="!reorderAlerts.length" class="empty">暂无预警，继续保持。</li>
          </ul>
        </div>
        <div class="panel">
          <p class="title">热销品类</p>
          <ol>
            <li v-for="item in topSellingFruits" :key="item.fruit">
              <span>{{ item.fruit }}</span>
              <strong>{{ formatCurrency(item.revenue) }}</strong>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="panel chart-panel">
        <div class="panel-header">
          <p class="title">支付方式占比</p>
          <button
            type="button"
            class="ghost-button"
            :disabled="!paymentPieData.length"
            @click="downloadChartImage(donutChartRef, 'payment-share.png')"
          >
            导出 PNG
          </button>
        </div>
        <DonutChart ref="donutChartRef" v-if="paymentPieData.length" :data="paymentPieData" series-name="收入" />
        <p v-else class="empty">暂无支付数据</p>
      </div>
      <div class="panel chart-panel">
        <div class="panel-header">
          <p class="title">销售 / 采购趋势</p>
          <button
            type="button"
            class="ghost-button"
            :disabled="!salesProcurementTrend.length"
            @click="downloadChartImage(trendChartRef, 'sales-trend.png')"
          >
            导出 PNG
          </button>
        </div>
        <LineAreaChart ref="trendChartRef" v-if="salesProcurementTrend.length" :data="salesProcurementTrend" />
        <p v-else class="empty">暂无趋势数据</p>
      </div>
      <div class="panel chart-panel">
        <div class="panel-header">
          <p class="title">库存前五 (kg)</p>
          <button
            type="button"
            class="ghost-button"
            :disabled="!inventoryBarData.length"
            @click="downloadChartImage(inventoryChartRef, 'inventory-top5.png')"
          >
            导出 PNG
          </button>
        </div>
        <HorizontalBarChart
          ref="inventoryChartRef"
          v-if="inventoryBarData.length"
          :data="inventoryBarData"
          unit="kg"
        />
        <p v-else class="empty">暂无库存品类数据</p>
      </div>
    </div>

    <div class="layout-two">
      <PurchaseForm />
      <SalesForm />
    </div>

    <TransactionTable />
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import StatCard from "../components/cards/StatCard.vue";
import InventoryTable from "../components/tables/InventoryTable.vue";
import TransactionTable from "../components/tables/TransactionTable.vue";
import PaymentBreakdown from "../components/tables/PaymentBreakdown.vue";
import PurchaseForm from "../components/forms/PurchaseForm.vue";
import SalesForm from "../components/forms/SalesForm.vue";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastBus } from "../composables/useToastBus";

type DatePreset = "today" | "week" | "month" | "all" | "custom";
type ExportableChart = { exportAsImage: () => string | null };

const presetOptions: { label: string; value: DatePreset }[] = [
  { label: "今天", value: "today" },
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "全部", value: "all" },
  { label: "自定义", value: "custom" }
];

const store = useInventoryStore();
const auth = useAuthStore();
const { notifySuccess, notifyError } = useToastBus();
const DonutChart = defineAsyncComponent(() => import("../components/charts/DonutChart.vue"));
const LineAreaChart = defineAsyncComponent(() => import("../components/charts/LineAreaChart.vue"));
const HorizontalBarChart = defineAsyncComponent(() => import("../components/charts/HorizontalBarChart.vue"));
const {
  totalRevenue,
  totalInventoryValue,
  grossProfit,
  inventoryTurnover,
  paymentBreakdown,
  reorderAlerts,
  topSellingFruits,
  inventory,
  filteredSales,
  filteredPurchases,
  dateFilter,
  loading,
  error
} = storeToRefs(store);
const { stores: availableStores, activeStoreId } = storeToRefs(auth);
const { setDatePreset, setCustomDateRange } = store;

const canWriteInventory = computed(() => auth.hasPermission("inventory.write"));

const selectedStoreId = ref(activeStoreId.value || availableStores.value[0]?.id || "");
watch(
  availableStores,
  (list) => {
    if (!list.length) return;
    if (!selectedStoreId.value) {
      selectedStoreId.value = activeStoreId.value || list[0].id;
    }
  },
  { immediate: true }
);

watch(activeStoreId, (next) => {
  if (!next) return;
  if (selectedStoreId.value !== next) {
    selectedStoreId.value = next;
  }
});
watch(selectedStoreId, (storeId) => {
  if (storeId) auth.selectStore(storeId as string);
});

const customStart = ref(dateFilter.value.start ?? "");
const customEnd = ref(dateFilter.value.end ?? "");
watch(dateFilter, (range) => {
  customStart.value = range.start ?? "";
  customEnd.value = range.end ?? "";
});

const showCustomInputs = computed(() => dateFilter.value.preset === "custom");

const applyPreset = (preset: DatePreset) => {
  setDatePreset(preset);
};

const handleCustomRangeChange = () => {
  setCustomDateRange(customStart.value || null, customEnd.value || null);
};

const isPresetActive = (preset: DatePreset) => dateFilter.value.preset === preset;

const donutChartRef = ref<ExportableChart | null>(null);
const trendChartRef = ref<ExportableChart | null>(null);
const inventoryChartRef = ref<ExportableChart | null>(null);

const downloadChartImage = (chart: ExportableChart | null, fileName: string) => {
  const dataUrl = chart?.exportAsImage();
  if (!dataUrl) return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

onMounted(() => {
  if (!store.currentStoreId) {
    store.loadStoreData().catch(() => {
      /* error state already stored */
    });
  }
});

const formatCurrency = (value: number) =>
  `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cards = computed(() => {
  const turnover = inventoryTurnover.value;
  return [
    {
      label: "当期销售额",
      value: formatCurrency(totalRevenue.value),
      sub: "含所有支付方式"
    },
    {
      label: "库存总价值",
      value: formatCurrency(totalInventoryValue.value),
      sub: "到货即刻更新"
    },
    {
      label: "毛利",
      value: formatCurrency(grossProfit.value),
      sub: "销售-采购"
    },
    {
      label: "库存周转",
      value: turnover == null ? "--" : `${turnover.toFixed(1)} 次`,
      sub: turnover == null ? "库存为0，暂无法计算" : "销售额/库存价值"
    }
  ];
});

const handleReorder = async (fruit: string) => {
  if (!canWriteInventory.value) return;
  try {
    await store.triggerReorder(fruit);
    notifySuccess(`${fruit} 补货请求已提交`);
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "补货失败，请稍后再试");
  }
};

const paymentMethodMap = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const paymentPieData = computed(() =>
  paymentBreakdown.value
    .filter((entry) => entry.incoming > 0)
    .map((entry) => ({
      name: paymentMethodMap[entry.method as keyof typeof paymentMethodMap],
      value: Number(entry.incoming.toFixed(2))
    }))
);

const round2 = (value: number) => Math.round(value * 100) / 100;

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseISODate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
};

const enumerateDates = (startISO: string, endISO: string) => {
  const dates: string[] = [];
  const cursor = parseISODate(startISO);
  const stop = parseISODate(endISO);
  while (cursor <= stop) {
    dates.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const lastNDays = (days = 7) => {
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toISODate(d));
  }
  return dates;
};

const formatLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${month}月${day}日`;
};

const buildTrendSeries = () => {
  const { start, end } = dateFilter.value;
  if (start && end) {
    return enumerateDates(start, end);
  }
  if (start && !end) {
    return enumerateDates(start, toISODate(new Date()));
  }
  if (!start && end) {
    return enumerateDates(end, end);
  }
  return lastNDays();
};

const salesProcurementTrend = computed(() => {
  const dateSeries = buildTrendSeries();
  return dateSeries.map((date) => {
    const salesTotal = filteredSales.value
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + item.quantityKg * item.unitPrice, 0);
    const procurementTotal = filteredPurchases.value
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + item.quantityKg * item.unitCost, 0);
    return {
      label: formatLabel(date),
      sales: round2(salesTotal),
      procurement: round2(procurementTotal)
    };
  });
});

const inventoryBarData = computed(() =>
  [...inventory.value]
    .sort((a, b) => b.onHandKg - a.onHandKg)
    .slice(0, 5)
    .map((item) => ({ name: item.fruit, value: round2(item.onHandKg) }))
);
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filters-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.filters-group.grow {
  flex: 1;
  min-width: 240px;
}

.filters-group label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.filters-group select,
.filters-group input[type="date"] {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  background: white;
  color: #0f172a;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-button {
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 6px 14px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.preset-button.active {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: white;
}

.custom-range .range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.layout-two {
  display: grid;
  grid-template-columns: 2fr 1.1fr;
  gap: 16px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.ghost-button {
  border: 1px solid #dbeafe;
  border-radius: 999px;
  padding: 6px 14px;
  background: white;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
}

.ghost-button:disabled {
  border-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.panel ul {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel ol {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel ol li {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.panel li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 14px;
}

.panel li span {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.panel button {
  border: none;
  background: #f97316;
  color: white;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

.panel button:disabled {
  background: #fed7aa;
  color: #a16207;
  cursor: not-allowed;
}

.panel li.empty {
  justify-content: center;
  color: #94a3b8;
}

.status {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-size: 14px;
}

.status.error {
  background: rgba(248, 113, 113, 0.15);
  color: #b91c1c;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.chart-panel {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

@media (max-width: 1200px) {
  .layout-two {
    grid-template-columns: 1fr;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
