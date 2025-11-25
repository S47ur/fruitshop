<template>
  <div class="chart-shell">
    <VChart ref="chartRef" :option="option" autoresize class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface TrendPoint {
  label: string;
  sales: number;
  procurement: number;
}

interface Props {
  title?: string;
  data: TrendPoint[];
}

const props = defineProps<Props>();

const chartRef = ref<any>(null);

const option = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "cross" }
  },
  legend: {
    data: ["销售收入", "采购支出"],
    top: 0,
    textStyle: { color: "#475569" }
  },
  grid: {
    left: 30,
    right: 10,
    bottom: 30,
    containLabel: true
  },
  xAxis: {
    type: "category",
    data: props.data.map((item) => item.label),
    boundaryGap: false,
    axisLine: { lineStyle: { color: "#cbd5f5" } }
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => `¥${value / 1000}k`
    },
    splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } }
  },
  series: [
    {
      name: "销售收入",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      areaStyle: {
        color: "rgba(34,197,94,0.15)"
      },
      lineStyle: { color: "#16a34a" },
      data: props.data.map((item) => item.sales)
    },
    {
      name: "采购支出",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      areaStyle: {
        color: "rgba(59,130,246,0.15)"
      },
      lineStyle: { color: "#2563eb" },
      data: props.data.map((item) => item.procurement)
    }
  ]
}));

const exportAsImage = () => {
  const instance = chartRef.value?.chart ?? chartRef.value?.getEchartsInstance?.() ?? chartRef.value;
  
  if (instance && typeof instance.getDataURL === 'function') {
    return instance.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" });
  }
  return null;
};

defineExpose({ exportAsImage });
</script>

<style scoped>
.chart-shell {
  width: 100%;
  height: 320px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
