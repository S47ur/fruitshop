<template>
  <div class="chart-shell">
    <VChart ref="chartRef" :option="option" autoresize class="chart" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface ChartDatum {
  name: string;
  value: number;
}

interface Props {
  title?: string;
  seriesName?: string;
  data: ChartDatum[];
  colors?: string[];
}

const props = defineProps<Props>();

const chartRef = ref<any>(null);

const palette = computed(() =>
  props.colors && props.colors.length
    ? props.colors
    : ["#2563eb", "#16a34a", "#f97316", "#8b5cf6", "#0f172a"]
);

const option = computed(() => ({
  color: palette.value,
  tooltip: {
    trigger: "item",
    valueFormatter: (value: number) => `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`
  },
  legend: {
    orient: "vertical",
    right: 10,
    top: 20,
    textStyle: { color: "#475569" }
  },
  series: [
    {
      name: props.seriesName || props.title || "占比",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2
      },
      label: {
        formatter: "{b}: {d}%",
        color: "#0f172a"
      },
      data: props.data
    }
  ]
}));

const exportAsImage = () => {
  // Try getting instance from different possible locations on the ref
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
