import type {
  AgingBucket,
  ApprovalFlow,
  AuditLogEntry,
  AutomationTask,
  ChannelConfig,
  InventoryBatch,
  InventoryItem,
  InvoiceStatus,
  ParameterConfig,
  PartnerProfile,
  PaymentMethod,
  PermissionKey,
  ProductMaster,
  PromotionRule,
  Purchase,
  PurchaseInvoice,
  RoleMatrixEntry,
  Sale,
  SalesContract,
  SalesQuote,
  SettlementStatus,
  StockAdjustment,
  StoreId,
  StoreProfile,
  TransferRequest,
  UserRole,
  IntegrationEndpoint
} from "../stores/types";

interface BackendUser {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  stores: StoreId[];
}

interface BackendState {
  purchases: Purchase[];
  sales: Sale[];
  inventory: InventoryItem[];
  quotes: SalesQuote[];
  invoices: PurchaseInvoice[];
  adjustments: StockAdjustment[];
  parameters: ParameterConfig[];
  users: BackendUser[];
  stores: StoreProfile[];
  batches: InventoryBatch[];
  transfers: TransferRequest[];
  contracts: SalesContract[];
  promotions: PromotionRule[];
  channelConfigs: ChannelConfig[];
  aging: AgingBucket[];
  // Enterprise Data
  products: ProductMaster[];
  partners: PartnerProfile[];
  roleMatrix: RoleMatrixEntry[];
  approvalFlows: ApprovalFlow[];
  integrations: IntegrationEndpoint[];
  automations: AutomationTask[];
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = "fruitshop-backend-state-v2";

const seedStores: StoreProfile[] = [
  { id: "store-sz", name: "深圳旗舰店", city: "深圳", code: "SZ01" },
  { id: "store-cs", name: "长沙高桥店", city: "长沙", code: "CS02" },
  { id: "store-wh", name: "武汉华南城", city: "武汉", code: "WH03" }
];

const seedProducts: ProductMaster[] = [
  { id: "prod-1", name: "麒麟西瓜", category: "瓜果", barcode: "6900001", spec: "5kg/个", unit: "个", conversions: [], taxRate: 0.09, pricing: { base: 15, min: 10, max: 30, currency: "CNY" }, tags: ["热销"], status: "active" },
  { id: "prod-2", name: "金煌芒果", category: "热带水果", barcode: "6900002", spec: "10kg/箱", unit: "箱", conversions: [], taxRate: 0.09, pricing: { base: 80, min: 60, max: 120, currency: "CNY" }, tags: [], status: "active" },
  { id: "prod-3", name: "进口车厘子", category: "进口", barcode: "6900003", spec: "5kg/箱", unit: "箱", conversions: [], taxRate: 0.09, pricing: { base: 280, min: 200, max: 400, currency: "CNY" }, tags: ["高端"], status: "active" },
  { id: "prod-4", name: "红富士苹果", category: "仁果", barcode: "6900004", spec: "10kg/箱", unit: "箱", conversions: [], taxRate: 0.09, pricing: { base: 60, min: 40, max: 90, currency: "CNY" }, tags: [], status: "active" },
  { id: "prod-5", name: "阳光玫瑰青提", category: "浆果", barcode: "6900005", spec: "2kg/盒", unit: "盒", conversions: [], taxRate: 0.09, pricing: { base: 45, min: 30, max: 80, currency: "CNY" }, tags: ["网红"], status: "active" }
];

const seedPartners: PartnerProfile[] = [
  { id: "supp-1", type: "supplier", name: "湘南果农联盟", contact: "张三", phone: "13800000001", creditScore: 90, paymentTermDays: 30, settlementMethod: "transfer", outstandingAmount: 0, totalVolumeKg: 5000, preferred: true, historyNotes: "" },
  { id: "supp-2", type: "supplier", name: "海南芒果社", contact: "李四", phone: "13800000002", creditScore: 85, paymentTermDays: 15, settlementMethod: "transfer", outstandingAmount: 0, totalVolumeKg: 2000, preferred: false, historyNotes: "" },
  { id: "cust-1", type: "customer", name: "社区团购A站", contact: "王五", phone: "13900000001", creditScore: 95, paymentTermDays: 7, settlementMethod: "mobile", outstandingAmount: 0, totalVolumeKg: 1000, preferred: true, historyNotes: "" },
  { id: "cust-2", type: "customer", name: "鲜丰自营堂食", contact: "赵六", phone: "13900000002", creditScore: 100, paymentTermDays: 0, settlementMethod: "cash", outstandingAmount: 0, totalVolumeKg: 500, preferred: false, historyNotes: "" }
];

const seedRoleMatrix: RoleMatrixEntry[] = [
  { role: "owner", permissions: ["procurement.write", "sales.write", "inventory.write", "finance.write", "org.switch-store", "system.manage", "master.write", "procurement.approval", "sales.approval", "inventory.adjust", "finance.risk", "audit.read"], dataDomains: ["all"] },
  { role: "manager", permissions: ["procurement.write", "sales.write", "inventory.write", "finance.write", "inventory.adjust", "sales.approval"], dataDomains: ["store"] },
  { role: "cashier", permissions: ["sales.write"], dataDomains: ["store"] },
  { role: "auditor", permissions: ["audit.read", "finance.write"], dataDomains: ["all"] }
];

const seedApprovalFlows: ApprovalFlow[] = [
  { id: "flow-1", documentType: "采购订单", steps: [{ id: "step-1", role: "manager", threshold: 5000 }, { id: "step-2", role: "owner", threshold: 20000 }], lastUpdated: new Date().toISOString() },
  { id: "flow-2", documentType: "销售报价", steps: [{ id: "step-3", role: "manager", threshold: 10000 }], lastUpdated: new Date().toISOString() }
];

const seedIntegrations: IntegrationEndpoint[] = [
  { id: "int-1", name: "金蝶财务同步", type: "api", target: "https://api.kingdee.com/v2/sync", secret: "******", status: "active" },
  { id: "int-2", name: "企业微信通知", type: "webhook", target: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send", secret: "******", status: "active" }
];

const seedAutomations: AutomationTask[] = [
  { id: "auto-1", name: "每日库存预警", schedule: "0 8 * * *", channel: "email", enabled: true, lastRun: new Date().toISOString() },
  { id: "auto-2", name: "逾期账款提醒", schedule: "0 9 * * 1", channel: "sms", enabled: false, lastRun: null }
];

const seedAuditLogs: AuditLogEntry[] = [
  { id: "log-1", actor: "admin", action: "系统初始化", entity: "System", at: new Date().toISOString(), ip: "127.0.0.1" }
];

const seedBatches: InventoryBatch[] = [
  { id: "batch-1", productId: "prod-1", warehouseId: "store-sz", lotNo: "LOT20251101", manufactureDate: "2025-11-01", expiryDate: "2025-12-01", quantityKg: 500, status: "normal" },
  { id: "batch-2", productId: "prod-2", warehouseId: "store-sz", lotNo: "LOT20251020", manufactureDate: "2025-10-20", expiryDate: "2025-11-30", quantityKg: 200, status: "expiring" },
  { id: "batch-3", productId: "prod-3", warehouseId: "store-cs", lotNo: "LOT20251110", manufactureDate: "2025-11-10", expiryDate: "2026-01-10", quantityKg: 1000, status: "normal" }
];

const seedTransfers: TransferRequest[] = [
  { id: "tr-1", fromWarehouseId: "store-sz", toWarehouseId: "store-cs", productId: "prod-1", quantityKg: 100, status: "in-transit", approver: "manager" },
  { id: "tr-2", fromWarehouseId: "store-wh", toWarehouseId: "store-sz", productId: "prod-3", quantityKg: 50, status: "approved", approver: "owner" }
];

const seedContracts: SalesContract[] = [
  { id: "ctr-1", quoteId: "quote-1", customerId: "cust-1", channel: "批发", ratePlan: "大客户协议价", startDate: "2025-01-01", endDate: "2025-12-31", settlementMethod: "transfer", status: "active" },
  { id: "ctr-2", quoteId: "quote-2", customerId: "cust-2", channel: "直营", ratePlan: "内部调拨价", startDate: "2025-06-01", endDate: "2026-05-31", settlementMethod: "transfer", status: "active" }
];

const seedPromotions: PromotionRule[] = [
  { id: "promo-1", name: "双十一大促", type: "discount", scope: ["prod-1", "prod-2"], condition: "满100减20", benefit: "9折", approvalStatus: "approved", active: true },
  { id: "promo-2", name: "会员日特惠", type: "member", scope: ["all"], condition: "会员等级>=Lv2", benefit: "88折", approvalStatus: "approved", active: true },
  { id: "promo-3", name: "滞销品清仓", type: "bundle", scope: ["prod-4"], condition: "买一送一", benefit: "赠品", approvalStatus: "pending", active: false }
];

const seedChannelConfigs: ChannelConfig[] = [
  { id: "ch-1", name: "美团优选", settlementDays: 3, feeRate: 0.05, splitMode: "net" },
  { id: "ch-2", name: "多多买菜", settlementDays: 7, feeRate: 0.03, splitMode: "gross" },
  { id: "ch-3", name: "线下门店", settlementDays: 0, feeRate: 0, splitMode: "gross" }
];

const seedAging: AgingBucket[] = [
  { bucket: "0-30天", receivables: 125000, payables: 80000 },
  { bucket: "31-60天", receivables: 45000, payables: 20000 },
  { bucket: "61-90天", receivables: 12000, payables: 5000 },
  { bucket: "90天+", receivables: 5000, payables: 0 }
];

const randomDate = (daysBack: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
};

const makePurchase = (idx: number): Purchase => {
  const storeId = seedStores[idx % seedStores.length].id;
  const product = seedProducts[idx % seedProducts.length];
  const supplier = seedPartners.find(p => p.type === "supplier") || seedPartners[0];
  const quantity = 60 + Math.round(Math.random() * 200);
  const unitCost = product.pricing.base * 0.6;
  return {
    id: `po-${1000 + idx}`,
    storeId,
    date: randomDate(90),
    supplier: supplier.name,
    supplierId: supplier.id,
    fruit: product.name,
    productId: product.id,
    quantityKg: quantity,
    unitCost: unitCost,
    paymentMethod: (idx % 3 === 0 ? "transfer" : "mobile") as PaymentMethod,
    status: idx % 5 === 0 ? "pending" : "settled"
  };
};

const makeSale = (idx: number): Sale => {
  const storeId = seedStores[idx % seedStores.length].id;
  const product = seedProducts[(idx + 1) % seedProducts.length];
  const customer = seedPartners.find(p => p.type === "customer") || seedPartners[2];
  const quantity = 5 + Math.round(Math.random() * 50);
  const channel = idx % 2 === 0 ? "批发" : "零售";
  return {
    id: `so-${2000 + idx}`,
    storeId,
    date: randomDate(60),
    customer: customer.name,
     customerId: customer.id,
     channel,
    fruit: product.name,
    quantityKg: quantity,
    unitPrice: product.pricing.base,
    paymentMethod: (idx % 4 === 0 ? "card" : idx % 2 === 0 ? "mobile" : "cash") as PaymentMethod,
    status: idx % 6 === 0 ? "pending" : "settled"
  };
};

const seedPurchases = Array.from({ length: 120 }).map((_, i) => makePurchase(i)).sort((a, b) => b.date.localeCompare(a.date));
const seedSales = Array.from({ length: 300 }).map((_, i) => makeSale(i)).sort((a, b) => b.date.localeCompare(a.date));

const seedQuotes: SalesQuote[] = seedSales.slice(0, 20).map((sale, index) => {
  const amount = sale.quantityKg * sale.unitPrice;
  return {
    id: `quote-${index}`,
    salesOrderId: sale.id,
    customerId: sale.customerId || "cust-1",
    channel: sale.channel ?? "批发",
    status: index % 3 === 0 ? "accepted" : index % 2 === 0 ? "sent" : "draft",
    version: index + 1,
    validFrom: sale.date,
    validTo: `2025-12-${String(5 + (index % 20)).padStart(2, "0")}`,
    totalAmount: amount,
    lines: [
      {
        productId: sale.fruit, // Should be ID but using name for simplicity in mock if needed, but let's try to match
        quantityKg: sale.quantityKg,
        unitPrice: sale.unitPrice,
        discountPercent: index % 2 === 0 ? 5 : 0
      }
    ],
    remarks: "系统自动生成报价",
    discountRate: index % 2 === 0 ? 0.05 : 0
  };
});

const seedInvoices: PurchaseInvoice[] = seedPurchases.slice(0, 40).map((purchase, index) => {
  const amount = purchase.quantityKg * purchase.unitCost;
  return {
    id: `inv-${index}`,
    poId: purchase.id,
    storeId: purchase.storeId,
    salesOrderId: undefined,
    amount,
    taxAmount: Number((amount * 0.09).toFixed(2)),
    dueDate: `2025-12-${String(10 + (index % 20)).padStart(2, "0")}`,
    status: (index % 5 === 0 ? "overdue" : index % 3 === 0 ? "pending" : "matched") as InvoiceStatus
  };
});

const seedAdjustments: StockAdjustment[] = [];

const seedParameters: ParameterConfig[] = [
  { key: "finance.currency", label: "默认币种", value: "CNY", description: "用于报表展示" },
  { key: "inventory.fifo", label: "库存核算模型", value: "FIFO", description: "先进先出 / 加权平均" }
];

const buildInventoryId = (storeId: StoreId, fruit: string) => `inv-${storeId}-${fruit}`;

const buildInventory = (): InventoryItem[] => {
  const inventoryMap = new Map<string, InventoryItem>();
  seedPurchases.forEach((purchase) => {
    const key = `${purchase.storeId}-${purchase.fruit}`;
    const existing = inventoryMap.get(key);
    if (!existing) {
      inventoryMap.set(key, {
        id: buildInventoryId(purchase.storeId, purchase.fruit),
        storeId: purchase.storeId,
        fruit: purchase.fruit,
        productId: purchase.productId,
        onHandKg: purchase.quantityKg,
        unitCost: purchase.unitCost,
        reorderLevelKg: 80,
        unitPrice: purchase.unitCost * 1.5
      });
      return;
    }
    existing.onHandKg += purchase.quantityKg;
    existing.unitCost = (existing.unitCost + purchase.unitCost) / 2;
  });
  seedSales.forEach((sale) => {
    const key = `${sale.storeId}-${sale.fruit}`;
    const existing = inventoryMap.get(key);
    if (existing) {
      existing.onHandKg = Math.max(existing.onHandKg - sale.quantityKg, 0);
    }
  });
  return Array.from(inventoryMap.values());
};

const seedUsers: BackendUser[] = [
  { username: "admin", password: "admin123", name: "系统管理员", role: "owner", email: "admin@fruitshop.com", stores: seedStores.map(s => s.id) },
  { username: "fruitboss", password: "123456", name: "李掌柜", role: "owner", email: "boss@fruiterp.cn", stores: [seedStores[0].id, seedStores[1].id] },
  { username: "cashier", password: "888888", name: "小柚", role: "cashier", email: "cashier@fruiterp.cn", stores: [seedStores[0].id] },
  { username: "auditor", password: "000000", name: "王稽核", role: "auditor", email: "audit@fruiterp.cn", stores: [seedStores[2].id] }
];

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

class MockBackend {
  private state: BackendState;

  constructor() {
    const cached = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (cached) {
      const parsed = JSON.parse(cached) as Partial<BackendState>;
      this.state = {
        purchases: parsed.purchases ?? seedPurchases,
        sales: parsed.sales ?? seedSales,
        inventory: parsed.inventory ?? buildInventory(),
        quotes: parsed.quotes ?? seedQuotes,
        invoices: parsed.invoices ?? seedInvoices,
        adjustments: parsed.adjustments ?? seedAdjustments,
        parameters: parsed.parameters ?? seedParameters,
        users: parsed.users ?? seedUsers,
        stores: parsed.stores ?? seedStores,
        batches: parsed.batches ?? seedBatches,
        transfers: parsed.transfers ?? seedTransfers,
        contracts: parsed.contracts ?? seedContracts,
        promotions: parsed.promotions ?? seedPromotions,
        channelConfigs: parsed.channelConfigs ?? seedChannelConfigs,
        aging: parsed.aging ?? seedAging,
        products: parsed.products ?? seedProducts,
        partners: parsed.partners ?? seedPartners,
        roleMatrix: parsed.roleMatrix ?? seedRoleMatrix,
        approvalFlows: parsed.approvalFlows ?? seedApprovalFlows,
        integrations: parsed.integrations ?? seedIntegrations,
        automations: parsed.automations ?? seedAutomations,
        auditLogs: parsed.auditLogs ?? seedAuditLogs
      };
    } else {
      this.state = {
        purchases: seedPurchases,
        sales: seedSales,
        inventory: buildInventory(),
        quotes: seedQuotes,
        invoices: seedInvoices,
        adjustments: seedAdjustments,
        parameters: seedParameters,
        users: seedUsers,
        stores: seedStores,
        batches: seedBatches,
        transfers: seedTransfers,
        contracts: seedContracts,
        promotions: seedPromotions,
        channelConfigs: seedChannelConfigs,
        aging: seedAging,
        products: seedProducts,
        partners: seedPartners,
        roleMatrix: seedRoleMatrix,
        approvalFlows: seedApprovalFlows,
        integrations: seedIntegrations,
        automations: seedAutomations,
        auditLogs: seedAuditLogs
      };
      this.persist();
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  async login(username: string, password: string) {
    await delay();
    const account = this.state.users.find(
      (user) => user.username === username && user.password === password
    );
    if (!account) {
      throw new Error("账号或密码不正确");
    }
    const permittedStores = this.state.stores.filter((store) =>
      account.stores.includes(store.id)
    );
    const roleEntry = this.state.roleMatrix.find(r => r.role === account.role);
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        username: account.username,
        name: account.name,
        role: account.role,
        email: account.email
      },
      stores: permittedStores,
      permissions: roleEntry?.permissions ?? []
    };
  }

  async getEnterpriseSnapshot() {
    await delay();
    return {
      products: this.state.products,
      partners: this.state.partners,
      warehouses: [], // Mock if needed
      purchaseOrders: [], // Advanced POs if needed
      shipments: [],
      invoices: this.state.invoices,
      quotes: this.state.quotes,
      contracts: this.state.contracts,
      promotions: this.state.promotions,
      channelConfigs: this.state.channelConfigs,
      batches: this.state.batches,
      adjustments: this.state.adjustments,
      transfers: this.state.transfers,
      aging: this.state.aging,
      cashForecast: [],
      roleMatrix: this.state.roleMatrix,
      approvalFlows: this.state.approvalFlows,
      auditLogs: this.state.auditLogs,
      integrations: this.state.integrations,
      automations: this.state.automations,
      parameters: this.state.parameters,
      users: this.state.users.map(u => ({ id: u.username, username: u.username, name: u.name, role: u.role, email: u.email, status: "active" as const }))
    };
  }

  async listPurchases(storeId: StoreId) {
    await delay();
    return this.state.purchases.filter((item) => item.storeId === storeId);
  }

  async listSales(storeId: StoreId) {
    await delay();
    return this.state.sales.filter((item) => item.storeId === storeId);
  }

  async listInventory(storeId: StoreId) {
    await delay();
    return this.state.inventory.filter((item) => item.storeId === storeId);
  }

  async listQuotesBySales(salesId: string) {
    await delay();
    return this.state.quotes.filter((quote) => quote.salesOrderId === salesId);
  }

  async createQuote(
    salesId: string,
    payload: { validUntil: string; discountRate: number; remarks?: string }
  ) {
    await delay();
    const sale = this.state.sales.find((order) => order.id === salesId);
    const amount = sale ? sale.quantityKg * sale.unitPrice : 0;
    const line = sale
      ? {
          productId: sale.fruit,
          quantityKg: sale.quantityKg,
          unitPrice: sale.unitPrice,
          discountPercent: Math.round(payload.discountRate * 100)
        }
      : { productId: "fruit", quantityKg: 100, unitPrice: 20, discountPercent: 5 };
    const quote: SalesQuote = {
      id: `quote-${Date.now()}`,
      salesOrderId: salesId,
      customerId: sale?.customer || "潜在客户",
      channel: sale?.channel ?? "渠道",
      status: "draft",
      version: (this.state.quotes.filter((item) => item.salesOrderId === salesId).length || 0) + 1,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: payload.validUntil,
      totalAmount: amount,
      lines: [line],
      remarks: payload.remarks,
      discountRate: payload.discountRate
    };
    this.state.quotes.unshift(quote);
    this.persist();
    return quote;
  }

  async updateQuoteStatus(id: string, status: string) {
    await delay();
    const target = this.state.quotes.find((quote) => quote.id === id);
    if (target) {
      target.status = status as SalesQuote["status"];
      this.persist();
    }
    return target;
  }

  async createPurchase(payload: Omit<Purchase, "id"> & { storeId: StoreId }) {
    await delay();
    const record: Purchase = { ...payload, id: `po-${Date.now()}` };
    this.state.purchases.unshift(record);
    this.applyPurchase(record);
    this.persist();
    return record;
  }

  async createSale(payload: Omit<Sale, "id"> & { storeId: StoreId }) {
    await delay();
    const record: Sale = { ...payload, id: `so-${Date.now()}` };
    this.state.sales.unshift(record);
    this.applySale(record);
    this.persist();
    return record;
  }

  async settlePurchase(id: string) {
    await delay();
    const target = this.state.purchases.find((item) => item.id === id);
    if (target) {
      target.status = "settled";
      this.persist();
    }
    return target;
  }

  async settleSale(id: string) {
    await delay();
    const target = this.state.sales.find((item) => item.id === id);
    if (target) {
      target.status = "settled";
      this.persist();
    }
    return target;
  }

  async updateReorderLevel(inventoryId: string, level: number) {
    await delay();
    const target = this.state.inventory.find((item) => item.id === inventoryId);
    if (target) {
      target.reorderLevelKg = level;
      this.persist();
    }
    return target;
  }

  async createAdjustment(inventoryId: string, reason: string, deltaKg: number, operator: string) {
    await delay();
    const inventoryLine = this.state.inventory.find((item) => item.id === inventoryId);
    const beforeQty = inventoryLine?.onHandKg ?? 0;
    const afterQty = beforeQty + deltaKg;
    if (inventoryLine) {
      inventoryLine.onHandKg = Math.max(afterQty, 0);
    }
    const record: StockAdjustment = {
      id: `adj-${Date.now()}`,
      warehouseId: "wh-demo",
      productId: inventoryLine?.productId ?? "fruit",
      reason,
      beforeQty,
      afterQty,
      operator,
      time: new Date().toISOString(),
      inventoryId,
      deltaKg
    };
    this.state.adjustments.unshift(record);
    this.persist();
    return record;
  }

  async listInvoices(storeId: StoreId) {
    await delay();
    return this.state.invoices.filter((invoice) => {
      if (invoice.storeId) {
        return invoice.storeId === storeId;
      }
      const purchase = this.state.purchases.find((po) => po.id === invoice.poId);
      return purchase?.storeId === storeId;
    });
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus) {
    await delay();
    const target = this.state.invoices.find((invoice) => invoice.id === id);
    if (target) {
      target.status = status;
      if (!target.storeId) {
        const purchase = this.state.purchases.find((po) => po.id === target.poId);
        if (purchase) {
          target.storeId = purchase.storeId;
        }
      }
      this.persist();
    }
    return target;
  }

  async updateParameter(key: string, value: string) {
    await delay();
    const target = this.state.parameters.find((param) => param.key === key);
    if (target) {
      target.value = value;
    } else {
      this.state.parameters.push({ key, label: key, value, description: "" });
    }
    this.persist();
    return this.state.parameters.find((param) => param.key === key);
  }

  private applyPurchase(record: Purchase) {
    const key = `${record.storeId}-${record.fruit}`;
    const target = this.state.inventory.find((item) => `${item.storeId}-${item.fruit}` === key);
    if (target) {
      const totalKg = target.onHandKg + record.quantityKg;
      const totalCost = target.onHandKg * target.unitCost + record.quantityKg * record.unitCost;
      target.onHandKg = totalKg;
      target.unitCost = totalCost / totalKg;
    } else {
      this.state.inventory.push({
        id: buildInventoryId(record.storeId, record.fruit),
        storeId: record.storeId,
        fruit: record.fruit,
        productId: record.productId ?? record.fruit,
        onHandKg: record.quantityKg,
        unitCost: record.unitCost,
        reorderLevelKg: 80,
        unitPrice: record.unitCost * 1.5
      });
    }
  }

  private applySale(record: Sale) {
    const target = this.state.inventory.find(
      (item) => item.storeId === record.storeId && item.fruit === record.fruit
    );
    if (!target) return;
    target.onHandKg = Math.max(0, target.onHandKg - record.quantityKg);
  }
}

export const mockBackend = new MockBackend();

export type MockBackendType = typeof mockBackend;
