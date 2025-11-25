<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      class="pagination__btn" 
      :disabled="currentPage === 1" 
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      &lt;
    </button>
    <span class="pagination__info">{{ currentPage }} / {{ totalPages }}</span>
    <button 
      class="pagination__btn" 
      :disabled="currentPage === totalPages" 
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      &gt;
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits<{
  (e: 'update:currentPage', page: number): void;
}>();
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.pagination__btn {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.pagination__btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
}

.pagination__info {
  font-size: 14px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}
</style>
