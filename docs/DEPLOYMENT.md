# 水果店进销存系统 - 部署手册

## 目录

1. [系统要求](#1-系统要求)
2. [环境准备](#2-环境准备)
3. [后端部署](#3-后端部署)
4. [前端部署](#4-前端部署)
5. [数据库配置](#5-数据库配置)
6. [生产环境部署](#6-生产环境部署)
7. [常见问题](#7-常见问题)

---

## 1. 系统要求

### 最低配置
| 组件 | 要求 |
|------|------|
| 操作系统 | Windows 10/11, Linux (Ubuntu 20.04+), macOS |
| CPU | 2 核心 |
| 内存 | 4 GB |
| 磁盘 | 10 GB 可用空间 |

### 软件依赖

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| **Java JDK** | 17+ | 后端运行环境 |
| **Maven** | 3.8+ | 后端构建工具 |
| **Node.js** | 18+ | 前端构建工具 |
| **MySQL** | 5.7+ (推荐 8.0) | 数据库 |
| **Git** | 2.0+ | 代码管理 |

---

## 2. 环境准备

### 2.1 安装 Java JDK 17

**Windows:**
1. 下载 [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/#java17) 或 [OpenJDK](https://adoptium.net/)
2. 运行安装程序
3. 设置环境变量：
   ```powershell
   # 设置 JAVA_HOME
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
   # 添加到 PATH
   $env:Path += ";$env:JAVA_HOME\bin"
   ```
4. 验证安装：
   ```bash
   java -version
   ```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

### 2.2 安装 Maven

**Windows:**
1. 下载 [Apache Maven](https://maven.apache.org/download.cgi)
2. 解压到 `C:\Program Files\Apache\maven`
3. 添加环境变量 `MAVEN_HOME` 和 PATH

**Linux:**
```bash
sudo apt install maven
mvn -version
```

### 2.3 安装 Node.js

**Windows/macOS:**
1. 下载 [Node.js LTS](https://nodejs.org/)
2. 运行安装程序

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

### 2.4 安装 MySQL

**Windows:**
1. 下载 [MySQL Installer](https://dev.mysql.com/downloads/installer/)
2. 选择 "MySQL Server" 安装
3. 记住设置的 root 密码

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

**创建数据库:**
```sql
CREATE DATABASE fruitshop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fruitshop'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fruitshop.* TO 'fruitshop'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. 后端部署

### 3.1 获取代码
```bash
cd /your/project/path
git clone <repository-url> fruitshop
cd fruitshop/backend
```

### 3.2 配置数据库连接

编辑 `src/main/resources/application.yml`：

```yaml
spring:
  profiles:
    active: mysql  # 使用 MySQL 配置

---
spring:
  config:
    activate:
      on-profile: mysql
  datasource:
    url: jdbc:mysql://localhost:3306/fruitshop?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&useSSL=false
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:your_password}
```

### 3.3 构建项目
```bash
mvn clean package -DskipTests
```

### 3.4 运行后端

**开发模式 (H2 内存数据库):**
```bash
mvn spring-boot:run
```

**生产模式 (MySQL):**
```bash
# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE="mysql"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_password"
java -jar target/fruitshop-backend-1.0.0.jar

# Linux/macOS
export SPRING_PROFILES_ACTIVE=mysql
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
java -jar target/fruitshop-backend-1.0.0.jar
```

### 3.5 验证后端运行
```bash
curl http://localhost:8080/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 4. 前端部署

### 4.1 安装依赖
```bash
cd frontend
npm install
```

### 4.2 配置 API 地址

创建 `.env.local` 文件：
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4.3 开发模式运行
```bash
npm run dev
```
访问 http://localhost:5173

### 4.4 生产构建
```bash
npm run build
```
构建产物在 `dist/` 目录

### 4.5 部署到 Web 服务器

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/fruitshop/dist;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. 数据库配置

### 5.1 初始化数据库

数据库表会在首次启动时自动创建（`ddl-auto: create`）。

如需手动初始化：
```bash
mysql -u root -p fruitshop < backend/src/main/resources/schema.sql
mysql -u root -p fruitshop < backend/src/main/resources/data.sql
```

### 5.2 默认账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | ROLE_OWNER | 系统管理员 |
| manager | password | ROLE_MANAGER | 店长 |
| cashier | password | ROLE_CASHIER | 收银员 |

### 5.3 数据库维护

**备份:**
```bash
mysqldump -u root -p fruitshop > backup_$(date +%Y%m%d).sql
```

**恢复:**
```bash
mysql -u root -p fruitshop < backup_20251214.sql
```

---

## 6. 生产环境部署

### 6.1 使用 Systemd 管理后端服务 (Linux)

创建服务文件 `/etc/systemd/system/fruitshop.service`：
```ini
[Unit]
Description=FruitShop Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fruitshop/backend
Environment="SPRING_PROFILES_ACTIVE=mysql"
Environment="MYSQL_USER=fruitshop"
Environment="MYSQL_PASSWORD=your_password"
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m fruitshop-backend-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable fruitshop
sudo systemctl start fruitshop
sudo systemctl status fruitshop
```

### 6.2 Windows 后台运行

**使用 NSSM (推荐):**
1. 下载 [NSSM](https://nssm.cc/download)
2. 安装服务：
   ```powershell
   nssm install FruitShop "C:\Program Files\Java\jdk-17\bin\java.exe" "-jar C:\fruitshop\backend\target\fruitshop-backend-1.0.0.jar"
   nssm set FruitShop AppEnvironmentExtra "SPRING_PROFILES_ACTIVE=mysql" "MYSQL_USER=root" "MYSQL_PASSWORD=123456"
   nssm start FruitShop
   ```

**使用 PowerShell 后台进程:**
```powershell
Start-Process -NoNewWindow -FilePath "java" -ArgumentList @(
    "-jar", "fruitshop-backend-1.0.0.jar",
    "--spring.profiles.active=mysql",
    "--spring.datasource.username=root",
    "--spring.datasource.password=your_password"
) -RedirectStandardOutput "app.log" -RedirectStandardError "error.log"
```

### 6.3 Docker 部署

**Dockerfile (后端):**
```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/fruitshop-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: fruitshop
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    depends_on:
      - mysql
    environment:
      SPRING_PROFILES_ACTIVE: mysql
      MYSQL_USER: root
      MYSQL_PASSWORD: rootpassword
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/fruitshop
    ports:
      - "8080:8080"
  
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  mysql_data:
```

---

## 7. 常见问题

### Q1: 后端启动报错 "Unable to determine Dialect"
**原因:** MySQL 未启动或连接配置错误

**解决:**
1. 检查 MySQL 服务是否运行
2. 验证数据库连接参数
3. 确保数据库 `fruitshop` 已创建

### Q2: 端口 8080 被占用
**解决:**
```bash
# 查找占用进程
netstat -ano | findstr :8080  # Windows
lsof -i :8080                  # Linux

# 修改端口
java -jar app.jar --server.port=9090
```

### Q3: 前端无法连接后端 API
**原因:** CORS 跨域问题或 API 地址配置错误

**解决:**
1. 检查 `.env.local` 中的 `VITE_API_BASE_URL`
2. 确保后端 CORS 配置允许前端域名

### Q4: MySQL 5.5 版本警告
**原因:** Hibernate 不再完全支持 MySQL 5.5

**建议:** 升级到 MySQL 5.7 或 8.0

### Q5: 中文乱码问题
**解决:**
1. 确保数据库使用 `utf8mb4` 编码
2. 连接字符串添加 `characterEncoding=UTF-8`
3. Java 启动参数添加 `-Dfile.encoding=UTF-8`

---

## 联系支持

- **文档**: [docs/](./docs/)
- **API 文档**: [docs/api.md](./docs/api.md)
- **ER 图**: [docs/ER_DIAGRAM.md](./docs/ER_DIAGRAM.md)
