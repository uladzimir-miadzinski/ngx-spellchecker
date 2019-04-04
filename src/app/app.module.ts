import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {SpellcheckerModule} from './spellchecker/spellchecker.module';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

CKEDITOR.config.extraPlugins = 'spellchecker';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    SpellcheckerModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
