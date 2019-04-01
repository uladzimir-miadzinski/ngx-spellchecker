import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPosition} from '../helpers/caret';
import {debounce} from '../helpers/delay';

enum NodeType {
  Div = 1,
  Text = 3
}

interface StyleOptions {
  [key: string]: string;
}

interface SpellcheckerOptions {
  style: StyleOptions;
}

interface Misspelled {
  suggestions: string[];
  word: string;
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
  
  getWrapper(suggestions: string[] = []) {
    const end = '</span>';
    const start = `<span class="spellchecker-error" data-suggest="${suggestions}">`;
    const length = end.length + start.length;
    return {end, length, start};
  }
  
  getWrappedWord(word: string, suggestions: string[]): string {
    const wrapper = SpellcheckerDirective.getWrapper(suggestions);
    return `${wrapper.start}${word}${wrapper.end}`;
  }
  
  getIndexesOfWordInText(word: string = '', text: string = '') {
    const fullWord = new RegExp(`\\b${word}\\b`, 'u');
    return text.search(fullWord);
  }
  
  getNodeValue(node: ChildNode) {
    const el = node as HTMLElement;
    
    return (el.nodeType === NodeType.Div)
      ? el.innerText
      : el.nodeType === NodeType.Text
        ? el.nodeValue
        : el.textContent;
  }
  
  getNodeWithMisspelledText(nodes: ChildNode[], word) {
    return nodes.find((node: ChildNode) => {
      return this.getIndexesOfWordInText(word, this.getNodeValue(node)) >= 0;
    });
  }
  
  ngOnInit(): void {
    const el = this.el.nativeElement as HTMLInputElement;
    const styleInject = document.createElement('style');
    styleInject.innerHTML = this.errorStyle;
    el.after(styleInject);
    el.setAttribute('spellcheck', 'false');
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
      this.spellWordsHtml(response.misspelledWords, textToSend);
      // this.spellWords(response.misspelledWords, textToSend);
      // setCaretPosition(el, caretOffset);
    }
  }
  
  
  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: MouseEvent) {
    const suggestions = (e.target as HTMLSpanElement).dataset.suggest.split(',');
    const caretOffset = getCaretCharacterOffsetWithin((e.target as HTMLSpanElement));
    console.log(caretOffset);
    console.log(e);
    console.log(suggestions);
    console.log('contextmenu');
  }
  
  spellWordsHtml(misspelledWords, textWasSent) {
    const el = this.el.nativeElement as HTMLInputElement;
    const {childNodes} = el;
    const nodes = Array.from(childNodes);
    misspelledWords.forEach((misspelled: Misspelled) => {
      const nodeWithMisspelledWord = this.getNodeWithMisspelledText(nodes, misspelled.word);
      this.spellWord(misspelled.word, misspelled.suggestions, nodeWithMisspelledWord);
      console.dir(nodeWithMisspelledWord);
    });
    console.log(childNodes);
  }
  
  spellWord(word = '', suggestions = [], node) {
    const nodeValue = this.getNodeValue(node);
    const indexesOfWord = this.getIndexesOfWordInText(word, nodeValue);
    const wrapper = this.getWrapper(suggestions);
    const isWrappedBefore = this.getIndexesOfWordInText(`${wrapper.start}${word}`, nodeValue);
    
  }
  
  spellWords(misspelledWords, textWasSent) {
    const el = this.el.nativeElement as HTMLInputElement;
    const innerHtml = el.innerHTML;
    console.log(innerHtml);
    let text = innerHtml;
    let outputText = '';
    
    if (misspelledWords.length) {
      let textCursor = 0;
      let wordCursor = 0;
      
      while (text.length > 0) {
        // avoid calc
        if (textWasSent.length !== el.innerText.length) {
          return;
        }
        
        textCursor = this.getIndexesOfWordInText(misspelledWords[wordCursor].word, text);
        const children = Array.from(el.children);
        const errorSpell = !!children.find(span => {
          console.group('children span if');
          console.dir(span);
          console.dir((span as HTMLSpanElement).innerText);
          console.dir(misspelledWords[wordCursor].word);
          console.groupEnd();
          return span.className === 'spellchecker-error' && this.getIndexesOfWordInText(misspelledWords[wordCursor].word, (span as HTMLSpanElement).innerText) >= 0;
        });
        
        console.log(`errorSpell: ${errorSpell}`);
        
        if (textCursor >= 0 && !errorSpell) {
          const spelledWord = this.getWrappedWord(misspelledWords[wordCursor].word, misspelledWords[wordCursor].suggestions);
          outputText += `${text.slice(0, textCursor)}${spelledWord}`;
          text = text.slice(textCursor + misspelledWords[wordCursor].word.length);
        }
        
        wordCursor++;
        if (wordCursor === misspelledWords.length) {
          break;
        }
      }
      
      // `text` - contains rest of the text if there is no mistakes
      // try to replace full text, if cant then user continue changing text
      const newInnerHtml = outputText + text;
      
      // avoid inserting if user continue typing
      if (el.innerText.length === textWasSent.length) {
        el.innerHTML = newInnerHtml;
      }
    }
  }
}
