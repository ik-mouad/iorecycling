import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Non-pure pour réagir aux changements de langue
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: string, params?: { [key: string]: string | number }): string {
    return this.i18n.translate(key, params);
  }
}

