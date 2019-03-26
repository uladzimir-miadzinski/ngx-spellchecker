import {Directive, ElementRef, HostListener} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';

export const debounce = (delay: number = 500): MethodDecorator => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    clearTimeout(this.__timeout__);
    this.__timeout__ = setTimeout(() => original.apply(this, args), delay);
  };
  
  return descriptor;
};


@Directive({
  selector: '[appSpellchecker]',
})
export class SpellcheckerDirective {
  constructor(
    private el: ElementRef,
    private spellcheckService: SpellcheckerService
  ) {
  }
  
  @HostListener('keyup')
  @debounce()
  async onClick() {
    const response = await this.spellcheckService.check((this.el.nativeElement as HTMLInputElement).value || '');
    const misspelledWords = response.filter(item => item.isMisspelled);
    console.log(misspelledWords);
  }
}
