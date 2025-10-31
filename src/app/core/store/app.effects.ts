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
      error: this.logger.error,
      success: this.logger.success,
      warning: this.logger.warn,
      info: this.logger.info,
    };

    const notifyFunctions = {
      error: this.notification.error,
      success: this.notification.success,
      warning: this.notification.warning,
      info: this.notification.info,
    };

    return {
      loggerFn: logFunctions[severity] || this.logger.info,
      notificationFn: notifyFunctions[severity] || this.notification.info,
    };
  }
}
