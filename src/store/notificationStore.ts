import { create } from "zustand";

export type NotificationType =
  | "success"
  | "error"
  | "info";

interface NotificationState {
  visible: boolean;
  message: string;
  type: NotificationType;
  showNotification: (
    message: string,
    type?: NotificationType
  ) => void;
  hideNotification: () => void;
}

export const useNotificationStore =
  create<NotificationState>((set) => ({
    visible: false,
    message: "",
    type: "info",

    showNotification: (
      message,
      type = "info"
    ) => {
      set({
        visible: true,
        message,
        type,
      });
    },

    hideNotification: () => {
      set({
        visible: false,
      });
    },
  }));
