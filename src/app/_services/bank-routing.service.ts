import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BankRoutingService {

  public host: string;
  
  constructor(
    private http: HttpClient
  ) {
    this.host = environment.host;
  }
  
  getBankInfo( routing: string ) {
    return this.http.get(this.host + '/bank/info', { params : { routing: routing } })
      .pipe(map(response => {
        return <any>response;
      }));
  }
  
  
}
