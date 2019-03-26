import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {SpellcheckerService} from '../../services/spellchecker.service';
import {getCaretCharacterOffsetWithin, setCaretPos} from '../helpers/caret';
import {debounce} from '../helpers/delay';

@Directive({
  selector: '[appSpellchecker]',
})
export class SpellcheckerDirective implements OnInit {
  @Input() spellcheckerErrorStyle: string;
  
  constructor(
    private el: ElementRef,
    private spellcheckService: SpellcheckerService
  ) {
  }
  
  ngOnInit(): void {
    this.spellcheckerErrorStyle = `
      text-decoration:none;
      border-bottom: 1px solid #e00;
      box-shadow: inset 0 -1px 0 #ef8b80;
      color: inherit;
      transition: background 0.1s cubic-bezier(.33,.66,.66,1);`;
  }
  
  @HostListener('keyup')
  @debounce()
  async onKeyUp() {
    const element = this.el.nativeElement as HTMLInputElement;
    const currentText = element.innerText || '';
    const response = await this.spellcheckService.checkText(currentText);
    const styleInject = `
      <style>
      .spellchecker-error {
       ${this.spellcheckerErrorStyle}
      }
      </style>`;
    const caretOffset = getCaretCharacterOffsetWithin(element);
    element.innerHTML = response.spelledText + styleInject;
    setCaretPos(element, caretOffset);
  }
}
