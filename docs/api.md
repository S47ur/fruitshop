# FruitShop API v2 接口文档

本文档根据当前前端代码实际调用的接口整理，覆盖登录、门店业务、库存、财务、会员和企业主数据等交互。

前端默认从环境变量 `VITE_API_BASE_URL` 读取网关地址，若未配置会自动降级到前端内置 mock。

---

## 通用约定

| 项目 | 说明 |
|------|------|
| 协议 | HTTP/HTTPS |
| 格式 | JSON，UTF-8 |
| 鉴权 | Bearer Token，通过 `Authorization: Bearer <token>` 传递（登录/注册接口除外） |
| 返回包 | 推荐 Envelope 形式 `{ data: <payload>, message?: string }`；前端也能接受直接返回 payload |
| 错误 | 返回 `4xx/5xx`，body `{ message: "reason" }` |

---

## 1. 认证与账号

### 1.1 登录
- **URL**: `POST /auth/login`
- **Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Success Response**:
```json
{
  "data": {
    "token": "jwt-or-random-token",
    "user": {
      "username": "admin",
      "name": "系统管理员",
      "role": "ROLE_OWNER",
      "email": "admin@fruitshop.com"
    },
    "stores": [
      { "id": "store-sz", "name": "深圳旗舰店", "city": "深圳", "code": "SZ01" }
    ],
    "permissions": [
      "procurement.write", "sales.write", "inventory.write", "finance.write",
      "org.switch-store", "master.write", "procurement.approval", "sales.approval",
      "inventory.adjust", "finance.risk", "audit.read", "system.manage"
    ]
  }
}
```

### 1.2 注册
- **URL**: `POST /auth/register`
- **Request Body**:
```json
{
  "username": "newuser",
  "password": "pass123",
  "name": "新用户",
  "inviteCode": "ADMIN888"
}
```
- **Success Response**:
```json
{
  "data": {
    "success": true,
    "message": "注册成功，请登录",
    "user": {
      "username": "newuser",
      "name": "新用户",
      "role": "ROLE_OWNER",
      "email": "newuser@fruitshop.com"
    }
  }
}
```

---

## 2. 门店运营

路径均按门店隔离：`/stores/{storeId}/...`

### 2.1 采购订单

#### 获取采购列表
- **URL**: `GET /stores/{storeId}/purchases`
- **Response**: `RemotePurchaseOrder[]`
```json
{
  "data": [
    {
      "id": "po-1001",
      "storeId": "store-sz",
      "supplierId": "33333333-3333-3333-3333-333333333331",
      "status": "paid",
      "expectedDate": "2025-12-01",
      "paymentTermDays": 7,
      "lines": [
        {
          "productId": "8e0cddde-6dc9-49f5-9a6b-111111111111",
          "fruit": "麒麟西瓜",
          "quantityKg": 120,
          "unitCost": 18.5
        }
      ],
      "timeline": [{ "time": "2025-11-25T10:00:00Z" }]
    }
  ]
}
```

#### 创建采购单
- **URL**: `POST /stores/{storeId}/purchases`
- **Request Body** (`RemotePurchasePayload`):
```json
{
  "supplierId": "33333333-3333-3333-3333-333333333331",
  "eta": "2025-12-01",
  "items": [
    {
      "productId": "8e0cddde-6dc9-49f5-9a6b-111111111111",
      "quantityKg": 50,
      "unitCost": 16.5,
      "batchRequired": false
    }
  ]
}
```
- **Response**: 返回创建后的 `RemotePurchaseOrder`

#### 结算采购单
- **URL**: `PATCH /purchases/{id}`
- **Request Body**:
```json
{ "status": "paid" }
```
- **Response**: 返回更新后的 `RemotePurchaseOrder`

### 2.2 销售订单

#### 获取销售列表
- **URL**: `GET /stores/{storeId}/sales`
- **Response**: `Sale[]`
```json
{
  "data": [
    {
      "id": "so-2001",
      "storeId": "store-sz",
      "date": "2025-11-20",
      "customer": "社区团购A站",
      "customerId": "cust-1",
      "channel": "零售",
      "fruit": "麒麟西瓜",
      "quantityKg": 30,
      "unitPrice": 26,
      "paymentMethod": "mobile",
      "status": "settled"
    }
  ]
}
```

#### 创建销售单
- **URL**: `POST /stores/{storeId}/sales`
- **Request Body**:
```json
{
  "date": "2025-12-01",
  "customer": "客户名称",
  "customerId": "cust-1",
  "channel": "零售",
  "fruit": "麒麟西瓜",
  "quantityKg": 20,
  "unitPrice": 25,
  "paymentMethod": "mobile",
  "status": "pending"
}
```
- **Response**: 返回创建后的 `Sale`

#### 结算销售单
- **URL**: `PATCH /sales/{id}/settle`
- **Request Body**: 可为空 `{}`
- **Response**: 返回更新后的 `Sale`（status 变为 "settled"）

### 2.3 库存

#### 获取库存列表
- **URL**: `GET /stores/{storeId}/inventory`
- **Response**: `InventoryItem[]`
```json
{
  "data": [
    {
      "id": "inv-store-sz-麒麟西瓜",
      "storeId": "store-sz",
      "fruit": "麒麟西瓜",
      "productId": "8e0cddde-6dc9-49f5-9a6b-111111111111",
      "onHandKg": 500,
      "unitCost": 9.5,
      "reorderLevelKg": 80,
      "unitPrice": 14.25
    }
  ]
}
```

#### 调整补货阈值
- **URL**: `PATCH /inventory/{inventoryId}/reorder-level`
- **Request Body**:
```json
{ "level": 120 }
```
- **Response**: 返回更新后的 `InventoryItem`

#### 盘点调整
- **URL**: `POST /inventory/{inventoryId}/adjustments`
- **Request Body**:
```json
{
  "reason": "损耗",
  "deltaKg": -5,
  "createdBy": "张三"
}
```
- **Response**:
```json
{
  "data": {
    "id": "adj-xxx",
    "inventoryId": "inv-store-sz-麒麟西瓜",
    "reason": "损耗",
    "deltaKg": -5,
    "createdBy": "张三",
    "createdAt": "2025-11-25T10:00:00Z"
  }
}
```

---

## 3. 财务

### 3.1 获取发票列表
- **URL**: `GET /stores/{storeId}/invoices`
- **Response**: `RemoteInvoice[]`
```json
{
  "data": [
    {
      "id": "inv-0",
      "storeId": "store-sz",
      "salesOrderId": "po-1000",
      "dueDate": "2025-12-10",
      "amount": 1620.5,
      "status": "pending"
    }
  ]
}
```

### 3.2 更新发票状态
- **URL**: `PATCH /invoices/{invoiceId}`
- **Request Body**:
```json
{ "status": "paid" }
```
- **Response**: 返回更新后的 `RemoteInvoice`

---

## 4. 系统参数

### 4.1 更新参数
- **URL**: `PUT /system/parameters/{key}`
- **Request Body**:
```json
{ "value": "CNY" }
```
- **Response**:
```json
{
  "data": {
    "key": "finance.currency",
    "value": "CNY",
    "description": "用于报表展示"
  }
}
```

---

## 5. 会员

### 5.1 搜索会员
- **URL**: `GET /members/search?keyword=138`
- **Response**: `MemberProfile[]`
```json
{
  "data": [
    {
      "id": "member-1",
      "name": "张三",
      "phone": "13800000001",
      "balance": 500,
      "points": 1200,
      "level": 2,
      "totalSpend": 5000,
      "joinDate": "2025-06-01"
    }
  ]
}
```

### 5.2 获取会员详情
- **URL**: `GET /members/{memberId}`
- **Response**: `MemberProfile`

---

## 6. 企业主数据

### 6.1 获取企业快照
- **URL**: `GET /enterprise/snapshot`
- **说明**: 用于加载商品、合作伙伴、审批、集成等看板数据
- **Response**:
```json
{
  "data": {
    "products": [],
    "partners": [],
    "roleMatrix": [],
    "approvalFlows": [],
    "integrations": [],
    "automations": [],
    "auditLogs": [],
    "parameters": [],
    "invoices": [],
    "adjustments": [],
    "channelConfigs": [],
    "aging": [],
    "users": []
  }
}
```

---

## 数据模型定义

### PaymentMethod
```typescript
type PaymentMethod = "cash" | "card" | "mobile" | "transfer" | "balance" | "points";
```

### SettlementStatus
```typescript
type SettlementStatus = "pending" | "settled";
```

### UserRole
```typescript
type UserRole = "ROLE_OWNER" | "ROLE_MANAGER" | "ROLE_CASHIER" | "ROLE_AUDITOR";
```

### StoreProfile
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 门店ID |
| name | string | 门店名称 |
| city | string | 城市 |
| code | string | 门店编码 |

### UserProfile
| 字段 | 类型 | 说明 |
|------|------|------|
| username | string | 用户名 |
| name | string | 姓名 |
| role | UserRole | 角色 |
| email | string | 邮箱 |

### Purchase (前端视图)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 采购单ID |
| storeId | string | 门店ID |
| date | string | 日期 (YYYY-MM-DD) |
| supplier | string | 供应商名称 |
| supplierId | string | 供应商ID |
| fruit | string | 水果名称 |
| productId | string | 商品ID |
| quantityKg | number | 重量 (kg) |
| unitCost | number | 单价 (成本) |
| paymentMethod | PaymentMethod | 支付方式 |
| status | SettlementStatus | 状态 |
| eta | string | 预计到货日期 |

### RemotePurchaseOrder (后端格式)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 采购单ID |
| storeId | string | 门店ID |
| supplierId | string | 供应商ID (UUID) |
| status | string | 状态 (pending/paid) |
| expectedDate | string | 预计到货日期 |
| paymentTermDays | number | 账期天数 |
| lines | array | 商品行 |
| timeline | array | 时间线 |

### Sale
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 销售单ID |
| storeId | string | 门店ID |
| date | string | 日期 |
| customer | string | 客户名称 |
| customerId | string | 客户ID |
| channel | string | 渠道 |
| fruit | string | 水果名称 |
| quantityKg | number | 重量 (kg) |
| unitPrice | number | 单价 (售价) |
| paymentMethod | PaymentMethod | 支付方式 |
| status | SettlementStatus | 状态 |

### InventoryItem
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 库存ID |
| storeId | string | 门店ID |
| fruit | string | 水果名称 |
| productId | string | 商品ID |
| onHandKg | number | 当前库存量 |
| unitCost | number | 平均成本 |
| reorderLevelKg | number | 补货阈值 |
| unitPrice | number | 建议售价 |

### MemberProfile
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 会员ID |
| name | string | 姓名 |
| phone | string | 手机号 |
| balance | number | 余额 |
| points | number | 积分 |
| level | number | 等级 (1/2/3) |
| totalSpend | number | 累计消费 |
| joinDate | string | 入会日期 |

### ProductMaster
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| name | string | 商品名称 |
| category | string | 分类 |
| barcode | string | 条码 |
| spec | string | 规格 |
| unit | string | 单位 |
| taxRate | number | 税率 |
| pricing | object | 定价策略 { base, min, max, currency } |
| tags | string[] | 标签 |
| status | string | 状态 (active/archived) |

### PartnerProfile
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 合作伙伴ID |
| type | string | 类型 (supplier/customer) |
| name | string | 名称 |
| contact | string | 联系人 |
| phone | string | 电话 |
| settlementMethod | PaymentMethod | 结算方式 |
| outstandingAmount | number | 未结金额 |
| totalVolumeKg | number | 累计交易量 |
| preferred | boolean | 是否优选 |

---

## 预置账号

| 用户名 | 密码 | 角色 | 可访问门店 |
|--------|------|------|------------|
| admin | admin123 | ROLE_OWNER | 全部门店 |
| fruitboss | 123456 | ROLE_OWNER | 深圳、长沙 |
| cashier | 888888 | ROLE_CASHIER | 深圳 |
| auditor | 000000 | ROLE_AUDITOR | 武汉 |

---

## 快速启动

```bash
cd backend
npm install
npm start
# 服务默认监听 http://localhost:8080

# 前端配置
# 在 frontend 目录创建 .env.local 文件：
# VITE_API_BASE_URL=http://localhost:8080
```
