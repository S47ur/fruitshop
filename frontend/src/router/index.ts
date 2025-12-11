import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { public: true, title: "登录" }
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
    meta: { public: true, title: "注册" }
  },
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "经营驾驶舱" }
  },
  {
    path: "/procurement",
    name: "procurement",
    component: () => import("../views/ProcurementView.vue"),
    meta: { title: "采购管理" }
  },
  {
    path: "/sales",
    name: "sales",
    component: () => import("../views/SalesView.vue"),
    meta: { title: "销售管理" }
  },
  {
    path: "/inventory",
    name: "inventory",
    component: () => import("../views/InventoryView.vue"),
    meta: { title: "库存预警" }
  },
  {
    path: "/finance",
    name: "finance",
    component: () => import("../views/FinanceView.vue"),
    meta: { title: "财务报表" }
  },
  {
    path: "/system",
    name: "system",
    component: () => import("../views/SystemView.vue"),
    meta: { title: "系统中心" }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (!to.meta?.public && !auth.isAuthenticated) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }
  if (to.name === "login" && auth.isAuthenticated) {
    return next({ name: "dashboard" });
  }
  next();
});

export default router;
