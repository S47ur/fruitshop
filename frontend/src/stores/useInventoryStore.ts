import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { dataGateway } from "../services/dataGateway";
import { useAuthStore } from "./useAuthStore";
import { useEnterpriseStore } from "./useEnterpriseStore";
import type {
  InventoryItem,
  PartnerProfile,
  PaymentBreakdownEntry,
  PaymentMethod,
  ProductMaster,
  Purchase,
  Sale,
  StockAdjustment,
  StoreId
} from "./types";

const paymentMethods: PaymentMethod[] = ["cash", "card", "mobile", "transfer"];

type DateRangePreset = "today" | "week" | "month" | "custom" | "all";

interface DateRangeState {
  preset: DateRangePreset;
  start: string | null;
  end: string | null;
}

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const computePresetRange = (preset: DateRangePreset): { start: string | null; end: string | null } => {
  const today = new Date();
  const todayISO = toISODate(today);
  if (preset === "today") {
    return { start: todayISO, end: todayISO };
  }
  if (preset === "week") {
    const start = new Date(today);
    const dayOfWeek = start.getDay() || 7;
    start.setDate(start.getDate() - (dayOfWeek - 1));
    return { start: toISODate(start), end: todayISO };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toISODate(start), end: todayISO };
  }
  if (preset === "all") {
    return { start: null, end: null };
  }
  return { start: null, end: null };
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export const useInventoryStore = defineStore("inventory", () => {
  const purchases = ref<Purchase[]>([]);
  const sales = ref<Sale[]>([]);
  const inventory = ref<InventoryItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentStoreId = ref<StoreId | null>(null);
  const initialRange = computePresetRange("month");
  const dateFilter = ref<DateRangeState>({ preset: "month", ...initialRange });

  const auth = useAuthStore();
  const enterprise = useEnterpriseStore();

  const resetStoreData = () => {
    purchases.value = [];
    sales.value = [];
    inventory.value = [];
    currentStoreId.value = null;
  };

  const loadStoreData = async (storeId?: StoreId | null, options: { silent?: boolean } = {}) => {
    const targetStore = storeId ?? auth.activeStoreId ?? currentStoreId.value;
    if (!targetStore) {
      resetStoreData();
      return;
    }
    if (!options.silent) {
      loading.value = true;
      error.value = null;
    }
    try {
      const [purchaseData, salesData, inventoryData] = await Promise.all([
        dataGateway.listPurchases(targetStore),
        dataGateway.listSales(targetStore),
        dataGateway.listInventory(targetStore)
      ]);
      purchases.value = purchaseData;
      sales.value = salesData;
      inventory.value = inventoryData;
      currentStoreId.value = targetStore;
    } catch (err) {
      if (!options.silent) {
        error.value = err instanceof Error ? err.message : "数据加载失败，请稍后再试";
      }
      throw err;
    } finally {
      if (!options.silent) {
        loading.value = false;
      }
    }
  };

  watch(
    () => auth.activeStoreId,
    (storeId) => {
      if (!storeId) {
        resetStoreData();
        return;
      }
      loadStoreData(storeId).catch(() => {
        /* error state already captured */
      });
    },
    { immediate: true }
  );

  const ensureStore = (): StoreId => {
    if (currentStoreId.value) return currentStoreId.value;
    if (auth.activeStoreId) return auth.activeStoreId;
    throw new Error("请选择门店后再执行操作");
  };

  const runMutation = async <T>(task: () => Promise<T>): Promise<T> => {
    loading.value = true;
    error.value = null;
    try {
      return await task();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "操作失败，请稍后再试";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const matchesRange = (targetDate: string) => {
    const { start, end } = dateFilter.value;
    if (start && targetDate < start) return false;
    if (end && targetDate > end) return false;
    return true;
  };

  const filteredSales = computed(() => sales.value.filter((sale) => matchesRange(sale.date)));
  const filteredPurchases = computed(() =>
    purchases.value.filter((purchase) => matchesRange(purchase.date))
  );

  const totalInventoryValue = computed(() =>
    round2(
      inventory.value.reduce(
        (sum: number, line: InventoryItem) => sum + line.onHandKg * line.unitCost,
        0
      )
    )
  );

  const totalRevenue = computed(() =>
    round2(
      filteredSales.value.reduce((sum: number, sale: Sale) => sum + sale.quantityKg * sale.unitPrice, 0)
    )
  );

  const totalProcurementCost = computed(() =>
    round2(
      filteredPurchases.value.reduce(
        (sum: number, purchase: Purchase) => sum + purchase.quantityKg * purchase.unitCost,
        0
      )
    )
  );

  const grossProfit = computed(() => round2(totalRevenue.value - totalProcurementCost.value));

  const inventoryTurnover = computed(() => {
    const inventoryValue = totalInventoryValue.value;
    if (!inventoryValue) return null;
    return round2((totalRevenue.value || 0) / inventoryValue);
  });

  const receivables = computed(() =>
    round2(
      sales.value
        .filter((sale) => sale.status === "pending")
        .reduce((sum, sale) => sum + sale.quantityKg * sale.unitPrice, 0)
    )
  );

  const payables = computed(() =>
    round2(
      purchases.value
        .filter((purchase) => purchase.status === "pending")
        .reduce((sum, purchase) => sum + purchase.quantityKg * purchase.unitCost, 0)
    )
  );

  const paymentBreakdown = computed<PaymentBreakdownEntry[]>(() =>
    paymentMethods.map((method) => {
      const incoming = filteredSales.value
        .filter((sale: Sale) => sale.paymentMethod === method)
        .reduce((sum: number, sale: Sale) => sum + sale.quantityKg * sale.unitPrice, 0);
      const outgoing = filteredPurchases.value
        .filter((purchase: Purchase) => purchase.paymentMethod === method)
        .reduce(
          (sum: number, purchase: Purchase) => sum + purchase.quantityKg * purchase.unitCost,
          0
        );
      return {
        method,
        incoming: round2(incoming),
        outgoing: round2(outgoing),
        net: round2(incoming - outgoing)
      };
    })
  );

  const reorderAlerts = computed(() =>
    inventory.value.filter((line: InventoryItem) => line.onHandKg <= line.reorderLevelKg)
  );

  const topSellingFruits = computed(() => {
    const revenueMap = new Map<string, number>();
    filteredSales.value.forEach((sale: Sale) => {
      const revenue = sale.quantityKg * sale.unitPrice;
      revenueMap.set(sale.fruit, (revenueMap.get(sale.fruit) || 0) + revenue);
    });
    return Array.from(revenueMap.entries())
      .map(([fruit, revenue]) => ({ fruit, revenue: round2(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  });

  const addPurchase = async (payload: Omit<Purchase, "id" | "storeId">) => {
    const storeId = ensureStore();
    await runMutation(async () => {
      await dataGateway.createPurchase(storeId, payload);
      await loadStoreData(storeId, { silent: true });
    });
  };

  const addSale = async (payload: Omit<Sale, "id" | "storeId">) => {
    const storeId = ensureStore();
    await runMutation(async () => {
      await dataGateway.createSale(storeId, payload);
      await loadStoreData(storeId, { silent: true });
    });
  };

  const settlePurchase = async (id: string) => {
    const storeId = ensureStore();
    await runMutation(async () => {
      await dataGateway.settlePurchase(id);
      await loadStoreData(storeId, { silent: true });
    });
  };

  const settleSale = async (id: string) => {
    const storeId = ensureStore();
    await runMutation(async () => {
      await dataGateway.settleSale(id);
      await loadStoreData(storeId, { silent: true });
    });
  };

  const triggerReorder = async (fruit: string) => {
    const target = inventory.value.find((line) => line.fruit === fruit);
    const quantity = target ? Math.max(target.reorderLevelKg * 1.5, 40) : 50;
    const unitCost = target ? target.unitCost : 20;
    const today = new Date().toISOString().slice(0, 10);
    const supplierCatalog = enterprise.partners.filter((partner: PartnerProfile) => partner.type === "supplier");
    const preferredSupplier = supplierCatalog.find((partner) => partner.preferred) || supplierCatalog[0];
    const product =
      enterprise.products.find((item: ProductMaster) => item.name === fruit) || enterprise.products[0];
    if (!preferredSupplier || !product) {
      throw new Error("缺少供应商或商品主数据，无法触发补货");
    }
    await addPurchase({
      date: today,
      eta: today,
      supplier: preferredSupplier.name,
      supplierId: preferredSupplier.id,
      fruit,
      productId: product.id,
      quantityKg: round2(quantity),
      unitCost: round2(unitCost),
      paymentMethod: preferredSupplier.settlementMethod,
      batchRequired: false,
      status: "pending"
    });
  };

  const updateReorderLevel = async (fruit: string, level: number) => {
    const sanitized = round2(Math.max(5, level));
    await runMutation(async () => {
      const target = inventory.value.find((line) => line.fruit === fruit);
      if (!target?.id) {
        throw new Error("当前门店未找到该品类库存，无法调整安全库存");
      }
      await dataGateway.updateReorderLevel(target.id, sanitized);
      target.reorderLevelKg = sanitized;
    });
  };

  const recordAdjustment = async (payload: {
    productId: string;
    warehouseId?: string;
    beforeQty: number;
    afterQty: number;
    reason: string;
  }): Promise<StockAdjustment> => {
    const operator = auth.user?.name ?? auth.user?.username ?? "系统";
    return runMutation(async () => {
      const product = enterprise.products.find((item) => item.id === payload.productId);
      const inventoryLine = inventory.value.find(
        (line) =>
          line.productId === payload.productId ||
          line.fruit === product?.name ||
          line.fruit === payload.productId
      );
      if (!inventoryLine?.id) {
        throw new Error("当前门店暂无该商品库存，无法提交盘点调整");
      }
      const delta = round2(payload.afterQty - payload.beforeQty);
      const remote = await dataGateway.createAdjustment(inventoryLine.id, {
        reason: payload.reason,
        deltaKg: delta,
        createdBy: operator
      });
      inventoryLine.onHandKg = round2(Math.max(0, payload.afterQty));
      return {
        id: remote.id,
        warehouseId: payload.warehouseId ?? "wh-local",
        productId: payload.productId,
        reason: payload.reason,
        beforeQty: payload.beforeQty,
        afterQty: payload.afterQty,
        operator,
        time: remote.createdAt,
        inventoryId: inventoryLine.id,
        deltaKg: delta
      } satisfies StockAdjustment;
    });
  };

  const setDatePreset = (preset: DateRangePreset) => {
    if (preset === "custom") {
      dateFilter.value = {
        preset,
        start: dateFilter.value.start,
        end: dateFilter.value.end
      };
      return;
    }
    const range = computePresetRange(preset);
    dateFilter.value = { preset, ...range };
  };

  const setCustomDateRange = (start: string | null, end: string | null) => {
    let resolvedStart = start || null;
    let resolvedEnd = end || null;
    if (resolvedStart && resolvedEnd && resolvedStart > resolvedEnd) {
      [resolvedStart, resolvedEnd] = [resolvedEnd, resolvedStart];
    }
    dateFilter.value = {
      preset: "custom",
      start: resolvedStart,
      end: resolvedEnd
    };
  };

  return {
    purchases,
    sales,
    inventory,
    currentStoreId,
    loading,
    error,
    dateFilter,
    receivables,
    payables,
    totalInventoryValue,
    totalRevenue,
    totalProcurementCost,
    grossProfit,
    inventoryTurnover,
    paymentBreakdown,
    reorderAlerts,
    topSellingFruits,
    filteredSales,
    filteredPurchases,
    setDatePreset,
    setCustomDateRange,
    addPurchase,
    addSale,
    settlePurchase,
    settleSale,
    triggerReorder,
    updateReorderLevel,
    recordAdjustment,
    loadStoreData
  };
});
