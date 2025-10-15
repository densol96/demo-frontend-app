import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../../components/toast/toast';
import { NotificationService } from '../../services/notifications';

@Component({
  selector: 'app-page-layout',
  imports: [Header, Footer, RouterOutlet, Toast],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.scss',
})
export class PageLayout {}
