import { ref } from "vue";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
  duration: number;
}

const toasts = ref<ToastMessage[]>([]);
let seed = 0;

const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

const pushToast = (type: ToastType, text: string, duration: number) => {
  const id = ++seed;
  const message: ToastMessage = { id, type, text, duration };
  toasts.value.push(message);
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
};

const notifySuccess = (text: string, duration = 3200) => pushToast("success", text, duration);
const notifyError = (text: string, duration = 4200) => pushToast("error", text, duration);
const notifyInfo = (text: string, duration = 3200) => pushToast("info", text, duration);

export const useToastBus = () => ({
  toasts,
  dismissToast,
  notifySuccess,
  notifyError,
  notifyInfo
});

export type { ToastMessage, ToastType };
