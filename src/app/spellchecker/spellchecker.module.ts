import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SpellcheckerDirective} from './directives/spellcheker/spellchecker.directive';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [SpellcheckerDirective],
  imports: [FormsModule, CommonModule],
  exports: [SpellcheckerDirective],
})
export class SpellcheckerModule {
}
