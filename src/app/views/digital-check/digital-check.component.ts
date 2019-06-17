import { Component, OnInit } from '@angular/core';
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
import {MessagesService} from '../../_services/messages.service';
import { Spinkit } from 'ng-http-loader';
import {JqueryService} from '../../_services/jquery.service';
import {UserService} from '../../_services/user.service';

declare var Plaid: any;

@Component({
  selector: 'app-digital-check',
  templateUrl: './digital-check.component.html',
  styleUrls: ['./digital-check.component.css']
})
export class DigitalCheckComponent implements OnInit {

  public spinkit = Spinkit;
  public host: string = environment.host;
  public isValidPayLink = true;
  public isSignature = false;
  public messageReason = '';
  public signature = '';
  public modalRef: NgbModalRef;
  public objDigitCheck: any = {
    verifyCodeSend: false,
    bankAccountType: 'checking',
    acceptPolicy: false,
    accountType: ''
  };
  public objPaymentLink: any = {};
  public objMoneyFrom: any = {};
  public objAccount: any = {};
  public objBankInfo: any = {};
  public objFutureUser: any = {};
  public objSenderUser: any = {};
  public isLoading = false;
  public isCheckValid = true;
  public isCheckPrinted = false;
  public isCheckCanseled = false;
  public isCheckProcess = false;
  public isCheckExpired = false;
  public isCheckPrintedInSession = false;
  public maskPhone: any = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public lstAccounts: any = [];
  public objCurAccount: any = {};
  public isExistUser = false;
  public objExistUser: any = {};
  public backButtonContent: any;
  public thankyouMessage = '';
  public intErrorSeconds = 60000;
  public objLink: any = environment.link;
  protected objCheckExperience: any = null;

  public verifyPhoneFormGroup: FormGroup;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private authenticationService: AuthenticationService,
    private router: ActivatedRoute,
    public utility: Utility,
    private bankRoutingService: BankRoutingService,
    private _formBuilder: FormBuilder,
    public messages: MessagesService,
    private route: Router,
    public jqueryService: JqueryService,
    public userService: UserService,
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

    const pay_token = this.router.snapshot.paramMap.get('pay_token');
    this.verifyPayLInk(pay_token);

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

  pasteCode(code: string = '' ) {
    if (code.length != 4) {
      return;
    }
    const vm = this;
    code.split('').forEach( function( elem, id ) {
      const fieldName = 'pin_part_' + ( id + 1 );
      vm.verifyPhoneFormGroup.controls[fieldName].patchValue(elem);
    });
    this.jqueryService.setFocus('#pin_part_4' );

  }

  setThankYouMessage(bRedirect: boolean = false, url: string = '' ) {
    this.closeModal();
    localStorage.setItem('thankyou_page_message', this.thankyouMessage);
    if (bRedirect ) {
      window.location.href = url;
    }
  }

  verifyPayLInk( pay_token: string ) {
    this.errorService.clearAlerts();
    const objRequest = {
      pl_token: pay_token
    };
    this.http.get<any>(this.host + '/dwl/customer/payment-link/valid', {params: objRequest })
      .subscribe(
        response => {
          if (response.success) {
            this.isCheckPrintedInSession = true;
            this.isValidPayLink = true;
            if( response.check_experience ) {
              this.objCheckExperience = response.check_experience;
            }
            if (response.signature) {
              this.signature = response.signature;
              this.isSignature = true;
            } else {
              this.signature = response.user.name;
              this.isSignature = false;
            }
            this.objPaymentLink = response.payment_link;
            this.objMoneyFrom = response.user;
            this.objAccount = response.account || {};
            this.objBankInfo = response.bank_info || {};
            this.objSenderUser = response.user;
            this.setFirstLastName();
            if ( response.client && response.client_accounts.length ) {
              this.lstAccounts = response.client_accounts;
              this.objCurAccount = response.client_accounts[0];
              this.isExistUser = true;
              this.objExistUser = response.client || {};
              this.objExistUser.masked_phone = response.client_masked_phone;
              this.objDigitCheck.accountType = this.objExistUser.type;
            }
            if ( response.check ) {
              const status = response.check.status.toLowerCase();
              this.isCheckPrinted = status == 'printed';
              this.isCheckCanseled = status == 'cancelled';
              this.isCheckProcess = status == 'pending';
              this.isCheckExpired = status == 'expired';
              this.isCheckPrintedInSession = !this.isCheckPrinted;
            }
            if ( this.isCheckPrinted || this.isCheckCanseled || this.isCheckProcess || this.isCheckExpired ) {
              this.isCheckValid = false;
            }
          }
        },
        err => {
          if (err.error) {
            this.isValidPayLink = this.isCheckValid = this.isCheckExpired = this.isCheckPrinted = false;
            this.errorService.getMessageError( err.error, 10000000 );
          }
        }
      );
  }

  setFirstLastName() {
    const arrNames = this.objPaymentLink.name.split(' ');
    this.objDigitCheck.firstName = arrNames[0] ? arrNames[0] : '';
    this.objDigitCheck.lastName = arrNames[1] ? arrNames[1] : '';
  }

  selectAnotherBankAccount() {
    this.objCurAccount = this.lstAccounts[ this.objDigitCheck.account_id ];
  }

  getDateFormat(strDate: string ) {
    return this.utility.getDateFormat(strDate );
  }

  openModal(content: any, contentBack: any = null) {
    this.errorService.clearAlerts();
    if ( this.modalRef ) {
      this.modalRef.close();
    }
    if (contentBack ) {
      this.backButtonContent = contentBack;
    }
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  openBackModal(content: any = null) {
    this.errorService.clearAlerts();
    if ( this.modalRef ) {
      this.modalRef.close();
    }

    if ( this.backButtonContent ) {
      this.modalRef = this.modalService.open( this.backButtonContent, { backdrop: 'static' } );
      this.backButtonContent = null;
    } else if ( content ) {
      this.modalRef = this.modalService.open(content, { backdrop: 'static' });
    }
  }

  closeModal() {
    this.modalRef.close();
  }

  openDialogPlaid(modalContent: any) {
    this.errorService.clearAlerts();
    const objPalidCreds = <any> environment.plaid;
    const vm = this;
    this.userService.setFingerPrintBrowser();

    objPalidCreds.onSuccess = function( publickToken: string, objAccountInfo: any ) {
      vm.objDigitCheck.mask = objAccountInfo.account.mask;
      vm.objDigitCheck.bank_name = objAccountInfo.institution.name;
      vm.isLoading = true;
      vm.http.post<any>(vm.host + '/user/customer/client/register/payment-link/plaid', {
          account_id: objAccountInfo.account_id,
          public_token: publickToken,
          pl_token: vm.objPaymentLink.pl_token,
          email: vm.objPaymentLink.email,
          atype: vm.objDigitCheck.accountType,
          phone: vm.verifyPhoneFormGroup.value.phone,
          phone_pin: vm.verifyPhoneFormGroup.value.phone_pin,
          acceptPolicy: vm.objDigitCheck.acceptPolicy,
          name: vm.objDigitCheck.firstName + ' ' + vm.objDigitCheck.lastName,
          fpb: vm.authenticationService.getFingerPrintBrowser(),
          browser: vm.authenticationService.browComponent,
          ipAddress: localStorage.getItem('ipClient') || null
        })
      .subscribe(
        response => {
          if (response.success) {
            vm.isCheckValid = false;
            vm.isCheckProcess = true;
            vm.isLoading = false;
            vm.objFutureUser = response;
            vm.openModal(modalContent);
            vm.userService.setFingerPrintBrowser();
          }
        },
        errResponse => {
          vm.isLoading = false;
          if (errResponse.error) {
            vm.errorService.getMessageError(errResponse.error, vm.intErrorSeconds);
          }
        }
      );
    };

    objPalidCreds.onExit = function() {
      vm.isLoading = false;
    };

    const PlaidInstance = new Plaid.create( objPalidCreds );
    PlaidInstance.open();
  }

  printCheck() {
    this.http.get<any>(this.host + '/check/payment-link/mobile/download/' + this.objPaymentLink.pl_token )
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.isCheckPrinted = true;
          }
        },
        errResponse => {
          this.isLoading = false;
          if (errResponse.error) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
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
      this.authenticationService.verifyPhoneCodeForAuthUser(this.objExistUser.u_token, this.verifyPhoneFormGroup.value.phone_pin)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.openModal(modalContent, contentBank);
            }
          },
          err => {
            if ( err.error.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    } else {
      this.authenticationService.verifyEmailCode(this.objPaymentLink.email, this.verifyPhoneFormGroup.value.phone_pin)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.openModal(modalContent, contentBank);
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

  onAccept( modalContent: any = null, backModalContent: any = null ) {
    this.openModal(modalContent, backModalContent);
    this.jqueryService.setFocus('#pin_part_1' );
    this.sendVerifyCode();
  }

  sendVerifyCode(bIsForExistUser: boolean = false) {
    this.errorService.clearAlerts();
    this.objDigitCheck.verifyCodeSend = true;
    this.clearVirifyCode();
    if (bIsForExistUser ) {
      this.verifyPhoneFormGroup.reset();
      this.authenticationService.sendVerifyPhoneCodeForAuthUser(this.objExistUser.u_token)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if ( err.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    } else {
      this.authenticationService.sendVerifyCodeToEmail(this.objPaymentLink.email)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if ( err.error ) {
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
              this.objDigitCheck.bank_name = response.bankInfo.name;
            }
          },
          errResponse => {
            console.log(errResponse);
          }
        );
  }

  hasLastName() {
    const arrNames = this.objPaymentLink.name.split(' ');
    return !!arrNames[1];
  }

  signUpByPayLink(content: any, contentBack: any = null, isFromConfirmPopup: boolean = false ) {
    this.errorService.clearAlerts();

    if (this.objDigitCheck.accountNumber != this.objDigitCheck.cAccountNumber ) {
      this.errorService.getMessageError( {message: 'Account Number does not match the confirm Account Number.'} );
      return;
    }

    this.isLoading = true;

    this.userService.setFingerPrintBrowser();

    const objRequestSignUp = this.objDigitCheck;
    objRequestSignUp.phone = this.verifyPhoneFormGroup.value.phone || this.objExistUser.phone;
    objRequestSignUp.phone_pin = this.verifyPhoneFormGroup.value.phone_pin;
    objRequestSignUp.pl_token = this.objPaymentLink.pl_token;
    objRequestSignUp.email = this.objPaymentLink.email;
    objRequestSignUp.atype = this.objDigitCheck.accountType || this.objExistUser.type;
    objRequestSignUp.accountType = this.objDigitCheck.accountType || this.objExistUser.type;
    objRequestSignUp.name = objRequestSignUp.firstName + ' ' + objRequestSignUp.lastName;
    objRequestSignUp.ipAddress = localStorage.getItem('ipClient') || null;
    if (this.isExistUser && isFromConfirmPopup ) {
      objRequestSignUp.acceptPolicy = true;
      objRequestSignUp.fs_token = this.objCurAccount.dwl_fs_token;
    }

    this.authenticationService.signUpByPaymentLink( objRequestSignUp )
      .subscribe(
        result => {
          const objResp = <any>result;
          if (objResp.success) {
            this.isCheckValid = false;
            this.isCheckProcess = true;
            this.isLoading = false;
            this.objFutureUser = objResp;
            this.openModal(content, contentBack);
            this.userService.setFingerPrintBrowser();
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

  // buttonDeposit: "Deposit the Check 123"
  // buttonPrint: "Print and Deposit 123"
  // is_online_deposit: 1
  // is_print_deposit: 1
  // is_two_auth: 1
  // logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoA"
  // title: "Securely send and receive digital checks online. 123"

  haveCustomLogo() {
    return this.objCheckExperience && this.objCheckExperience.logo && this.objCheckExperience.logo != '';
  }
  getCustomLogo() {
    return this.objCheckExperience.logo;
  }

  getCustomTitle() {
    return this.objCheckExperience && this.objCheckExperience.title != ''
      ? this.objCheckExperience.title : 'Securely send and receive digital checks online.';
  }

  haveOnlineDeposit() {
    if ( !this.objCheckExperience ) {
      return true;
    }
    return this.objCheckExperience && (this.objCheckExperience.is_online_deposit == 1 || this.objCheckExperience.is_online_deposit);
  }
  getLabelOnlineDeposit() {
    return this.objCheckExperience && this.objCheckExperience.buttonDeposit != '' ? this.objCheckExperience.buttonDeposit : 'Deposit the Check Online';
  }
  getLabelPrintDeposit() {
    return this.objCheckExperience && this.objCheckExperience.buttonPrint != '' ? this.objCheckExperience.buttonPrint : 'Print and Deposit the Check';
  }
  havePrintDeposit() {
    if ( !this.objCheckExperience ) {
      return true;
    }
    return this.objCheckExperience && ( this.objCheckExperience.is_print_deposit == 1 || this.objCheckExperience.is_print_deposit );
  }
  requireTwoAuth() {
    if ( !this.objCheckExperience ) {
      return true;
    }
    return this.objCheckExperience && ( this.objCheckExperience.is_two_auth == 1 || this.objCheckExperience.is_two_auth);
  }

  getClassForPrintButton() {
    if ( this.haveOnlineDeposit() && this.havePrintDeposit() && !this.isCheckPrinted ) {
      return 'col-md-6 col-sm-12 text-left col-lg-6';
    }
    if ( ( !this.haveOnlineDeposit() && this.havePrintDeposit() ) || this.isCheckPrinted ) {
      return 'col-12 text-center';
    }
  }

  getClassForOnlineDepositButton() {
    if (this.haveOnlineDeposit() && this.havePrintDeposit()) {
      return 'col-lg-6 col-md-6 col-sm-12 text-right';
    }
    if ( this.haveOnlineDeposit() && !this.havePrintDeposit() ) {
      return 'col-12 text-center';
    }
  }
}
