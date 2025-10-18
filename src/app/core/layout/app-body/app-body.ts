import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Footer } from './footer/footer';
import { Toast } from '../../components/toast/toast';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-body',
  imports: [Footer, Toast, RouterOutlet],
  templateUrl: './app-body.html',
  styleUrl: './app-body.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBody {}
