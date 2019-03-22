import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SpellcheckerModule} from './spellchecker/spellchecker.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    SpellcheckerModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
