import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import * as AppActions from './app.actions';
import { NotificationService } from '../services/notifications';
import { LoggerService } from '../services/logger';

@Injectable()
export class NotificationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly notification = inject(NotificationService);
  private readonly logger = inject(LoggerService);

  showError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AppActions.showError,
          AppActions.showSuccess,
          AppActions.showInfo,
          AppActions.showWarning
        ),
        tap(({ consoleMessage, userMessage, source, showToUser, severity, data }) => {
          const { loggerFn, notificationFn } = this.selectLogFn(severity);
          loggerFn(source, consoleMessage, data);
          if (showToUser) {
            notificationFn(userMessage);
          }
        })
      ),
    { dispatch: false }
  );

  private selectLogFn(severity: AppActions.NotificationSeverity) {
    const logFunctions = {
      error: this.logger.error.bind(this.logger),
      success: this.logger.success.bind(this.logger),
      warning: this.logger.warn.bind(this.logger),
      info: this.logger.info.bind(this.logger),
    };

    const notifyFunctions = {
      error: this.notification.error.bind(this.notification),
      success: this.notification.success.bind(this.notification),
      warning: this.notification.warning.bind(this.notification),
      info: this.notification.info.bind(this.notification),
    };

    return {
      loggerFn: logFunctions[severity] || this.logger.info,
      notificationFn: notifyFunctions[severity] || this.notification.info,
    };
  }
}
