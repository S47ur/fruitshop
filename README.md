# 🍎 水果店进销存管理系统 (FruitShop)

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Vue.js-3.x-green" alt="Vue.js">
  <img src="https://img.shields.io/badge/MySQL-5.7+-blue" alt="MySQL">
  <img src="https://img.shields.io/badge/Java-17-orange" alt="Java">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

一个现代化的水果店进销存管理系统，支持多门店、采购、销售、库存、财务、会员等全流程管理。

---

## ✨ 功能特性

### 🏪 多门店管理
- 支持多门店独立运营
- 门店数据隔离
- 用户多门店授权

### 📦 采购管理
- 采购订单创建与审批
- 供应商管理
- 到货验收与入库
- 采购付款跟踪

### 🛒 销售管理
- 销售开单
- 多渠道销售（门店POS、线上商城、批发）
- 会员价与积分
- 销售数据分析

### 📊 库存管理
- 实时库存查询
- 库存预警
- 盘点调整
- 批次追踪

### 💰 财务管理
- 应收应付管理
- 账龄分析
- 发票管理
- 收支报表

### 👥 会员系统
- 会员注册与管理
- 积分累积与兑换
- 会员等级
- 储值卡充值

### ⚙️ 系统配置
- 角色权限管理
- 审批流程配置
- 系统参数设置
- 操作日志审计

---

## 🛠️ 技术栈

### 后端
| 技术 | 说明 |
|------|------|
| Spring Boot 3.2.0 | 基础框架 |
| Spring Data JPA | 数据持久层 |
| Hibernate 6.3 | ORM 框架 |
| MySQL / H2 | 数据库 |
| Lombok | 代码简化 |
| Maven | 构建工具 |

### 前端
| 技术 | 说明 |
|------|------|
| Vue.js 3 | 前端框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Pinia | 状态管理 |
| ECharts | 图表组件 |
| TailwindCSS | 样式框架 |

---

## 📁 项目结构

```
fruitshop/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/fruitshop/
│   │       ├── controller/     # REST API 控制器
│   │       ├── service/        # 业务逻辑层
│   │       ├── repository/     # 数据访问层
│   │       ├── entity/         # JPA 实体类
│   │       ├── dto/            # 数据传输对象
│   │       ├── config/         # 配置类
│   │       └── exception/      # 异常处理
│   └── src/main/resources/
│       ├── application.yml     # 应用配置
│       ├── schema.sql          # 数据库脚本
│       └── data.sql            # 初始数据
├── frontend/                   # Vue.js 前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 通用组件
│   │   ├── stores/             # Pinia 状态
│   │   ├── services/           # API 服务
│   │   └── router/             # 路由配置
│   └── package.json
├── docs/                       # 文档目录
│   ├── api.md                  # API 接口文档
│   ├── ER_DIAGRAM.md           # 数据库 ER 图
│   └── DEPLOYMENT.md           # 部署手册
└── README.md
```

---

## 🚀 快速开始

### 环境要求
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 5.7+ (或使用内置 H2)

### 1. 克隆项目
```bash
git clone <repository-url>
cd fruitshop
```

### 2. 启动后端

**开发模式（H2 内存数据库）：**
```bash
cd backend
mvn spring-boot:run
```

**MySQL 模式：**
```bash
cd backend
# Windows
$env:SPRING_PROFILES_ACTIVE="mysql"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_password"
mvn spring-boot:run

# Linux/macOS
SPRING_PROFILES_ACTIVE=mysql MYSQL_USER=root MYSQL_PASSWORD=your_password mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 4. 访问系统

打开浏览器访问 http://localhost:5173

**默认账号：**
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| manager | password | 店长 |
| cashier | password | 收银员 |

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [API 接口文档](docs/api.md) | REST API 详细说明 |
| [数据库 ER 图](docs/ER_DIAGRAM.md) | 数据库设计文档 |
| [部署手册](docs/DEPLOYMENT.md) | 生产环境部署指南 |
| [快速启动](QUICK_START.md) | 5 分钟快速上手 |

---

## 🔌 API 示例

### 登录
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 获取库存
```bash
curl http://localhost:8080/stores/store-1/inventory \
  -H "Authorization: Bearer <token>"
```

### 创建销售单
```bash
curl -X POST http://localhost:8080/stores/store-1/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "customer": "散客",
    "fruit": "苹果",
    "quantityKg": 5,
    "unitPrice": 10,
    "paymentMethod": "CASH"
  }'
```

---

## 🗄️ 数据库

系统支持两种数据库模式：

| 模式 | 数据库 | 适用场景 |
|------|--------|----------|
| `dev` | H2 内存 | 开发测试 |
| `mysql` | MySQL | 生产环境 |

### 核心表结构

```
stores          - 门店信息
users           - 用户账号
products        - 商品主数据
partners        - 供应商/客户
inventory       - 库存记录
purchase_orders - 采购订单
sales_orders    - 销售订单
invoices        - 发票
members         - 会员
```

详见 [ER 图文档](docs/ER_DIAGRAM.md)

---

## 🔒 安全特性

- ✅ 基于角色的访问控制 (RBAC)
- ✅ 密码加密存储
- ✅ API Token 鉴权
- ✅ 操作审计日志
- ✅ 数据门店隔离

---

## 📈 系统截图

### 仪表盘
- 销售趋势图
- 库存预警
- 待办事项
- 关键指标

### 库存管理
- 库存列表
- 库存预警
- 盘点调整

### 采购管理
- 采购订单
- 供应商管理
- 入库记录

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

[MIT License](LICENSE)

---

## 📞 联系方式

如有问题，请提交 Issue 或联系维护者。
