import { Component } from '@angular/core';
import { Header } from './header/header';
import { AppBody } from './app-body/app-body';

@Component({
  selector: 'app-page-layout',
  imports: [Header, AppBody],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.scss',
})
export class PageLayout {}
