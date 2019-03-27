import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPosition} from '../helpers/caret';

interface ErrorStyle {
  [key: string]: string;
}

interface SpellcheckerOptions {
  style: ErrorStyle;
}

@Directive({
  selector: '[appSpellchecker]',
})
export class SpellcheckerDirective implements OnInit {
  @Input()
  timeout = 1000;
  
  @Input()
  options: SpellcheckerOptions = {
    style: {
      'text-decoration': 'none',
      'background': '#f8d2d4',
      'border-bottom': '1px solid #e00',
      'box-shadow': 'inset 0 -1px 0 #e00',
      'color': 'inherit',
      'transition': 'background 0.1s cubic-bezier(.33,.66,.66,1)'
    }
  };
  
  keyUpTimer: any;
  actualText: string;
  
  constructor(
    private el: ElementRef,
    private spellcheckService: SpellcheckerService
  ) {
  }
  
  ngOnInit(): void {
  }
  
  get errorStyle() {
    return `
    .spellchecker-error {
      ${Object.entries(this.options.style).reduce((acc, style) => acc + `${style[0]}:${style[1]};`, '')}
    }
    `;
  }
  
  @HostListener('keyup')
  async onKeyUp() {
    this.actualText = (this.el.nativeElement as HTMLInputElement).innerText || '';
    
    if (this.keyUpTimer) {
      clearTimeout(this.keyUpTimer);
    }
    
    this.keyUpTimer = setTimeout(async () => {
      const element = this.el.nativeElement as HTMLInputElement;
      const textToSend = element.innerText || '';
      const response = await this.spellcheckService.checkText(textToSend);
      const styleInject = `
      <style>
      ${this.errorStyle}
      </style>`;
      const caretOffset = getCaretCharacterOffsetWithin(element);
      //if (this.actualText !== textToSend) {
      const syncWritingText = this.actualText.slice(textToSend.length);
      console.log(syncWritingText);
      console.log(textToSend);
      //}
      element.innerHTML = `${response.spelledText}${syncWritingText}${styleInject}`;
      setCaretPosition(element, caretOffset);
    }, this.timeout);
    
  }
}
