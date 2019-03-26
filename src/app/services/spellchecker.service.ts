import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const baseUrl = 'http://localhost:2999/';

@Injectable({
  providedIn: 'root'
})
export class SpellcheckerService {
  
  constructor(private http: HttpClient) {
  }
  
  async check(text): Promise<any> {
    return await this.http.post(baseUrl, {text}).toPromise();
  }
  
}
