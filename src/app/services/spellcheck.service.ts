import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const baseUrl = 'http://localhost:2999/';

@Injectable({
  providedIn: 'root'
})
export class SpellcheckService {
  
  constructor(private http: HttpClient) {
  }
  
  check(text): Observable<any> {
    return this.http.post(baseUrl, {text});
  }
  
}
