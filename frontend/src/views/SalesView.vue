<template>
  <div class="sales-view">
    <!-- 左侧商品库 -->
    <aside class="product-panel">
      <h2>商品库</h2>
      <div class="product-grid">
        <div
          v-for="item in inventory"
          :key="item.id"
          class="product-card"
          @click="addToCart(item)"
        >
          <div class="product-image">
            <span class="placeholder">{{ item.fruit.substring(0, 2) }}</span>
          </div>
          <div class="product-info">
            <p class="product-name">{{ item.fruit }}</p>
            <p class="product-spec">{{ item.unitPrice }}元/kg</p>
            <p class="product-price" v-if="item.onHandKg > 0">库存: {{ item.onHandKg }}kg</p>
            <p class="product-price out-of-stock" v-else>缺货</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧收银条 -->
    <main class="checkout-panel">
      <!-- 会员信息栏 -->
      <section class="member-info">
        <div class="member-header">
          <h3>会员信息</h3>
          <button class="btn-member" @click="showMemberDialog = true">输入会员</button>
        </div>
        <div v-if="currentMember" class="member-card">
          <p><strong>{{ currentMember.name }}</strong></p>
          <p>余额: ¥{{ currentMember.balance }}</p>
        </div>
        <div v-else class="member-card empty">
          <p>未登录会员</p>
        </div>
      </section>

      <!-- 购物车列表 -->
      <section class="cart-section">
        <h3>购物车</h3>
        <div class="cart-items">
          <div v-if="cart.length === 0" class="empty-cart">
            <p>购物车为空</p>
          </div>
          <div v-for="(item, idx) in cart" :key="idx" class="cart-item">
            <div class="cart-item-info">
              <p>{{ item.fruit }}</p>
              <p class="price">¥{{ item.unitPrice }}/kg</p>
            </div>
            <div class="cart-item-actions">
              <input
                v-model.number="cart[idx].quantityKg"
                type="number"
                min="0.01"
                step="0.01"
                @input="updateCart"
                class="qty-input"
              />
              <span class="total">¥{{ formatNumber(item.quantityKg * item.unitPrice) }}</span>
              <button class="btn-delete" @click="removeFromCart(idx)">删除</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 挂单按钮 -->
      <button class="btn-hold" @click="holdOrder">挂单</button>

      <!-- 结算区 -->
      <section class="settlement-section">
        <div class="total-display">
          <p>应收金额</p>
          <p class="amount">¥{{ formatNumber(totalAmount) }}</p>
        </div>

        <!-- 支付方式 -->
        <div class="payment-methods">
          <label v-for="method in paymentMethods" :key="method">
            <input
              v-model="selectedPaymentMethod"
              type="radio"
              :value="method"
            />
            <span>{{ paymentMethodLabels[method] }}</span>
          </label>
        </div>

        <!-- 大按钮结算 -->
        <button
          class="btn-checkout primary"
          @click="checkout"
          :disabled="cart.length === 0"
        >
          结算 (空格键)
        </button>
        <button class="btn-clear" @click="clearCart">清空 (ESC)</button>
      </section>
    </main>

    <!-- 会员弹窗 -->
    <dialog v-if="showMemberDialog" class="member-dialog">
      <div class="dialog-content">
        <h3>查询会员</h3>
        <input
          v-model="memberSearchInput"
          type="text"
          placeholder="输入手机号或扫会员码"
          @keydown.enter="searchMember"
        />
        <div v-if="memberSearchResults.length > 0" class="member-list">
          <div
            v-for="member in memberSearchResults"
            :key="member.id"
            class="member-item"
            @click="selectMember(member)"
          >
            <p><strong>{{ member.name }}</strong></p>
            <p>余额: ¥{{ member.balance }} | 积分: {{ member.points }}</p>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="showMemberDialog = false">关闭</button>
          <button @click="searchMember">搜索</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useInventoryStore } from "../stores/useInventoryStore";
import { dataGateway } from "../services/dataGateway";
import type { InventoryItem, Sale, PaymentMethod, MemberProfile } from "../stores/types";

const router = useRouter();
const inventoryStore = useInventoryStore();
const inventory = computed(() => inventoryStore.inventory);

// 购物车
const cart = ref<Array<Omit<Sale, "id" | "storeId" | "status">>>([]);

// 支付方式
const paymentMethods: PaymentMethod[] = ["cash", "card", "mobile", "transfer", "balance", "points"];
const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "现金",
  card: "刷卡",
  mobile: "移动支付",
  transfer: "银行转账",
  balance: "余额支付",
  points: "积分抵扣"
};
const selectedPaymentMethod = ref<PaymentMethod>("cash");

// 会员信息
const currentMember = ref<any>(null);
const showMemberDialog = ref(false);
const memberSearchInput = ref("");
const memberSearchResults = ref<any[]>([]);

// 计算总金额
const totalAmount = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.quantityKg * item.unitPrice), 0);
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toFixed(2);
};

// 添加到购物车
const addToCart = (item: InventoryItem) => {
  if (item.onHandKg <= 0) return;
  
  const existing = cart.value.find(c => c.fruit === item.fruit);
  if (existing) {
    existing.quantityKg += 1;
  } else {
    cart.value.push({
      date: new Date().toISOString().split('T')[0],
      customer: currentMember.value?.name || "散户",
      customerId: currentMember.value?.id,
      channel: "零售",
      fruit: item.fruit,
      quantityKg: 1,
      unitPrice: item.unitPrice,
      paymentMethod: selectedPaymentMethod.value
    });
  }
};

// 更新购物车
const updateCart = () => {
  cart.value = cart.value.filter(item => item.quantityKg > 0);
};

// 删除商品
const removeFromCart = (idx: number) => {
  cart.value.splice(idx, 1);
};

// 清空购物车
const clearCart = () => {
  if (confirm("确定要清空购物车吗？")) {
    cart.value = [];
    currentMember.value = null;
  }
};

// 挂单
const holdOrder = () => {
  if (cart.value.length === 0) {
    alert("购物车为空");
    return;
  }
  alert(`已挂单，共 ${cart.value.length} 件商品，金额 ¥${formatNumber(totalAmount.value)}`);
  clearCart();
};

// 结算
const checkout = async () => {
  if (cart.value.length === 0) {
    alert("购物车为空");
    return;
  }

  try {
    // TODO: 调用数据网关保存销售单
    alert(`结算成功！金额: ¥${formatNumber(totalAmount.value)}`);
    clearCart();
  } catch (err) {
    alert("结算失败: " + (err instanceof Error ? err.message : "未知错误"));
  }
};

// 会员搜索
const searchMember = async () => {
  if (!memberSearchInput.value) return;
  
  try {
    const results = await dataGateway.searchMembers(memberSearchInput.value);
    memberSearchResults.value = results;
  } catch (err) {
    alert("搜索会员失败: " + (err instanceof Error ? err.message : "未知错误"));
  }
};

// 选择会员
const selectMember = (member: MemberProfile) => {
  currentMember.value = member;
  showMemberDialog.value = false;
  memberSearchInput.value = "";
  memberSearchResults.value = [];
};

// 快捷键处理
const handleKeyDown = (e: KeyboardEvent) => {
  // Space: 结算
  if (e.code === "Space" && !showMemberDialog.value) {
    e.preventDefault();
    checkout();
  }
  // Esc: 清空
  if (e.code === "Escape") {
    clearCart();
  }
  // F1: 会员弹窗
  if (e.code === "F1") {
    e.preventDefault();
    showMemberDialog.value = !showMemberDialog.value;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.sales-view {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 16px;
  padding: 16px;
  min-height: 100vh;
  background: #f5f5f5;
}

.product-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.product-panel h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.product-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  background: #efefef;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.placeholder {
  font-size: 24px;
  color: #999;
}

.product-info {
  font-size: 12px;
}

.product-name {
  margin: 0;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-spec {
  margin: 4px 0;
  color: #666;
}

.product-price {
  margin: 4px 0 0 0;
  color: #d32f2f;
  font-weight: bold;
}

.out-of-stock {
  color: #999;
}

.checkout-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-info {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.member-header h3 {
  margin: 0;
  font-size: 14px;
}

.btn-member {
  padding: 6px 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.member-card {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.member-card p {
  margin: 4px 0;
}

.member-card.empty {
  color: #999;
}

.cart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.cart-section h3 {
  margin: 0;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.cart-item {
  background: #f9f9f9;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
}

.cart-item-info {
  margin-bottom: 6px;
}

.cart-item-info p {
  margin: 0;
}

.price {
  color: #d32f2f;
}

.cart-item-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.qty-input {
  width: 50px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.total {
  flex: 1;
  color: #d32f2f;
  font-weight: bold;
}

.btn-delete {
  padding: 4px 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.btn-hold {
  padding: 12px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.settlement-section {
  border-top: 2px solid #e0e0e0;
  padding-top: 12px;
}

.total-display {
  text-align: center;
  margin-bottom: 16px;
}

.total-display p:first-child {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.amount {
  margin: 8px 0 0 0;
  font-size: 32px;
  font-weight: bold;
  color: #d32f2f;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
}

.payment-methods label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.payment-methods input {
  cursor: pointer;
}

.btn-checkout {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-bottom: 8px;
}

.btn-checkout.primary {
  background: #4caf50;
  color: white;
}

.btn-checkout:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-clear {
  width: 100%;
  padding: 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 会员弹窗 */
.member-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: none;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.member-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  padding: 20px;
  width: 400px;
}

.dialog-content h3 {
  margin: 0 0 16px 0;
}

.dialog-content input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
}

.member-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.member-item {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.member-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.member-item p {
  margin: 0;
  font-size: 12px;
}

.dialog-actions {
  display: flex;
  gap: 8px;
}

.dialog-actions button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.dialog-actions button:last-child {
  background: #2196f3;
  color: white;
  border: none;
}

@media (max-width: 1280px) {
  .sales-view {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
