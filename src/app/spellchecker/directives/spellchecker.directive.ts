import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPosition} from '../helpers/caret';
import {debounce} from '../helpers/delay';

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
  
  @HostListener('keypress')
  @debounce()
  async onKeyPress() {
    const el = this.el.nativeElement as HTMLInputElement;
    const textToSend = el.innerText || '';
    const response = await this.spellcheckService.checkText(textToSend);
    
    // avoid calc
    if (el.innerText.length === textToSend.length) {
      const caretOffset = getCaretCharacterOffsetWithin(el);
      this.spellWords(response.misspelledWords, textToSend);
      setCaretPosition(el, caretOffset);
    }
  }
  
  spellWords(misspelledWords, ofText) {
    const el = this.el.nativeElement as HTMLInputElement;
    const styleInject = `<style>${this.errorStyle}</style>`;
    const inputText = el.innerText;
    let text = inputText;
    let outputText = '';
    
    if (misspelledWords.length) {
      let textCursor = 0;
      let wordCursor = 0;
      const wrapper = this.getWrapper();
      
      while (text.length > 0) {
        // avoid calc
        if (ofText.length !== el.innerText.length) {
          return;
        }
        
        textCursor = 0;
        
        const fullWord = new RegExp(`\\b${misspelledWords[wordCursor].word}\\b`);
        textCursor = text.search(fullWord);
        
        if (textCursor >= 0) {
          const spelledWord = `${wrapper.start}${misspelledWords[wordCursor].word}${wrapper.end}`;
          outputText += `${text.slice(0, textCursor)}${spelledWord}`;
          text = text.slice(textCursor + misspelledWords[wordCursor].word.length);
        }
        
        wordCursor++;
        if (wordCursor === misspelledWords.length) {
          break;
        }
      }
      
      if (el.innerText.length === ofText.length) {
        el.innerHTML = el.innerText.replace(inputText, outputText + text + styleInject);
      }
    }
  }
}
