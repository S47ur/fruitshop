<template>
  <AppShell v-if="!isPublicRoute">
    <RouterView />
  </AppShell>
  <RouterView v-else />
  <ToastHost />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import AppShell from "./components/AppShell.vue";
import ToastHost from "./components/ui/ToastHost.vue";

const route = useRoute();
const isPublicRoute = computed(() => Boolean(route.meta?.public));
</script>
