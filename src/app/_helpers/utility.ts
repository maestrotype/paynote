import {Injectable} from '@angular/core';
import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {Directive, ElementRef, HostListener} from '@angular/core';
import {environment} from '../../environments/environment';

@Directive({
  selector: '[onlyNumbers]'
})
export class NumbersDirective {

  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'Control', 'V'];

  constructor(private el: ElementRef) {

  }

  // ngOnInit() {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex) && !event.ctrlKey) {
      event.preventDefault();
    }
  }

}

@Injectable()

@Pipe({ name: 'phone' })

export class PhonePipe implements PipeTransform {
    transform(tel: any, args: any) {
//      val = val.charAt(0) != 0 ? '0' + val : '' + val;
//      let newStr = '';
//      let i: number = 0
//
//      for(i=0; i < (Math.floor(val.length/2) - 1); i++){
//        newStr = newStr+ val.substr(i*2, 2) + '-';
//      }
//      return newStr+ val.substr(i*2);

      if (!tel) { return ''; }

        const value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        let country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = '';
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + ' (' + city + ') ' + number).trim();
    }
}

export class Utility  {

  public amountWords = '';
  public objDateFormatOptions: any = { year: 'numeric', month: 'long', day: 'numeric' };
  public maskPhone: any = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public maskFullSsn: any = [ /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public maskMicroDeposit: any = ['$', '0', '.', /\d/, /\d/];
  public errorMessage: any = '';
  public currencyPipe: CurrencyPipe;
  public domSanitaser: any;


  constructor(  ) {
    this.currencyPipe = new CurrencyPipe('en-US');
  }

  debugValue(value: any = null, message: string = '' ) {
    if ( environment.debugMode ) {
      console.log( message, value );
    }
  }

  getTrustHtml( html: any = '' ) {
    return html.replace(/<[^>]*>/g, '');
  }

  getMessageError(response: any ) {
    let strMessage = '';
    if ( response.message ) {
      strMessage = response.message;
    }

    if ( response.messages && response.messages.length ) {
      response.messages.forEach(function (value: string ) {
        strMessage += '- ' + value + '\n\r';
      });
    }

    this.errorMessage = strMessage;

    return strMessage;
  }

  getTodayDate() {
    return new Date().toLocaleDateString('en-US', this.objDateFormatOptions);
  }

  getDateFormat( customDate: any ) {
    if (customDate != '' ) {
      return new Date( customDate ).toLocaleDateString('en-US', this.objDateFormatOptions);
    } else {
      return new Date().toLocaleDateString('en-US', this.objDateFormatOptions);
    }
  }

  toWords(s: any ) {
    if ( !s ) {
      return;
    }

    let wordReplace = 'Dollar and Zero Cents';

    let wordDollar = 'Dollar';
    const amountFloat = parseFloat(s);
    if ( amountFloat > 0 && amountFloat > 1.99 ) {
      wordDollar = 'Dollars';
      wordReplace = wordDollar + ' and Zero Cents';
    }

    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s)) {
      return '';
    }
    let x = s.indexOf('.');
    if (x == -1) {
      x = s.length;
    }
    if (x > 15) {
      return 'too big';
    }
    const n = s.split('');
    let str = '';
    let sk = 0;
    let i: number;
    const th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
    const dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    for (i = 0; i < x; i++) {
      if ((x - i) % 3 == 2) {
        if (n[i] == '1') {
          str += tn[Number(n[i + 1])] + ' ';
          i++;
          sk = 1;
        } else if (n[i] != 0) {
          str += tw[n[i] - 2] + ' ';
          sk = 1;
        }
      } else if (n[i] != 0) {
        str += dg[n[i]] + ' ';
        if ((x - i) % 3 == 0) {
          str += 'Hundred ';
        }
        str = str.replace(wordReplace, '');
        str += ' ' + wordDollar + ' and Zero Cents';
        sk = 1;
      }


      if ((x - i) % 3 == 1) {
        if (sk) {
          str += th[(x - i - 1) / 3] + ' ';
        }
        str = str.replace(wordReplace, '');
        str += ' ' + wordDollar + ' and Zero Cents';
        sk = 0;
      }
      if (n[i] == 0 && s.charAt(0) === '0') {
        str = str.replace(wordReplace, '');
        str += 'Zero ' + wordDollar + ' and Zero Cents';
        sk = 0;
      }
    }
    if (x != s.length) {
      const y = s.length;
      if (s.charAt(0) === '.') {
        str += 'Zero ' + wordDollar + ' and .';
        for (i = x + 1; i < y; i++) {
          str += n[i];
        }
        str += ' Cents';
      }

      if (s.charAt(0) != '.') {
        str = str.replace('Zero Cents', '');
        str += '.';
        for (i = x + 1; i < y; i++) {
          str += n[i];
        }
        str += ' Cents';
      }
    }
    return str.replace(/\s+/g, ' ');
  }

  getFrequencyString(strFrequencyValue: string = '' ) {
    let strFrequency = '';
    switch ( strFrequencyValue ) {
      case 'week':
        strFrequency = 'weekly';
        break;
      case 'month':
        strFrequency = 'monthly';
        break;
    }

    return strFrequency;
  }

  getWindowWidth() {
    return window && window.innerWidth ? window.innerWidth : 0;
  }

  getMessageUsability(strAction: string = '' ) {
    let strMessage = '';
    const screenWidth = 500;
    switch ( strAction ) {
      case 'confirm_request_money':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Request Check' : 'Request Check';
        break;
      case 'confirm_void_invoice':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Void' : 'Void';
        break;
      case 'confirm_resend_notification':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Resend Notification' : 'Resend';
        break;
      case 'confirm_send_money':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Send Money' : 'Send Money';
        break;
      case 'back_to_digital_check':
        strMessage = this.getWindowWidth() > screenWidth ? 'Back to Digital Check' : 'Back';
        break;
      case 'confirm_and_accept':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Accept' : 'Accept';
        break;
      case 'confirm_create_pay_link':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Create' : 'Create';
        break;
      case 'confirm_disable_pay_link':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Disable' : 'Disable';
        break;
      case 'confirm_enable_pay_link':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Enable' : 'Enable';
        break;
      case 'confirm_switch':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Switch' : 'Switch';
        break;
      case 'confirm_remove':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Remove' : 'Remove';
        break;
      case 'confirm_update':
        strMessage = this.getWindowWidth() > screenWidth ? 'Confirm & Update' : 'Update';
        break;
    }

    return strMessage;
  }

  renderLimitProgressBar( message: string = '', usedLimit: any = 0, limit: any = 0, bShort: boolean = false ) {
    const percent = (usedLimit / limit) * 100;
    const remaining = limit - usedLimit;
    const advansedDetails = bShort ? '' : '<div class="bar-label-right text-right">\n' +
      '                            <span class="info" title="Used / Limit">' +
      '                       <span style="color: #66aefa">' + this.currencyPipe.transform(usedLimit, '', 'symbol') + '</span> / ' +
      '                       <span style="color: black">'
      + this.currencyPipe.transform(limit, '', 'symbol') + '</span></span>\n' +
      '                          </div>\n';
    return '<div class="os-progress-bar primary">\n' +
'                        <div class="bar-labels">\n' +
'                          <div class="bar-label-left">\n' +
'                            <span>' + message + '</span>\n' +
'                            <span class="positive" title="Available"> ' + this.currencyPipe.transform(remaining, '', 'symbol') + '</span>\n' +
'                          </div>\n' + advansedDetails +
'                        </div>\n' +
'                        <div class="bar-level-1" style="width: 100%">\n' +
'                          <div class="bar-level-2" style="width:' + percent + '%"></div>\n' +
'                        </div>\n' +
'                      </div>';
  }
}
