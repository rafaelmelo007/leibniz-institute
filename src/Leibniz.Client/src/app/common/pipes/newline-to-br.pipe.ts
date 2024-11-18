import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineToBr',
  standalone: true
})
export class NewlineToBrPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) {
      return '';
    }
    return value.replace(/\r?\n/g, '<br />');
  }
}
