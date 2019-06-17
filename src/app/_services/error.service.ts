import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  public isError: boolean;
  public isSuccess: boolean;
  public errorMessage: string;
  public successMessage: string;
  public timeToHide = 10000;

  constructor() {
    this.isError = false;
    this.isSuccess = false;
  }

  getMessageError(response: any, intSeconds: number = 0 ) {
    if (intSeconds == 0 ) {
      intSeconds = this.timeToHide;
    }
    setTimeout(() => this.clearAlerts(), intSeconds);
    this.isError = true;

    let strMessage = '';
    if ( response.message ) {
      strMessage = response.message;
    }

    if ( response.messages && response.messages.length ) {
      response.messages.forEach(function (value: string ) {
        strMessage += '&bullet;&nbsp;&nbsp;' + value + '<br>';
      });
    }

    this.errorMessage = strMessage;

    return strMessage;
  }

  getMessageSuccess( response: any, customMessage: string = '' ) {
    setTimeout(() => this.clearAlerts(), this.timeToHide );
    this.isSuccess = true;

    if (customMessage != '' ) {
      this.successMessage = customMessage;
      return;
    }

    if ( response.message ) {
      this.successMessage = response.message;
    }
  }

  clearAlerts() {
    this.isError = this.isSuccess = false;
    this.errorMessage = this.successMessage = '';
  }
}
