import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoggerService } from '../../../core/services/logger';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notifications';
import { readonlySignal } from '../../../shared/utils/readonlySignal';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {}
