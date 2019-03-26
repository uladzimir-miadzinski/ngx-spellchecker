import {Component, OnDestroy} from '@angular/core';
import {SpellcheckerService} from './services/spellchecker.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  form = this.fb.group({
    text: [''],
    serverResponse: ['']
  });
  
  subscriptions: Subscription[] = [];
  
  constructor(
    private spellcheckService: SpellcheckerService,
    private fb: FormBuilder
  ) {
  }
  
  async onClickCheckBtn() {
    const response = await this.spellcheckService.checkText(this.form.controls.text.value);
    this.form.patchValue({serverResponse: JSON.stringify(response, null, 2)});
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
}
