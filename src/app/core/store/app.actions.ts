import { createAction } from '@ngrx/store';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  consoleMessage: string;
  userMessage?: string;
  source?: string;
  showToUser?: boolean;
  data?: unknown;
}

function createNotificationAction(type: string, severity: NotificationSeverity) {
  return createAction(type, (props: NotificationProps) => {
    const { consoleMessage, userMessage, source, showToUser, data } = props;
    return {
      consoleMessage,
      userMessage: userMessage ?? consoleMessage,
      showToUser: showToUser ?? true,
      source: source || 'App Notifications',
      severity,
      data,
    };
  });
}

export const showSuccess = createNotificationAction('[App Notifications] Show Success', 'success');
export const showError = createNotificationAction('[App Notifications] Show Error', 'error');
export const showInfo = createNotificationAction('[App Notifications] Show Info', 'info');
export const showWarning = createNotificationAction('[App Notifications] Show Warning', 'warning');
