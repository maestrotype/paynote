import {Component, OnInit, ViewChild, TemplateRef, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {Uploader} from '../../_helpers/uploader/uploader';
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {PlaidClientService} from '../../_services/plaid-client.service';
import {JqueryService} from '../../_services/jquery.service';
import {BankRoutingService} from '../../_services/bank-routing.service';
import {MessagesService} from '../../_services/messages.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {AuthenticationService} from '../../auth.service';
import {Utility} from '../../_helpers/utility';
import {ActivatedRoute} from '@angular/router';
import {DialogService} from '../../_services/dialog.service';
import {CurrencyPipe} from '@angular/common';

declare var Plaid: any;

@Component({
  selector: 'app-funding-sources',
  templateUrl: './funding-sources.component.html',
  styleUrls: ['./funding-sources.component.css'],
  providers: [ErrorService]
})

export class FundingSourcesComponent implements OnInit {

  @ViewChild('selectTypeAddFundingSource')
  private selectTypeAddFundingSource: TemplateRef<any>;

  @Input() objMerchant: any = {};

  public host: string = environment.host;
  public loading = false;
  public isAdminControl = false;
  public limitCountFSBank = false;
  public limitCountFSBalance = false;
  public limitingCountFSBank: number;
  public lstMerchantFundSources: any = [];
  public lstModalFundSources: any = [];
  public backButtonContent: any;
  public modelNewFundSource: FormGroup;
  public _dwl_token: string;
  public _u_token: string;
  public fltNegativeBalanse: any = 0.00;
  public subDomen: string = environment.subDomen;

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

  public objFundingSourcesComp: any = {
    action: <string> '',
    modelSetReserve: <any> {
      reserve_with_cap: 0
    }
  };

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private router: ActivatedRoute,
    public dialog: MatDialog,
    public uploaderService: Uploader,
    public userService: UserService,
    public errorService: ErrorService,
    public _plaidService: PlaidClientService,
    private bankRoutingService: BankRoutingService,
    public messages: MessagesService,
    public _jqueryService: JqueryService,
    public topAlertsService: TopAlertsService,
    private authenticationService: AuthenticationService,
    public utility: Utility,
    private _formBuilder: FormBuilder,
    public dialogService: DialogService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit() {

    if ( this.objMerchant.settings ) {
      this.objMerchant.disable_transfer_to_bank = this.objMerchant.disable_transfer_to_bank !== 1;
      if ( this.objMerchant.reserve_with_cap === 1 || this.objMerchant.reserve_with_cap === 0 ) {
        this.objFundingSourcesComp.modelSetReserve.reserve_with_cap = this.objMerchant.reserve_with_cap;
        if ( this.objMerchant.reserve_with_cap === 1) {
          this.objFundingSourcesComp.modelSetReserve.amount_cap = this.objMerchant.settings.amount_reserve;
          this.objFundingSourcesComp.modelSetReserve.percent_cap = this.objMerchant.settings.percent_cap;
        } else {
          this.objFundingSourcesComp.modelSetReserve.amount = this.objMerchant.settings.once_amount_reserve;
        }
      }
    }
    this.objFundingSourcesComp.action = this.router.snapshot.paramMap.get('action');
    this._dwl_token = this.router.snapshot.paramMap.get('dwl_token');
    this._u_token = this.router.snapshot.paramMap.get('u_token');
    this._dwl_token && this._u_token ? this.isAdminControl = true : this.isAdminControl = false;

    this.utility.debugValue(this.objMerchant, 'objMerchant from BankAccounts');

    this.modelNewFundSource = this._formBuilder.group({
      name: ['', Validators.compose([
        Validators.required
      ])
      ],
      bankAccountType: ['checking', Validators.compose([
        Validators.required
      ])
      ],
      dwl_token: [this.userService.getDwlToken()],
      u_token: [this.userService.getToken()],
      routingNumber: ['', Validators.compose([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ])
      ],
      accountNumber: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(17)
      ])
      ],
      re_account_number: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(17)
      ])
      ]
    });

    this.errorService.clearAlerts();
    this.getMerchantFundSources(this.userService.getDwlToken());
    if (this.userService.isClient() || this.userService.isCustomer() || this.userService.isMerchant()) {
      this.limitingCountFSBank = 2;
    }
    if (this.userService.isAdmin() || this.userService.isSuperAdmin()) {
      this.limitingCountFSBank = 2;
    }

    if (this.objFundingSourcesComp.action && this.objFundingSourcesComp.action === 'add') {
      setTimeout(() => {
        if (this.userService.getCountBankAccount() >= 2 ) {
          const objDataDialog = {
            text: this.messages.get('YOU_MUST_REMOVE_BANK_ACCOUNT'),
            button_confirm_text: 'Close'
          };
          this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
            if (result) {}
          });
        } else {
          this.openDialog(this.selectTypeAddFundingSource);
        }
      }, 500);
    }
  }

  removeFundSource(idFundSource: string | string[]) {
    this.loading = true;
    this.errorService.clearAlerts();

    let url = '/dwl/customer/funding-source/remove';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/remove';
    }
    if (this.userService.isAdmin() || this.userService.isSuperAdmin()) {
      url = '/dwl/funding-source/remove';
    }

    this.http.post<any>(this.host + url, {fundingsource: idFundSource, u_token: this.userService.getToken()})
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_REMOVED_SUCCESSFULLY'));
            this.getMerchantFundSources(this.userService.getDwlToken(), true);
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

  verifyFundingSourcesBank(idFundSource: string | string[]) {
    this.loading = true;
    this.errorService.clearAlerts();

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
          if (errResponse.error) {
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  openAddSourceModal(content: any) {
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
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

  openDialogRemoveFSModal(content: any, fs_obj: any) {
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
    this.objRemoveFSId = fs_obj;
  }
  openDialogVerifiedFSModal(content: any, fs_obj: any) {
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
    this.objRemoveFSId = fs_obj;
  }

  openDialog(content: any, contentBack: any = null) {
    this.errorService.clearAlerts();
    if (!this.userService.checkAvailableActions('addBankAccount')) {
      return;
    }
    this.closeModal();
    if (contentBack) {
      this.backButtonContent = contentBack;
    }
    this.modalRef = this.modalService.open(content);
  }

  openBackModal(content: any = null) {
    this.errorService.clearAlerts();
    this.closeModal();
    if (this.backButtonContent) {
      this.modalRef = this.modalService.open(this.backButtonContent);
    } else if (content) {
      this.modalRef = this.modalService.open(content);
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
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
    setTimeout(() => this.getMerchantFundSources(this.userService.getDwlToken(), true), 800);
  }

  canRemoveBankAccount(objAccount: any = null) {
    if (!objAccount) {
      return false;
    }

    if (objAccount.account && objAccount.account.primary === 1 && objAccount.status === 'verified') {
      return false;
    }

    return this.limitCountFSBank;
  }


  openDialogPlaid() {
    const vm = this;
    this.loading = true;
    this.errorService.clearAlerts();
    let objPalidCreds = <any> environment.plaid;  // plaidSandbox
    if (this.userService.isApiSandBoxMode()) {
      objPalidCreds = <any> environment.plaidSandbox;
    }

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
              vm.getMerchantFundSources(vm.userService.getDwlToken(), true);
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
    this.errorService.clearAlerts();
    this.bankRoutingService.getBankInfo(this.modelNewFundSource.value.routingNumber)
      .subscribe(
        response => {
          if (response.success) {
            this.modelNewFundSource.patchValue({name: response.bankInfo.name});
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.modelNewFundSource.patchValue({name: ''});
            this.loading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }

        }
      );
  }

  transferToBank() {
    this.loading = true;
    this.http.post<any>(this.host + '/user/merchant/release/balance', {
      fs_token: this.modelTransferToBank.fundingsource_bank,
      amount: this.modelTransferToBank.amount,
      u_token: this.userService.isAdmin() || this.userService.isSuperAdmin() ? this._u_token : this.userService.getToken()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('TRANSFER_TO_BANK_SUCCESSFULLY'));
            this.getMerchantFundSources(this.userService.getDwlToken(), true);
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
    this.loading = true;
    const u_token = this.userService.isSuperAdmin() || this.userService.isAdmin() ? this._u_token : this.userService.getToken();
    const objRequest = {
      fs_token: this.modelAddToBalance.fundingsource_bank,
      amount: this.modelAddToBalance.amount,
      u_token: u_token
//      description: this.modelAddToBalance.description
    };

    this.http.post<any>(this.host + '/check/transfer/balance/recharge', objRequest )
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('ADD_TO_BALANCE_SUCCESSFULLY'));
            this.getMerchantFundSources(this.userService.getDwlToken(), true);
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

  setReserveToBalance() {
    this.loading = true;
    const u_token = this._u_token;
    const objRequest = <any> {
      u_token: u_token,
      disable_transfer_to_bank: 1,
      reserve_with_cap: this.objFundingSourcesComp.modelSetReserve.reserve_with_cap
    };
    if ( this.objFundingSourcesComp.modelSetReserve.reserve_with_cap === 0 ) {
      objRequest.fs_token = this.objFundingSourcesComp.modelSetReserve.fundingsource_bank;
      objRequest.amount = this.objFundingSourcesComp.modelSetReserve.amount;
    }
    if ( this.objFundingSourcesComp.modelSetReserve.reserve_with_cap === 1 ) {
      objRequest.amount = this.objFundingSourcesComp.modelSetReserve.amount_cap;
      objRequest.percent_cap = this.objFundingSourcesComp.modelSetReserve.percent_cap;
    }

    this.http.post<any>(this.host + '/user/merchant/reserve/balance', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('SET_RESERV_BALANCE_SUCCESSFULLY'));
            this.getMerchantFundSources(this.userService.getDwlToken(), true);
            this.objMerchant.disable_transfer_to_bank = false;
            scrollTo(0, 20);
            if ( this.objFundingSourcesComp.modelSetReserve.reserve_with_cap == 0 ) {
              this.objMerchant.settings.once_amount_reserve = this.objFundingSourcesComp.modelSetReserve.amount;
              this.objMerchant.settings.disable_transfer_to_bank = 0;
            }
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

  releaseReserve( bDisableTransferToBank: boolean = false, bIsReleaseReserve: boolean = true ) {
    this.loading = true;
    const message = bIsReleaseReserve ? this.messages.get('RESERVE_RELEASED_SUCCESSFULLY')
      : 'Availability of the button "Transfer to bank" changed successfully';
    const title = bIsReleaseReserve ? 'Reserve release for this merchant'
      : !bDisableTransferToBank ? 'Disable of the button "Transfer to bank"' : 'Enable of the button "Transfer to bank"';

    const objDataDialog = {
      title: title,
      text: 'Are you sure?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        const objRequest = { u_token: this._u_token, disable_transfer_to_bank: !bDisableTransferToBank ? 1 : 0 };

        this.http.post<any>(this.host + '/user/merchant/balance2bank/enable', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.loading = false;
                this.topAlertsService.popToast('success', 'Success', message);
                if ( bIsReleaseReserve ) {
                  this.objMerchant.disable_transfer_to_bank = !this.objMerchant.disable_transfer_to_bank;
                }
                this.objFundingSourcesComp.modelSetReserve.reserve_with_cap = 0;
                this.objMerchant.settings.once_amount_reserve = 0;
                this.objMerchant.settings.disable_transfer_to_bank = 1;
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
      } else {
        this.loading = false;
        if ( !bIsReleaseReserve ) {
          this.objMerchant.disable_transfer_to_bank = !this.objMerchant.disable_transfer_to_bank;
        }
      }
    });
  }

  makePrimaryFounSource(foundSourceToken: string) {
    this.loading = true;
    let url = '/dwl/customer/funding-source/primary';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/primary';
    }
    this.http.post<any>(this.host + url, {
      u_token: this.userService.getToken(),
      fundingsource: foundSourceToken,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('FUNDING_SOURCE_MAKING_AS_PRIMARY_SUCCESSFULLY'));
            this.getMerchantFundSources(this.userService.getDwlToken(), true);
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

  checkBalance( objFundSource: any = null ) {
    const objRequest = {
      fs_token: objFundSource.id
    };

    this.http.get<any>(this.host + '/dwl/customer/funding-source/balance', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'Success', 'Balance: ' + this.currencyPipe.transform(response.balance, '', 'symbol'));
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
    let utoken = <string> this.userService.getToken();
    if (this.isAdminControl) {
      utoken = this._u_token;
    }
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    let url = '/dwl/customer/funding-source/list';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/list';
    }
    if (this.userService.isSuperAdmin() && !this.isAdminControl) {
      url = '/dwl/account/funding-sources/list';
    }
    const vm = this;
    if (!this.lstMerchantFundSources.length || bForse) {
      this.http.get<any>(this.host + url, {params: {removed: '0', u_token: utoken}})
        .subscribe(
          response => {
            if (response.success) {
              vm.lstModalFundSources = [];
              let bankLength = 0;
              response.list.forEach(function (bank: any) {
                if (bank.type === 'bank') {
                  vm.lstModalFundSources.push( bank );
                  if (bankLength === 0 ) {
                    vm.modelAddToBalance.fundingsource_bank = bank.id;
                  }
                  bankLength += 1;
                }
                if (bank.type === 'balance') {
                  vm.fltNegativeBalanse = vm.subDomen === 'paynote' ? Math.abs(bank.balance.value) : 100;
                  vm.modelAddToBalance.amount = vm.subDomen === 'paynote' ?  Math.abs(bank.balance.value) : 100;
                  vm.limitCountFSBalance = true;
                }
              });
              if (bankLength >= this.limitingCountFSBank) {
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

  isFSVerified(status) {
    return status === 'verified';
  }

  addFundSources() {
    this.errorService.clearAlerts();
    if (this.modelNewFundSource.value.accountNumber !== this.modelNewFundSource.value.re_account_number) {
      this.errorService.getMessageError({message: this.messages.get('ACCOUNT_NUMBER_AND_RE-ENTER_ACCOUNT')});
      return;
    }
    this.loading = true;

    let url = '/dwl/customer/funding-source/create';
    if (this.userService.isClient() || this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/create';
    }
    if (this.userService.isAdmin() || this.userService.isSuperAdmin()) {
      url = '/dwl/account/funding-source/create';
    }
    this.http.post<any>(this.host + url, this.modelNewFundSource.value)
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

}
