import axios, { type AxiosInstance } from "axios";
import { mockBackend } from "./mockBackend";
import {
  translatePartnerIdToBackend,
  translatePartnerIdToFrontend,
  translateProductIdToBackend,
  translateProductIdToFrontend
} from "./idTranslator";
import type {
  InventoryItem,
  InvoiceStatus,
  ParameterConfig,
  PermissionKey,
  Purchase,
  PurchaseInvoice,
  Sale,
  SettlementStatus,
  StockAdjustment,
  StoreId,
  StoreProfile,
  UserProfile,
  RegisterPayload,
  RegisterResponse,
  MemberProfile
} from "../stores/types";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

const httpClient: AxiosInstance | null = baseURL
  ? axios.create({
      baseURL,
      timeout: 10_000
    })
  : null;

type RemotePurchaseOrder = {
  id: string;
  storeId: StoreId;
  supplierId: string;
  status: string;
  expectedDate: string;
  paymentTermDays: number;
  lines: Array<{
    productId: string;
    fruit?: string;
    quantityKg: number;
    unitCost: number;
  }>;
  timeline: Array<{ time: string }>;
};

type RemotePurchasePayload = {
  supplierId: string;
  eta: string;
  items: Array<{
    productId: string;
    quantityKg: number;
    unitCost: number;
    batchRequired: boolean;
  }>;
};

type RemoteInvoice = {
  id: string;
  storeId: StoreId;
  salesOrderId: string;
  dueDate: string;
  amount: number;
  status: string;
};

type RemoteAdjustment = {
  id: string;
  inventoryId: string;
  reason: string;
  deltaKg: number;
  createdBy: string;
  createdAt: string;
};

type RemoteParameter = {
  key: string;
  value: string;
  description?: string;
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

const isApiEnvelope = <T>(payload: ApiEnvelope<T> | T): payload is ApiEnvelope<T> =>
  typeof payload === "object" && payload !== null && "data" in payload && "message" in payload;

const extractPayload = <T>(payload: ApiEnvelope<T> | T): T =>
  isApiEnvelope(payload) ? payload.data : (payload as T);

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  stores: StoreProfile[];
  permissions: PermissionKey[];
}

const useHttp = Boolean(httpClient);

const handleHttp = async <T>(
  action: () => Promise<{ data: ApiEnvelope<T> | T }>,
  fallback: () => Promise<T>
) => {
  if (!useHttp) return fallback();
  try {
    const response = await action();
    return extractPayload(response.data);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[dataGateway] HTTP请求失败: ${reason}，回退到mock数据`);
    return fallback();
  }
};

const mapPurchaseOrder = (order: RemotePurchaseOrder): Purchase => {
  // 增强空值保护
  if (!order) {
    console.error('[dataGateway] mapPurchaseOrder: order is null or undefined');
    throw new Error('采购订单数据无效');
  }
  
  const lines = Array.isArray(order.lines) ? order.lines : [];
  const primaryLine = lines.length > 0 ? lines[0] : null;
  const totalQty = lines.reduce((sum, line) => sum + (line?.quantityKg ?? 0), 0);
  const totalUnitCost = primaryLine?.unitCost ?? 0;
  const timelineDate =
    (Array.isArray(order.timeline) ? order.timeline : [])[0]?.time ?? order.expectedDate ?? new Date().toISOString();
  const supplierId = translatePartnerIdToFrontend(order.supplierId ?? '');
  const productId = primaryLine?.productId ? translateProductIdToFrontend(primaryLine.productId) : undefined;
  return {
    id: order.id ?? 'unknown',
    storeId: order.storeId ?? '',
    date: timelineDate.slice(0, 10),
    supplier: supplierId,
    supplierId,
    fruit: primaryLine?.fruit ?? "多品类",
    productId,
    quantityKg: totalQty,
    unitCost: totalUnitCost,
    paymentMethod: "transfer",
    status: order.status === "paid" ? "settled" : "pending",
    eta: order.expectedDate ?? timelineDate.slice(0, 10)
  };
};

const mapInvoiceToRemote = (invoice: PurchaseInvoice, fallbackStoreId: StoreId): RemoteInvoice => ({
  id: invoice.id,
  storeId: invoice.storeId ?? fallbackStoreId,
  salesOrderId: invoice.salesOrderId ?? invoice.poId,
  dueDate: invoice.dueDate,
  amount: invoice.amount,
  status: invoice.status
});

const mapAdjustmentToRemote = (adjustment: StockAdjustment): RemoteAdjustment => ({
  id: adjustment.id,
  inventoryId: adjustment.inventoryId ?? "",
  reason: adjustment.reason,
  deltaKg: adjustment.deltaKg ?? adjustment.afterQty - adjustment.beforeQty,
  createdBy: adjustment.operator,
  createdAt: adjustment.time
});

const mapParameterToRemote = (param: ParameterConfig, key: string, value: string): RemoteParameter => ({
  key: param?.key ?? key,
  value: param?.value ?? value,
  description: param?.description
});

const buildPurchasePayload = (payload: Omit<Purchase, "id" | "storeId">): RemotePurchasePayload => {
  if (!payload.supplierId || !payload.productId) {
    throw new Error("缺少供应商或商品信息，无法提交采购单");
  }
  const supplierId = translatePartnerIdToBackend(payload.supplierId);
  const productId = translateProductIdToBackend(payload.productId);
  return {
    supplierId,
    eta: payload.eta ?? payload.date,
    items: [
      {
        productId,
        quantityKg: payload.quantityKg,
        unitCost: payload.unitCost,
        batchRequired: Boolean(payload.batchRequired)
      }
    ]
  };
};

const mapInventoryItemFromRemote = (item: InventoryItem): InventoryItem => ({
  ...item,
  productId: item.productId ? translateProductIdToFrontend(item.productId) : item.productId
});

export const dataGateway = {
  login(payload: LoginPayload) {
    return handleHttp<LoginResponse>(
      () => httpClient!.post<ApiEnvelope<LoginResponse>>("/auth/login", payload),
      () => mockBackend.login(payload.username, payload.password)
    );
  },
  register(payload: RegisterPayload) {
    return handleHttp<RegisterResponse>(
      () => httpClient!.post<ApiEnvelope<RegisterResponse>>("/auth/register", payload),
      () => mockBackend.register(payload.username, payload.password, payload.name, payload.inviteCode)
    );
  },
  listPurchases(storeId: StoreId) {
    return handleHttp<Purchase[]>(
      () =>
        httpClient!
          .get<ApiEnvelope<RemotePurchaseOrder[]>>(`/stores/${storeId}/purchases`)
          .then((res) => ({ data: extractPayload(res.data).map(mapPurchaseOrder) })),
      () => mockBackend.listPurchases(storeId)
    );
  },
  listSales(storeId: StoreId) {
    return handleHttp<Sale[]>(
      () => httpClient!.get<ApiEnvelope<Sale[]>>("/stores/" + storeId + "/sales"),
      () => mockBackend.listSales(storeId)
    );
  },
  listInventory(storeId: StoreId) {
    return handleHttp<InventoryItem[]>(
      () =>
        httpClient!
          .get<ApiEnvelope<InventoryItem[]>>("/stores/" + storeId + "/inventory")
          .then((res) => ({ data: extractPayload(res.data).map(mapInventoryItemFromRemote) })),
      () => mockBackend.listInventory(storeId)
    );
  },
  createPurchase(storeId: StoreId, payload: Omit<Purchase, "id" | "storeId"> & { status?: SettlementStatus }) {
    return handleHttp<Purchase>(
      () =>
        httpClient!
          .post<ApiEnvelope<RemotePurchaseOrder>>(`/stores/${storeId}/purchases`, buildPurchasePayload(payload))
          .then((res) => ({ data: mapPurchaseOrder(extractPayload(res.data)) })),
      () => mockBackend.createPurchase({ ...payload, storeId })
    );
  },
  createSale(storeId: StoreId, payload: Omit<Sale, "id" | "storeId"> & { status?: SettlementStatus }) {
    return handleHttp<Sale>(
      () => httpClient!.post<ApiEnvelope<Sale>>("/stores/" + storeId + "/sales", payload),
      () => mockBackend.createSale({ ...payload, storeId })
    );
  },
  settlePurchase(id: string) {
    return handleHttp<Purchase | undefined>(
      () =>
        httpClient!
          .patch<ApiEnvelope<RemotePurchaseOrder>>(`/purchases/${id}`, { status: "paid" })
          .then((res) => ({ data: mapPurchaseOrder(extractPayload(res.data)) })),
      () => mockBackend.settlePurchase(id)
    );
  },
  settleSale(id: string) {
    return handleHttp<Sale | undefined>(
      () => httpClient!.patch<ApiEnvelope<Sale>>("/sales/" + id + "/settle", {}),
      () => mockBackend.settleSale(id)
    );
  },
  updateReorderLevel(inventoryId: string, level: number) {
    return handleHttp<InventoryItem | undefined>(
      () => httpClient!.patch<ApiEnvelope<InventoryItem>>(`/inventory/${inventoryId}/reorder-level`, { level }),
      () => mockBackend.updateReorderLevel(inventoryId, level)
    );
  },
  createAdjustment(
    inventoryId: string,
    payload: { reason: string; deltaKg: number; createdBy: string }
  ) {
    return handleHttp<RemoteAdjustment>(
      () => httpClient!.post<ApiEnvelope<RemoteAdjustment>>(`/inventory/${inventoryId}/adjustments`, payload),
      () =>
        mockBackend
          .createAdjustment(inventoryId, payload.reason, payload.deltaKg, payload.createdBy)
          .then((record) => mapAdjustmentToRemote(record))
    );
  },
  listInvoices(storeId: StoreId) {
    return handleHttp<RemoteInvoice[]>(
      () => httpClient!.get<ApiEnvelope<RemoteInvoice[]>>(`/stores/${storeId}/invoices`),
      () =>
        mockBackend
          .listInvoices(storeId)
          .then((invoices) => invoices.map((invoice) => mapInvoiceToRemote(invoice, storeId)))
    );
  },
  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    return handleHttp<RemoteInvoice | undefined>(
      () => httpClient!.patch<ApiEnvelope<RemoteInvoice>>(`/invoices/${invoiceId}`, { status }),
      () =>
        mockBackend
          .updateInvoiceStatus(invoiceId, status)
          .then((invoice) => (invoice ? mapInvoiceToRemote(invoice, invoice.storeId ?? "store") : undefined))
    );
  },
  updateSystemParameter(key: string, value: string) {
    return handleHttp<RemoteParameter>(
      () =>
        httpClient!
          .put<ApiEnvelope<RemoteParameter>>(`/system/parameters/${encodeURIComponent(key)}`, { value })
          .then((res) => ({ data: extractPayload(res.data) })),
      () =>
        mockBackend
          .updateParameter(key, value)
          .then((param) => mapParameterToRemote(param ?? { key, label: key, value, description: "" }, key, value))
    );
  },
  searchMembers(keyword: string) {
    return handleHttp<MemberProfile[]>(
      () => httpClient!.get<ApiEnvelope<MemberProfile[]>>(`/members/search?keyword=${encodeURIComponent(keyword)}`),
      () => mockBackend.searchMembers(keyword)
    );
  },
  getMember(memberId: string) {
    return handleHttp<MemberProfile | undefined>(
      () => httpClient!.get<ApiEnvelope<MemberProfile>>(`/members/${memberId}`),
      () => mockBackend.getMember(memberId)
    );
  },
  fetchEnterpriseSnapshot() {
    return handleHttp<any>(
      () => httpClient!.get<ApiEnvelope<any>>("/enterprise/snapshot"),
      () => mockBackend.getEnterpriseSnapshot()
    );
  }
};

export type DataGateway = typeof dataGateway;
