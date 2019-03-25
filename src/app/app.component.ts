import {Component, OnDestroy} from '@angular/core';
import {SpellcheckService} from './services/spellcheck.service';
import {FormControl} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  
  text = new FormControl(
    'Helo, my namei is Vova and I hav jusd developid aplicateon to chek speling of mispeled worts and medikal terms, ' +
    'such as scotophobicalli, scoyrge, Coladern, unit-eosenophil, aestetician that are misspelled, ' +
    'and correct words: afelimomab, helminthophobes, unit-granulocyte-macrophage');
  serverResponse = new FormControl('');
  
  subscriptions: Subscription[] = [];
  
  constructor(
    private spellcheckService: SpellcheckService
  ) {
  }
  
  onClickCheckBtn(): void {
    this.subscriptions.push(this.spellcheckService.check(this.text.value).subscribe(response => {
      this.serverResponse.setValue(JSON.stringify(response, null, 2));
    }));
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
}
