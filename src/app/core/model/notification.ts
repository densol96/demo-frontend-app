export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  timeoutId?: ReturnType<typeof setTimeout>;
}
