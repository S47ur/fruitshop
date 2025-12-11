<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <div class="brand">
        <span class="brand__dot" />
        <div>
          <p class="brand__title">鲜果智控</p>
          <p class="brand__subtitle">Fruit ERP</p>
        </div>
      </div>
      <div class="sidebar-scroll">
        <nav>
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="nav-item"
            :class="{ active: item.name === currentRouteName }"
          >
            <span>{{ item.label }}</span>
            <small>{{ item.desc }}</small>
          </RouterLink>
        </nav>
      </div>
      <div class="user-card" role="contentinfo">
        <div>
          <p class="user-card__name">{{ auth.user?.name || "未登录" }}</p>
          <p class="user-card__role">{{ roleCopy }}</p>
          <p v-if="activeStore" class="user-card__store">{{ activeStore.name }}</p>
        </div>
        <button class="logout" @click="handleLogout">退出</button>
      </div>
    </aside>
    <div class="app-shell__body">
      <header class="app-shell__header">
        <div>
          <p class="heading">{{ headingTitle }}</p>
          <p class="subheading">{{ headingSubtitle }}</p>
        </div>
        <div class="header-actions">
          <div v-if="stores.length" class="store-switcher">
            <label>当前门店</label>
            <select v-model="selectedStoreId" :disabled="!canSwitchStore">
              <option disabled value="">请选择门店</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }} · {{ store.city }}
              </option>
            </select>
            <small v-if="stores.length > 1 && !canSwitchStore">无切换权限</small>
          </div>
          <button class="ghost" @click="handleExportDaily">导出日报</button>
          <button class="primary" :disabled="!canUseQuickActions" @click="toggleQuickActions">
            {{ !canUseQuickActions ? "无权限" : showQuickActions ? "选择类型" : "新增单据" }}
          </button>
        </div>
      </header>
      <main>
        <slot />
      </main>
    </div>

    <transition name="fade">
      <div v-if="showQuickActions" class="quick-actions">
        <p>请选择要创建的单据类型：</p>
        <div class="quick-actions__buttons">
          <button
            v-for="action in quickActions"
            :key="action.key"
            @click="handleQuickAction(action.key)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/useAuthStore";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { PermissionKey, Purchase, Sale, StoreId, UserRole } from "../stores/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const inventoryStore = useInventoryStore();
const { purchases, sales } = storeToRefs(inventoryStore);
const { stores, activeStoreId, activeStore } = storeToRefs(auth);

const showQuickActions = ref(false);

const navItems = [
  { name: "dashboard", label: "经营驾驶舱", desc: "销售 & 库存概览", to: { name: "dashboard" } },
  { name: "procurement", label: "采购管理", desc: "供应商与到货", to: { name: "procurement" } },
  { name: "sales", label: "销售管理", desc: "POS收银台", to: { name: "sales" } },
  { name: "inventory", label: "库存预警", desc: "安全库存 & 补货", to: { name: "inventory" } },
  { name: "finance", label: "财务报表", desc: "资金拆解", to: { name: "finance" } }
];

const roleLabels: Record<UserRole, string> = {
  "ROLE_OWNER": "店主",
  "ROLE_MANAGER": "店长",
  "ROLE_CASHIER": "收银",
  "ROLE_AUDITOR": "稽核"
};

const quickActionConfigs: Array<{
  key: "procurement" | "sales";
  label: string;
  permission: PermissionKey;
}> = [
  { key: "procurement", label: "采购入库单", permission: "procurement.write" },
  { key: "sales", label: "销售出库单", permission: "sales.write" }
];

const currentRouteName = computed(() => (route.name as string) || "dashboard");
const headingTitle = computed(() => (route.meta?.title as string) || "经营驾驶舱");
const headingSubtitle = computed(() => "实时掌握采购、销售、库存与资金流");
const roleCopy = computed(() => {
  if (!auth.user) return "访客";
  return roleLabels[auth.user.role];
});

const quickActions = computed(() => quickActionConfigs.filter((item) => auth.hasPermission(item.permission)));
const canUseQuickActions = computed(() => quickActions.value.length > 0);

const selectedStoreId = computed({
  get: () => activeStoreId.value ?? "",
  set: (value: string) => {
    if (!value) return;
    auth.selectStore(value as StoreId);
  }
});

const canSwitchStore = computed(
  () => auth.hasPermission("org.switch-store") && (stores.value?.length || 0) > 1
);

const toggleQuickActions = () => {
  if (!canUseQuickActions.value) return;
  showQuickActions.value = !showQuickActions.value;
};

const handleQuickAction = (target: "procurement" | "sales") => {
  if (!quickActions.value.some((item) => item.key === target)) return;
  showQuickActions.value = false;
  router.push({ name: target });
};

const handleLogout = () => {
  auth.logout();
  router.replace({ name: "login" });
};

const handleExportDaily = () => {
  const header = ["类型", "单号", "品类", "数量(kg)", "单价", "金额", "支付方式", "日期"];
  const rows = [
    ...sales.value.map((line: Sale) => [
      "销售",
      line.id,
      line.fruit,
      line.quantityKg,
      line.unitPrice,
      (line.quantityKg * line.unitPrice).toFixed(2),
      line.paymentMethod,
      line.date
    ]),
    ...purchases.value.map((line: Purchase) => [
      "采购",
      line.id,
      line.fruit,
      line.quantityKg,
      line.unitCost,
      (line.quantityKg * line.unitCost).toFixed(2),
      line.paymentMethod,
      line.date
    ])
  ];
  const csv = [header, ...rows]
    .map((line) =>
      line
        .map((cell) => {
          const value = String(cell ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  position: relative;
}

.app-shell__sidebar {
  background: #0f172a;
  color: #e2e8f0;
  padding: 32px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34d399, #22d3ee);
  display: inline-block;
}

.brand__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.brand__subtitle {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  color: inherit;
  background: transparent;
  transition: background 0.2s ease;
}

.nav-item small {
  color: #818cf8;
  font-size: 12px;
}

.nav-item.active,
.nav-item:hover {
  background: rgba(226, 232, 240, 0.12);
}

.user-card {
  padding: 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 24px;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.45);
}

.user-card__name {
  margin: 0;
  font-weight: 600;
}

.user-card__role {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.user-card__store {
  margin: 4px 0 0;
  font-size: 12px;
  color: #cbd5f5;
}

.logout {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #e2e8f0;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}

.app-shell__body {
  background: #f8fafc;
  padding: 32px 40px;
}

.app-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.heading {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.subheading {
  margin: 4px 0 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.store-switcher {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #475569;
  background: white;
  padding: 8px 12px;
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.store-switcher select {
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  padding: 6px 10px;
  background: #f8fafc;
}

.store-switcher small {
  color: #f97316;
}

button {
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.primary {
  background: #2563eb;
  color: white;
}

button.ghost {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.quick-actions {
  position: fixed;
  right: 40px;
  top: 110px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  padding: 18px 22px;
  width: 240px;
}

.quick-actions__buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.quick-actions__buttons button {
  width: 100%;
  border-radius: 10px;
  background: #f1f5f9;
  color: #0f172a;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .app-shell__sidebar {
    position: static;
    height: auto;
    grid-row: 2;
    flex-direction: row;
    overflow-x: auto;
  }
  nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .sidebar-scroll {
    flex: none;
    overflow: visible;
  }
  .user-card {
    position: static;
    box-shadow: none;
    margin-top: 12px;
  }
}
</style>
