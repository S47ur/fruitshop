# FruitShop API 接口文档

本文档描述了 FruitShop 前端与后端交互的 API 接口规范。

## 1. 基础说明

*   **Base URL**: `/api` (在 Mock 模式下由前端拦截)
*   **认证方式**: Bearer Token (Header: `Authorization: Bearer <token>`)
*   **数据格式**: JSON

## 2. 认证模块 (Auth)

### 2.1 用户登录
*   **URL**: `/auth/login`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "username": "admin",
      "password": "password"
    }
*   **Response**:
    ```json
    {
      "token": "mock-token-...",
      "user": {
        "username": "admin",
        "name": "系统管理员",
        "role": "owner",
        "email": "admin@fruitshop.com"
      },
      "stores": [ ... ], // 可访问的门店列表
      "permissions": [ ... ] // 权限列表
    }
    ```

## 3. 采购模块 (Procurement)

### 3.1 获取采购列表
*   **URL**: `/procurement/purchases`
*   **Method**: `GET`
*   **Query Params**:
    *   `storeId`: 门店ID
*   **Response**: `Purchase[]`

### 3.2 创建采购单
*   **URL**: `/procurement/purchases`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "storeId": "store-sz",
      "date": "2025-11-25",
      "supplier": "供应商名称",
      "fruit": "水果名称",
      "quantityKg": 100,
      "unitCost": 10.5,
      "paymentMethod": "transfer",
      "status": "pending"
    }
    ```

### 3.3 结算采购单
*   **URL**: `/procurement/purchases/{id}/settle`
*   **Method**: `POST`

## 4. 销售模块 (Sales)

### 4.1 获取销售列表
*   **URL**: `/sales/orders`
*   **Method**: `GET`
*   **Query Params**:
    *   `storeId`: 门店ID
*   **Response**: `Sale[]`

### 4.2 创建销售单
*   **URL**: `/sales/orders`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "storeId": "store-sz",
      "date": "2025-11-25",
      "customer": "客户名称",
      "fruit": "水果名称",
      "quantityKg": 50,
      "unitPrice": 20.0,
      "paymentMethod": "mobile",
      "status": "settled"
    }
    ```

### 4.3 结算销售单
*   **URL**: `/sales/orders/{id}/settle`
*   **Method**: `POST`

### 4.4 获取报价单列表
*   **URL**: `/sales/quotes`
*   **Method**: `GET`
*   **Query Params**:
    *   `salesId`: 关联的销售单ID

### 4.5 创建报价单
*   **URL**: `/sales/quotes`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "salesId": "so-...",
      "validUntil": "2025-12-31",
      "discountRate": 0.05,
      "remarks": "备注"
    }
    ```

## 5. 库存模块 (Inventory)

### 5.1 获取库存列表
*   **URL**: `/inventory/items`
*   **Method**: `GET`
*   **Query Params**:
    *   `storeId`: 门店ID
*   **Response**: `InventoryItem[]`

### 5.2 更新补货阈值
*   **URL**: `/inventory/items/{id}/reorder-level`
*   **Method**: `PUT`
*   **Request Body**:
    ```json
    {
      "level": 100
    }
    ```

### 5.3 创建库存调整 (盘点)
*   **URL**: `/inventory/adjustments`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "productId": "prod-...",
      "warehouseId": "wh-...",
      "beforeQty": 100,
      "afterQty": 95,
      "reason": "损耗"
    }
    ```

### 5.4 推进调拨任务
*   **URL**: `/inventory/transfers/{id}/progress`
*   **Method**: `POST`
*   **Description**: 将调拨单状态推进到下一阶段 (Draft -> Approved -> In-Transit -> Completed)

## 6. 财务模块 (Finance)

### 6.1 获取发票列表
*   **URL**: `/finance/invoices`
*   **Method**: `GET`
*   **Query Params**:
    *   `storeId`: 门店ID

### 6.2 更新发票状态
*   **URL**: `/finance/invoices/{id}/status`
*   **Method**: `PUT`
*   **Request Body**:
    ```json
    {
      "status": "paid"
    }
    ```

## 7. 企业数据 (Enterprise)

### 7.1 获取企业数据快照
*   **URL**: `/enterprise/snapshot`
*   **Method**: `GET`
*   **Description**: 获取全量企业配置数据，包括合作伙伴、产品、仓库、合同、促销、渠道配置、账龄分析等。
*   **Response**: `EnterpriseSnapshot`

### 7.2 激活合同
*   **URL**: `/contracts/from-quote`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "quoteId": "qt-...",
      "paymentMethod": "transfer"
    }
    ```

### 7.3 切换促销状态
*   **URL**: `/promotions/{id}/toggle`
*   **Method**: `POST`

## 数据模型定义

### Purchase (采购单)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 唯一标识 |
| storeId | string | 门店ID |
| date | string | 日期 (YYYY-MM-DD) |
| supplier | string | 供应商名称 |
| fruit | string | 水果名称 |
| quantityKg | number | 重量 (kg) |
| unitCost | number | 单价 (成本) |
| paymentMethod | string | 支付方式 (cash/card/mobile/transfer) |
| status | string | 状态 (pending/settled) |

### Sale (销售单)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 唯一标识 |
| storeId | string | 门店ID |
| date | string | 日期 (YYYY-MM-DD) |
| customer | string | 客户名称 |
| fruit | string | 水果名称 |
| quantityKg | number | 重量 (kg) |
| unitPrice | number | 单价 (售价) |
| paymentMethod | string | 支付方式 |
| status | string | 状态 |

### InventoryItem (库存项)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 唯一标识 |
| storeId | string | 门店ID |
| fruit | string | 水果名称 |
| onHandKg | number | 当前库存量 |
| unitCost | number | 平均成本 |
| reorderLevelKg | number | 补货阈值 |

### InventoryBatch (库存批次)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 唯一标识 |
| productId | string | 产品ID |
| warehouseId | string | 仓库ID |
| lotNo | string | 批次号 |
| quantityKg | number | 数量 |
| expiryDate | string | 过期日期 |
| status | string | 状态 (normal/expiring/hold) |

### SalesContract (销售合同)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 合同号 |
| customerId | string | 客户ID |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| status | string | 状态 (pending/active/closed) |

### PromotionRule (促销规则)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 唯一标识 |
| name | string | 促销名称 |
| type | string | 类型 (discount/bundle/rebate) |
| active | boolean | 是否启用 |

