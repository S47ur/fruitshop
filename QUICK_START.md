# 🍎 FruitShop 快速启动指南

> 5 分钟快速部署运行水果店进销存管理系统

---

## 📋 准备工作

### 必需软件
- ✅ Java JDK 17+
- ✅ Maven 3.8+
- ✅ Node.js 18+
- ✅ MySQL 5.7+ (可选，可用内置 H2)

### 检查环境
```bash
java -version    # 应显示 17.x.x
mvn -version     # 应显示 3.8.x+
node -v          # 应显示 v18.x.x+
npm -v           # 应显示 9.x.x+
```

---

## 🚀 方式一：快速启动（开发模式）

### 步骤 1: 启动后端（使用 H2 内存数据库）

```bash
cd backend
mvn spring-boot:run
```

等待看到：
```
Started FruitShopApplication in X.XXX seconds
种子数据初始化完成！
```

后端运行在: http://localhost:8080

### 步骤 2: 启动前端

```bash
cd frontend
npm install        # 首次运行需要
npm run dev
```

前端运行在: http://localhost:5173

### 步骤 3: 访问系统

打开浏览器访问 http://localhost:5173

**登录账号：**
- 管理员: `admin` / `admin123`
- 店长: `manager` / `password`
- 收银员: `cashier` / `password`

---

## 🗄️ 方式二：MySQL 数据库模式

### 步骤 1: 准备 MySQL

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE fruitshop DEFAULT CHARACTER SET utf8mb4;
```

### 步骤 2: 启动后端（连接 MySQL）

**Windows PowerShell:**
```powershell
cd backend

# 设置环境变量
$env:SPRING_PROFILES_ACTIVE = "mysql"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "你的密码"

# 启动
mvn spring-boot:run
```

**Linux / macOS:**
```bash
cd backend

export SPRING_PROFILES_ACTIVE=mysql
export MYSQL_USER=root
export MYSQL_PASSWORD=你的密码

mvn spring-boot:run
```

### 步骤 3: 启动前端（同方式一）

```bash
cd frontend
npm run dev
```

---

## 📦 方式三：JAR 包部署（生产环境）

### 步骤 1: 构建后端

```bash
cd backend
mvn clean package -DskipTests
```

生成文件: `target/fruitshop-backend-1.0.0.jar`

### 步骤 2: 运行 JAR

**Windows:**
```powershell
java -jar target/fruitshop-backend-1.0.0.jar `
  --spring.profiles.active=mysql `
  --spring.datasource.username=root `
  --spring.datasource.password=你的密码
```

**Linux / macOS:**
```bash
java -jar target/fruitshop-backend-1.0.0.jar \
  --spring.profiles.active=mysql \
  --spring.datasource.username=root \
  --spring.datasource.password=你的密码
```

### 步骤 3: 后台运行（可选）

**Windows PowerShell:**
```powershell
Start-Process -NoNewWindow -FilePath "java" -ArgumentList @(
    "-jar", "target/fruitshop-backend-1.0.0.jar",
    "--spring.profiles.active=mysql",
    "--spring.datasource.username=root",
    "--spring.datasource.password=你的密码"
) -RedirectStandardOutput "app.log" -RedirectStandardError "error.log"
```

**Linux (nohup):**
```bash
nohup java -jar fruitshop-backend-1.0.0.jar \
  --spring.profiles.active=mysql \
  --spring.datasource.username=root \
  --spring.datasource.password=你的密码 \
  > app.log 2>&1 &
```

### 步骤 4: 构建前端

```bash
cd frontend
npm run build
```

产物目录: `dist/`

将 `dist/` 部署到 Nginx 或任意静态服务器

---

## ✅ 验证部署

### 检查后端

```bash
# 测试登录 API
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

成功响应:
```json
{
  "data": {
    "token": "token-xxx",
    "user": { "username": "admin", ... }
  }
}
```

### 检查前端

打开浏览器访问前端地址，应看到登录页面。

---

## 🔧 常用配置

### 修改后端端口

```bash
# 命令行
java -jar app.jar --server.port=9090

# 或修改 application.yml
server:
  port: 9090
```

### 修改前端 API 地址

创建 `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://your-server:8080
```

### 查看后端日志

```bash
# Maven 运行时直接显示
# JAR 运行时查看日志文件
tail -f app.log      # Linux
Get-Content app.log -Wait  # Windows
```

---

## 🛑 停止服务

### 停止后端

**Maven 模式:** 按 `Ctrl+C`

**JAR 后台模式:**
```bash
# Linux
ps aux | grep fruitshop
kill <PID>

# Windows
Get-Process java | Stop-Process
```

### 停止前端

按 `Ctrl+C` 或关闭终端

---

## 📊 数据库管理

### 使用 H2 控制台（开发模式）

访问 http://localhost:8080/h2-console

- JDBC URL: `jdbc:h2:mem:fruitshop`
- Username: `sa`
- Password: (空)

### MySQL 常用命令

```sql
-- 查看所有表
SHOW TABLES;

-- 查看用户
SELECT * FROM users;

-- 查看库存
SELECT * FROM inventory WHERE store_id = 'store-1';

-- 重置数据（谨慎使用！）
DROP DATABASE fruitshop;
CREATE DATABASE fruitshop;
-- 重启后端，表会自动重建
```

---

## 💡 快速测试 API

```bash
# 1. 登录获取 Token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. 获取企业数据快照
curl http://localhost:8080/enterprise/snapshot \
  -H "Authorization: Bearer $TOKEN"

# 3. 获取门店库存
curl http://localhost:8080/stores/store-1/inventory \
  -H "Authorization: Bearer $TOKEN"

# 4. 获取采购订单
curl http://localhost:8080/stores/store-1/purchases \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 更多文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目介绍 | [README.md](README.md) | 项目概述和功能特性 |
| API 文档 | [docs/api.md](docs/api.md) | 完整 REST API 说明 |
| ER 图 | [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) | 数据库设计 |
| 部署手册 | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 生产环境部署 |

---

## ❓ 遇到问题？

### 后端启动失败

1. **端口被占用**
   ```bash
   # 查看 8080 端口
   netstat -ano | findstr :8080  # Windows
   lsof -i :8080                  # Linux
   ```

2. **MySQL 连接失败**
   - 确认 MySQL 服务已启动
   - 检查用户名密码是否正确
   - 确认数据库 `fruitshop` 已创建

3. **Maven 依赖下载慢**
   - 使用国内镜像（阿里云 Maven）

### 前端启动失败

1. **依赖安装失败**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **端口冲突**
   ```bash
   npm run dev -- --port 3000
   ```

---

**祝您使用愉快！** 🎉
