<template>
  <div class="chart-shell">
    <VChart ref="chartRef" :option="option" autoresize class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface BarDatum {
  name: string;
  value: number;
}

interface Props {
  title?: string;
  unit?: string;
  data: BarDatum[];
  color?: string;
}

const props = defineProps<Props>();

const chartRef = ref<any>(null);

const option = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" }
  },
  grid: {
    left: 120,
    right: 32,
    top: 10,
    bottom: 20
  },
  xAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => `${value}${props.unit || ""}`
    },
    splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } }
  },
  yAxis: {
    type: "category",
    data: props.data.map((item) => item.name),
    axisLabel: { color: "#475569" }
  },
  series: [
    {
      type: "bar",
      data: props.data.map((item) => item.value),
      barWidth: 18,
      itemStyle: {
        borderRadius: [0, 12, 12, 0],
        color: props.color || "#f97316"
      }
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
