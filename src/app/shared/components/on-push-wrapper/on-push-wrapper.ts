import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-on-push-wrapper',
  imports: [],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnPushWrapper {}
