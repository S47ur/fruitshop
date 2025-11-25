<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>基础资料中心</h1>
        <p>维护商品/伙伴/仓库档案，作为采购、销售、库存的底座。</p>
      </div>
      <div class="page__actions">
        <button class="ghost" @click="refreshForecast">同步预测</button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat">
        <p>商品档案</p>
        <strong>{{ productCount }}</strong>
        <small>活跃品类 {{ products.length }}</small>
      </div>
      <div class="stat">
        <p>供应商/客户</p>
        <strong>{{ supplierCount }}/{{ customerCount }}</strong>
        <small>本页实时维护</small>
      </div>
      <div class="stat">
        <p>授信占用</p>
        <strong>¥{{ formatNumber(outstandingCredit) }}</strong>
        <small>含所有客户账期</small>
      </div>
      <div class="stat">
        <p>即将到期批次</p>
        <strong>{{ expiringBatchCount }}</strong>
        <small>库存模块驱动</small>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">商品/品类</button>
      <button :class="{ active: activeTab === 'partners' }" @click="activeTab = 'partners'">供应商/客户</button>
      <button :class="{ active: activeTab === 'warehouses' }" @click="activeTab = 'warehouses'">门店/仓库</button>
    </div>

    <div v-if="activeTab === 'products'" class="panel-grid">
      <form class="panel" @submit.prevent="handleAddProduct">
        <p class="panel__title">新增商品档案</p>
        <label>名称<input v-model.trim="productForm.name" required /></label>
        <label>品类<input v-model.trim="productForm.category" required /></label>
        <label>条码<input v-model.trim="productForm.barcode" required /></label>
        <label>规格(示例：A级 8kg/箱)<input v-model.trim="productForm.spec" required /></label>
        <label>计量单位<input v-model.trim="productForm.unit" required /></label>
        <label>税率(%)<input v-model.number="productForm.taxRate" min="0" max="20" type="number" required /></label>
        <div class="grid-2">
          <label>价格区间-最低<input v-model.number="productForm.min" type="number" min="0" step="0.1" required /></label>
          <label>价格区间-最高<input v-model.number="productForm.max" type="number" min="0" step="0.1" required /></label>
        </div>
        <label>转换（单位→单位×系数）
          <div class="grid-3">
            <input v-model.trim="productForm.convFrom" placeholder="箱" />
            <input v-model.trim="productForm.convTo" placeholder="kg" />
            <input v-model.number="productForm.convFactor" type="number" step="0.1" placeholder="8" />
          </div>
        </label>
        <label>标签（逗号分隔）<input v-model.trim="productForm.tags" placeholder="高毛利,走量" /></label>
        <button type="submit" class="primary" :disabled="enterprise.loading">保存档案</button>
      </form>
      <div class="panel overflow">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>条码</th>
              <th>类别</th>
              <th>税率</th>
              <th>价格策略</th>
              <th>标签</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedProducts" :key="item.id">
              <td>
                <strong>{{ item.name }}</strong>
                <small>{{ item.spec }}</small>
              </td>
              <td>{{ item.barcode }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.taxRate }}%</td>
              <td>¥{{ item.pricing.min }}~¥{{ item.pricing.max }}</td>
              <td>
                <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
              </td>
              <td>
                <span class="chip" :class="item.status === 'active' ? 'done' : 'pending'">
                  {{ item.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
            </tr>
            <tr v-if="!products.length">
              <td colspan="7" class="empty">暂无商品档案</td>
            </tr>
          </tbody>
        </table>
        <PaginationControl
          v-model:currentPage="productPage"
          :totalPages="productTotalPages"
        />
      </div>
    </div>

    <div v-else-if="activeTab === 'partners'" class="panel-grid">
      <form class="panel" @submit.prevent="handleAddPartner">
        <p class="panel__title">新增伙伴档案</p>
        <label>类型
          <select v-model="partnerForm.type">
            <option value="supplier">供应商</option>
            <option value="customer">客户</option>
          </select>
        </label>
        <label>名称<input v-model.trim="partnerForm.name" required /></label>
        <label>联系人<input v-model.trim="partnerForm.contact" required /></label>
        <label>电话<input v-model.trim="partnerForm.phone" required /></label>
        <div class="grid-2">
          <label>信用分(1-5)<input v-model.number="partnerForm.credit" type="number" min="1" max="5" required /></label>
          <label>账期(天)<input v-model.number="partnerForm.term" type="number" min="0" required /></label>
        </div>
        <label>结算方式
          <select v-model="partnerForm.settlement">
            <option value="cash">现金</option>
            <option value="card">刷卡</option>
            <option value="mobile">移动支付</option>
            <option value="transfer">银行转账</option>
          </select>
        </label>
        <label>历史备注<textarea v-model.trim="partnerForm.notes" rows="3"></textarea></label>
        <button type="submit" class="primary" :disabled="enterprise.loading">保存伙伴</button>
      </form>
      <div class="panel overflow">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>联系人</th>
              <th>信用</th>
              <th>账期</th>
              <th>结算方式</th>
              <th>授信占用</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="partner in paginatedPartners" :key="partner.id">
              <td>
                <strong>{{ partner.name }}</strong>
                <small>{{ partner.historyNotes }}</small>
              </td>
              <td>{{ partner.type === 'supplier' ? '供应商' : '客户' }}</td>
              <td>{{ partner.contact }}</td>
              <td>{{ partner.creditScore }}/5</td>
              <td>{{ partner.paymentTermDays }} 天</td>
              <td>{{ settlementCopy[partner.settlementMethod] }}</td>
              <td>¥{{ formatNumber(partner.outstandingAmount) }}</td>
            </tr>
            <tr v-if="!partners.length">
              <td colspan="7" class="empty">暂无伙伴档案</td>
            </tr>
          </tbody>
        </table>
        <PaginationControl
          v-model:currentPage="partnerPage"
          :totalPages="partnerTotalPages"
        />
      </div>
    </div>

    <div v-else class="panel-grid">
      <form class="panel" @submit.prevent="handleAddWarehouse">
        <p class="panel__title">新增仓库/门店</p>
        <label>名称<input v-model.trim="warehouseForm.name" required /></label>
        <label>城市<input v-model.trim="warehouseForm.city" required /></label>
        <label>编码<input v-model.trim="warehouseForm.code" required /></label>
        <label class="checkbox">
          <input v-model="warehouseForm.temperatureControl" type="checkbox" />
          支持温控
        </label>
        <label>可调拨路径（逗号分隔）<input v-model.trim="warehouseForm.paths" placeholder="长沙配送中心,武汉" /></label>
        <label>库区描述<textarea v-model.trim="warehouseForm.zone" rows="3" placeholder="常温区 5000kg"></textarea></label>
        <button type="submit" class="primary" :disabled="enterprise.loading">保存仓库</button>
      </form>
      <div class="panel overflow">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>城市</th>
              <th>温控</th>
              <th>库区</th>
              <th>调拨路径</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="warehouse in paginatedWarehouses" :key="warehouse.id">
              <td><strong>{{ warehouse.name }}</strong><small>{{ warehouse.code }}</small></td>
              <td>{{ warehouse.city }}</td>
              <td>{{ warehouse.temperatureControl ? '是' : '否' }}</td>
              <td>
                <span v-for="zone in warehouse.zones" :key="zone.name" class="chip">
                  {{ zone.name }} · {{ zone.capacityKg }}kg
                </span>
              </td>
              <td>{{ warehouse.transferPaths.join(' / ') }}</td>
            </tr>
            <tr v-if="!warehouses.length">
              <td colspan="5" class="empty">暂无仓储/门店档案</td>
            </tr>
          </tbody>
        </table>
        <PaginationControl
          v-model:currentPage="warehousePage"
          :totalPages="warehouseTotalPages"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import PaginationControl from "../components/ui/PaginationControl.vue";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useToastBus } from "../composables/useToastBus";
import type { PaymentMethod } from "../stores/types";

const enterprise = useEnterpriseStore();
const {
  products,
  partners,
  warehouses,
  productCount,
  supplierCount,
  customerCount,
  outstandingCredit,
  expiringBatchCount
} = storeToRefs(enterprise);
const { notifySuccess, notifyError, notifyInfo } = useToastBus();

const activeTab = ref<"products" | "partners" | "warehouses">("products");

const productPage = ref(1);
const partnerPage = ref(1);
const warehousePage = ref(1);
const pageSize = 10;

const productTotalPages = computed(() => Math.ceil(products.value.length / pageSize));
const partnerTotalPages = computed(() => Math.ceil(partners.value.length / pageSize));
const warehouseTotalPages = computed(() => Math.ceil(warehouses.value.length / pageSize));

const paginatedProducts = computed(() => {
  const start = (productPage.value - 1) * pageSize;
  return products.value.slice(start, start + pageSize);
});

const paginatedPartners = computed(() => {
  const start = (partnerPage.value - 1) * pageSize;
  return partners.value.slice(start, start + pageSize);
});

const paginatedWarehouses = computed(() => {
  const start = (warehousePage.value - 1) * pageSize;
  return warehouses.value.slice(start, start + pageSize);
});

const productForm = reactive({
  name: "",
  category: "",
  barcode: "",
  spec: "",
  unit: "kg",
  taxRate: 9,
  min: 10,
  max: 20,
  convFrom: "箱",
  convTo: "kg",
  convFactor: 10,
  tags: "高毛利"
});

const partnerForm = reactive({
  type: "supplier",
  name: "",
  contact: "",
  phone: "",
  credit: 3,
  term: 15,
  settlement: "transfer",
  notes: ""
});

const warehouseForm = reactive({
  name: "",
  city: "",
  code: "",
  temperatureControl: true,
  zone: "常温区 5000kg",
  paths: "华南配送"
});

const settlementCopy = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账"
};

const resetProductForm = () => {
  productForm.name = "";
  productForm.category = "";
  productForm.barcode = "";
  productForm.spec = "";
  productForm.unit = "kg";
  productForm.taxRate = 9;
  productForm.min = 10;
  productForm.max = 20;
  productForm.convFrom = "箱";
  productForm.convTo = "kg";
  productForm.convFactor = 10;
  productForm.tags = "高毛利";
};

const handleAddProduct = async () => {
  if (!productForm.name || !productForm.category) return;
  try {
    await enterprise.addProduct({
      name: productForm.name,
      category: productForm.category,
      barcode: productForm.barcode,
      spec: productForm.spec,
      unit: productForm.unit,
      conversions:
        productForm.convFrom && productForm.convTo && productForm.convFactor
          ? [
              {
                fromUnit: productForm.convFrom,
                toUnit: productForm.convTo,
                factor: Number(productForm.convFactor) || 1
              }
            ]
          : [],
      taxRate: Number(productForm.taxRate) || 0,
      pricing: {
        base: Number(((productForm.min + productForm.max) / 2).toFixed(2)),
        min: Number(productForm.min) || 0,
        max: Number(productForm.max) || 0,
        currency: "CNY",
        note: "前台新增"
      },
      tags: productForm.tags ? productForm.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) : [],
      status: "active"
    });
    notifySuccess("商品档案已创建");
    resetProductForm();
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "创建失败");
  }
};

const handleAddPartner = async () => {
  if (!partnerForm.name) return;
  try {
    await enterprise.addPartner({
      type: partnerForm.type as "supplier" | "customer",
      name: partnerForm.name,
      contact: partnerForm.contact,
      phone: partnerForm.phone,
      creditScore: Number(partnerForm.credit) || 1,
      paymentTermDays: Number(partnerForm.term) || 0,
      settlementMethod: partnerForm.settlement as PaymentMethod,
      outstandingAmount: 0,
      totalVolumeKg: 0,
      preferred: true,
      historyNotes: partnerForm.notes
    });
    notifySuccess("伙伴档案已新增");
    partnerForm.name = "";
    partnerForm.contact = "";
    partnerForm.phone = "";
    partnerForm.notes = "";
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "保存失败");
  }
};

const handleAddWarehouse = async () => {
  if (!warehouseForm.name) return;
  try {
    await enterprise.addWarehouse({
      name: warehouseForm.name,
      city: warehouseForm.city,
      code: warehouseForm.code,
      temperatureControl: warehouseForm.temperatureControl,
      zones: [
        {
          name: warehouseForm.zone || "常温区",
          type: warehouseForm.temperatureControl ? "cold" : "ambient",
          capacityKg: 5000,
          priority: 2
        }
      ],
      transferPaths: warehouseForm.paths
        ? warehouseForm.paths.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
        : []
    });
    notifySuccess("仓库档案已创建");
    warehouseForm.name = "";
    warehouseForm.city = "";
    warehouseForm.code = "";
    warehouseForm.zone = "";
    warehouseForm.paths = "";
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "保存失败");
  }
};

const refreshForecast = () => {
  enterprise.simulateForecast();
  notifyInfo("已根据最新库存刷新现金流预测");
};

const formatNumber = (value: number) => value.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page__actions {
  display: flex;
  gap: 12px;
}

button.ghost {
  border: 1px solid #cbd5f5;
  border-radius: 999px;
  background: transparent;
  padding: 10px 18px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.07);
}

.stat strong {
  display: block;
  font-size: 24px;
  margin-top: 6px;
}

.tabs {
  display: flex;
  gap: 12px;
}

.tabs button {
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  background: #e2e8f0;
  cursor: pointer;
}

.tabs button.active {
  background: #2563eb;
  color: white;
}

.panel-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 18px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__title {
  font-weight: 600;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input,
select,
textarea {
  border: 1px solid #cbd5f5;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

button.primary {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: #0ea5e9;
  color: white;
  cursor: pointer;
}

button.primary:disabled {
  background: #bfdbfe;
}

.table-actions {
  display: flex;
  gap: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  font-size: 12px;
  color: #94a3b8;
}

small {
  display: block;
  color: #94a3b8;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  margin-right: 6px;
  margin-bottom: 4px;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 12px;
}

.chip.done {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.chip.pending {
  background: rgba(248, 113, 113, 0.15);
  color: #b91c1c;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 18px 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.overflow {
  overflow: auto;
}

@media (max-width: 1100px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
