<template>
  <div class="stat-card">
    <div class="stat-card__meta">
      <p class="label">{{ label }}</p>
      <slot name="icon" />
    </div>
    <p class="value">{{ value }}</p>
    <p class="sub">{{ sub }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.08);
  min-width: 0;
}

.stat-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 13px;
  margin-bottom: 8px;
}

.value {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #0f172a;
}

.sub {
  margin: 4px 0 0;
  color: #0ea5e9;
  font-size: 13px;
}
</style>
