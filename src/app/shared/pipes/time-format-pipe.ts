import { Pipe, PipeTransform } from '@angular/core';
import { formatSecondsToMMSS } from '../utils/formatSecondsToMMSS';

@Pipe({
  name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatSecondsToMMSS(value ?? 0);
  }
}
