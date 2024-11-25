import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineToBr',
  standalone: true
})
export class NewlineToBrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/\r?\n/g, '<br />');
  }
}
