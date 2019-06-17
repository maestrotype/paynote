import { Injectable } from '@angular/core';
import {UserService} from './user.service';
import {CurrencyPipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    public userService: UserService,
    private currencyPipe: CurrencyPipe,
  ) { }


  canVoidCheck(status: string = '', strType: string = '' ) {
    if ( strType === 'internal' && (this.userService.isMerchant() || this.userService.isClient() ) ) {
      return false;
    }
    let canVoid: boolean;
    canVoid = true;
    switch (status.toLowerCase() ) {
      case 'paid':
      case 'voided':
      case 'void pending':
      case 'cancel pending':
      case 'cancelled':
      case 'processed':
      case 'failed':
      case 'unpaid':
      case 'printed':
        canVoid = false;
        break;
      default:
        canVoid = true;
        break;
    }

    return canVoid;
  }

  isSystemPaiment( transaction: any = null ) {
    if (!transaction ) {
      return false;
    }

    if (this.userService.isAdmin() || this.userService.isSuperAdmin() ) {
      return false;
    }

    return transaction.rec_token && transaction.rec_token.indexOf('####') >= 0;
  }

  canCancelInvoice(status: string = '', strType: string = '' ) {
    if ( strType === 'internal' && (this.userService.isMerchant() || this.userService.isClient() ) ) {
      return false;
    }
    let canVoid = true;
    switch (status.toLowerCase() ) {
      case 'paid':
      case 'voided':
      case 'void pending':
      case 'cancel pending':
      case 'cancelled':
      case 'processed':
      case 'printed':
        canVoid = false;
        break;
      default:
        canVoid = true;
        break;
    }

    return canVoid;
  }

  getStatus(transaction: any = {}) {
    let status = '';
    if (transaction.status) {
      switch (transaction.status.toLowerCase()) {
        case 'processed':
          let message = '';
          if (transaction.i_token) {
            message = 'The funds have been disbursed from the recipient on ' + this.userService.getDateFormat(transaction.created_at)
              + '. You should see them the same day or next working day';
          } else {
            message = 'The funds have been disbursed to on ' + this.userService.getDateFormat(transaction.created_at)
              + '. You should see them the same day or next working day';
          }
          status = 'Paid&nbsp<i class="fa fa-question-circle" title="' + message + '"></i>';
          break;
        case 'pending':
          status = 'In process';
          break;
        case 'cancelled':
        case 'voided':
        case 'void pending':
          status = 'Void';
          break;
        case 'failed':
          status = 'Failed';
          break;
        case 'printed':
          status = 'Printed';
          break;
        case 'unpaid':
          status = 'Unpaid';
          break;
        case 'penprocessedding':
          status = 'Penprocessedding';
          break;
      }
    }

    return status;
  }

  getAmountString(objTransaction: any = null) {
    let strAmount = '';
    if (!objTransaction) {
      return '';
    }
    if (this.userService.isMerchant()) {
      if (objTransaction.type === 'check' && this.userService.getToken() !== objTransaction.rec_token
        && this.userService.getEmail() !== objTransaction.rec_email) {
        strAmount += '-';
      }
      if (objTransaction.type === 'invoice' && this.userService.getToken() === objTransaction.sndr_token
        && this.userService.getEmail() === objTransaction.sndr_email) {
        strAmount += '-';
      }
    }
    if (this.userService.isClient()) {
      if (this.userService.getToken() !== objTransaction.rec_token && this.userService.getEmail() !== objTransaction.rec_email) {
        strAmount += '-';
      }
    }

    strAmount += this.currencyPipe.transform(objTransaction.amount, '', 'symbol');

    return strAmount;
  }
}
