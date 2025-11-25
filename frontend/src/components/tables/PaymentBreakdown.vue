<template>
  <div class="panel">
    <div class="panel-header">
      <p class="title">支付方式拆解</p>
      <div class="actions">
        <button type="button" class="ghost-button" :disabled="!breakdown.length" @click="exportCsv">
          导出 CSV
        </button>
        <button type="button" class="ghost-button" :disabled="!breakdown.length" @click="exportPdf">
          导出 PDF
        </button>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>支付方式</th>
          <th>收入(元)</th>
          <th>支出(元)</th>
          <th>净流入(元)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in breakdown" :key="entry.method">
          <td>{{ methodMap[entry.method] }}</td>
          <td>{{ entry.incoming.toFixed(2) }}</td>
          <td>{{ entry.outgoing.toFixed(2) }}</td>
          <td :class="entry.net >= 0 ? 'positive' : 'negative'">{{ entry.net.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PaymentBreakdownEntry, PaymentMethod } from "../../stores/types";
import { exportToPdf } from "../../utils/exportUtils";

interface Props {
  breakdown: PaymentBreakdownEntry[];
}

const props = defineProps<Props>();

const methodMap: Record<PaymentMethod, string> = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const wrapCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

const exportCsv = () => {
  if (!props.breakdown.length) return;
  const header = ["支付方式", "收入(元)", "支出(元)", "净流入(元)"];
  const rows = props.breakdown.map((entry) => [
    methodMap[entry.method],
    entry.incoming.toFixed(2),
    entry.outgoing.toFixed(2),
    entry.net.toFixed(2)
  ]);
  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => wrapCsvValue(cell)).join(","))
    .join("\r\n");
  const blob = new Blob([`\ufeff${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payment-breakdown-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportPdf = () => {
  if (!props.breakdown.length) return;
  const header = ["Method", "Incoming", "Outgoing", "Net"];
  const rows = props.breakdown.map((entry) => [
    entry.method,
    entry.incoming.toFixed(2),
    entry.outgoing.toFixed(2),
    entry.net.toFixed(2)
  ]);
  exportToPdf("Payment Breakdown", header, rows, `payment-breakdown-${new Date().toISOString().slice(0, 10)}.pdf`);
};
</script>

<style scoped>
.panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0 0 12px 0;
  font-weight: 600;
}

.ghost-button {
  border: 1px solid #dbeafe;
  background: transparent;
  color: #2563eb;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.ghost-button:disabled {
  border-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px 6px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

th {
  color: #94a3b8;
  font-weight: 500;
}

.positive {
  color: #16a34a;
  font-weight: 600;
}

.negative {
  color: #dc2626;
  font-weight: 600;
}
</style>
