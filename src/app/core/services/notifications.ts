import { computed, Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../model/notification';
import { readonlySignal } from '../../shared/utils/readonlySignal';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = readonlySignal(this._notifications);
  readonly lastNotification = computed(() => this._notifications().at(-1) ?? null);

  private _nextId = 1;

  private push(message: string, type: NotificationType = 'info', duration = 5000) {
    const note: Notification = {
      id: this._nextId++,
      type,
      message,
    };

    if (duration > 0) {
      note.timeoutId = setTimeout(() => this.remove(note.id), duration);
    }

    this._notifications.update((list) => [...list, note]);
  }

  remove(id: number) {
    const note = this._notifications().find((n) => n.id === id);
    if (note?.timeoutId) clearTimeout(note.timeoutId);
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear() {
    this._notifications()
      .filter((n) => n.timeoutId)
      .forEach((n) => clearTimeout(n.timeoutId!));

    this._notifications.set([]);
  }

  success(msg: string, duration = 4000) {
    this.push(msg, 'success', duration);
  }

  error(msg: string, duration = 6000) {
    this.push(msg, 'error', duration);
  }

  warning(msg: string, duration = 5000) {
    this.push(msg, 'warning', duration);
  }

  info(msg: string, duration = 4000) {
    this.push(msg, 'info', duration);
  }
}
