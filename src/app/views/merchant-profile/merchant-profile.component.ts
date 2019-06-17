import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Uploader} from '../../_helpers/uploader/uploader';
import {UserService} from '../../_services/user.service';
import {PlaidClientService} from '../../_services/plaid-client.service';
import {JqueryService} from '../../_services/jquery.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {DialogService} from '../../_services/dialog.service';
import {StatesService} from '../../_services/states.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Utility} from '../../_helpers/utility';


@Component({
  selector: 'app-merchant-profile',
  templateUrl: './merchant-profile.component.html',
  styleUrls: ['./merchant-profile.component.css'],
  providers: [PaginationService],
})
export class MerchantProfileComponent implements OnInit {

  public host: string;
  public subDomen: string = environment.subDomen;
  public loading: boolean;
  public isVer: boolean;
  public isUnver: boolean;
  public isBusiness: boolean;
  public showBankAccounts = false;
  public showBillingInfo = false;
  public showListTransactions = false;
  public showListFailedPayments = false;
  public _dwl_token: string;
  public _u_token: string;
  public newPrimaryPlan = '';
  public typeSame = '';
  public modelUpdateInfo: any;
  public isLoading = false;
  public subscriptionList: any = [];
  public primarySubscription: any = {};
  public newPlanDetails: any = {};
  public note: any = {};
  public objPreviewDocument: any;
  public isPreviewDocumentPDF = false;
  public listPlans: any = [];
  public listBilling: any = [];
  public listInvoiceDeatils: any = [];
  public listSameFingerprints: any = [];
  public listSameBankAccounts: any = [];
  public lstMerchantDocuments: any = [];
  public userEmailHistoryList: any = [];
  public listSameIP: any = [];
  public listSameInModal: any = [];
  public objMerchantProfile: any = {
    isReview: <boolean> false,
    isPersSignUpLock: <boolean> false
  };

  arrStates: any;
  public merchantObject: any = {
    settings: {
      receive_limit: {},
      send_limit: {}
    },
    dwl_customer: {}
  };
  public lstUserStatuses: any = [
    'deactivated',
    'reactivated',
    'suspended'
  ];

  public objUserInfo: any;
  public modalRef: NgbModalRef;

  @ViewChild('templateListSame')
  private templateListSame: TemplateRef<any>;

  @ViewChild('showFilePreview')
  private showFilePreview: TemplateRef<any>;

  public objMerchantProfileComp: any = {
    canShowApiTab: <boolean> environment.availableAPIMode,
    externApp: <any> {
      live_endpoint: <string>environment.api.live_endpoint,
      sandbox_endpoint: <string>environment.api.sandbox_endpoint
    },
    lstLogs: <any> [],
    lstLabelLogs: <any> [],
    lstStatusLogs: <any> [],
    objViewFullLog: <any> {}
  };

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private modalService: NgbModal,
    public uploaderService: Uploader,
    public userService: UserService,
    public _plaidService: PlaidClientService,
    public _jqueryService: JqueryService,
    public paginationService: PaginationService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService,
    public _stateService: StatesService,
    public sanitizer: DomSanitizer,
    public utility: Utility
  ) {
    this.host = environment.host;
    this.loading = false;
    this.isVer = false;
    this.isUnver = true;
    this.isBusiness = false;
    this.modelUpdateInfo = {
      email: '',
      first_name: '',
      last_name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      website: '',
    };
    this.note = {
      textNote: ''
    };
  }

  ngOnInit() {
    this._dwl_token = this.router.snapshot.paramMap.get('dwl_token');
    this._u_token = this.router.snapshot.paramMap.get('u_token');
    this.getUserInfo(this._dwl_token);
    this.getMerchantObject();
  }

  canShowFraudButton() {
    return true; //(this.subDomen != 'paynote' && this.subDomen != 'demo') || this.userService.getEmail() == 'admin_ae141086@mail.ru' ? true : false
  }

  getUserStatus() {
    const status = this.objUserInfo.status;
    let showStatus = status;
    if (status === 'document') {
      const settings = this.merchantObject.settings;
      if (settings && settings.document_status && settings.document_status == 'pending') {
        showStatus = 'Document Pending';
      }
    }

    return showStatus;
  }

  getUserInfo(dwl_token: string | string[]) {

    if (!this.objUserInfo) {
      this.http.get<any>(this.host + '/dwl/customer/retrieve', {params: {dwl_token: dwl_token}})
        .subscribe(
          response => {
            if (response.success) {
              this.objUserInfo = <any> response.customer;
              this.modelUpdateInfo = Object.assign({}, this.objUserInfo);

              if (this.objUserInfo.status == 'verified') {
                this.isVer = false;
                this.isUnver = false;
                this.isBusiness = true;
              }
              if (this.objUserInfo.status == 'verified' && this.objUserInfo.type == 'business') {
                this.isVer = false;
                this.isUnver = false;
                this.isBusiness = false;
              }

              this.utility.debugValue(this.objUserInfo, 'User Info');
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

  openModal(content: any) {
    this.closeModal();
    this.modalRef = this.modalService.open(content);
  }

  openBigModal(content: any) {
    this.closeModal();
    this.modalRef = this.modalService.open(content, {size: 'lg'});
  }

  openCustomModal(content: any, strClass: string = '') {
    this.closeModal();
    this.modalRef = this.modalService.open(content, {size: 'lg', windowClass: strClass});
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  changeMerchantStatus() {
    this.loading = true;

    this.http.post<any>(this.host + '/dwl/customer/update/status', {
      status: this.objUserInfo.status,
      dwl_token: this.objUserInfo.id
    })
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('STATUS_UPDATED'));

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

  updateMerchantInfo() {
    this.loading = true;
    this.modelUpdateInfo.dwl_token = this._dwl_token;
    this.modelUpdateInfo.u_token = this._u_token;
    this.modelUpdateInfo.postalCode = this.modelUpdateInfo.postal_code;
    delete this.modelUpdateInfo.phone;
    delete this.modelUpdateInfo.last_name;
    delete this.modelUpdateInfo.first_name;
    delete this.modelUpdateInfo.controller;
    delete this.modelUpdateInfo.business_name;

    this.http.post<any>(this.host + '/dwl/customer/update', this.modelUpdateInfo)
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('MERCHANT_UPDATE_INFO_SUCCESSFULLY'));

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
  updateEmailMerchant() {
    this.loading = true;
    const objRequest = {
      u_token: this._u_token,
      email: this.modelUpdateInfo.email
    };

    this.http.post<any>(this.host + '/user/email/update', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', 'Merchant email updated successfully');
            this.getMerchantObject();
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

  isVerified() {
    if (this.objUserInfo) {
      if (this.objUserInfo.status == 'verified') {
        return true;
      }
      return false;
    }
  }

  addNotes() {
    this.loading = true;
    this.http.post<any>(this.host + '/user/note/update', {
      u_token: this._u_token,
      note: this.note.textNote
    })
      .subscribe(
        response => {
          if (response.success) {
            this.loading = false;
            this.getMerchantObject();
            this.note.textNote = '';
            this._jqueryService.setFocus('#notes');
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

  getFullName() {
    if (this.objUserInfo.type == 'business') {
      return this.objUserInfo.doing_business_as ? this.objUserInfo.doing_business_as : this.objUserInfo.business_name;
    } else {
      return this.objUserInfo.first_name + ' ' + this.objUserInfo.last_name;
    }
  }

  getUserEmailsHistory() {
    const objRequest = {
      u_token: this._u_token
    };
    this.http.get<any>(this.host + '/user/email/history/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.userEmailHistoryList = <any> response.list.data;
          } else {
            this.userEmailHistoryList = [];
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

  getPlanDetails() {
    const objRequest = {
      u_token: this._u_token
    };
    this.http.get<any>(this.host + '/subscription/list/customer', {params: objRequest})
      .subscribe(
        response => {
          if (response.success && response.list.length) {
            this.isLoading = false;
            this.subscriptionList = <any> response.list;
            this.primarySubscription = response.list[0];
            this.newPrimaryPlan = this.primarySubscription.p_token;
          } else {
            this.subscriptionList = [];
          }
          this.getListPlans();
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

  isBussinesType() {
    if ( this.merchantObject.type && this.merchantObject.type == 'business' ) {
      return true;
    }

    return false;
  }

  getMerchantReachedLimits() {
    this.http.get<any>(this.host + '/user/merchant/remaining/limits',{ params: { u_token: this._u_token } } ).subscribe(
      response => {
        this.merchantObject.limits = response.limits;
      });
  }

  getMerchantObject() {
    this.http.post<any>(this.host + '/user/merchant/retrieve', {u_token: this._u_token})
      .subscribe(
        response => {
          if (response.success) {
            this.getPlanDetails();
            response.user.settings.receive_limit.Enabled = response.user.settings.receive_limit.Enabled ? true : false;
            response.user.settings.send_limit.Enabled = response.user.settings.send_limit.Enabled ? true : false;
            this.merchantObject = response.user;
            if (this.merchantObject.settings == null) {
              this.merchantObject.settings = this.userService.defaultSettings;
            }
            this.initSettingsLimit();
            this.merchantObject.geo_ip = response.geo_ip;
            this.merchantObject.ip_risk = response.ip_risk;
            this.merchantObject.ip_address = response.ip_address;
            this.merchantObject.dwl_customer = response.dwl_customer;
            this.merchantObject.blocked_ip = response.blocked_ip;
            this.merchantObject.machine_learning = response.machine_learning;

            if (this.merchantObject.labels) {
              this.merchantObject.labels.forEach((item) => {
                this.objMerchantProfile.isReview = item == 'Review' ? true : false;
              });
            }

            this.utility.debugValue( this.merchantObject, 'Merchant Object' );
            this.getMerchantReachedLimits();
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

  initSettingsLimit() {
    this.merchantObject.settings.receive_limit.funding_type =
      this.merchantObject.settings.receive_limit.delayed && this.merchantObject.settings.receive_limit.delayed > 0
      ? 'delay'
      : ( this.merchantObject.settings.receive_limit.next_day ? 'next_day' : 'standard' );

    this.merchantObject.settings.send_limit.funding_type =
      this.merchantObject.settings.send_limit.delayed && this.merchantObject.settings.send_limit.delayed > 0
      ? 'delay'
      : ( this.merchantObject.settings.send_limit.next_day ? 'next_day' : 'standard' );
  }

  canShowButtonApproveSignUp() {
    if (this.merchantObject.settings.personal_signup_approve == 0
      // && (this.merchantObject.type == null || this.merchantObject.type == 'personal')
      && this.isHaveLabel('Personal Signup Lock')) {
      return true;
    }
    return false;
  }

  updateMerchantObject() {

    this.merchantObject.settings.receive_limit.Enabled = this.merchantObject.settings.receive_limit.Enabled ? 1 : 0;
    this.merchantObject.settings.send_limit.Enabled = this.merchantObject.settings.send_limit.Enabled ? 1 : 0;

    this.merchantObject.settings.receive_limit.next_day = this.merchantObject.settings.receive_limit.next_day ? 1 : 0;
    this.merchantObject.settings.send_limit.next_day = this.merchantObject.settings.send_limit.next_day ? 1 : 0;

    //console.log(this.merchantObject.settings);
    this.http.post<any>(this.host + '/user/merchant/update', {u_token: this._u_token, settings: this.merchantObject.settings})
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('MERCHANT_LIMITS_UPDATED_SUCCESSFULLY'));

            this.updateLimits();
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

  toogleFraud(objCustomer: any) {
    const seccessText = 'User ' + objCustomer.name + ' set as ' + (objCustomer.fraud ? ' not fraud' : ' fraud');
    const objDataDialog = {
      title: seccessText,
      text: 'Are you sure?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/user/fraud/update', {
          fraud: !objCustomer.fraud,
          u_token: objCustomer.u_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', seccessText + ' successfully');
                this.isLoading = false;
                if ( !objCustomer.fraud ) {
                  objCustomer.status = 'Locked';
                }
                objCustomer.fraud = !objCustomer.fraud;
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
    });
  }

  reviwedUser() {
    const objDataDialog = {
      title: 'Are you sure?',
      text: 'Are you sure you would like to remove Review flag from this merchant?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/user/label/remove', {
          label: 'Review',
          u_token: this.merchantObject.u_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', 'Review flag removed from this merchant');
                this.isLoading = false;

                this.getMerchantObject();
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
    });
  }

  approvePersonalSignUp() {
    const objDataDialog = {
      title: 'Are you sure?',
      text: 'Are you sure you would like to Approve Personal Signup for this merchant?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/customer/personal/signup/approve', {
          u_token: this.merchantObject.u_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', ' Personal Signup Approved for this merchant');
                this.isLoading = false;

                this.getMerchantObject();
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
    });
  }

  blockUnblockUserIp() {
    const url = this.merchantObject.blocked_ip ? '/admin/unblock/ip' : '/admin/block/ip';
    const seccessText = 'IP ' + this.merchantObject.ip_address + (this.merchantObject.blocked_ip ? ' is unblocked' : ' is blocked');
    const objDataDialog = {
      title: (this.merchantObject.blocked_ip ? 'Unblock IP ' : 'Block IP ') + this.merchantObject.ip_address,
      text: 'Are you sure?',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.merchantObject.blocked_ip ? 'Confirm & Unblock' : 'Confirm & Block'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + url, {
          ip_block: this.merchantObject.ip_address,
          u_token: this.merchantObject.u_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', seccessText);
                this.isLoading = false;

                this.getMerchantObject();
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
    });
  }

  updateLimits() {
    if (!this.primarySubscription.remaining) {
      return;
    }
    this.primarySubscription.remaining.next_day = this.primarySubscription.remaining.next_day ? 1 : 0;

    const objRequest = this.primarySubscription;
    this.http.post<any>(this.host + '/subscription/update', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.closeModal();
            this.getPlanDetails();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('COMPANY_LIMIT_SERVICES_UPDATED') );
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

  getListPlans() {
    if (this.listPlans.length) {
      return;
    }
    this.http.get<any>(this.host + '/plan/list/public')
      .subscribe(
        response => {
          if (response.success) {
            if (this.merchantObject.type == 'business') {
              response.list.forEach(function (item, i) {
                if (item.name == 'Individuals') {
                  response.list.splice(i, 1);
                }
              });
            }

            this.isLoading = false;
            this.listPlans = <any> response.list;
            if (!this.newPrimaryPlan && this.listPlans.length) {
              this.newPrimaryPlan = this.listPlans[0].p_token;
            }
            this.getPlanDetailsSettings();
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

  updateMerchandPlan() {
    this.isLoading = true;

    this.http.post<any>(this.host + '/subscription/plan/add', {
      u_token: this._u_token,
      p_token: this.newPrimaryPlan,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.isLoading = false;
            this.topAlertsService.popToast('success', 'Success', this.messages.get('PLAN_UPDATED_SUCCESSFULLY'));
            this.getPlanDetails();

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

  getPlanDetailsSettings() {
    if (!this.newPrimaryPlan) {
      return;
    }
    this.isLoading = true;
    this.http.get<any>(this.host + '/plan/retrieve', {params: {p_token: this.newPrimaryPlan}})
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.newPlanDetails = <any> response.plan;
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

  cancelSubscription() {
    const objDataDialog = {
      title: 'Please confirm',
      text: this.messages.get('CANCEL_SUBSCRIPTION_MESSAGE'),
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm & Cancel'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/subscription/disable', {
          u_token: this.merchantObject.u_token
        }).subscribe(
          response => {
            if (response.success) {
              this.topAlertsService.popToast('success', 'Success', this.messages.get('SUBSCRIPTION_SUCCESSFULLY_CANCELED'));
              this.getPlanDetails();

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
    });
  }

  updateReceiveFundingType( strType: any = null ) {
    // this.merchantObject.settings.receive_limit.next_day = !this.merchantObject.settings.receive_limit.next_day;
    switch ( strType ) {
      case 'delay':
        this.merchantObject.settings.receive_limit.next_day = 0;
        this.merchantObject.settings.receive_limit.delayed = 1;
        break;
      case 'standard':
        this.merchantObject.settings.receive_limit.next_day = 0;
        this.merchantObject.settings.receive_limit.delayed = 0;
        break;
      case 'next_day':
        this.merchantObject.settings.receive_limit.next_day = 1;
        this.merchantObject.settings.receive_limit.delayed = 0;
        break;
    }
  }

  updateSendFundingType( strType: any = null ) {
    // this.merchantObject.settings.send_limit.next_day = !this.merchantObject.settings.send_limit.next_day;
    switch ( strType ) {
      case 'delay':
        this.merchantObject.settings.send_limit.next_day = 0;
        this.merchantObject.settings.send_limit.delayed = 1;
        break;
      case 'standard':
        this.merchantObject.settings.send_limit.next_day = 0;
        this.merchantObject.settings.send_limit.delayed = 0;
        break;
      case 'next_day':
        this.merchantObject.settings.send_limit.next_day = 1;
        this.merchantObject.settings.send_limit.delayed = 0;
        break;
    }
  }

  initListTransactions() {
    this.showListTransactions = true;
  }

  initListFailedPayments() {
    this.showListFailedPayments = true;
  }

  initBillingInfo() {
    this.showBillingInfo = true;
  }

  initBankAccounts() {
    this.showBankAccounts = true;
  }

  initFraud() {
    this.getListSameFingerprint();
    this.getListSameBankAccount();
    this.getListSameIP();
  }

  initDocuments() {
    this.getMerchantDocuments();
  }

  initEventAndLogs() {
    this.getEventAndLogs();
    this.getStatusLogs();
    this.getLabelLogs();
    this.getUserEmailsHistory();
  }


  getStatusLogs( event: any = null ) {
    const objRequest = <any> {
      u_token: this.merchantObject.u_token,
      limit: 10000, //  event ? event.pageSize : this.paginationService.pageSize,
      page: 1, // event ? event.pageNo : this.paginationService.pageNo,
//      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    this.http.get<any>(this.host + '/user/status/history/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objMerchantProfileComp.lstStatusLogs = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
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

  getLabelLogs( event: any = null ) {
    const objRequest = <any> {
      u_token: this.merchantObject.u_token,
      limit: 10000, //  event ? event.pageSize : this.paginationService.pageSize,
      page: 1, // event ? event.pageNo : this.paginationService.pageNo,
//      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    this.http.get<any>(this.host + '/user/label/history/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objMerchantProfileComp.lstLabelLogs = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
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

  getEventAndLogs( event: any = null ) {
    const objRequest = <any> {
      owner: this.merchantObject.email,
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    this.http.get<any>(this.host + '/log/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objMerchantProfileComp.lstLogs = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
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

  viewFullLog( objLog: any = null, content: any = null ) {
    this.objMerchantProfileComp.objViewFullLog = objLog;
    this.openBigModal( content );
  }

  getMerchantDocuments() {
    this.http.get<any>(this.host + '/dwl/customer/document/list', {params: {u_token: this.merchantObject.u_token }})
      .subscribe(
        response => {
          if (response.success) {
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

  getMerchantDocumentByDwlToken(dwl_document_token: string = '' ) {
    const url = this.host + '/dwl/customer/document/download?u_token=' + this.merchantObject.u_token
      + '&dwl_document_token=' + dwl_document_token + '&type=view';
    this.objPreviewDocument = <any> this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.http.get<any>(url)
      .subscribe(
      response => {},
      errResponse => {
        if (errResponse.error.text && errResponse.error.text.indexOf('PDF') >= 0) {
          this.isPreviewDocumentPDF = true;
        }
      }
      );

    this.openBigModal(this.showFilePreview);
  }



  showSameModalList(typeSame: string = '' ) {
    switch ( typeSame ) {
      case 'fingerPrint':
        this.typeSame = 'Fingerprint';
        this.getListSameFingerprint();
        break;
      case 'bankAccount':
        this.typeSame = 'Bank Transfer';
        this.getListSameBankAccount();
        break;
      case 'IP':
        this.typeSame = 'IP';
        this.getListSameIP();
        break;
    }
    this.openBigModal(this.templateListSame);
  }

  getListSameFingerprint() {
    this.listSameInModal = [];
    this.http.get<any>(this.host + '/user/same/fingerprint/list', {params: {u_token: this.merchantObject.u_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.listSameFingerprints = response.list;
            this.listSameInModal = response.list;
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

  getListSameIP() {
    this.listSameInModal = [];
    this.http.get<any>(this.host + '/user/same/ip/list', {params: {u_token: this.merchantObject.u_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.listSameIP = response.list;
            this.listSameInModal = response.list;
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

  getListSameBankAccount() {
    this.listSameInModal = [];
    this.http.get<any>(this.host + '/user/same/account/list', {params: {u_token: this.merchantObject.u_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.listSameBankAccounts = response.list;
            this.listSameInModal = response.list;
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

  canShowResultSearchFraud() {
    return true; //this.userService.getEmail() == 'admin_ae141086@mail.ru' || this.userService.getEmail() == 'sumantaroot@seamlesschEX.com' ? true : false
  }

  getLabelFraudRisk() {
    if (!this.merchantObject.machine_learning) {
      return '';
    }
    const risk = this.merchantObject.machine_learning.risk;
    let risklLabel = '';
    if (risk <= 40) {
      risklLabel = 'Low Risk';
    }
    if (risk > 40 && risk <= 70) {
      risklLabel = 'Medium Risk';
    }
    if (risk > 70) {
      risklLabel = 'High Risk';
    }

    return '<span> ' + risklLabel + ' ' + risk + '%</span>';
  }

  getColorForFraudRisk() {
    if (!this.merchantObject.machine_learning) {
      return '';
    }
    const risk = this.merchantObject.machine_learning.risk;
    if (risk <= 40) {
      return '#43b536';
    }
    if (risk > 40 && risk <= 70) {
      return '#f4ba36';
    }
    if (risk > 70) {
      return '#f44336';
    }
  }

  isHaveLabel(strLabel: any = '') {
    if (!this.merchantObject.labels || !this.merchantObject.labels.length) {
      return false;
    }
    let bHaveLabel = false;
    this.merchantObject.labels.forEach(function (label: string) {
      if (label == strLabel) {
        bHaveLabel = true;
      }
    });

    return bHaveLabel;
  }
}
