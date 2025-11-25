<template>
  <section class="page">
    <header class="page__header">
      <div>
        <h1>系统中心</h1>
        <p>审批流、角色矩阵、集成与自动化在此统一维护。</p>
      </div>
      <div class="page__actions">
        <span :class="['badge', canManageSystem ? 'badge--ok' : 'badge--warn']">
          {{ canManageSystem ? "具备系统管理权限" : "只读模式" }}
        </span>
      </div>
    </header>

    <div class="grid">
      <div class="panel wide">
        <div class="panel__header">
          <p>用户管理</p>
          <span>{{ users.length }} 个用户</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select
                  :value="user.role"
                  :disabled="!canManageSystem"
                  @change="updateUserRole(user.id, ($event.target as HTMLSelectElement).value as UserRole)"
                >
                  <option v-for="(label, key) in roleCopy" :key="key" :value="key">{{ label }}</option>
                </select>
              </td>
              <td>
                <span class="chip" :class="user.status === 'active' ? 'done' : 'pending'">
                  {{ user.status === "active" ? "启用" : "禁用" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel wide">
        <div class="panel__header">
          <p>角色矩阵</p>
          <span>{{ roleMatrix.length }} 个角色</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>角色</th>
              <th>权限</th>
              <th>数据域</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in roleMatrix" :key="entry.role">
              <td>{{ roleCopy[entry.role] ?? entry.role }}</td>
              <td>
                <span v-for="perm in entry.permissions" :key="perm" class="chip">{{ perm }}</span>
              </td>
              <td>{{ entry.dataDomains.join("、") }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>审批流</p>
          <span>{{ approvalFlows.length }} 套</span>
        </div>
        <div class="flow-list">
          <article v-for="flow in approvalFlows" :key="flow.id">
            <header>
              <strong>{{ flow.documentType }}</strong>
              <small>更新于 {{ formatTime(flow.lastUpdated) }}</small>
            </header>
            <ol>
              <li v-for="step in flow.steps" :key="step.id">
                {{ roleCopy[step.role] ?? step.role }} · ≥ ¥{{ formatNumber(step.threshold) }}
              </li>
            </ol>
          </article>
          <p v-if="!approvalFlows.length" class="empty">暂无审批配置</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>系统集成</p>
          <span>{{ integrations.length }} 条</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>目标</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in integrations" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.target }}</td>
              <td>
                <span class="chip" :class="item.status === 'active' ? 'done' : 'pending'">
                  {{ item.status === 'active' ? '启用' : '暂停' }}
                </span>
              </td>
            </tr>
            <tr v-if="!integrations.length">
              <td colspan="4" class="empty">暂无集成</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>自动化任务</p>
          <span>{{ automations.length }} 项</span>
        </div>
        <ul>
          <li v-for="task in automations" :key="task.id">
            <div>
              <strong>{{ task.name }}</strong>
              <small>{{ task.schedule }} · {{ task.channel.toUpperCase() }}</small>
            </div>
            <button
              class="mini"
              type="button"
              :disabled="!canManageSystem"
              @click="toggleAutomation(task.id)"
            >
              {{ task.enabled ? "暂停" : "启用" }}
            </button>
          </li>
          <li v-if="!automations.length" class="empty">暂无自动化</li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel__header">
          <p>参数配置</p>
          <span>{{ parameters.length }} 条</span>
        </div>
        <form class="param-list">
          <label v-for="param in parameters" :key="param.key">
            <span>{{ param.label }}</span>
            <input v-model="editableParams[param.key]" :disabled="!canManageSystem" />
            <small>{{ param.description }}</small>
            <button
              class="mini ghost"
              type="button"
              :disabled="!canManageSystem"
              @click="saveParameter(param.key)"
            >
              保存
            </button>
          </label>
        </form>
      </div>

      <div class="panel wide">
        <div class="panel__header">
          <p>操作日志</p>
          <span>{{ auditLogs.length }} 条</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>操作者</th>
              <th>动作</th>
              <th>对象</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in auditLogs" :key="log.id">
              <td>{{ formatTime(log.at) }}</td>
              <td>{{ log.actor }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.entity }}</td>
              <td>{{ log.ip }}</td>
            </tr>
            <tr v-if="!auditLogs.length">
              <td colspan="5" class="empty">暂无日志</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useEnterpriseStore } from "../stores/useEnterpriseStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastBus } from "../composables/useToastBus";
import type { UserRole } from "../stores/types";

const enterprise = useEnterpriseStore();
const auth = useAuthStore();
const { roleMatrix, approvalFlows, integrations, automations, parameters, auditLogs, users } = storeToRefs(enterprise);
const { notifySuccess, notifyError } = useToastBus();

const canManageSystem = computed(() => auth.hasPermission("system.manage"));

const editableParams = reactive<Record<string, string>>({});

watch(
  parameters,
  (list) => {
    list.forEach((param) => {
      editableParams[param.key] = param.value;
    });
  },
  { immediate: true }
);

const roleCopy: Partial<Record<UserRole, string>> = {
  owner: "老板",
  manager: "店长",
  cashier: "收银",
  auditor: "审计"
};

const formatTime = (value: string) => new Date(value).toLocaleString("zh-CN", { hour12: false });
const formatNumber = (value: number) => value.toLocaleString("zh-CN");

const updateUserRole = async (userId: string, role: UserRole) => {
  if (!canManageSystem.value) {
    notifyError("当前账户无权限");
    return;
  }
  try {
    await enterprise.updateUserRole(userId, role);
    notifySuccess("用户角色已更新");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "更新失败");
  }
};

const saveParameter = async (key: string) => {
  if (!canManageSystem.value) {
    notifyError("当前账户无权限");
    return;
  }
  try {
    await enterprise.updateParameter(key, editableParams[key]);
    notifySuccess("参数已更新");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "保存失败");
  }
};

const toggleAutomation = async (id: string) => {
  if (!canManageSystem.value) {
    notifyError("当前账户无权限");
    return;
  }
  try {
    await enterprise.toggleAutomation(id);
    notifySuccess("自动化状态已切换");
  } catch (err) {
    notifyError(err instanceof Error ? err.message : "切换失败");
  }
};
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

.badge {
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
}

.badge--ok {
  background: #dcfce7;
  color: #15803d;
}

.badge--warn {
  background: #fee2e2;
  color: #b91c1c;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel.wide {
  grid-column: 1 / -1;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.chip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  margin: 2px;
}

.chip.done {
  background: #dcfce7;
  color: #15803d;
}

.chip.pending {
  background: #fee2e2;
  color: #b91c1c;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-list article {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.flow-list header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.flow-list ol {
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-list label {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 8px;
  align-items: center;
}

.param-list input {
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  padding: 8px 10px;
}

.param-list small {
  grid-column: 1 / -1;
  color: #94a3b8;
}

.mini {
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.mini.ghost {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #94a3b8;
}
</style>
