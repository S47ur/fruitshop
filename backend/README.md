# Fruit Shop ERP Backend

## Features
- **Spring Boot 3.2**: Core framework.
- **Spring Data JPA**: Database access.
- **Spring Cloud Alibaba (Nacos)**: Service discovery and configuration management.
- **WebSocket**: Real-time message pushing (e.g., order status updates).
- **Quartz**: Scheduled tasks (e.g., report generation).
- **MySQL**: Relational database.

## Setup
1. **Database**: Create a MySQL database named `fruiterp`. The tables will be automatically created via `schema.sql`.
2. **Nacos**: Ensure Nacos Server is running at `localhost:8848`.
3. **Configuration**: Check `src/main/resources/application.yml` for database and Nacos settings.

## Running
```bash
mvn spring-boot:run
```

## Microservices
This project is configured as a Nacos client. It will register itself with the Nacos server upon startup.

## Real-time Communication
WebSocket endpoint is available at `/ws`. Clients can subscribe to `/topic/...` for updates.

## Scheduled Tasks
Quartz is configured. A sample job runs every 60 seconds.
