import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPosition} from '../helpers/caret';
import {debounce} from '../helpers/delay';

enum NodeType {
  Div = 1,
  Text = 3
}

enum KeyboardButtons {
  Delete = 46,
  Backspace = 8
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
    mark.tf-spellchecker-err {
      ${Object.entries(this.options.style).reduce((acc, [key, value]) => acc + `${key}:${value};`, '')}
    }
    `;
  }
  
  @Input()
  timeout = 1000;
  
  @Input()
  options: SpellcheckerOptions = {
    style: {
      'text-decoration': 'none',
      'background': 'transparent', // '#f8d2d4',
      'border-bottom': '1px solid #e00',
      'box-shadow': 'inset 0 -1px 0 #e00',
      'color': 'inherit',
      'transition': 'background 0.1s cubic-bezier(.33,.66,.66,1)'
    }
  };
  
  getMatches(word, text) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const result = [];
    
    let match = null;
    do {
      match = regex.exec(text);
      if (match) {
        result.push(match.index);
      }
    } while (match);
    
    return result;
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
    await this.spellcheck();
  }
  
  @HostListener('keyup', ['$event'])
  async onKeyUp(e) {
    if (e.which === KeyboardButtons.Backspace || e.which === KeyboardButtons.Delete) {
      await this.spellcheck();
    }
  }
  
  @HostListener('focus')
  @debounce()
  async onFocus() {
    await this.spellcheck();
  }
  
  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: MouseEvent) {
    const dataSuggest = (e.target as HTMLSpanElement).dataset.suggest;
    if (dataSuggest) {
      const suggestions = dataSuggest.split(',');
      console.log(suggestions);
    }
  }
  
  /*@HostListener('contextmenu', ['$event'])
  onContextMenu(e: MouseEvent) {
    let targetCkeditor = null;
    
    for (let instanceProp in e.view['CKEDITOR'].instances) {
      const instance = e.view['CKEDITOR'].instances[instanceProp];
      if (Array.from(instance.element.$.classList).includes('cke_focus')) {
        targetCkeditor = instance;
        break;
      }
    }
    
    /*`
      ​<span class=​"cke_menuitem">
        ​<a class=​"cke_menubutton cke_menubutton__paste cke_menubutton_off cke_menubutton__paste"
        href=​"javascript:​void('Вставить')​" title=​"Вставить (Ctrl+V)​" tabindex=​"-1" _cke_focus=​"1"
        hidefocus=​"true" role=​"menuitem" aria-label=​"Вставить" aria-describedby=​"cke_90_description"
        aria-haspopup=​"false" aria-disabled=​"false" draggable=​"false">
          ​<span class=​"cke_menubutton_inner">
            ​<span class=​"cke_menubutton_icon">​…​</span>
            ​<span class=​"cke_menubutton_label">​Вставить​</span>
            ​<span class=​"cke_menubutton_label cke_menubutton_shortcut">​Ctrl+V​</span>
          ​</span>
        ​</a>
        ​<span id=​"cke_90_description" class=​"cke_voice_label" aria-hidden=​"false">​Комбинация клавиш Ctrl+V​</span>
      ​</span>​`;*/
  
  /*console.log(targetCkeditor);
  console.dir(targetCkeditor.contextMenu.items[0]);
  const contextMenuIframe = document.querySelector('.cke_panel_frame') as HTMLIFrameElement;
  const ckeMenu = contextMenuIframe.contentWindow.document.body.querySelector('.cke_menu');
  console.log(ckeMenu);
  
  const dataSuggest = (e.target as HTMLSpanElement).dataset.suggest;
  if (dataSuggest) {
    const suggestions = dataSuggest.split(',');
    suggestions.forEach(suggestion => {
      const menuItem = document.createElement('span');
      menuItem.setAttribute('class', 'cke_menuitem');
      
      const a = document.createElement('a');
      a.setAttribute('class', 'cke_menubutton cke_menubutton__paste cke_menubutton_off cke_menubutton__paste');
      a.setAttribute('title', suggestion);
      a.setAttribute('role', 'menuitem');
      
      const inner = document.createElement('span');
      inner.setAttribute('class', 'cke_menubutton_inner');
      
      const ckeBtn = document.createElement('span');
      ckeBtn.setAttribute('class', 'cke_menubutton_icon');
      ckeBtn.innerHTML = '...';
      
      const ckeLabel = document.createElement('span');
      ckeLabel.setAttribute('class', 'cke_menubutton_label');
      ckeLabel.innerHTML = suggestion;
      
      const ckeShortcut = document.createElement('span');
      ckeShortcut.setAttribute('class', 'cke_menubutton_label cke_menubutton_shortcut');
      ckeShortcut.innerHTML = '...';
      
      const descr = document.createElement('span');
      ckeShortcut.setAttribute('class', 'cke_voice_label');
      ckeShortcut.innerHTML = '​Комбинация клавиш не назначена';

      inner.appendChild(ckeBtn);
      inner.appendChild(ckeLabel);
      inner.appendChild(ckeShortcut);
      a.appendChild(inner);

      menuItem.appendChild(a);
      menuItem.appendChild(descr);
      
      ckeMenu.appendChild(menuItem);
    });
    console.log(suggestions);
  }
  console.log(targetCkeditor.contextMenu.items);
}*/
  
  async spellcheck() {
    const el = this.el.nativeElement as HTMLInputElement;
    const textToSend = el.innerText || '';
    const response = await this.spellcheckService.checkText(textToSend);
    await this.spellWordsHtml(response.misspelledWords, el);
  }
  
  async spellWordsHtml(misspelledWords, el: HTMLInputElement) {
    await this.makeChildNodesWithSpelling(el.childNodes, misspelledWords);
  }
  
  async makeChildNodesWithSpelling(childNodes, misspelledWords) {
    for (let m = 0; m < misspelledWords.length; m++) {
      for (let i = 0; i < childNodes.length; i++) {
        await this.makeNodeWithSpelling(childNodes[i], misspelledWords[m]);
      }
    }
  }
  
  async makeNodeWithSpelling(node, misspelled) {
    if (node.hasChildNodes()) {
      if (node.nodeName === 'MARK' && node.textContent === node.dataset.misspelled) {
        // value inside <mark> not changed
        return;
      } else if (node.nodeName === 'MARK') {
        // value inside <mark> was changed, need to update <mark> node with new spell, or correct
        const corrections: Misspelled[] = await this.spellcheckService.checkText(node.textContent);
        if (corrections.length) {
          // word with another errors
          node.dataset.missplled = corrections[0].word;
          node.dataset.suggest = corrections[0].suggestions;
        } else {
          // word without errors
          const caret = getCaretCharacterOffsetWithin(this.el.nativeElement as HTMLInputElement);
          const textNodeFrag = document.createTextNode(node.textContent);
          node.parentNode.replaceChild(textNodeFrag, node);
          setCaretPosition(this.el.nativeElement as HTMLInputElement, caret);
        }
      }
      await this.makeChildNodesWithSpelling(node.childNodes, [misspelled]);
    } else if (node.nodeValue) {
      // text value of node, the smallest part
      
      let newNodeValue = node.nodeValue;
      const matches = this.getMatches(misspelled.word, node.nodeValue);
      const mark = document.createElement('mark');
      
      mark.dataset.suggest = misspelled.suggestions;
      mark.dataset.misspelled = misspelled.word;
      mark.setAttribute('class', 'tf-spellchecker-err');
      mark.innerHTML = misspelled.word;
      
      matches.forEach(matchIndex => {
        newNodeValue = newNodeValue.slice(0, matchIndex) + mark.outerHTML + newNodeValue.slice(matchIndex + misspelled.word.length);
      });
      
      const frag = document.createRange().createContextualFragment(newNodeValue);
      const caret = getCaretCharacterOffsetWithin(this.el.nativeElement as HTMLInputElement);
      
      node.parentNode.replaceChild(frag, node);
      
      setCaretPosition(this.el.nativeElement as HTMLInputElement, caret);
    }
  }
  
}
