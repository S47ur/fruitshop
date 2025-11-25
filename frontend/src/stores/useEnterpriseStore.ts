import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { dataGateway } from "../services/dataGateway";
import type {
  AgingBucket,
  ApprovalFlow,
  AuditLogEntry,
  AutomationTask,
  CashForecastEntry,
  ChannelConfig,
  IntegrationEndpoint,
  InventoryBatch,
  InboundShipment,
  InvoiceStatus,
  ParameterConfig,
  PartnerProfile,
  PaymentMethod,
  PermissionKey,
  ProductMaster,
  ProductStatus,
  PromotionRule,
  PurchaseInvoice,
  PurchaseOrder,
  PurchaseOrderStatus,
  QuoteStatus,
  RoleMatrixEntry,
  SalesContract,
  SalesQuote,
  StockAdjustment,
  StoreProfile,
  TransferRequest,
  UnitConversion,
  UserRole,
  WarehouseProfile
} from "./types";

interface EnterpriseSnapshot {
  products: ProductMaster[];
  partners: PartnerProfile[];
  warehouses: WarehouseProfile[];
  purchaseOrders: PurchaseOrder[];
  shipments: InboundShipment[];
  invoices: PurchaseInvoice[];
  quotes: SalesQuote[];
  contracts: SalesContract[];
  promotions: PromotionRule[];
  channelConfigs: ChannelConfig[];
  batches: InventoryBatch[];
  adjustments: StockAdjustment[];
  transfers: TransferRequest[];
  aging: AgingBucket[];
  cashForecast: CashForecastEntry[];
  roleMatrix: RoleMatrixEntry[];
  approvalFlows: ApprovalFlow[];
  auditLogs: AuditLogEntry[];
  integrations: IntegrationEndpoint[];
  automations: AutomationTask[];
  parameters: ParameterConfig[];
}

const storageKey = "fruitshop-enterprise-state";

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 6)}${Date.now().toString(36)}`;

const buildDefaultSnapshot = (): EnterpriseSnapshot => ({
  products: [],
  partners: [],
  warehouses: [],
  purchaseOrders: [],
  shipments: [],
  invoices: [],
  quotes: [],
  contracts: [],
  promotions: [],
  channelConfigs: [],
  batches: [],
  adjustments: [],
  transfers: [],
  aging: [],
  cashForecast: [],
  roleMatrix: [],
  approvalFlows: [],
  auditLogs: [],
  integrations: [],
  automations: [],
  parameters: []
});

const loadSnapshot = (): EnterpriseSnapshot => {
  if (typeof window === "undefined") {
    return buildDefaultSnapshot();
  }
  const cached = window.localStorage.getItem(storageKey);
  if (!cached) {
    return buildDefaultSnapshot();
  }
  try {
    const parsed = JSON.parse(cached) as Partial<EnterpriseSnapshot>;
    const fallback = buildDefaultSnapshot();
    return {
      products: parsed.products ?? fallback.products,
      partners: parsed.partners ?? fallback.partners,
      warehouses: parsed.warehouses ?? fallback.warehouses,
      purchaseOrders: parsed.purchaseOrders ?? fallback.purchaseOrders,
      shipments: parsed.shipments ?? fallback.shipments,
      invoices: parsed.invoices ?? fallback.invoices,
      quotes: parsed.quotes ?? fallback.quotes,
      contracts: parsed.contracts ?? fallback.contracts,
      promotions: parsed.promotions ?? fallback.promotions,
      channelConfigs: parsed.channelConfigs ?? fallback.channelConfigs,
      batches: parsed.batches ?? fallback.batches,
      adjustments: parsed.adjustments ?? fallback.adjustments,
      transfers: parsed.transfers ?? fallback.transfers,
      aging: parsed.aging ?? fallback.aging,
      cashForecast: parsed.cashForecast ?? fallback.cashForecast,
      roleMatrix: parsed.roleMatrix ?? fallback.roleMatrix,
      approvalFlows: parsed.approvalFlows ?? fallback.approvalFlows,
      auditLogs: parsed.auditLogs ?? fallback.auditLogs,
      integrations: parsed.integrations ?? fallback.integrations,
      automations: parsed.automations ?? fallback.automations,
      parameters: parsed.parameters ?? fallback.parameters
    };
  } catch (err) {
    return buildDefaultSnapshot();
  }
};

const poStatusFlow: PurchaseOrderStatus[] = [
  "draft",
  "approved",
  "ordered",
  "receiving",
  "stored",
  "reconciled",
  "paid"
];

const quoteStatuses: QuoteStatus[] = ["draft", "sent", "accepted", "rejected", "expired"];

export const useEnterpriseStore = defineStore("enterprise", () => {
  const snapshot = loadSnapshot();

  const products = ref<ProductMaster[]>(snapshot.products);
  const partners = ref<PartnerProfile[]>(snapshot.partners);
  const warehouses = ref<WarehouseProfile[]>(snapshot.warehouses);
  const purchaseOrders = ref<PurchaseOrder[]>(snapshot.purchaseOrders);
  const shipments = ref<InboundShipment[]>(snapshot.shipments);
  const invoices = ref<PurchaseInvoice[]>(snapshot.invoices);
  const quotes = ref<SalesQuote[]>(snapshot.quotes);
  const contracts = ref<SalesContract[]>(snapshot.contracts);
  const promotions = ref<PromotionRule[]>(snapshot.promotions);
  const channelConfigs = ref<ChannelConfig[]>(snapshot.channelConfigs);
  const batches = ref<InventoryBatch[]>(snapshot.batches);
  const adjustments = ref<StockAdjustment[]>(snapshot.adjustments);
  const transfers = ref<TransferRequest[]>(snapshot.transfers);
  const agingBuckets = ref<AgingBucket[]>(snapshot.aging);
  const cashForecast = ref<CashForecastEntry[]>(snapshot.cashForecast);
  const roleMatrix = ref<RoleMatrixEntry[]>(snapshot.roleMatrix);
  const approvalFlows = ref<ApprovalFlow[]>(snapshot.approvalFlows);
  const auditLogs = ref<AuditLogEntry[]>(snapshot.auditLogs);
  const integrations = ref<IntegrationEndpoint[]>(snapshot.integrations);
  const automations = ref<AutomationTask[]>(snapshot.automations);
  const parameters = ref<ParameterConfig[]>(snapshot.parameters);
  const loading = ref(false);

  const persist = () => {
    if (typeof window === "undefined") return;
    const payload: EnterpriseSnapshot = {
      products: products.value,
      partners: partners.value,
      warehouses: warehouses.value,
      purchaseOrders: purchaseOrders.value,
      shipments: shipments.value,
      invoices: invoices.value,
      quotes: quotes.value,
      contracts: contracts.value,
      promotions: promotions.value,
      channelConfigs: channelConfigs.value,
      batches: batches.value,
      adjustments: adjustments.value,
      transfers: transfers.value,
      aging: agingBuckets.value,
      cashForecast: cashForecast.value,
      roleMatrix: roleMatrix.value,
      approvalFlows: approvalFlows.value,
      auditLogs: auditLogs.value,
      integrations: integrations.value,
      automations: automations.value,
      parameters: parameters.value
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const withPersist = async (task: () => void | Promise<void>) => {
    loading.value = true;
    try {
      await task();
      persist();
    } finally {
      loading.value = false;
    }
  };

  const productCount = computed(() => products.value.length);
  const supplierCount = computed(() => partners.value.filter((item) => item.type === "supplier").length);
  const customerCount = computed(() => partners.value.filter((item) => item.type === "customer").length);
  const expiringBatchCount = computed(() => batches.value.filter((batch) => batch.status !== "normal").length);
  const outstandingCredit = computed(() => partners.value.reduce((sum, partner) => sum + partner.outstandingAmount, 0));

  const addProduct = (payload: Omit<ProductMaster, "id" | "status"> & { status?: ProductStatus }) =>
    withPersist(() => {
      const record: ProductMaster = {
        ...payload,
        id: createId("prd"),
        status: payload.status ?? "active"
      };
      products.value = [record, ...products.value];
      auditLogs.value = [
        { id: createId("log"), actor: "系统", action: "新增商品", entity: record.name, at: new Date().toISOString(), ip: "127.0.0.1" },
        ...auditLogs.value
      ];
    });

  const addPartner = (payload: Omit<PartnerProfile, "id">) =>
    withPersist(() => {
      const record: PartnerProfile = { ...payload, id: createId("partner") };
      partners.value = [record, ...partners.value];
    });

  const addWarehouse = (payload: Omit<WarehouseProfile, "id">) =>
    withPersist(() => {
      const record: WarehouseProfile = { ...payload, id: createId("wh") };
      warehouses.value = [record, ...warehouses.value];
    });

  const advancePurchaseOrder = (id: string) =>
    withPersist(() => {
      const target = purchaseOrders.value.find((order) => order.id === id);
      if (!target) return;
      const idx = poStatusFlow.indexOf(target.status);
      if (idx >= 0 && idx < poStatusFlow.length - 1) {
        target.status = poStatusFlow[idx + 1];
      }
    });

  const scheduleShipment = (payload: Omit<InboundShipment, "id">) =>
    withPersist(() => {
      const record: InboundShipment = { ...payload, id: createId("ship") };
      shipments.value = [record, ...shipments.value];
    });

  const updateShipmentStatus = (id: string, status: InboundShipment["status"]) =>
    withPersist(() => {
      const target = shipments.value.find((item) => item.id === id);
      if (target) {
        target.status = status;
      }
    });

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) =>
    withPersist(() => {
      const target = invoices.value.find((item) => item.id === id);
      if (target) {
        target.status = status;
      }
    });

  const addQuote = (payload: Omit<SalesQuote, "id">) =>
    withPersist(() => {
      const record: SalesQuote = { ...payload, id: createId("quo") };
      quotes.value = [record, ...quotes.value];
    });

  const changeQuoteStatus = (id: string, status: QuoteStatus) =>
    withPersist(() => {
      const target = quotes.value.find((item) => item.id === id);
      if (target) {
        target.status = status;
      }
    });

  const activateContractFromQuote = (quoteId: string, settlementMethod: PaymentMethod) =>
    withPersist(() => {
      const quote = quotes.value.find((item) => item.id === quoteId);
      if (!quote) return;
      const record: SalesContract = {
        id: createId("ctr"),
        quoteId: quote.id,
        customerId: quote.customerId,
        channel: quote.channel,
        ratePlan: "标准",
        startDate: quote.validFrom,
        endDate: quote.validTo,
        settlementMethod,
        status: "pending"
      };
      contracts.value = [record, ...contracts.value];
    });

  const togglePromotion = (id: string) =>
    withPersist(() => {
      const target = promotions.value.find((promo) => promo.id === id);
      if (!target) return;
      target.active = !target.active;
    });

  const recordAdjustment = (
    payload: Omit<StockAdjustment, "id" | "time"> & Partial<Pick<StockAdjustment, "id" | "time">>
  ) =>
    withPersist(() => {
      const record: StockAdjustment = {
        id: payload.id ?? createId("adj"),
        time: payload.time ?? new Date().toISOString(),
        ...payload
      };
      adjustments.value = [record, ...adjustments.value];
    });

  const progressTransfer = (id: string) =>
    withPersist(() => {
      const target = transfers.value.find((item) => item.id === id);
      if (!target) return;
      if (target.status === "draft") {
        target.status = "approved";
      } else if (target.status === "approved") {
        target.status = "shipped";
      } else if (target.status === "shipped") {
        target.status = "received";
      }
    });

  const updateApprovalFlow = (id: string, payload: Partial<ApprovalFlow>) =>
    withPersist(() => {
      const target = approvalFlows.value.find((item) => item.id === id);
      if (target) {
        Object.assign(target, payload);
      }
    });

  const appendAuditLog = (payload: Omit<AuditLogEntry, "id" | "at" | "ip">) =>
    withPersist(() => {
      const record: AuditLogEntry = {
        ...payload,
        id: createId("log"),
        at: new Date().toISOString(),
        ip: "127.0.0.1"
      };
      auditLogs.value = [record, ...auditLogs.value];
    });

  const updateRolePermissions = (role: string, permissions: string[]) =>
    withPersist(() => {
      const target = roleMatrix.value.find((item) => item.role === role);
      if (target) {
        target.permissions = permissions as PermissionKey[];
      } else {
        roleMatrix.value.push({ role: role as UserRole, permissions: permissions as PermissionKey[], dataDomains: [] });
      }
    });

  const upsertIntegration = (payload: IntegrationEndpoint) =>
    withPersist(() => {
      const idx = integrations.value.findIndex((item) => item.id === payload.id);
      if (idx >= 0) {
        integrations.value[idx] = payload;
      } else {
        integrations.value = [payload, ...integrations.value];
      }
    });

  const toggleAutomation = (id: string) =>
    withPersist(() => {
      const target = automations.value.find((item) => item.id === id);
      if (target) {
        target.enabled = !target.enabled;
      }
    });

  const updateParameter = (key: string, value: string) =>
    withPersist(() => {
      const target = parameters.value.find((item) => item.key === key);
      if (target) {
        target.value = value;
      }
    });

  const simulateForecast = () =>
    withPersist(() => {
      const baseDate = new Date();
      const entries: CashForecastEntry[] = Array.from({ length: 5 }).map((_, index) => {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + index * 2);
        return {
          date: date.toISOString().slice(0, 10),
          inflow: 40000 + index * 8000,
          outflow: 25000 + index * 6000,
          notes: index % 2 === 0 ? "合同回款" : "预计采购"
        };
      });
      cashForecast.value = entries;
    });

  return {
    loading,
    products,
    partners,
    warehouses,
    purchaseOrders,
    shipments,
    invoices,
    quotes,
    contracts,
    promotions,
    channelConfigs,
    batches,
    adjustments,
    transfers,
    agingBuckets,
    cashForecast,
    roleMatrix,
    approvalFlows,
    auditLogs,
    integrations,
    automations,
    parameters,
    productCount,
    supplierCount,
    customerCount,
    expiringBatchCount,
    outstandingCredit,
    addProduct,
    addPartner,
    addWarehouse,
    advancePurchaseOrder,
    scheduleShipment,
    updateShipmentStatus,
    updateInvoiceStatus,
    addQuote,
    changeQuoteStatus,
    activateContractFromQuote,
    togglePromotion,
    recordAdjustment,
    progressTransfer,
    updateApprovalFlow,
    appendAuditLog,
    updateRolePermissions,
    upsertIntegration,
    toggleAutomation,
    updateParameter,
    simulateForecast
  };
});
