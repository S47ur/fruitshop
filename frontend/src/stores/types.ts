export type PaymentMethod = "cash" | "card" | "mobile" | "transfer" | "balance" | "points";

export type SettlementStatus = "pending" | "settled";

export type StoreId = string;

export interface StoreProfile {
  id: StoreId;
  name: string;
  city: string;
  code: string;
}

export type UserRole = "ROLE_OWNER" | "ROLE_MANAGER" | "ROLE_CASHIER" | "ROLE_AUDITOR";

export type PermissionKey =
  | "procurement.write"
  | "sales.write"
  | "inventory.write"
  | "finance.write"
  | "org.switch-store"
  | "master.write"
  | "procurement.approval"
  | "sales.approval"
  | "inventory.adjust"
  | "finance.risk"
  | "audit.read"
  | "system.manage";

export interface UserProfile {
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  name: string;
  inviteCode: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

export interface Purchase {
  id: string;
  storeId: StoreId;
  date: string;
  supplier: string;
  supplierId?: string;
  fruit: string;
  productId?: string;
  quantityKg: number;
  unitCost: number;
  paymentMethod: PaymentMethod;
  status: SettlementStatus;
  eta?: string;
  batchRequired?: boolean;
}

export interface Sale {
  id: string;
  storeId: StoreId;
  date: string;
  customer: string;
  customerId?: string;
  channel?: string;
  fruit: string;
  quantityKg: number;
  unitPrice: number;
  paymentMethod: PaymentMethod;
  status: SettlementStatus;
}

export interface InventoryItem {
  id?: string;
  storeId: StoreId;
  fruit: string;
  productId?: string;
  onHandKg: number;
  unitCost: number;
  reorderLevelKg: number;
  unitPrice: number;
  availableKg?: number;
  reservedKg?: number;
}

export interface PaymentSummary {
  method: PaymentMethod;
  amount: number;
}

export interface PaymentBreakdownEntry {
  method: PaymentMethod;
  incoming: number;
  outgoing: number;
  net: number;
}

export type ProductStatus = "active" | "archived";

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}

export interface PriceStrategy {
  base: number;
  min: number;
  max: number;
  currency: string;
  note?: string;
}

export interface ProductMaster {
  id: string;
  name: string;
  category: string;
  barcode: string;
  spec: string;
  unit: string;
  conversions: UnitConversion[];
  taxRate: number;
  pricing: PriceStrategy;
  tags: string[];
  status: ProductStatus;
}

export interface PartnerProfile {
  id: string;
  type: "supplier" | "customer";
  name: string;
  contact: string;
  phone: string;
  settlementMethod: PaymentMethod;
  outstandingAmount: number;
  totalVolumeKg: number;
  preferred: boolean;
  historyNotes: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  phone: string;
  balance: number;
  points: number;
  level: 1 | 2 | 3; // 铜牌、银牌、金牌
  totalSpend: number;
  joinDate: string;
}

export interface WarehouseZone {
  name: string;
  type: "ambient" | "cold" | "frozen";
  capacityKg: number;
  priority: number;
}

export interface WarehouseProfile {
  id: string;
  name: string;
  city: string;
  code: string;
  temperatureControl: boolean;
  zones: WarehouseZone[];
  transferPaths: string[];
}

export type PurchaseOrderStatus =
  | "draft"
  | "approved"
  | "ordered"
  | "receiving"
  | "stored"
  | "reconciled"
  | "paid";

export interface OrderTimelineEvent {
  id: string;
  action: string;
  actor: string;
  time: string;
  notes?: string;
}

export interface PurchaseOrderLine {
  productId: string;
  fruit: string;
  spec: string;
  quantityKg: number;
  unitCost: number;
  taxRate: number;
}

export interface PurchaseOrder {
  id: string;
  storeId: StoreId;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  expectedDate: string;
  paymentTermDays: number;
  approvalNeeded: boolean;
  lines: PurchaseOrderLine[];
  timeline: OrderTimelineEvent[];
}

export type ShipmentStatus = "scheduled" | "arrived" | "stored" | "hold";

export interface InboundShipment {
  id: string;
  poId: string;
  date: string;
  quantityKg: number;
  acceptedKg: number;
  damagedKg: number;
  status: ShipmentStatus;
}

export type InvoiceStatus = "pending" | "matched" | "paid" | "overdue";

export interface PurchaseInvoice {
  id: string;
  poId: string;
  storeId?: StoreId;
  salesOrderId?: string;
  amount: number;
  taxAmount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export type PromotionType = "bundle" | "discount" | "member" | "rebate";

export interface PromotionRule {
  id: string;
  name: string;
  type: PromotionType;
  scope: string[];
  condition: string;
  benefit: string;
  approvalStatus: "pending" | "approved";
  active: boolean;
}

export interface ChannelConfig {
  id: string;
  name: string;
  settlementDays: number;
  feeRate: number;
  splitMode: "gross" | "net";
}

export type BatchStatus = "normal" | "expiring" | "expired";

export interface InventoryBatch {
  id: string;
  productId: string;
  warehouseId: string;
  lotNo: string;
  manufactureDate: string;
  expiryDate: string;
  quantityKg: number;
  status: BatchStatus;
}

export interface StockAdjustment {
  id: string;
  warehouseId: string;
  productId: string;
  reason: string;
  beforeQty: number;
  afterQty: number;
  operator: string;
  time: string;
  inventoryId?: string;
  deltaKg?: number;
}

export type TransferStatus = "draft" | "approved" | "in-transit" | "completed" | "shipped" | "received";

export interface TransferRequest {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantityKg: number;
  status: TransferStatus;
  approver: string;
}

export interface AgingBucket {
  bucket: string;
  receivables: number;
  payables: number;
}

export interface CashForecastEntry {
  date: string;
  inflow: number;
  outflow: number;
  notes: string;
}

export interface RoleMatrixEntry {
  role: UserRole;
  permissions: PermissionKey[];
  dataDomains: string[];
}

export interface ApprovalStep {
  id: string;
  role: UserRole;
  threshold: number;
}

export interface ApprovalFlow {
  id: string;
  documentType: string;
  steps: ApprovalStep[];
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
  ip: string;
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  type: "api" | "webhook" | "ftp";
  target: string;
  secret: string;
  status: "active" | "paused";
}

export interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  channel: "email" | "sms" | "wechat";
  enabled: boolean;
  lastRun: string | null;
}

export interface ParameterConfig {
  key: string;
  label: string;
  value: string;
  description: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  status: "active" | "disabled";
}
