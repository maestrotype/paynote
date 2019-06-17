import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {Uploader} from '../../_helpers/uploader/uploader';
import {UploadDoc} from '../../_helpers/upload-doc';
import {UserService} from '../../_services/user.service';
import {StatesService} from '../../_services/states.service';
import {PlaidClientService} from '../../_services/plaid-client.service';
import {JqueryService} from '../../_services/jquery.service';
import {BankRoutingService} from '../../_services/bank-routing.service';
import {MessagesService} from '../../_services/messages.service';
import {Utility} from '../../_helpers/utility';
import {conformToMask} from 'angular2-text-mask';
import {AuthenticationService} from '../../auth.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {DialogService} from '../../_services/dialog.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {validateBirthDate} from '../../_vaidators/birthDate';
import {NgProgress, NgProgressRef} from '@ngx-progressbar/core';
import {DomSanitizer} from '@angular/platform-browser';

declare var Plaid: any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  minDate = new Date(1918, 0, 1);

  public host: string = environment.host;
  public loading: boolean;
  public listTransactions: any;
  public limitCountFSBank = false;
  public errorFileType = false;
  public errorFileSize = false;
  public limitingCountFSBank = 2;
  public countDocument: boolean;
  public lstMerchantFundSources: any = [];
  public lstMerchantDocuments: any = [];
  public lstOwnerDocuments: any = [];
  public lstBeneficialOwner: any = [];
  public modelNewFundSource: any;
  public modelUpdateInfo: any;
  public isLoading = false;
  public subscriptionInfo: any = null;
  public isInvoice = false;
  public backButtonContent: any;
  public tabName = '';
  public action = '';
  public tabAction = '';
  public isUSA = false;
  public blockAddOwner = false;
  public idBeneficialOwner = '';
  public verifyOwnerStatus = false;

  public objAccountComp: any = {
    certifyOwnerStatus: <boolean> false,
    verifyOwnerStatus: <boolean> false,
    objExternApp: <any> {
      live_endpoint: <string>environment.api.live_endpoint,
      sandbox_endpoint: <string>environment.api.sandbox_endpoint
    },
    canShowEmailSettings: <boolean> environment.availableEmailSettings && this.userService.isMerchant(),
    cloneMerchantObject: <any> {}
  };


  public objUserInfo: any = {};
  public objUserInfoForUpdate: any = {};
  public objRemoveFSId: any;
  public listTansferToBank: any;
  public modalRef: NgbModalRef;

  modelVerifyFundSource: any = {};
  modelTransferToBank: any = {};
  modelAddToBalance: any = {};
  formDataDocument: any = {};
  modelNewBeneficialOwner: any = {};
  arrStates: any;
  arrCountries: any;
  arrCountriesPassport: any;

  addBeneficialFormGroup: FormGroup;

  public conformedPhoneNumber = conformToMask(
    this.userService.getPhone(),
    this.utility.maskPhone,
    {guide: false}
  );

  @ViewChild('selectTypeAddFundingSource')
  private selectTypeAddFundingSource: TemplateRef<any>;

  @ViewChild('addDocumentDialog')
  private addDocumentDialog: TemplateRef<any>;

  @ViewChild('viewOwnerDocuments')
  private viewOwnerDocuments: TemplateRef<any>;

  progressRef: NgProgressRef;

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public uploaderService: Uploader,
    public userService: UserService,
    public _stateService: StatesService,
    public _plaidService: PlaidClientService,
    private bankRoutingService: BankRoutingService,
    public _jqueryService: JqueryService,
    public messages: MessagesService,
    private authenticationService: AuthenticationService,
    public utility: Utility,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService,
    private _formBuilder: FormBuilder,
    public ngProgress: NgProgress,
    public domSanitizer: DomSanitizer
  ) {
    this.loading = false;
    this.countDocument = false;
    this.modelUpdateInfo = {
      email: '',
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      website: '',
    };
    this.modelNewFundSource = {
      name: '',
      bankAccountType: 'checking',
      routingNumber: '',
      accountNumber: '',
      re_account_number: '',
      dwl_token: ''
    };

  }

  ngOnInit() {
    this.progressRef = this.ngProgress.ref('myProgress');
    if (!this.userService.isIndividualAccount() && this.userService.isController() ) {
      this.getBeneficialOwner();
    }
    this.tabName = this.router.snapshot.paramMap.get('tab_name');
    this.tabAction = this.router.snapshot.paramMap.get('action');

    if (!this.tabName) {
      this._jqueryService.addClass('#show_tab_details', 'active');
      this.getUserInfo(this.userService.getDwlToken());
    } else {
      setTimeout(() => this.initAccount(), 500);
    }

    this.arrStates = this._stateService.arrStates;
    //    this.arrStatesPassport = this._stateService.arrStates
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
    this.changeBeneficialCountry('US');

  }

  initAccount() {
    this._jqueryService.addClass('#show_tab_' + this.tabName, 'active');
    this._jqueryService.addClass('#tab_' + this.tabName, 'active');
    switch (this.tabName) {
      case 'profile':
        //      this.getBeneficialOwner()
        if (!this.userService.isIndividualAccount() && this.userService.isController()) {
          this.getBeneficialOwner();
        }
        this.getUserInfo(this.userService.getDwlToken());
        break;
      case 'documents':
        this.getMerchantDocuments();
        break;
      case 'beneficial_owner':
        this.getBeneficialOwner();
        break;
      case 'plan':
        this.getMerchantPlan();
        break;
    }
  }

  isPersonal() {
    return this.objUserInfo.type == 'personal';
  }

  isBussines() {
    return this.objUserInfo.type == 'business';
  }

  getMerchantPlan() {
    this.subscriptionInfo = this.userService.getSubscription();
    this.isInvoice = true;
  }

  getUserInfo(id: string | string[]) {
    this.getMerchantPlan();
    let url = '/dwl/customer/retrieve';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/retrieve';
    }
    if (!this.objUserInfo.email) {
      this.http.get<any>(this.host + url, {params: {dwl_token: id}})
        .subscribe(
          response => {
            if (response.success) {
              this.objUserInfo = <any> response.customer;
              if (this.objUserInfo.controller) {
                this.objUserInfo.first_name = this.objUserInfo.controller.firstName;
                this.objUserInfo.last_name = this.objUserInfo.controller.lastName;
              }

              this.utility.debugValue(this.objUserInfo, 'objUserInfo');
            }
          },
          errResponse => {
            if (errResponse.error) {
              this.loading = false;
              this.utility.getMessageError(errResponse.error);
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
          }
        );
    }
  }

  removeFundSource(idCust: string | string[], idFundSource: string | string[]) {
    this.loading = true;

    let url = '/dwl/customer/funding-source/remove';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/remove';
    }

    this.http.post<any>(this.host + url, {fundingsource: idFundSource, u_token: this.userService.getToken()})
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_REMOVED_SUCCESSFULLY'));
            this.getMerchantFundSources(idCust, true);
            scrollTo(0, 20);
            this.limitCountFSBank = false;
            this.reInitClient();
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  verifyFundingSourcesBank(idCust: string | string[], idFundSource: string | string[]) {
    this.loading = true;

    this.http.post<any>(this.host + '/dwl/funding-source/verify', {
      fundingsource: idFundSource,
      amount1: parseFloat(this.modelVerifyFundSource.amount1.replace('$', '')),
      amount2: parseFloat(this.modelVerifyFundSource.amount2.replace('$', ''))
    })
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_VERIFY_SUCCESSFULLY'));
            this.reInitClient();
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getStatusVerifiedFSBank(idFundSource: string | string[]) {
    this.http.post<any>(this.host + '/dwl/funding-source/verify/status', {fundingsource: idFundSource})
      .subscribe(
        response => {
          if (response.success) {}
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  openDialogTransferToBankModal(content: any, fs_obj: any, listTansferToBank: any) {
    this.modalRef = this.modalService.open(content);
    this.objRemoveFSId = fs_obj;
    const a = [];
    listTansferToBank.forEach(function (item) {
      if (item['type'] === 'bank') {
        a.push(item);
      }
    });
    this.listTansferToBank = a;
  }
  openDialogAddToBalanceModal(content: any, fs_obj: any, listAddToBalance: any) {
    this.modalRef = this.modalService.open(content);
    this.objRemoveFSId = fs_obj;
    const a = [];
    listAddToBalance.forEach(function (item) {
      if (item['type'] === 'bank') {
        a.push(item);
      }
    });
    this.listTansferToBank = a;
  }
  openDialogModal(content: any) {
    this.modalRef = this.modalService.open(content);
  }

  openDialog(content: any, contentBack: any = null) {
    if (!this.userService.checkAvailableActions('addBankAccount')) {
      return;
    }
    this.closeModal();
    if (contentBack) {
      this.backButtonContent = contentBack;
    }
    this.objUserInfoForUpdate = Object.assign({}, this.objUserInfo);
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  openBackModal(content: any = null) {
    this.closeModal();
    if (this.backButtonContent) {
      this.modalRef = this.modalService.open(this.backButtonContent);
    } else if (content) {
      this.modalRef = this.modalService.open(content);
    }
  }

  openDialogPlaid() {
    this.loading = true;
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
              vm.reInitClient();
              vm.closeModal();
              vm.topAlertsService.popToast('success', 'Success', vm.messages.get('FUNDING_SOURCE_ADDED_SUCCESSFULLY'));
              vm.getMerchantFundSources(vm.objUserInfo.id, true);
              scrollTo(0, 20);
            }
          },
          errResponse => {
            vm.loading = false;
            if (errResponse.error) {
              vm.loading = false;
              vm.utility.getMessageError(errResponse.error);
              vm.topAlertsService.popToast('error', 'Error', vm.utility.errorMessage);
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
        },
        errResponse => {
          if (errResponse.error) {
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }

        }
      );
  }


  transferToBank() {
    this.http.post<any>(this.host + '/dwl/customer/transfer/balance-bank', {
      fundingsource_bank: this.modelTransferToBank.fundingsource_bank,
      amount: this.modelTransferToBank.amount,
      u_token: this.userService.getToken()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('TRANSFER_TO_BANK_SUCCESSFULLY'));
            this.getMerchantFundSources(this.objUserInfo.id, true);
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  addToBalance() {
    this.http.post<any>(this.host + '/dwl/customer/transfer/bank-balance', {
      fundingsource_bank: this.modelAddToBalance.fundingsource_bank,
      amount: this.modelAddToBalance.amount,
      u_token: this.userService.getToken()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('ADD_TO_BALANCE_SUCCESSFULLY'));
            this.getMerchantFundSources(this.objUserInfo.id, true);
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getMerchantFundSources(id: string | string[], bForse: boolean = false) {
    let url = '/dwl/customer/funding-source/list';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/list';
    }
    if (!this.lstMerchantFundSources.length || bForse) {
      this.http.get<any>(this.host + url, {params: {removed: '0', u_token: this.userService.getToken()}})
        .subscribe(
          response => {
            if (response.success) {
              const length = response.list.length;
              if (length >= this.limitingCountFSBank) {
                this.limitCountFSBank = true;
              }
              this.lstMerchantFundSources = <any> response.list;
            }
          },
          errResponse => {
            if (errResponse.error) {
              this.loading = false;
              this.utility.getMessageError(errResponse.error);
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
          }
        );
    }
  }

  getMerchantDocuments() {
    if (!this.lstMerchantDocuments.length) {
      this.http.get<any>(this.host + '/dwl/customer/document/list', {params: {u_token: this.userService.getToken()}})
        .subscribe(
          response => {
            if (response.success) {
              let countPendingDocument = 0;
              response.list.forEach(function (elem) {
                if (elem.status == 'pending') {
                  countPendingDocument += 1;
                }
              });
              if (countPendingDocument >= 4) {
                this.countDocument = true;
              }
              this.lstMerchantDocuments = <any> response.list;
            }
          },
          errResponse => {
            if (errResponse.error) {
              this.loading = false;
              this.utility.getMessageError(errResponse.error);
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
          }
        );
    }
  }

  getOwnerDocuments(dwl_owner_token: string = '') {
    this.http.get<any>(this.host + '/dwl/customer/beneficial-owner/document/list', {params: {dwl_owner_token: dwl_owner_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.lstOwnerDocuments = <any> response.list;
            this.openDialog(this.viewOwnerDocuments);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getTransferTimeline( strType: string = '' ) {
    const settings = this.userService.getSettings();
    if ( strType == 'receive' ) {
      if (!settings.receive_limit.delayed || settings.receive_limit.delayed == 0) {
        return settings.receive_limit.next_day == 1 ? 'Next Day(T+1)' : 'Standard(T+4)';
      }
      if (settings.receive_limit.delayed > 0) {
        return 'Funding to Balance Account (T+4)';
      }
    }
    if ( strType == 'send' ) {
      if (!settings.send_limit.delayed || settings.send_limit.delayed == 0) {
        return settings.send_limit.next_day == 1 ? 'Next Day(T+1)' : 'Standard(T+4)';
      }
      if (settings.send_limit.delayed > 0) {
        return 'Funding to Balance Account (T+4)';
      }
    }
  }


  updateMerchantInfo() {
    const objRequest = Object.assign({}, this.objUserInfoForUpdate);
    objRequest.dwl_token = this.objUserInfoForUpdate.id;
    objRequest.u_token = this.userService.getToken();
    objRequest.firstName = this.objUserInfoForUpdate.first_name;
    objRequest.lastName = this.objUserInfoForUpdate.last_name;
    objRequest.postalCode = this.objUserInfoForUpdate.postal_code;
    delete objRequest.postal_code;
    delete objRequest.last_name;
    delete objRequest.first_name;
    delete objRequest.controller;
    delete objRequest.business_name;

    let url = '/dwl/customer/update';
    if (this.userService.isClient()) {
      url = '/dwl/client/update';
    }
    this.http.post<any>(this.host + url, objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('MERCHANT_UPDATE_INFO_SUCCESSFULLY'));
            this.getUserInfo(this.userService.getDwlToken());
            scrollTo(0, 20);
            this.objUserInfo = <any> response.customer;
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  addFundSources() {
    if (this.modelNewFundSource.accountNumber != this.modelNewFundSource.re_account_number) {
      this.topAlertsService.popToast('error', 'Error', this.messages.get('ACCOUNT_NUMBER_AND_RE-ENTER_ACCOUNT'));
      return;
    }
    this.loading = true;
    this.modelNewFundSource.dwl_token = this.objUserInfo.id;
    this.modelNewFundSource.u_token = this.userService.getToken();

    let url = '/dwl/customer/funding-source/create';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/create';
    }
    this.http.post<any>(this.host + url, this.modelNewFundSource)
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_ADDED_SUCCESSFULLY'));
            this.reInitClient();
            scrollTo(0, 20);
          }
        },
        errResponse => {
          this.loading = false;
          if (errResponse.error) {
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  reInitClient() {
    if (this.userService.isGhostLogin) {
      this.authenticationService.retrieveUser(this.userService.getToken())
        .subscribe(
          response => {
            const objGhostUser: any = response;
            if (objGhostUser) {
              objGhostUser.token = this.userService.getAuthToken();
              localStorage.setItem('currentUser', JSON.stringify(objGhostUser));
            }
          }
        );
    } else {
      this.userService.reLogin();
    }
    setTimeout(() => this.userService.initUser(), 500);
    setTimeout(() => this.getMerchantFundSources(this.objUserInfo.id, true), 800);
  }

  isVerified() {
    if (this.objUserInfo) {
      return this.objUserInfo.status == 'verified';
    }
  }
  isFSVerified(status) {
    return status == 'verified';
  }

  // ******************************* BeneficialOwner *****************************************************


  openDialogAddUpdateBeneficialOwner(content: any, fs_obj: any, action: string) {
    if (action == 'edit') {

      const objInfoOwner = <any> {
        firstName: fs_obj.firstName,
        lastName: fs_obj.lastName,
        address1: fs_obj.address.address1,
        address2: fs_obj.address.address2,
        city: fs_obj.address.city,
        country: fs_obj.address.country,
        postalCode: fs_obj.address.postalCode,
        dwl_owner_token: fs_obj.id
      };
      this.changeBeneficialCountry(fs_obj.address.country);
      if (fs_obj.country == 'US') {
        objInfoOwner.stateProvinceRegion = fs_obj.address.stateProvinceRegion;

      } else {
        objInfoOwner.stateProvinceRegionNotUS = fs_obj.address.stateProvinceRegion;
      }

      this.addBeneficialFormGroup.patchValue(
        objInfoOwner
      );

    }
    if (action == 'add') {

    }
    this.action = action;
    this.modalRef = this.modalService.open(content);
    setTimeout(() => this._jqueryService.removeClass('.modal-body .ng-valid', 'ng-valid'), 10);
  }

  prepareUploadDocForBeneficialOwner(idBeneficialOwner: string = '') {
    this.idBeneficialOwner = idBeneficialOwner; // dwl_owner_token
    this.openDialog(this.addDocumentDialog);
  }

  prepareViewDocForBeneficialOwner(idBeneficialOwner: string = '') {
    this.lstOwnerDocuments = [];
    this.getOwnerDocuments(idBeneficialOwner);
  }

  onImageChangeFromFile(event: any = null) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type == 'application/pdf' ||
        file.type == 'image/png' ||
        file.type == 'image/jpg' ||
        file.type == 'image/jpeg' ||
        file.type == 'image/tif') {
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
    let url = '/dwl/customer/document/create';
    if (this.idBeneficialOwner != '') {
      url = '/dwl/customer/beneficial-owner/document/create';
    }
    this.progressRef.start();
    const PayNoteUploadItem = new UploadDoc(uploadFile, this.userService, url);
    const objRequest = <any> {type: this.formDataDocument.type, u_token: this.userService.getToken()};
    if (this.idBeneficialOwner != '') {
      objRequest.dwl_owner_token = this.idBeneficialOwner;
    }
    PayNoteUploadItem.formData = objRequest;  // (optional) form data can be sent with file
    this.uploaderService.onSuccessUpload = () => {
      this.progressRef.complete();
      this.loading = false;
    };
    this.uploaderService.onErrorUpload = (item, response, status) => {
      this.progressRef.complete();
      this.loading = false;
      if (status == 503) {
        this.topAlertsService.popToast('error', 'Error', 'The file must be either a .jpg, .jpeg, .png, .tif, or .pdf up to 10MB in size.');
      } else {
        this.topAlertsService.popToast('error', 'Error', response.message);
      }
    };
    this.uploaderService.onCompleteUpload = (item, response, status) => {
      this.progressRef.complete();
      this.loading = false;
      if (status == 200) {
        this.closeModal();
        this.topAlertsService.popToast('success', 'Success', this.messages.get('DOCUMENT_UOLOADED_SUCCESSFULLY'));
        this.lstMerchantDocuments = '';
        if (this.idBeneficialOwner == '') {
          this.getMerchantDocuments();
          this.userService.reInitClient();
        } else {
          this.getBeneficialOwner();
          this.certifyBeneficialOwner();
        }
        this.idBeneficialOwner = '';

      }
      if (status == 413) {
        this.topAlertsService.popToast('error', 'Error', this.messages.get('DOCUMENT_UOLOADED_ERROR'));
      }

      scrollTo(0, 20);
    };

    this.uploaderService.upload(PayNoteUploadItem);
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
    this.isLoading = true;

    let url = '/dwl/customer/beneficial-owner/create';
    let successMessage = this.messages.get('ADD_BENEFICIAL_OWNER');
    if (this.action == 'edit') {
      url = '/dwl/customer/beneficial-owner/update';
      successMessage = this.messages.get('UPDATED_BENEFICIAL_OWNER');
    }

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
    this.http.post<any>(this.host + url, objRequest).subscribe(
      response => {
        if (response.success) {
          this.userService.reInitClient();
          this.topAlertsService.popToast('success', 'Success', successMessage);
          this.closeModal();
          this.isLoading = false;
          scrollTo(0, 20);
          this.getBeneficialOwner();
          this.certifyBeneficialOwner();
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.isLoading = false;
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      }
    );
  }

  certifyBeneficialOwner() {
    this.http.post<any>(this.host + '/dwl/customer/beneficial-owner/certify', {u_token: this.userService.getToken()}).subscribe(
      response => {
        if (response.success) {
          this.topAlertsService.popToast('success', 'Success', this.messages.get('CERTIFY_BENEFICIAL_OWNER'));
          this.closeModal();
          this.isLoading = false;
          scrollTo(0, 20);
          this.statusCertifiedBeneficialOwner();
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.isLoading = false;
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      }
    );
  }

  removeBeneficialOwner(beneficialId: any = null) {
    this.isLoading = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: this.messages.get('REMOVE_BENEFICIAL_OWNER_TEXT'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_remove')
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/dwl/customer/beneficial-owner/remove', {
          dwl_owner_token: beneficialId,
          u_token: this.userService.getToken()
        }).subscribe(
          response => {
            if (response.success) {
              this.userService.reInitClient();
              this.topAlertsService.popToast('success', 'Success', this.messages.get('REMOVE_BENEFICIAL_OWNER'));
              this.isLoading = false;
              scrollTo(0, 20);
              this.getBeneficialOwner();
              this.statusCertifiedBeneficialOwner();
            }
          },
          errResponse => {
            if (errResponse.error) {
              this.isLoading = false;
              this.utility.getMessageError(errResponse.error);
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
          }
        );
      }
    });
  }

  statusCertifiedBeneficialOwner() {
    this.authenticationService.getStatusCertifiedBeneficialOwner(this.userService.getToken())
      .subscribe(
        status => {
          if (status) {
            if ((status == 'recertify' || status == 'uncertified') && !this.objAccountComp.verifyOwnerStatus
              && this.lstBeneficialOwner.length) {
              this.objAccountComp.certifyOwnerStatus = true;
            } else {
              this.objAccountComp.certifyOwnerStatus = false;
            }
            if (status == 'certified') {
              this.userService.isCertifiedBeneficialOwner = true;
            } else if (!this.lstBeneficialOwner.length) {
              this.userService.isCertifiedBeneficialOwner = false;
            }
          }
        }
      );
  }

  getBeneficialOwner() {
    const url = this.userService.isMerchant() ? '/dwl/customer/beneficial-owner/list' : '/dwl/client/beneficial-owner/list';
    this.http.get<any>(this.host + url, {params: {u_token: this.userService.getToken()}})
      .subscribe(
        response => {
          let bNotVerify = false;
          if (response.success) {
            response.list.forEach(function (item) {
              if (item.verificationStatus != 'verified') {
                bNotVerify = true;
              }
            });

            this.objAccountComp.verifyOwnerStatus = bNotVerify;
            response.list.length >= 4 ? this.blockAddOwner = true : this.blockAddOwner = false;
            this.lstBeneficialOwner = <any> response.list;
            this.statusCertifiedBeneficialOwner();
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  change2FAAuth() {
    this.isLoading = true;
    const bAvailable2FA = this.userService.isEnable2FA();
    const objRequest = {
      u_token: this.userService.getToken(),
      enable: bAvailable2FA ? 0 : 1
    };

    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + ( bAvailable2FA ? 'disable' : 'enable' ) + ' Two Factor Authentication',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability( bAvailable2FA ? 'confirm_disable_pay_link' : 'confirm_enable_pay_link'),
      checkbox_confirm: false,
    };



    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/user/twofa/enable', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.userService.reInitClient();
                this.isLoading = false;
                this.topAlertsService.popToast('success', 'Success', 'Two Factor Authentication successfully '
                  + (bAvailable2FA ? 'disabled' : 'enabled') + '');
              }
            },
            err => {
              if (err.error) {
                this.isLoading = false;
                this.utility.getMessageError( err.error );
                this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
              }
            }
          );
      } else {
        this.isLoading = false;
      }
    });
  }

  getCloneMerchantObject() {
    if ( !this.objAccountComp.cloneMerchantObject.id ) {
      this.objAccountComp.cloneMerchantObject = Object.assign({}, this.userService.getUser());
    }
    return this.objAccountComp.cloneMerchantObject;
  }
}
