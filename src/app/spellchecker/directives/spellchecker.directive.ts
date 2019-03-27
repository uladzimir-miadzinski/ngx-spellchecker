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
  timeout = 500;
  
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
  
  getWrapper() {
    const end = '</span>';
    const start = '<span class="spellchecker-error">';
    const length = end.length + start.length;
    return {end, length, start};
  }
  
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
      ${Object.entries(this.options.style).reduce((acc, [key, value]) => acc + `${key}:${value};`, '')}
    }
    `;
  }
  
  @HostListener('keydown')
  onKeyDown() {
    if (this.keyUpTimer) {
      clearTimeout(this.keyUpTimer);
    }
  }
  
  @HostListener('keyup')
  async onKeyUp() {
    this.actualText = (this.el.nativeElement as HTMLInputElement).innerText;
    
    this.keyUpTimer = setTimeout(async () => {
      const el = this.el.nativeElement as HTMLInputElement;
      const textToSend = el.innerText || '';
      const response = await this.spellcheckService.checkText(textToSend);
      const styleInject = `<style>${this.errorStyle}</style>`;
      const caretOffset = getCaretCharacterOffsetWithin(el);
      const spelledText = this.spellWords(response.misspelledWords);
      setCaretPosition(el, caretOffset);
    }, this.timeout);
  }
  
  spellWords(misspelledWords) {
    const el = this.el.nativeElement as HTMLInputElement;
    const text = el.innerText;
    
    if (misspelledWords.length) {
      let textCursor = 0;
      let wordCursor = 0;
      const wrapper = this.getWrapper();
      let prevTextCursor = 0;
      
      while (textCursor <= text.length) {
        prevTextCursor = textCursor;
        textCursor = text.indexOf(misspelledWords[wordCursor].word, prevTextCursor);
        
        let diff = 0;
        if (textCursor < wrapper.start.length) {
          diff = wrapper.start.length - textCursor;
        }
        
        const sliceStart = textCursor - wrapper.start.length;
        
        const textBeforeWord = sliceStart < 0 ? '' : text.slice(sliceStart, sliceStart + wrapper.start.length);
        const isErrorWrapperBefore = textBeforeWord === '' ? false : textBeforeWord === wrapper.start.slice(diff);
        
        if (textCursor >= 0 && !isErrorWrapperBefore) {
          const spelledWord = `${wrapper.start}${misspelledWords[wordCursor].word}${wrapper.end}`;
          el.innerHTML = el.innerHTML.replace(misspelledWords[wordCursor].word, spelledWord);
        }
        
        wordCursor++;
        
        if (wordCursor === misspelledWords.length) {
          textCursor = text.length + 1;
        }
      }
      
      return text;
    } else {
      return '';
    }
  }
}
