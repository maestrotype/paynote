import { Component, OnInit } from '@angular/core';

import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService} from '../../auth.service';
import {Utility} from '../../_helpers/utility';
import {UserService} from '../../_services/user.service';
import {MessagesService} from '../../_services/messages.service';
import { Spinkit } from 'ng-http-loader';
import {JqueryService} from '../../_services/jquery.service';
import {TopAlertsService} from '../../_services/top-alerts.service';

declare var Plaid: any;

@Component({
  selector: 'app-express-checkout',
  templateUrl: './express-checkout.component.html',
  styleUrls: ['./express-checkout.component.css']
})
export class ExpressCheckoutComponent implements OnInit {

  public spinkit = Spinkit;
  public host: string = environment.host;
  public modalRef: NgbModalRef;
  public isLoading = false;
  public subDomen: string = environment.subDomen;
  public objExpressCheckoutComp: any = {
    objExprCheckRequest: <any> {},
    apiLinks: <any> environment.api,
    canShowExpressCheckout: <boolean> false
  };

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private authenticationService: AuthenticationService,
    private router: ActivatedRoute,
    public utility: Utility,
    public userService: UserService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public jqueryService: JqueryService
  ) { }

  ngOnInit() {
    this.userService.isExpressCheckout = true;
    const base64_token = this.router.snapshot.paramMap.get('base64_token');
    if ( base64_token ) {
      const objParamsIn = JSON.parse(atob(base64_token));
      this.objExpressCheckoutComp.objExprCheckRequest = Object.assign(this.objExpressCheckoutComp.objExprCheckRequest, objParamsIn);
//      console.log(this.objExpressCheckoutComp.objExprCheckRequest)
      if ( this.objExpressCheckoutComp.objExprCheckRequest.lightBox ) {
        this.objExpressCheckoutComp.objExprCheckRequest.lightBox.redirectUrl =
          decodeURIComponent(this.objExpressCheckoutComp.objExprCheckRequest.lightBox.redirectUrl);
      }
      if (this.objExpressCheckoutComp.objExprCheckRequest.lightBox
        && this.objExpressCheckoutComp.objExprCheckRequest.lightBox.logoUrl != '' ) {
        this.objExpressCheckoutComp.objExprCheckRequest.lightBox.logoUrl =
          decodeURIComponent(this.objExpressCheckoutComp.objExprCheckRequest.lightBox.logoUrl);
      }
    }
    setTimeout(() => {
      this.userService.clearUser();
      this.authenticationService.clearLogin();
    }, 2000);
  }

  openDialogPlaid() {
    const objPalidCreds = <any> environment.plaid;

    this.userService.setFingerPrintBrowser();

    const vm = this;
    const headers = {
      'Authorization': this.objExpressCheckoutComp.objExprCheckRequest.publicKey
    };

    objPalidCreds.onSuccess = function (publickToken: string, objAccountInfo: any) {
      const Request = <any> {
        account_id: objAccountInfo.account_id,
        token: publickToken
      };
      if (vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerEmail) {
        Request.email = vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerEmail;
      }
      if (vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerFirstName) {
        Request.firstName = vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerFirstName;
      }
      if (vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerLastName) {
        Request.lastName = vm.objExpressCheckoutComp.objExprCheckRequest.checkout.customerLastName;
      }
      if (vm.objExpressCheckoutComp.objExprCheckRequest.checkout.companyName) {
        Request.businessName = vm.objExpressCheckoutComp.objExprCheckRequest.checkout.companyName;
      }

      vm.isLoading = true;
      vm.http.post<any>(vm.getHostApi() + '/user/express/', Request, {headers: headers})
      .subscribe(
        response => {
          if (response.success) {
            vm.isLoading = false;
            vm.objExpressCheckoutComp.objExprCheckRequest = Object.assign(vm.objExpressCheckoutComp.objExprCheckRequest, response);
            vm.userService.setFingerPrintBrowser();
            vm.objExpressCheckoutComp.canShowExpressCheckout = true;
          }
        },
        errResponse => {
          vm.isLoading = false;
          if (errResponse.error) {
            vm.utility.getMessageError( errResponse.error );
            vm.topAlertsService.popToast('error', 'Error', vm.utility.errorMessage);
          }
        }
      );
    };

    objPalidCreds.onExit = function () {
      vm.isLoading = false;
    };

    const PlaidInstance = new Plaid.create( objPalidCreds );
    PlaidInstance.open();
  }

  submitPayment() {

    let amount = this.objExpressCheckoutComp.objExprCheckRequest.checkout.totalValue;
    if (environment.subDomen != 'paynote') {
      amount = 98;
    }
    if (this.objExpressCheckoutComp.objExprCheckRequest.checkout.errorDemo) {
      amount = this.objExpressCheckoutComp.objExprCheckRequest.checkout.totalValue;
    }
    const headers = {
      'Authorization': this.objExpressCheckoutComp.objExprCheckRequest.publicKey
    };
    const Request = <any> {
      amount: amount,
      description: this.objExpressCheckoutComp.objExprCheckRequest.checkout.description,
      user_id: this.objExpressCheckoutComp.objExprCheckRequest.user.user_id,
      identifier: this.objExpressCheckoutComp.objExprCheckRequest.paymentToken
    };
    if ( this.objExpressCheckoutComp.objExprCheckRequest.checkout.recurring
      && this.objExpressCheckoutComp.objExprCheckRequest.checkout.recurring ) {
      Request.recurring = this.objExpressCheckoutComp.objExprCheckRequest.checkout.recurring;
    }
    this.http.post<any>(this.getHostApi() + '/check/express', Request, {headers: headers})
      .subscribe(
        response => {
          if (response.success) {
            if (this.objExpressCheckoutComp.objExprCheckRequest.displayMethod == 'redirect') {
            window.location.href = this.objExpressCheckoutComp.objExprCheckRequest.lightBox.redirectUrl;
            } else if (this.objExpressCheckoutComp.objExprCheckRequest.displayMethod == 'iframe') {
              parent.postMessage('pay_success', '*');
            }
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.utility.getMessageError( errResponse.error );
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            this.objExpressCheckoutComp.canShowExpressCheckout = false;
          }
        }
      );
  }

  getHostApi() {
    return this.objExpressCheckoutComp.objExprCheckRequest.sandbox
      ? this.objExpressCheckoutComp.apiLinks.sandbox_endpoint
      : this.objExpressCheckoutComp.apiLinks.live_endpoint;
  }

  getLogo() {
    return this.objExpressCheckoutComp.objExprCheckRequest.lightBox
      ? this.objExpressCheckoutComp.objExprCheckRequest.lightBox.logoUrl || 'assets/img/Paynote_-_New_Blue.svg'
      : 'assets/img/Paynote_-_New_Blue.svg';
  }

  closeIframe() {
    parent.postMessage('pay_close', '*');
  }

  getReturnUrl() {
    return this.objExpressCheckoutComp.objExprCheckRequest.lightBox.cancelUrl;
  }

  getStoreName() {
    return this.objExpressCheckoutComp.objExprCheckRequest.storeName;
  }

}
