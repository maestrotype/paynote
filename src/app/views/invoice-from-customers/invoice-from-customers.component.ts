import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ErrorService} from '../../_services/error.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AuthenticationService} from '../../auth.service';
import {Utility} from '../../_helpers/utility';
import {Router} from '@angular/router';
import {BankRoutingService} from '../../_services/bank-routing.service';
import {UserService} from '../../_services/user.service';
import {MessagesService} from '../../_services/messages.service';
import { Spinkit } from 'ng-http-loader';
import {JqueryService} from '../../_services/jquery.service';
import {TopAlertsService} from '../../_services/top-alerts.service';

declare var Plaid: any;

@Component({
  selector: 'app-invoice-from-customers',
  templateUrl: './invoice-from-customers.component.html',
  styleUrls: ['./invoice-from-customers.component.css']
})
export class InvoiceFromCustomersComponent implements OnInit {

  public spinkit = Spinkit;
  public host: string = environment.host;
  public isValidPayLink = true;
  public modalRef: NgbModalRef;
  public objDigitCheck: any = {
    verifyCodeSend: false,
    bankAccountType: 'checking',
    acceptPolicy: false,
    accountType: '',
    account_id: 0,
    recurring: false,
    billing_cycle: 'month'
  };
  public lstAccounts: any = [];
  public objCurAccount: any = {};
  public objBankInfo: any = {};
  public objFutureUser: any = {};
  public objExistUser: any = {};
  public isLoading = false;
  public isInvoiceValid = false;
  public isInvoicePending = false;
  public isInvoiceProcessed = false;
  public isInvoiceCanseled = false;
  public isExistUser = false;
  public isManualVerificationExist = false;
  public thankyouMessage = '';
  public backButtonContent: any;
  public subDomen: string = environment.subDomen;
  public intErrorSeconds = 60000;
  public objLink: any = environment.link;

  public objInvoice: any = {};

  public verifyPhoneFormGroup: FormGroup;

  public objInFromCustComp: any = {
    isInvoice: <boolean> false,
    isPayLink: <boolean> false,
    isPayLinkValid: <boolean> false,
    isPayLinkPlaidVerified: <boolean> false,
    isPayLinkManualMustVerify: <boolean> false,
    isPayLinkSuccessSendMoney: <boolean> false,
    objPaymentLink: <any> {},
    objPaymentLinkForm: <any> {},
    rulesForm: {
      minSendAmount: 2,
      disableInputSendAmount: false
    },
    objInvoiceExperience: <any> null
  };

  @ViewChild('depositCheckOnline')
  private depositCheckOnline: TemplateRef<any>;

  @ViewChild('verifyPhoneExistUser')
  private verifyPhoneExistUser: TemplateRef<any>;

  @ViewChild('selectTypeAddFundingSource')
  private selectTypeAddFundingSource: TemplateRef<any>;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private authenticationService: AuthenticationService,
    private router: ActivatedRoute,
    public utility: Utility,
    private bankRoutingService: BankRoutingService,
    private _formBuilder: FormBuilder,
    private route: Router,
    public userService: UserService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public jqueryService: JqueryService
  ) {}

  ngOnInit() {
    if (this.router.snapshot.data['isSandbox'] ) {
      this.host = environment.sandboxHost;
    }

    this.verifyPhoneFormGroup = this._formBuilder.group({
      phone_pin: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)])],
      pin_part_1: ['', Validators.required],
      pin_part_2: ['', Validators.required],
      pin_part_3: ['', Validators.required],
      pin_part_4: ['', Validators.required]
    });
    this.authenticationService.clearLogin();
    this.initInvoice();
  }

  initInvoice() {
    if ( this.router.snapshot.paramMap.get('invoice_token') ) {
      this.objInFromCustComp.isInvoice = true;
      const invoice_token = this.router.snapshot.paramMap.get('invoice_token');
      this.verifyInvoiceLInk(invoice_token);
    }
    if ( this.router.snapshot.paramMap.get('checkout_token') ) {
      this.objInFromCustComp.isPayLink = true;
      const checkout_token = this.router.snapshot.paramMap.get('checkout_token');
      this.verifyPaymentLink(checkout_token);
    }
  }

  nextDigit(intStep: number = 0 ) {
    switch (intStep) {
      case 1:
        if ( this.verifyPhoneFormGroup.value.pin_part_1 != '' && this.verifyPhoneFormGroup.value.pin_part_1 >= 0 ) {
          this.jqueryService.setFocus('#pin_part_' + (intStep + 1 ) );
        }
        break;
      case 2:
        if ( this.verifyPhoneFormGroup.value.pin_part_2 != '' && this.verifyPhoneFormGroup.value.pin_part_2 >= 0 ) {
          this.jqueryService.setFocus('#pin_part_' + (intStep + 1 ) );
        }
        break;
      case 3:
        if ( this.verifyPhoneFormGroup.value.pin_part_3 != '' && this.verifyPhoneFormGroup.value.pin_part_3 >= 0 ) {
          this.jqueryService.setFocus('#pin_part_' + (intStep + 1 ) );
        }
        break;
    }
  }

  onAccept( modalContent: any = null, backModalContent: any = null ) {
    this.openModal(modalContent, backModalContent);
    this.jqueryService.setFocus('#pin_part_1' );
    this.sendVerifyCode();
  }

  verifyPaymentLink( checkout_token: string ) {
    this.http.get<any>(this.host + '/customer/billing-link/retrive', { params: { bl_token: checkout_token } })
      .subscribe(
        response => {
          if (response.success) {
            this.objInFromCustComp.isPayLinkValid = <boolean>response.link.enabled;
            this.objInFromCustComp.objPaymentLink = response;
            this.objInFromCustComp.objPaymentLinkForm.billing_cycle = this.objInFromCustComp.objPaymentLink.link.billing_cycle;
            this.objInFromCustComp.objPaymentLinkForm.recurring = this.objInFromCustComp.objPaymentLink.link.recurring;
            this.objInFromCustComp.objPaymentLinkForm.num_of_payments = this.objInFromCustComp.objPaymentLink.link.num_of_payments;
            this.objInFromCustComp.objPaymentLinkForm.amount = this.objInFromCustComp.objPaymentLink.link.amount > 0
              ? this.objInFromCustComp.objPaymentLink.link.amount : '';
            this.objInFromCustComp.objPaymentLinkForm.description = this.objInFromCustComp.objPaymentLink.link.description;
            this.objInFromCustComp.rulesForm.disableInputSendAmount = this.objInFromCustComp.objPaymentLink.link.amount > 0;
          }
        },
        err => {
          if (err.error) {
            this.isInvoiceValid = false;
            this.utility.getMessageError( err.error );
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getCssClassForInstantVerification() {
    console.log(this.haveManualVerification())
    if ( this.objInFromCustComp.isPayLink ) {
      return !this.objInFromCustComp.objPaymentLink.link.is_manual_v ? 'col-sm-12' : 'col-sm-6';
    }

    if ( this.objInFromCustComp.isInvoice ) {
      return !this.haveManualVerification() ? 'col-sm-12' : 'col-sm-6';
    }
  }

  canShowManualVerification() {
    if ( this.objInFromCustComp.isPayLink ) {
      return !!(this.objInFromCustComp.isPayLink && this.objInFromCustComp.objPaymentLink.link.is_manual_v);
    }

    if ( this.objInFromCustComp.isInvoice ) {
      return this.haveManualVerification();
    }

  }

  submitBillLink() {
    this.isLoading = true;
    this.userService.setFingerPrintBrowser();
    let objRequest = {
      bl_token: this.objInFromCustComp.objPaymentLink.link.bl_token,
      fpb: this.authenticationService.getFingerPrintBrowser(),
      browser: this.authenticationService.browComponent
    };

    objRequest = Object.assign(objRequest, this.objInFromCustComp.objPaymentLinkForm);

    this.http.post<any>(this.host + '/customer/check/invoice/billing-link', objRequest )
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.initPrepareInvoice(response);
            if (this.isExistUser ) {
              this.openModal(this.verifyPhoneExistUser);
              this.sendVerifyCode(false);
            } else {
              this.openModal(this.depositCheckOnline);
            }
            this.userService.setFingerPrintBrowser();
          }
        },
        err => {
          this.isLoading = false;
          if (err.error) {
            this.utility.getMessageError( err.error );
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getRedirectUrl() {
    return this.objInFromCustComp.objPaymentLink.link.callback ? this.objInFromCustComp.objPaymentLink.link.callback : 'https://paynote.io/';
  }

  verifyInvoiceLInk( invoice_token: string ) {
    this.errorService.clearAlerts();
    const objRequest = {
      i_token: invoice_token
    };
    this.http.get<any>(this.host + '/invoice/customer/retrieve', {params: objRequest })
      .subscribe(
        response => {
          if (response.success) {
            this.initPrepareInvoice(response);
            this.utility.debugValue(response, 'Invoice Object');
          }
        },
        err => {
          if (err.error) {
            this.isInvoiceValid = false;
            this.errorService.getMessageError( err.error );
          }
        }
      );
  }

  initPrepareInvoice( response: any = null ) {
    this.lstAccounts = [];
    this.objCurAccount = {};
    this.objExistUser = {};
    this.isExistUser = false;
    this.isInvoiceValid = true;
    this.objInvoice = response.invoice;
    this.objDigitCheck.accountName = this.objInvoice.sndr_name;
    this.setFirstLastName();

    this.objInFromCustComp.objInvoiceExperience = response.invoice_experience && this.objInFromCustComp.isInvoice ? response.invoice_experience : null;
    if ( response.user ) {
      this.isExistUser = true;
      this.objExistUser = response.user;
      this.objDigitCheck.accountType = this.objExistUser.type;
    }
    if ( response.accounts && response.accounts.length ) {
      this.lstAccounts = response.accounts;
      this.objCurAccount = response.accounts[0];
    }

    if ( this.objInvoice.billing_cycle && this.objInvoice.billing_cycle != 'null' ) {
      this.objDigitCheck.billing_cycle = this.objInvoice.billing_cycle;
      this.objDigitCheck.recurring = true;
      this.objDigitCheck.num_of_payments = this.objInvoice.num_of_payments;
    }

    this.thankyouMessage = 'Thank you! Your payment was sent to ' + this.objInvoice.rec_name + ' using SeamlessChex!';
    if ( this.objInvoice.status.toLowerCase() == 'pending' || this.objInvoice.status.toLowerCase() == 'new' ) {
      this.isInvoicePending = true;
    }
    if ( this.objInvoice.status.toLowerCase() == 'processing' || this.objInvoice.status.toLowerCase() == 'pending'
      || this.objInvoice.status.toLowerCase() == 'processed' || this.objInvoice.fs_token != null ) {
      this.isInvoiceProcessed = true;
      this.isInvoiceValid = false;
    }
    if ( this.objInvoice.status.toLowerCase() == 'canceled' || this.objInvoice.status.toLowerCase() == 'void pending'
      || this.objInvoice.status.toLowerCase() == 'cancel pending' || this.objInvoice.status.toLowerCase() == 'voided' ) {
      this.isInvoiceCanseled = true;
      this.isInvoiceValid = false;
    }
  }

  sendInvoiceCheck(content: any, contentBack: any = null) {
    this.errorService.clearAlerts();
    this.isLoading = true;
    this.userService.setFingerPrintBrowser();
    const objRequest = {
      i_token: this.objInvoice.i_token,
      fs_token: this.objCurAccount.dwl_fs_token,
      phone_pin: this.verifyPhoneFormGroup.value.phone_pin,
      name: this.objExistUser.name,
      email: this.objExistUser.email,
      acceptPolicy: true,
      billing_cycle: this.objDigitCheck.billing_cycle,
      recurring: this.objDigitCheck.recurring,
      num_of_payments: this.objDigitCheck.num_of_payments,
      fpb: this.authenticationService.getFingerPrintBrowser(),
      browser: this.authenticationService.browComponent
    };
    this.http.post<any>(this.host + '/check/invoice/payment/create/manual-verification', JSON.stringify(objRequest) )
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.objFutureUser = response;
            this.userService.setFingerPrintBrowser();

            if (this.objInFromCustComp.isPayLink ) {
              this.objInFromCustComp.isPayLinkSuccessSendMoney = true;
              this.closeModal();
            } else {
              this.isInvoiceProcessed = true;
              this.isInvoiceValid = false;
              this.isInvoicePending = false;
              this.openModal(content, contentBack);
            }
          }
        },
        err => {
          this.isLoading = false;
          if (err.error) {
            this.errorService.getMessageError( err.error, this.intErrorSeconds );
          }
        }
      );
  }

  setThankYouMessage(bRedirect: boolean = false, url: string = '' ) {
    this.closeModal();
    localStorage.setItem('thankyou_page_message', this.thankyouMessage);
    if (bRedirect ) {
      window.location.href = url;
    }
  }

  selectAnotherBankAccount() {
    this.objCurAccount = this.lstAccounts[ this.objDigitCheck.account_id ];
  }

  getDateFormat(strDate: string ) {
    return this.utility.getDateFormat(strDate );
  }

  openModal(content: any, contentBack: any = null) {
    this.errorService.clearAlerts();
    this.closeModal();
    if (contentBack ) {
      this.backButtonContent = contentBack;
    }
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  openBackModal(content: any = null) {
    this.errorService.clearAlerts();
    this.closeModal();
    if ( this.backButtonContent ) {
      this.modalRef = this.modalService.open( this.backButtonContent, { backdrop: 'static' } );
      this.backButtonContent = null;
    } else if ( content ) {
      this.modalRef = this.modalService.open(content, { backdrop: 'static' });
    }
  }

  closeModal() {
    if ( this.modalRef ) {
      this.modalRef.close();
    }
  }

  getLastDigitAccount() {
    if ( this.objDigitCheck.mask ) {
      return this.objDigitCheck.mask;
    }

    if ( !this.objDigitCheck.accountNumber ) {
      return false;
    }

    return this.objDigitCheck.accountNumber.substr(this.objDigitCheck.accountNumber.length - 4);
  }

  initRedirect() {
    setTimeout(() => {
      if ( this.getRedirectUrl().indexOf('http') >= 0 ) {
        window.location.href = this.getRedirectUrl();
      } else {
        window.location.href = 'https://' + this.getRedirectUrl();
      }
    }, 5000);
  }

  openDialogPlaid(modalContent: any, backContent: any = null) {
    this.errorService.clearAlerts();
    const objPalidCreds = <any> environment.plaid;

    this.userService.setFingerPrintBrowser();

    const vm = this;
    objPalidCreds.onSuccess = function( publickToken: string, objAccountInfo: any ) {
      vm.objDigitCheck.mask = objAccountInfo.account.mask;
      vm.objDigitCheck.bank_name = objAccountInfo.institution.name;
      vm.isLoading = true;
      vm.http.post<any>(vm.host + '/check/invoice/payment/create/instant-verification', {
          account_id: objAccountInfo.account_id,
          public_token: publickToken,
          i_token: vm.objInvoice.i_token,
          email: vm.objInvoice.sndr_email,
          atype: vm.objDigitCheck.accountType,
          phone: vm.verifyPhoneFormGroup.value.phone,
          phone_pin: vm.verifyPhoneFormGroup.value.phone_pin,
          acceptPolicy: vm.objDigitCheck.acceptPolicy || vm.isExistUser,
          name: vm.objDigitCheck.firstName + ' ' + vm.objDigitCheck.lastName,
          fpb: vm.authenticationService.getFingerPrintBrowser(),
          browser: vm.authenticationService.browComponent,
          ipAddress: localStorage.getItem('ipClient') || null,
          billing_cycle: vm.objDigitCheck.billing_cycle,
          recurring: vm.objDigitCheck.recurring,
          num_of_payments: vm.objDigitCheck.num_of_payments
        })
      .subscribe(
        response => {
          if (response.success) {
            vm.isLoading = false;
            vm.objFutureUser = response;
            if (vm.objInFromCustComp.isPayLink) {
              vm.closeModal();
              vm.objInFromCustComp.isPayLinkPlaidVerified = true;
              vm.initRedirect();
            } else {
              vm.isInvoiceValid = false;
              vm.isValidPayLink = false;
              vm.isInvoiceProcessed = true;
              vm.openModal(modalContent);
            }
            vm.userService.setFingerPrintBrowser();
          }
        },
        errResponse => {
          vm.isLoading = false;
          if (errResponse.error) {
            if ( backContent ) {
              vm.openModal(backContent);
            }
            vm.errorService.getMessageError(errResponse.error, vm.intErrorSeconds);
          }
        }
      );
    };

    objPalidCreds.onExit = function () {
      vm.isLoading = false;
    };

    objPalidCreds.onExit = function() {
      vm.isLoading = false;
    };

    const PlaidInstance = new Plaid.create( objPalidCreds );
    PlaidInstance.open();
  }

  collectVerifyCode() {
    this.verifyPhoneFormGroup.patchValue({
      phone_pin: this.verifyPhoneFormGroup.value.pin_part_1 + this.verifyPhoneFormGroup.value.pin_part_2
        + this.verifyPhoneFormGroup.value.pin_part_3 + this.verifyPhoneFormGroup.value.pin_part_4
    });
  }

  clearVirifyCode() {
    this.verifyPhoneFormGroup.patchValue({
      pin_part_1: '',
      pin_part_2: '',
      pin_part_3: '',
      pin_part_4: '',
      phone_pin: ''
    });
  }

  verifyPhoneCode( modalContent: any, bIsForExistUser: boolean = false, contentBank: any = null ) {
    this.errorService.clearAlerts();
    this.collectVerifyCode();
    if ( bIsForExistUser ) {
      this.authenticationService.verifyPhoneCodeForAuthUser(this.objInvoice.sndr_token, this.verifyPhoneFormGroup.value.phone_pin)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.openModal(modalContent, contentBank);
            }
          },
          err => {
            if ( err.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    } else {
      this.authenticationService.verifyEmailCode(this.objInvoice.sndr_email, this.verifyPhoneFormGroup.value.phone_pin)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.openModal(modalContent, contentBank);
            }
          },
          err => {
            if ( err.error) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    }
  }

  sendVerifyCode(bIsForExistUser: boolean = false ) {
    this.errorService.clearAlerts();
    this.objDigitCheck.verifyCodeSend = true;
    this.clearVirifyCode();
    if (bIsForExistUser ) {
      this.verifyPhoneFormGroup.reset();
      this.authenticationService.sendVerifyPhoneCodeForAuthUser(this.objInvoice.sndr_token)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if ( err.error.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    } else {
      this.authenticationService.sendVerifyCodeToEmail(this.objInvoice.sndr_email)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if ( err.error.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    }
  }

  getBankRouting() {
    this.bankRoutingService.getBankInfo( this.objDigitCheck.routingNumber )
      .subscribe(
          response => {
            if (response.success ) {
              this.objBankInfo = response.bankInfo;
              this.objDigitCheck.bank_name = response.bankInfo.name;
            }
          },
          errResponse => {
            console.log(errResponse);
          }
        );
  }

  setFirstLastName() {
    const arrNames = this.objInvoice.sndr_name.split(' ');
    this.objDigitCheck.firstName = arrNames[0] ? arrNames[0] : '';
    this.objDigitCheck.lastName = arrNames[1] ? arrNames[1] : '';
  }

  hasLastName() {
    const arrNames = this.objInvoice.sndr_name.split(' ');
    if ( arrNames[1] ) {
      return true;
    }
    return false;
  }

  clearManualAddBankAccount() {
    this.isManualVerificationExist = false;
    this.objDigitCheck.bank_name = '';
    this.objDigitCheck.routingNumber = '';
    this.objDigitCheck.accountNumber = '';
    this.objDigitCheck.cAccountNumber = '';
  }

  signUpByInvoiceLink( content: any, contentBack: any = null ) {

    this.isLoading = true;
    this.errorService.clearAlerts();
    if (this.objDigitCheck.accountNumber != this.objDigitCheck.cAccountNumber ) {
      this.errorService.getMessageError( {message: this.messages.get('ACCOUNT_NUMBER_DOES_NOT_MATCH_THE_CONFIRM_ACCOUNT_NUMBER')} );
      this.isLoading = false;
      return;
    }
    this.isManualVerificationExist = false;


    this.userService.setFingerPrintBrowser();

    const objRequestSignUp = this.objDigitCheck;
    objRequestSignUp.phone = this.verifyPhoneFormGroup.value.phone;
    objRequestSignUp.phone_pin = this.verifyPhoneFormGroup.value.phone_pin;
    objRequestSignUp.i_token = this.objInvoice.i_token;
    objRequestSignUp.email = this.objInvoice.sndr_email;
    objRequestSignUp.atype = this.objDigitCheck.accountType;
    objRequestSignUp.name = objRequestSignUp.firstName + ' ' + objRequestSignUp.lastName;
    objRequestSignUp.ipAddress = localStorage.getItem('ipClient') || null;
    if (this.isExistUser ) {
      objRequestSignUp.acceptPolicy = true;
//      objRequestSignUp.fs_token = this.objCurAccount.dwl_fs_token
    }

    this.authenticationService.signUpByInvoiceLink( objRequestSignUp )
      .subscribe(
        result => {
          const objResp = <any>result;
          if (objResp.success) {
            this.isLoading = false;
            this.objFutureUser = objResp;
            this.userService.setFingerPrintBrowser();
            if (this.objInFromCustComp.isPayLink ) {
              this.objInFromCustComp.isPayLinkManualMustVerify = true;
              this.closeModal();
            } else {
              if ( !objResp.fs_existing ) {
                this.isValidPayLink = false;
                this.isInvoiceValid = false;
                this.isInvoiceProcessed = true;
                this.isInvoicePending = false;
                this.openModal(content, contentBack);
              } else {
                this.isManualVerificationExist = true;
              }
            }
          }
        },
        err => {
          if ( err.error ) {
            this.isLoading = false;
            this.errorService.getMessageError( err.error, this.intErrorSeconds );
          }
        }
      );
  }

  loginCreatedUser() {
    if ( this.modalRef ) {
      this.modalRef.close();
    }

    localStorage.setItem('currentUser', JSON.stringify(this.objFutureUser));

    this.userService.initUser();
    this.userService.retrieveUserLimits();
    this.route.navigate(['/transactions']);
  }

  // button: "Send Check 123"
  // is_instant_v: 1
  // is_manual_v: 0
  // is_two_auth: 1
  // logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoA"
  // title: "Securely send and receive digital checks online. 123"

  haveInstantVerification() {
    if ( !this.objInFromCustComp.objInvoiceExperience ) {
      return true;
    }
    return this.objInFromCustComp.objInvoiceExperience
      && ( this.objInFromCustComp.objInvoiceExperience.is_instant_v || this.objInFromCustComp.objInvoiceExperience.is_instant_v == 1);
  }
  haveManualVerification() {
    if ( !this.objInFromCustComp.objInvoiceExperience ) {
      return true;
    }
    return this.objInFromCustComp.objInvoiceExperience
      && (this.objInFromCustComp.objInvoiceExperience.is_manual_v || this.objInFromCustComp.objInvoiceExperience.is_manual_v == 1);
  }

  haveLogo() {
    if ( !this.objInFromCustComp.objInvoiceExperience ) {
      return false;
    }
    return this.objInFromCustComp.objInvoiceExperience.logo && this.objInFromCustComp.objInvoiceExperience.logo !=  '';
  }

  getLogo() {
    return this.objInFromCustComp.objInvoiceExperience.logo;
  }

  getButtonLabel() {
    return this.objInFromCustComp.objInvoiceExperience && this.objInFromCustComp.objInvoiceExperience.button != ''
      ? this.objInFromCustComp.objInvoiceExperience.button : 'Send Check';
  }

  getTitle() {
    return this.objInFromCustComp.objInvoiceExperience && this.objInFromCustComp.objInvoiceExperience.title != ''
      ? this.objInFromCustComp.objInvoiceExperience.title : 'Securely send and receive digital checks online.';
  }

  requireToFAuth() {
    if ( this.objInFromCustComp.isPayLink ) {
      return this.objInFromCustComp.objPaymentLink.link.is_two_auth || this.objInFromCustComp.objPaymentLink.link.is_two_auth == 1;
    }
    if ( this.objInFromCustComp.isInvoice ) {
      if ( !this.objInFromCustComp.objInvoiceExperience ) {
        return true;
      }
      return this.objInFromCustComp.objInvoiceExperience.is_two_auth || this.objInFromCustComp.objInvoiceExperience.is_two_auth == 1;
    }
  }
}


//   http://localhost:4200//invoice/26c75860-9401-11e8-b397-85d3c6d581fd
