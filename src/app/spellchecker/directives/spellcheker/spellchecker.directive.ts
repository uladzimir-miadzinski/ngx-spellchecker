import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appSpellchecker]',
})
export class SpellcheckerDirective {
    constructor(private el: ElementRef) {
        console.log('SpellChecker constructor');
    }
    
    numberOfClicks = 0;
    
    @HostListener('keyup', ['$event.target'])
    onClick(input: HTMLElement) {
      console.log('events', input, 'events:', this.numberOfClicks++);
    }
}
