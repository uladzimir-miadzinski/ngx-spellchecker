import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPosition} from '../helpers/caret';
import {debounce} from '../helpers/delay';

interface StyleOptions {
  [key: string]: string;
}

interface SpellcheckerOptions {
  style: StyleOptions;
}

@Directive({
  selector: '[appSpellchecker]',
})
export class SpellcheckerDirective implements OnInit {
  
  constructor(
    private el: ElementRef,
    private spellcheckService: SpellcheckerService
  ) {
  }
  
  get errorStyle() {
    return `
    .spellchecker-error {
      ${Object.entries(this.options.style).reduce((acc, [key, value]) => acc + `${key}:${value};`, '')}
    }
    `;
  }
  
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
  
  static getWrapper(suggestions: string[]) {
    const end = '</span>';
    const start = `<span class="spellchecker-error" data-suggest="${suggestions}">`;
    const length = end.length + start.length;
    return {end, length, start};
  }
  
  static getWrappedWord(word: string, suggestions: string[]): string {
    const wrapper = SpellcheckerDirective.getWrapper(suggestions);
    return `${wrapper.start}${word}${wrapper.end}`;
  }
  
  static getIndexOfWordInText(word: string, text: string) {
    const fullWord = new RegExp(`\\b${word}\\b`, 'u');
    return text.search(fullWord);
  }
  
  ngOnInit(): void {
    (this.el.nativeElement as HTMLInputElement).setAttribute('spellcheck', 'false');
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
  
  
  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: MouseEvent) {
    const suggestions = (e.target as HTMLSpanElement).dataset.suggest.split(',');
    console.log(e);
    console.log(suggestions);
    console.log('contextmenu');
  }
  
  spellWords(misspelledWords, textWasSent) {
    const el = this.el.nativeElement as HTMLInputElement;
    const styleInject = `<style>${this.errorStyle}</style>`;
    const inputText = el.innerText;
    let text = inputText;
    let outputText = '';
    
    if (misspelledWords.length) {
      let textCursor = 0;
      let wordCursor = 0;
      
      while (text.length > 0) {
        // avoid calc
        if (textWasSent.length !== el.innerText.length) {
          return;
        }
        
        textCursor = SpellcheckerDirective.getIndexOfWordInText(misspelledWords[wordCursor].word, text);
        
        if (textCursor >= 0) {
          const spelledWord = SpellcheckerDirective.getWrappedWord(misspelledWords[wordCursor].word, misspelledWords[wordCursor].suggestions);
          outputText += `${text.slice(0, textCursor)}${spelledWord}`;
          text = text.slice(textCursor + misspelledWords[wordCursor].word.length);
        }
        
        wordCursor++;
        if (wordCursor === misspelledWords.length) {
          break;
        }
      }
      
      // `text` - contains rest of the text if there is no mistakes
      const newInnerHtml = el.innerText.replace(inputText, outputText + text) + styleInject;
      
      // avoid inserting if user continue typing
      if (el.innerText.length === textWasSent.length) {
        el.innerHTML = newInnerHtml;
      }
    }
  }
}
