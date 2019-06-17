import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  public host: string;

  constructor(
    private http: HttpClient
  ) {
    this.host = environment.host;
  }
  
  
  getFundSources( objRequest: any ) {
    return this.http.get<any>(this.host + '/dwl/customer/funding-source/list', {params: objRequest })
      .pipe(map(response => { return response; }));
  }
}
