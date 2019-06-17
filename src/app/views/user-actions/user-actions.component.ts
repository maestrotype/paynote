import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../_services/user.service';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../_services/messages.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {ErrorService} from '../../_services/error.service';
import {MatDialog} from '@angular/material';
import {BankRoutingService} from '../../_services/bank-routing.service';
import {AuthenticationService} from '../../auth.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UploadDoc} from '../../_helpers/upload-doc';
import {Uploader} from '../../_helpers/uploader/uploader';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {validateBirthDate} from '../../_vaidators/birthDate';
import {StatesService} from '../../_services/states.service';
import {NgProgress, NgProgressRef} from '@ngx-progressbar/core';

declare var Plaid: any;

@Component({
  selector: 'app-user-actions',
  templateUrl: './user-actions.component.html',
  styleUrls: ['./user-actions.component.css'],
  providers: [ErrorService]
})
export class UserActionsComponent implements OnInit {

  minDate = new Date(1918, 0, 1);

  public host: string = environment.host;
  public loading: boolean;
  formDataDocument: any = {};
  public isUSA = false;
  public lstMerchantDocuments: any = [];
  public modalRef: NgbModalRef;
  public isLoading = false;
  public objReloginPopup: any = {
    showloginAlert: false,
    log_sec: 9000
  };
  public modelVerifyFundSource: any = {
    account: {}
  };

  public backButtonContent: any;
  public modelNewFundSource: any = {
    name: '',
    bankAccountType: 'checking',
    routingNumber: '',
    accountNumber: '',
    re_account_number: '',
    dwl_token: ''
  };
  addBeneficialFormGroup: FormGroup;
  arrStates: any;
  arrCountries: any;
  arrCountriesPassport: any;

  public intervalTimerCountDown: any;
  public intervalTimerSession: any;

  public verifyPhoneForm: FormGroup;
  public errorFileType = false;
  public errorFileSize = false;
  public objUserActionsComp: any = {
    showMoreText: <boolean> true
  };

  @ViewChild('foundingSourcesVerifiedDialog')
  private foundingSourcesVerifiedDialog: TemplateRef<any>;

  @ViewChild('verifyVoiceCodeDialog')
  private verifyVoiceCodeDialog: TemplateRef<any>;

  progressRef: NgProgressRef;

  constructor(
    private http: HttpClient,
    public userService: UserService,
    private modalService: NgbModal,
    public uploaderService: Uploader,
    public dialog: MatDialog,
    public errorService: ErrorService,
    public messages: MessagesService,
    public utility: Utility,
    public jqueryService: JqueryService,
    private bankRoutingService: BankRoutingService,
    public authenticationService: AuthenticationService,
    public topAlertsService: TopAlertsService,
    private _formBuilder: FormBuilder,
    public _stateService: StatesService,
    public ngProgress: NgProgress
  ) {}

  ngOnInit() {
    this.progressRef = this.ngProgress.ref('myProgress');
    this.arrStates = this._stateService.arrStates;
    this.arrCountries = this._stateService.arrCountrise;
    this.arrCountriesPassport = this._stateService.arrCountrise;

    this.addBeneficialFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      ssn: ['', Validators.required],
      dateOfBirth: ['', Validators.compose([Validators.required, validateBirthDate])],
      address1: ['', Validators.required],
      address2: [''],
      dwl_owner_token: [''],
      country: ['US', Validators.required],
      stateProvinceRegion: ['', Validators.required],
      stateProvinceRegionNotUS: ['', Validators.required],
      countryPassport: ['', Validators.required],
      postalCode: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
    });

    this.verifyPhoneForm = this._formBuilder.group({
      phone_pin: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)])]
    });

    this.changeBeneficialCountry('US');

    if (!this.userService.isGhostLogin && environment.subDomen !== 'local' ) {
      setTimeout(() => this.initReloginModule(), 5000);
    }
  }

  eventClickMoreInfo() {
    this.jqueryService.toggleWraper('#wrapp_info_need');
    this.objUserActionsComp.showMoreText = !this.objUserActionsComp.showMoreText;
  }

  openDialogModal(content: any) {
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
  }

  onImageChangeFromFile(event: any = null) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/tif') {
        this.errorFileType = false;
      } else {
        this.errorFileType = true;
        this.topAlertsService.popToast('error', 'Error', 'The file must be either a .jpg, .jpeg, .png, .tif, or .pdf');
      }
      if (file.size < 10485760) {
        this.errorFileSize = false;
      } else {
        this.errorFileSize = true;
        this.topAlertsService.popToast('error', 'Error', 'The file size must be either up to 10MB');
      }
    }
  }

  onFileChange() {
    this.loading = true;
    const uploadFile = (<HTMLInputElement> window.document.getElementById('payNoteDocUpload')).files[0];
    const url = '/dwl/customer/document/create';
    this.progressRef.start();
    const PayNoteUploadItem = new UploadDoc(uploadFile, this.userService, url);
    PayNoteUploadItem.formData = <any> {type: this.formDataDocument.type, u_token: this.userService.getToken()};
    this.uploaderService.onSuccessUpload = (item, response, status, headers) => {
      this.progressRef.complete();
      this.loading = false;
    };
    this.uploaderService.onErrorUpload = (item, response, status, headers) => {
      this.progressRef.complete();
      this.loading = false;
      if (status === 503) {
        this.topAlertsService.popToast('error', 'Error', 'The file must be either a .jpg, .jpeg, .png, .tif, or .pdf up to 10MB in size.');
      } else {
        this.topAlertsService.popToast('error', 'Error', response.message);
      }
    };
    this.uploaderService.onCompleteUpload = (item, response, status, headers) => {
      this.progressRef.complete();
      this.loading = false;
      this.closeModal();
      if ( status === 200 ) {
        this.topAlertsService.popToast('success', 'Success', this.messages.get('DOCUMENT_UOLOADED_SUCCESSFULLY'));
      }
      this.lstMerchantDocuments = '';

      if (status === 413) {
        this.topAlertsService.popToast('error', 'Error', this.messages.get('DOCUMENT_UOLOADED_ERROR'));
      }

      scrollTo(0, 20);
    };
    this.uploaderService.upload(PayNoteUploadItem);
  }

  public profileInfoVerifyEmail() {
    this.errorService.clearAlerts();
    this.http.post<any>(this.host + '/user/email/verification', {
      email: this.userService.getEmail()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'Success', response.message);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  initReloginModule() {
    if (this.userService.isGhostLogin) {
      return;
    }

    console.log('initReloginModule');

    this.objReloginPopup.log_sec = 180;
    console.log( this.objReloginPopup.log_sec );
    this.intervalTimerCountDown = setInterval(() => {
      if ( this.objReloginPopup.log_sec <= 0 && this.userService.isLogined() ) {
        console.log( this.objReloginPopup.log_sec );
        console.log( 'this.objReloginPopup.log_sec <= 0' );
        this.jqueryService.closeModal('.alert-relogin-modal');
        this.objReloginPopup.showloginAlert = false;
        this.userService.clearUser();
        this.authenticationService.logout('From initReloginModule');
        this.clearIntervals();
      }
      if (this.objReloginPopup.log_sec >= 0 && this.objReloginPopup.log_sec <= 180 ) {
        this.objReloginPopup.log_sec -= 1;
      }
    }, 1000);

    const helperJwtservice = new JwtHelperService();
    const decodedToken = helperJwtservice.decodeToken(this.userService.getAuthToken());

    this.intervalTimerSession = setInterval(() => {
      if (!this.userService.isLogined()) {
        console.log('!this.userService.isLogined()');
        if (this.objReloginPopup.showloginAlert) {
          this.clearIntervals();
          this.jqueryService.closeModal('.alert-relogin-modal');
          this.objReloginPopup.showloginAlert = false;
          this.authenticationService.logout();
        }
        if (!this.userService.getToken() && !this.isGuestUrl()) {
          this.userService.redirectJustSimple('/login');
        }
        return;
      }

      const t = Date.now();
      const exp = decodedToken.exp * 1000;
      console.log( 'expire sec -> ' +  exp);
      const d = (exp - t) / 1000;
      const sec = Math.round(d);
      this.objReloginPopup.log_sec = sec;
      console.log( 'sesion sec -> ' +  sec);
      console.log( 'lastActive ->' + this.userService.lastActive);
      console.log( 'time -> ' + t);
      console.log( 'time diferent -> ' + (t - this.userService.lastActive));
      console.log( 'time refresh -> ' + (15 * 60 * 1000));

      if ( sec < 180 && this.userService.isLogined() ) { // 180000 / 180
        if (this.userService.isGhostLogin ) {	//      if (sec < 800) { // 180000 / 180
          return this.clearIntervals();
        }

        this.objReloginPopup.log_sec = sec;
        this.objReloginPopup.showloginAlert = true;
        console.log('show modal');
        this.jqueryService.showModal('.alert-relogin-modal', {backdrop: 'static', keyboard: false, showClose: true});

        console.log((t - this.userService.lastActive) < 15 * 60 * 1000);
        if ((t - this.userService.lastActive) < 15 * 60 * 1000 && this.userService.isLogined() ) { // 15 * 60 * 1000
          console.log('if (t - this.userService.lastActive) < 15 * 60 * 1000 && this.userService.isLogined()');
          this.userService.refreshClient();
        }

        if (sec <= 0) {
          console.log( ' if (sec <= 0) {');
          this.clearIntervals();
          this.jqueryService.closeModal('.alert-relogin-modal');
          this.authenticationService.logout();
        }
        console.log( this.objReloginPopup );
      }
    }, 60000);
  }

  clearIntervals() {
    this.objReloginPopup.log_sec = 180;
    window.clearInterval(this.intervalTimerCountDown );
    window.clearInterval(this.intervalTimerSession );
    console.log( this.intervalTimerCountDown );
    console.log( this.intervalTimerSession );
  }

  refreshUser() {
    console.log('refreshUser');
    this.jqueryService.closeModal('.alert-relogin-modal');
    this.userService.lastActive = Date.now();
    this.userService.refreshClient();
    this.clearIntervals();
    setTimeout(() => this.initReloginModule(), 3000);
  }

  isGuestUrl() {
    const url = location.pathname;
    if (url.indexOf('login') || url.indexOf('sign-up') || url.indexOf('create-password')
      || url.indexOf('reset-password') || url.indexOf('check') || url.indexOf('invoice')
      || url.indexOf('confirm-email')) {
      return true;
    }

    return false;
  }

  isShowFundingSourceSetupOnLoad() {
    return !this.userService.isHaveBankAccount() && this.userService.isFilledInfoForDwolla()
      && this.userService.isMerchant() && this.userService.isPasswordSet()
      && this.userService.isEmailConfirmation() && !this.userService.isDwollaSuspended() ? true : false;
  }

  // temporarily tern off
  isShowAdditionalVerificationCode() {
    let bIsReqAdditVerification = false;
    if ( this.userService.isMerchant() && this.userService.isAdditionalVerificationRequired() ) {
      bIsReqAdditVerification = true;
    }

    return bIsReqAdditVerification;
  }

  callAction(objWarMessage: any = {}) {
    switch (objWarMessage.action) {
      case 'verify_funding_source':
        this.modelVerifyFundSource = objWarMessage;
        this.openDialog(this.foundingSourcesVerifiedDialog);
        break;
      case 'verify_voice_code':
        console.log( this.modalRef );
        this.authenticationService.sendVerifyVoiceCode(this.userService.getToken() ).subscribe(
          result => {
            this.loading = false;
            const objResp = <any> result;
            console.log(objResp );
            if (objResp.success) {
              this.errorService.getMessageSuccess(objResp);
            }
            return false;
          },
          err => {
            this.loading = false;
            if (err.error) {
              this.topAlertsService.popToast('error', 'Error', err.error.message);
            }
          }
        );
        this.openDialog(this.verifyVoiceCodeDialog);
        break;
    }
  }

  verifyVoiceCode() {
    this.authenticationService.verifyVoiceCode( this.userService.getToken(), this.verifyPhoneForm.value.phone_pin ).subscribe(
      result => {
        this.loading = false;
        const objResp = <any> result;
        console.log(objResp );
        if (objResp.success) {
          this.topAlertsService.popToast('success', 'Success', 'Additional verification was successful');
          this.closeModal();
          this.userService.reInitClient();
        }
        return false;
      },
      err => {
        this.loading = false;
        if (err.error) {
          this.topAlertsService.popToast('error', 'Error', err.error.message);
        }
      }
    );
  }

  openDialog(content: any, contentBack: any = null) {
    this.errorService.clearAlerts();
    this.closeModal();
    if (contentBack) {
      this.backButtonContent = contentBack;
    }
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  verifyFundingSourcesBank() {
    this.loading = true;
    this.errorService.clearAlerts();
    this.http.post<any>(this.host + '/dwl/funding-source/verify', {
      fundingsource: this.modelVerifyFundSource.data.fs_token,
      amount1: parseFloat(this.modelVerifyFundSource.amount1.replace('$', '')),
      amount2: parseFloat(this.modelVerifyFundSource.amount2.replace('$', ''))
    })
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_VERIFY_SUCCESSFULLY'));
            this.userService.reInitClient();
            setTimeout(() => this.initActionsAfterVerifyFundingSources(), 1000);
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  initActionsAfterVerifyFundingSources() {

//    if (this.userService.isClient() && !this.userService.isFilledInfoForDwolla()) {
//      this.jqueryService.showModal('.onboarding-in-dwolla-modal.modal', {backdrop: 'static', keyboard: false, showClose: true})
//    } else {
      location.reload();
//    }
  }

  closePopupForAddFoundSources( bAddClassToBody: boolean = false ) {
    this.closeModal();
    this.jqueryService.closeModal('.funding-source-setup-modal.modal');
    if ( bAddClassToBody ) {
      setTimeout(() => this.jqueryService.addClass('body', 'modal-open'), 500);
    }
  }

  openDialogPlaid() {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.loading = true;
    this.errorService.clearAlerts();
    let objPalidCreds = <any> environment.plaid;
    if (this.userService.isApiSandBoxMode()) {
      objPalidCreds = <any> environment.plaidSandbox;
    }
    const vm = this;
    objPalidCreds.onSuccess = function (publickToken: string, objAccountInfo: any) {
      let url = '/dwl/customer/funding-source/plaid/create';
      if (vm.userService.isClient() || vm.userService.isCustomer()) {
        url = '/dwl/client/funding-source/plaid/create';
      }
      vm.http.post<any>(vm.host + url, {
        account_id: objAccountInfo.account_id,
        public_token: publickToken,
        u_token: vm.userService.getToken()
      })
        .subscribe(
          response => {
            vm.loading = false;
            if (response.success) {
              vm.userService.reInitClient();
              vm.closePopupForAddFoundSources();
              vm.topAlertsService.popToast('success', 'Success', vm.messages.get('FUNDING_SOURCE_ADDED_SUCCESSFULLY'));
              scrollTo(0, 20);
            }
          },
          errResponse => {
            vm.loading = false;
            if (errResponse.error) {
              vm.loading = false;
              vm.topAlertsService.popToast('error', 'Error', errResponse.error.message);
            }
          }
        );
    };

    objPalidCreds.onExit = function () {
      vm.loading = false;
    };

    const PlaidInstance = new Plaid.create(objPalidCreds);
    PlaidInstance.open();
  }

  getBankRouting() {
    this.bankRoutingService.getBankInfo(this.modelNewFundSource.routingNumber)
      .subscribe(
        response => {
          if (response.success) {
            this.modelNewFundSource.name = response.bankInfo.name;
          }
        }
      );
  }

  addFundSources() {
    this.errorService.clearAlerts();
    if (this.modelNewFundSource.accountNumber !== this.modelNewFundSource.re_account_number) {
      this.errorService.getMessageError({message: this.messages.get('ACCOUNT_NUMBER_AND_RE-ENTER_ACCOUNT')});
      return;
    }
    this.loading = true;
    this.modelNewFundSource.dwl_token = this.userService.getDwlToken();
    this.modelNewFundSource.u_token = this.userService.getToken();

    let url = '/dwl/customer/funding-source/create';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/create';
    }
    this.http.post<any>(this.host + url, this.modelNewFundSource)
      .subscribe(
        response => {
          if (response.success) {
            this.closePopupForAddFoundSources();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_ADDED_SUCCESSFULLY'));
            this.userService.reInitClient();
            scrollTo(0, 20);
          }
        },
        errResponse => {
          this.loading = false;
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }
  changeBeneficialCountry(country: any) {
    if (country === 'US') {
      this.isUSA = true;
      this.addBeneficialFormGroup.controls['ssn'].enable();
      this.addBeneficialFormGroup.controls['stateProvinceRegion'].enable();
      this.addBeneficialFormGroup.controls['stateProvinceRegionNotUS'].disable();
      this.addBeneficialFormGroup.controls['countryPassport'].disable();
      this.addBeneficialFormGroup.controls['number'].disable();
    } else {
      this.isUSA = false;
      this.addBeneficialFormGroup.controls['ssn'].disable();
      this.addBeneficialFormGroup.controls['stateProvinceRegion'].disable();
      this.addBeneficialFormGroup.controls['stateProvinceRegionNotUS'].enable();
      this.addBeneficialFormGroup.controls['countryPassport'].enable();
      this.addBeneficialFormGroup.controls['number'].enable();
    }
  }
  getDateFullFormat(objDate: Date) {
    if (objDate) {
      const intDay = objDate.getDate() > 9 ? objDate.getDate() : '0' + objDate.getDate();
      const intMonth = objDate.getMonth() + 1 > 9 ? objDate.getMonth() + 1 : '0' + (objDate.getMonth() + 1);
      const intFullYear = objDate.getFullYear();
      return intFullYear + '-' + intMonth + '-' + intDay;
    }

    return '';
  }
  addNewBeneficialOwner() {
    this.errorService.clearAlerts();
    this.isLoading = true;
    const objRequest = <any> {
      address: {}
    };
    objRequest.dateOfBirth = this.getDateFullFormat(this.addBeneficialFormGroup.value.dateOfBirth);
    objRequest.u_token = this.userService.getToken();
    objRequest.firstName = this.addBeneficialFormGroup.value.firstName;
    objRequest.lastName = this.addBeneficialFormGroup.value.lastName;
    objRequest.address.address1 = this.addBeneficialFormGroup.value.address1;
    objRequest.address.address2 = this.addBeneficialFormGroup.value.address2;
    objRequest.address.city = this.addBeneficialFormGroup.value.city;
    objRequest.address.country = this.addBeneficialFormGroup.value.country;
    objRequest.address.postalCode = this.addBeneficialFormGroup.value.postalCode;
    objRequest.dwl_owner_token = this.addBeneficialFormGroup.value.dwl_owner_token;

    if (this.isUSA) {
      objRequest.ssn = this.addBeneficialFormGroup.value.ssn;
      objRequest.address.stateProvinceRegion = this.addBeneficialFormGroup.value.stateProvinceRegion;
      delete objRequest.passport;
    } else {
      delete objRequest.ssn;
      delete objRequest.address.stateProvinceRegion;
      objRequest.passport = <any> {};
      objRequest.passport.number = this.addBeneficialFormGroup.value.postalCode;
      objRequest.passport.country = this.addBeneficialFormGroup.value.countryPassport;
      objRequest.address.stateProvinceRegion = this.addBeneficialFormGroup.value.stateProvinceRegionNotUS;

    }
    this.http.post<any>(this.host + '/dwl/customer/beneficial-owner/create', objRequest).subscribe(
      response => {
        if (response.success) {
          this.userService.reInitClient();
          this.topAlertsService.popToast('success', 'Success', this.messages.get('ADD_BENEFICIAL_OWNER'));
          this.closeModal();
          this.isLoading = false;
          scrollTo(0, 20);
          this.userService.redirectJustSimple('/account', true, {tab_name: 'profile'});
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.isLoading = false;
          this.errorService.getMessageError(errResponse.error);
        }
      }
    );
  }

}
