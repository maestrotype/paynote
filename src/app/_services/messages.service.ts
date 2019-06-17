import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  public host: string;
  public objMessages: any = {test: 'gfdgfdgfdg'};
  
  constructor(
    private http: HttpClient
  ) {
    this.host = environment.host;
  }
  
  
  init() {
    //this.http.get<any>(this.host + '/messages/client')
    this.http.get<any>(this.host + '/messages/all')
      .subscribe(
        response => {
          this.objMessages = response;
        },
        errResponse => {
          this.objMessages = {};
        }
      );
  }
  
  get( slug: string ) {
    if( this.objMessages ) {
      return this.objMessages[slug];
    }
    
    return slug;
  }
}
