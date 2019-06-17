import { Injectable } from '@angular/core';
import {JqueryService} from './jquery.service';

@Injectable({
  providedIn: 'root'
})
export class PlaidClientService {

  public objPalidCreds: any = {
    selectAccount: true,
    env: 'sandbox',
    clientName: 'SeamlessChex',
    apiVersion: 'v2',
    key: '1902b1de5ce38dfe7586c08873d297',
    product: ['auth'],
    onSuccess: this.onSuccess,
    onExit: this.onExit,
    onEvent: this.onEvent
  }

  constructor(
      private jqueryService: JqueryService
    ) {
    
  }
  
  onSuccess( publicToken: string, objAccountInfo: any ) {
    console.log( objAccountInfo )
    console.log('onSuccess')
    console.log(publicToken)
    console.log(this)
  }
  
  onExit() {
    console.log('onExit')
  }
  
  onEvent(event: string) {
    console.log('onEvent')
    console.log(event)
  }
  
  openWindow() {
    console.log('openWindow')
    this.jqueryService.openPlaidWindow();
  }
  
  init( vm:any ) {
    let PlaidInstance = this.jqueryService.initPlaid( this.objPalidCreds );
    //PlaidInstance.open();
    
  }
}
