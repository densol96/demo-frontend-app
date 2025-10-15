import { Pipe, PipeTransform } from '@angular/core';
import { formatSecondsToMMSS } from '../utils/formatSecondsToMMSS';

@Pipe({
  name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    console.log('SECONDS ', value);
    return formatSecondsToMMSS(value ?? 0);
  }
}
