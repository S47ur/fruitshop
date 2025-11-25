import type {
  InventoryItem,
  InvoiceStatus,
  ParameterConfig,
  PaymentMethod,
  PermissionKey,
  Purchase,
  PurchaseInvoice,
  Sale,
  SalesQuote,
  SettlementStatus,
  StockAdjustment,
  StoreId,
  StoreProfile,
  UserRole
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
}

const STORAGE_KEY = "fruitshop-backend-state";

const seedStores: StoreProfile[] = [
  { id: "store-sz", name: "深圳旗舰店", city: "深圳", code: "SZ01" },
  { id: "store-cs", name: "长沙高桥店", city: "长沙", code: "CS02" },
  { id: "store-wh", name: "武汉华南城", city: "武汉", code: "WH03" }
];

const pick = <T>(values: T[]) => values[Math.floor(Math.random() * values.length)];

const fruits = ["火龙果", "金煌芒果", "进口车厘子", "蓝莓", "榴莲"];
const suppliers = ["湘南果农联盟", "海南芒果社", "智利进口仓", "云南花果山"];
const customers = ["社区团购A站", "鲜丰自营堂食", "线上商城", "商超渠道"];
const buildInventoryId = (storeId: StoreId, fruit: string) => `inv-${storeId}-${fruit}`;

const makePurchase = (idx: number): Purchase => {
  const storeId = seedStores[idx % seedStores.length].id;
  const fruit = fruits[idx % fruits.length];
  const quantity = 60 + Math.round(Math.random() * 80);
  return {
    id: `po-${100 + idx}`,
    storeId,
    date: `2025-11-${String(10 + (idx % 10)).padStart(2, "0")}`,
    supplier: suppliers[idx % suppliers.length],
    fruit,
    quantityKg: quantity,
    unitCost: 12 + (idx % 5) * 2,
    paymentMethod: (idx % 2 ? "mobile" : "transfer") as PaymentMethod,
    status: idx % 3 === 0 ? "pending" : "settled"
  };
};

const makeSale = (idx: number): Sale => {
  const storeId = seedStores[idx % seedStores.length].id;
  const fruit = fruits[(idx + 1) % fruits.length];
  const quantity = 15 + Math.round(Math.random() * 40);
  const channel = idx % 2 === 0 ? "批发" : "零售";
  return {
    id: `so-${200 + idx}`,
    storeId,
    date: `2025-11-${String(12 + (idx % 8)).padStart(2, "0")}`,
    customer: customers[idx % customers.length],
     customerId: customers[idx % customers.length],
     channel,
    fruit,
    quantityKg: quantity,
    unitPrice: 25 + (idx % 4) * 5,
    paymentMethod: (idx % 2 ? "card" : "cash") as PaymentMethod,
    status: idx % 4 === 0 ? "pending" : "settled"
  };
};

const seedPurchases = Array.from({ length: 8 }).map((_, i) => makePurchase(i));
const seedSales = Array.from({ length: 8 }).map((_, i) => makeSale(i));

const seedQuotes: SalesQuote[] = seedSales.slice(0, 4).map((sale, index) => {
  const amount = sale.quantityKg * sale.unitPrice;
  return {
    id: `quote-${index}`,
    salesOrderId: sale.id,
    customerId: sale.customer,
    channel: sale.channel ?? "批发",
    status: index % 3 === 0 ? "accepted" : index % 2 === 0 ? "sent" : "draft",
    version: index + 1,
    validFrom: sale.date,
    validTo: `2025-12-${String(5 + index).padStart(2, "0")}`,
    totalAmount: amount,
    lines: [
      {
        productId: sale.fruit,
        quantityKg: sale.quantityKg,
        unitPrice: sale.unitPrice,
        discountPercent: index % 2 === 0 ? 5 : 0
      }
    ],
    remarks: "示例报价",
    discountRate: index % 2 === 0 ? 0.05 : 0
  };
});

const seedInvoices: PurchaseInvoice[] = seedPurchases.slice(0, 4).map((purchase, index) => {
  const amount = purchase.quantityKg * purchase.unitCost;
  return {
    id: `inv-${index}`,
    poId: purchase.id,
    storeId: purchase.storeId,
    salesOrderId: undefined,
    amount,
    taxAmount: Number((amount * 0.09).toFixed(2)),
    dueDate: `2025-12-${String(10 + index).padStart(2, "0")}`,
    status: (index % 3 === 0 ? "overdue" : index % 2 === 0 ? "matched" : "pending") as InvoiceStatus
  };
});

const seedAdjustments: StockAdjustment[] = [];

const seedParameters: ParameterConfig[] = [
  {
    key: "finance.currency",
    label: "默认币种",
    value: "CNY",
    description: "用于报表展示"
  },
  {
    key: "inventory.fifo",
    label: "库存核算模型",
    value: "FIFO",
    description: "先进先出 / 加权平均"
  }
];

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
        productId: purchase.fruit,
        onHandKg: purchase.quantityKg,
        unitCost: purchase.unitCost,
        reorderLevelKg: 80,
        unitPrice: purchase.unitCost * 2
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

const rolePermissionsMap: Record<UserRole, PermissionKey[]> = {
  owner: [
    "procurement.write",
    "sales.write",
    "inventory.write",
    "finance.write",
    "org.switch-store"
  ],
  manager: ["procurement.write", "sales.write", "inventory.write", "finance.write"],
  cashier: ["sales.write"],
  auditor: []
};

const seedUsers: BackendUser[] = [
  {
    username: "fruitboss",
    password: "123456",
    name: "李掌柜",
    role: "owner",
    email: "boss@fruiterp.cn",
    stores: [seedStores[0].id, seedStores[1].id]
  },
  {
    username: "cashier",
    password: "888888",
    name: "小柚",
    role: "cashier",
    email: "cashier@fruiterp.cn",
    stores: [seedStores[0].id]
  },
  {
    username: "auditor",
    password: "000000",
    name: "王稽核",
    role: "auditor",
    email: "audit@fruiterp.cn",
    stores: [seedStores[2].id]
  }
];

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

class MockBackend {
  private state: BackendState;

  constructor() {
    const cached =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
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
        stores: parsed.stores ?? seedStores
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
        stores: seedStores
      };
      this.persist();
    }
    this.backfillInvoiceStoreIds();
    this.backfillInventoryIds();
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
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        username: account.username,
        name: account.name,
        role: account.role,
        email: account.email
      },
      stores: permittedStores,
      permissions: rolePermissionsMap[account.role]
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

  private backfillInvoiceStoreIds() {
    let updated = false;
    this.state.invoices.forEach((invoice) => {
      if (!invoice.storeId) {
        const purchase = this.state.purchases.find((po) => po.id === invoice.poId);
        if (purchase) {
          invoice.storeId = purchase.storeId;
          updated = true;
        }
      }
    });
    if (updated) {
      this.persist();
    }
  }

  private backfillInventoryIds() {
    let updated = false;
    this.state.inventory.forEach((line) => {
      if (!line.id) {
        line.id = buildInventoryId(line.storeId, line.fruit);
        if (!line.productId) {
          line.productId = line.fruit;
        }
        updated = true;
      }
    });
    if (updated) {
      this.persist();
    }
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
        unitPrice: record.unitCost * 2
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
