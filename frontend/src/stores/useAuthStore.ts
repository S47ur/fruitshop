import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { dataGateway } from "../services/dataGateway";
import type { PermissionKey, StoreId, StoreProfile, UserProfile } from "./types";

interface Credentials {
  username: string;
  password: string;
}

interface PersistedAuth {
  user: UserProfile;
  token: string;
  stores: StoreProfile[];
  activeStoreId: StoreId | null;
  permissions: PermissionKey[];
}

const storageKey = "fruitshop-auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<UserProfile | null>(null);
  const token = ref<string | null>(null);
  const stores = ref<StoreProfile[]>([]);
  const activeStoreId = ref<StoreId | null>(null);
  const permissions = ref<PermissionKey[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(user.value && token.value));
  const activeStore = computed(() =>
    stores.value.find((store) => store.id === activeStoreId.value) || null
  );

  const hasPermission = (permission: PermissionKey) => permissions.value.includes(permission);

  const persist = () => {
    if (typeof window === "undefined") return;
    if (!user.value || !token.value) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    const payload: PersistedAuth = {
      user: user.value,
      token: token.value,
      stores: stores.value,
      activeStoreId: activeStoreId.value,
      permissions: permissions.value
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const hydrate = () => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(storageKey);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as PersistedAuth;
      user.value = parsed.user;
      token.value = parsed.token;
      stores.value = parsed.stores || [];
      permissions.value = parsed.permissions || [];
      activeStoreId.value = parsed.activeStoreId || parsed.stores?.[0]?.id || null;
    } catch (err) {
      window.localStorage.removeItem(storageKey);
    }
  };

  const login = async (credentials: Credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await dataGateway.login(credentials);
      user.value = response.user;
      token.value = response.token;
      stores.value = response.stores;
      permissions.value = response.permissions;
      activeStoreId.value = response.stores[0]?.id ?? null;
      persist();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "登录失败，请稍后再试";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const selectStore = (storeId: StoreId) => {
    if (!stores.value.some((store) => store.id === storeId)) return;
    if (activeStoreId.value === storeId) return;
    if (!hasPermission("org.switch-store") && stores.value.length > 1) return;
    activeStoreId.value = storeId;
    persist();
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    stores.value = [];
    permissions.value = [];
    activeStoreId.value = null;
    persist();
  };

  hydrate();

  return {
    user,
    token,
    stores,
    activeStoreId,
    activeStore,
    permissions,
    loading,
    error,
    isAuthenticated,
    hasPermission,
    selectStore,
    login,
    logout
  };
});
