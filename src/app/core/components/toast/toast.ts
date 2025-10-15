import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notifications';
import { NotificationType } from '../../model/notification';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  private readonly notificationService = inject(NotificationService);
  readonly notifications = this.notificationService.notifications;

  remove(id: number) {
    this.notificationService.remove(id);
  }

  getIcon(type: NotificationType) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }
}
