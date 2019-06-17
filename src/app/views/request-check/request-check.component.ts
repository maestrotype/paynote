import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CurrencyPipe} from '@angular/common';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';
import {DialogService} from '../../_services/dialog.service';
import {TransactionService} from '../../_services/transaction.service';
import {MessagesService} from '../../_services/messages.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {Uploader} from '../../_helpers/uploader/uploader';
import {UploadDoc} from '../../_helpers/upload-doc';
import {NgProgress, NgProgressRef} from '@ngx-progressbar/core';

@Component({
  selector: 'app-request-check',
  templateUrl: './request-check.component.html',
  styleUrls: ['./request-check.component.css']
})
export class RequestCheckComponent implements OnInit {

  public objSend: any = {
    billing_cycle: 'month',
    recurring: false
  };
  public lstFundSources: any;
  public host: string = environment.host;
  public dateToday = '';
  public isLoading = false;
  public canVoidIncoice = false;
  public selectAllInvoices = false;
  public makeRecurringToggle = false;
  public recurringPeriod = false;
  public errorFileType = false;
  public errorFileSize = false;
  public isNotHaveFunds = false;
  public objDirectDeposit: any = {};
  public modalRef: NgbModalRef;
  public objLoadedCustomer: any = {};
  public listCustomers: any = [];
  public arrayCustomers: any = [];
  public lstInvoices: any = [];
  public pageSize: any;
  public pageNo: any;
  public subDomen: string = environment.subDomen;
  public objRequestCheckComp: any = {
    form: {
      name_placeholder: '',
      name_temp: null
    }
  };
  public storageFilterName = 'paymentRequests';

  sendMoneyForm: FormGroup;

  progressRef: NgProgressRef;
  private $event: any;

  constructor(
    private http: HttpClient,
    public userService: UserService,
    public errorService: ErrorService,
    public jqueryService: JqueryService,
    private _formBuilder: FormBuilder,
    public utility: Utility,
    public dialog: MatDialog,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    public transactionService: TransactionService,
    public messages: MessagesService,
    private currencyPipe: CurrencyPipe,
    public topAlertsService: TopAlertsService,
    public uploaderService: Uploader,
    public ngProgress: NgProgress
  ) {}

  ngOnInit() {
    this.progressRef = this.ngProgress.ref('myProgress');
    this.errorService.clearAlerts();
    this.getCustomersList();
    this.paginationService.searchQuery = '';

    this.sendMoneyForm = this._formBuilder.group({
      autocomplite_name: ['']
    });
    this.initFilter();
  }

  initFilter(): void {
    const objFilter = this.paginationService.getFilterFromLocalStorage(this.storageFilterName);
    if ( objFilter ) {
      // this.objFilter = Object.assign( this.objFilter, objFilter.filter );
      this.paginationService = Object.assign( this.paginationService, objFilter.pagination );
    }
  }

  resetFilter(): void {
    this.paginationService.resetFilterInLocalStorage(this.storageFilterName);
    this.paginationService.searchQuery = '';
    this.paginationService.sortField = 'created_at';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.pageNo = 1;
    this.listInvoices();
  }

  getStatus(invoice: any = {}) {
    let status = '';
    if (invoice.status) {
      switch (invoice.status.toLowerCase()) {
        case 'new':
          status = 'Unpaid';
          break;
        case 'pending':
          status = 'In process';
          break;
        case 'cancelled':
        case 'voided':
          status = 'Void';
          break;
        case 'failed':
          status = 'Failed';
          break;
        case 'printed':
          status = 'Printed';
          break;
        case 'processed':
          status = 'Paid';
          break;
      }
    }

    return status;
  }

  getCustomersList() {
    this.http.get<any>(this.host + '/dwl/customer/owner/customer/list',
      {
        params: {
          u_token: this.userService.getToken(),
          limit: '1000'
        }
      })
      .subscribe(
        response => {
          if (response.success) {
            const tmpArr: any = [];
            this.listCustomers = <any> response.list.data;
            this.listCustomers.forEach(function (elem: any) {
              tmpArr.push(elem.name);
            });
            this.arrayCustomers = tmpArr;
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  resendNotification(invoice: any) {
    this.errorService.clearAlerts();
    this.isLoading = true;

    const objDataDialog = {
      title: 'Please confirm',
      text: this.messages.get('RESENT_NOTIFICATION_CONFIRM_TEXT'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_resend_notification'),
      checkbox_confirm: true,
      checkbox_confirm_text: 'Please confirm',
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        let objRequest: any;
        objRequest = {
          i_token: invoice.i_token
        };
        this.http.get<any>(this.host + '/customer/check/invoice/resend', {params: objRequest})
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess(response, this.messages.get('RESENT_NOTIFICATION_EMAIL'));
                this.isLoading = false;
                scrollTo(0, 20);
              }
            },
            err => {
              if (err.error.error) {
                this.errorService.getMessageError(err.error);
              }
            }
          );
      }
    });
  }

  blurSelect() {
    if ( this.objRequestCheckComp.form.name_temp ) {
      this.objSend.sndr_name = this.objRequestCheckComp.form.name_temp;
      this.objRequestCheckComp.form.name_placeholder = this.objRequestCheckComp.form.name_temp;
      this.jqueryService.removeClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'hide');
      this.jqueryService.addClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'show');
    }
  }

  searchSelect(search: string ) {
    if ( !search ) {
      return;
    }
    this.objSend.sndr_email = '';
    this.objRequestCheckComp.form.name_placeholder = '';
    this.objRequestCheckComp.form.name_temp = search;
    this.objSend.sndr_name = '';
  }

  handleResultSelected($event: any) {
    this.$event = $event;
    this.objRequestCheckComp.form.name_temp = '';
    this.objRequestCheckComp.form.name_placeholder = '';
    this.jqueryService.removeClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'show');
    this.jqueryService.addClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'hide');

    setTimeout(() => {
      const curUserName = this.objSend.sndr_name;
      let curUserEmail = '';
      this.listCustomers.forEach(function (elem: any) {
        if (curUserName == elem.name) {
          curUserEmail = elem.email;
        }
      });
      this.objSend.sndr_email = curUserEmail;
    }, 100);
  }

  onChangeReccuring(value: any) {
    this.makeRecurringToggle = value.checked === true;
  }

  selectAllCheck() {
    const isMultiple = !this.selectAllInvoices;
    this.canVoidIncoice = isMultiple;
    const transService = this.transactionService;
    this.lstInvoices.forEach(function (invoice: any) {
      if (transService.canVoidCheck(invoice.status)) {
        invoice.multiple = isMultiple;
      }
    });
  }

  unCheckedInvoices(event: any) {
    event.stopPropagation();
    this.selectAllInvoices = false;

    let canVoid = false;
    setTimeout(() =>
      this.lstInvoices.forEach(function (invoice: any) {
        if (invoice.multiple) {
          canVoid = true;
        }
      })
      , 200);

    setTimeout(() => this.canVoidIncoice = canVoid, 300);

  }

  voidInvoices() {
    this.errorService.clearAlerts();
    const deleteCheckArr = <any>[];
    this.lstInvoices.forEach(function (check: any) {
      if (check.multiple == true) {
        // deleteCheckArr.push({check_token : check.check_token})
        deleteCheckArr.push({i_token: check.i_token, c_token: check.c_token});
      }
    });

    if (!deleteCheckArr.length) {
      return;
    }

    const objDataDialog = {
      title: 'Please confirm your action',
      text: 'Are you sure you want to void ' + deleteCheckArr.length + (deleteCheckArr.length > 1 ? ' invoices.' : ' invoice.'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_void_invoice'),
      checkbox_confirm: false,
    };

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/customer/check/invoice/void', {
          u_token: this.userService.getToken(),
          id_invoices: deleteCheckArr
        })
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess({message: this.messages.get('INVOICES_CANCELLED_SUCESSFULLY')});
                this.listInvoices();
              }
            },
            errResponse => {
              if (errResponse.error) {
                this.errorService.getMessageError(errResponse.error);
              }
            }
          );
      }
    });
  }

  validateSendMoneyForm() {
    if (this.objSend.sndr_email == this.userService.getEmail()) {
      this.errorService.getMessageError({message: this.messages.get('YOU_CAN_NOT_SEND_MONEY_TO_THE_SAME_ACCOUNT')});
      return false;
    }

    return true;
  }

  checkEmailAddress() {
    this.isLoading = true;
    const objRequest = {
      email: this.objSend.sndr_email
    };
    this.http.post<any>(this.host + '/user/email/check', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.prepareCreateRequestCheck();
          }
        },
        err => {
          if (err.error) {
            const objDataDialog = {
              title: 'Please confirm',
              text: 'The invoice sent to <b>' + this.objSend.sndr_email +
                '</b> is undeliverable. Please check the email and try again. If you are sure this email is correct click Resend.',
              button_cancel_text: 'Cancel',
              button_confirm_text: 'Resend'
            };
            this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
              if (result) {
                this.prepareCreateRequestCheck();
              } else {
                this.isLoading = false;
              }
            });
          }
        }
      );
  }

  resetForm() {
    this.isLoading = false;
    this.objSend = {
      billing_cycle: 'month',
      recurring: false,
      sndr_name: null,
      sndr_email: '',
      amount: '',
      description: ''
    };
    this.objRequestCheckComp.form.name_temp = '';
    this.objRequestCheckComp.form.name_placeholder = '';
    this.makeRecurringToggle = false;
    setTimeout(() => {
      this.jqueryService.setValue('#receiveMoneyPayorsName input', '');
      this.jqueryService.removeClass('.form-group', 'has-error');
      this.jqueryService.removeClass('.form-group', 'has-danger');
      this.jqueryService.removeClass('ng-select.ng-invalid', 'ng-invalid');
      this.jqueryService.removeSelector('.with-errors.form-control-feedback');
      this.jqueryService.resetFile('#requestCheckInput');
    }, 10);
  }

  onImageChangeFromFile(event: any = null) {
    if (event.target.files && event.target.files[0]) {
      //      console.log(event.target.files[0])
      const file = event.target.files[0];
      if (file.type == 'application/pdf') {
        this.errorFileType = false;
      } else {
        this.errorFileType = true;
        this.topAlertsService.popToast('error', 'Error', 'The file must be either a .pdf');
      }
      if (file.size < 5242880) {
        this.errorFileSize = false;
      } else {
        this.errorFileSize = true;
        this.topAlertsService.popToast('error', 'Error', 'The file size must be either up to 5MB');
      }
    } else {
      this.errorFileSize = false;
    }
  }

  prepareCreateRequestCheck() {
    this.isLoading = true;
    const uploadFile = <any>(<HTMLInputElement> window.document.getElementById('requestCheckInput')).files[0] || {};

    if (!this.objSend.sndr_name || this.objSend.sndr_name.replace(/\s/g, '') == '' ) {
      this.isLoading = false;
      this.topAlertsService.popToast('error', 'Error', 'Please enter Payor\'s name');
      return;
    }

    if (!this.userService.canRequestAction()) {
      this.isLoading = false;
      this.topAlertsService.popToast('error', 'Error', this.messages.get('MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED'));
      return;
    }
    this.errorService.clearAlerts();
    if (!this.validateSendMoneyForm()) {
      this.isLoading = false;
      return;
    }
    let message = 'Are you sure you want to request a check of <b>' + this.currencyPipe.transform(this.objSend.amount, '', 'symbol')
      + '</b> from <b>' + this.objSend.sndr_name + '</b> at <b>' + this.objSend.sndr_email + '</b>?';
    if (this.objSend.recurring) {
      message = 'Are you sure you want to request a ' + this.utility.getFrequencyString(this.objSend.billing_cycle) +
        ' recurring check of <b>'
        + this.currencyPipe.transform(this.objSend.amount, '', 'symbol')
        + '</b> from <b>' + this.objSend.sndr_name + '</b> at <b>' + this.objSend.sndr_email + '</b>?';
    }
    const objDataDialog = {
      title: 'Please confirm',
      text: message,
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_request_money'),
      checkbox_confirm: false,
    };
    if ((<HTMLInputElement> window.document.getElementById('requestCheckInput')).files[0]) {
      this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
        if (result) {
          this.isLoading = true;
          const url = '/invoice/customer/create';
          const PayNoteUploadItem = new UploadDoc(uploadFile, this.userService, url);
          const objRequest: any = Object.assign({}, this.objSend);
          objRequest.rec_token = this.userService.getToken();
          objRequest.u_token = this.userService.getToken();
          objRequest.rec_name = this.userService.getFullName();
          objRequest.rec_email = this.userService.getEmail();
          if (!objRequest.recurring) {
            objRequest.billing_cycle = null;
          }
          PayNoteUploadItem.formData = objRequest;
          this.progressRef.start();
          this.uploaderService.onSuccessUpload = (item, response) => {
            this.isLoading = false;
            this.progressRef.complete();
            setTimeout(() => {
              if (this.userService.getCountFreeReceivs() == 0 && !this.userService.isHavePlan()) {
                this.userService.redirectJustSimple('/transactions');
              }
            }, 2000);
            if (environment.subDomen != 'paynote') {
              this.jqueryService.setContent('#request_money_url', response.message);
            }
            this.resetForm();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('REQUEST_CHECK_SUCCESSFULLY_SENT'));
            this.listInvoices();
          };
          this.uploaderService.onErrorUpload = (item, response, status) => {
            if (status == 503) {
              this.topAlertsService.popToast('error', 'Error', 'The file must be either a .pdf up to 5MB in size.');
            } else {
              this.utility.getMessageError( response );
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
            this.isLoading = false;
            this.progressRef.complete();
          };
          this.uploaderService.onCompleteUpload = (item, response, status) => {
            this.isLoading = false;
            this.progressRef.complete();
            if (status == 413) {
              this.topAlertsService.popToast('error', 'Error', this.messages.get('The file must be either a .pdf up to 5MB in size.'));
            }
          };
          this.uploaderService.upload(PayNoteUploadItem);
        } else {
          this.isLoading = false;
        }
      });
    } else {
      this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
        if (result) {
          const objRequest: any = Object.assign({}, this.objSend);
          objRequest.rec_token = this.userService.getToken();
          objRequest.u_token = this.userService.getToken();
          objRequest.rec_name = this.userService.getFullName();
          objRequest.rec_email = this.userService.getEmail();
          objRequest.description = this.objSend.description;
          objRequest.metadata = {
            description: this.objSend.description
          };
          if (!objRequest.recurring) {
            objRequest.billing_cycle = null;
          }
          this.progressRef.start();
          this.http.post<any>(this.host + '/invoice/customer/create', objRequest)
            .subscribe(
              response => {
                if (response.success) {
                  this.progressRef.complete();
                  this.resetForm();
                  this.topAlertsService.popToast('success', 'Success', this.messages.get('REQUEST_CHECK_SUCCESSFULLY_SENT'));
                  this.listInvoices();

                  setTimeout(() => {
                    if (this.userService.getCountFreeReceivs() == 0 && !this.userService.isHavePlan()) {
                      this.userService.redirectJustSimple('/transactions');
                    }
                  }, 2000);
                  if (environment.subDomen != 'paynote') {
                    this.jqueryService.setContent('#request_money_url', response.message);
                  }
                }
              },
              err => {
                if (err.error) {
                  this.progressRef.complete();
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
  }

  listInvoices(event: any = null) {
    this.selectAllInvoices = false;
    this.canVoidIncoice = false;
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
    const objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/customer/check/invoice/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstInvoices = response.list.data;
            this.paginationService.setParamsForResponce(response.list);
            this.paginationService.generateFilterForLocalStorage(this.storageFilterName);
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  applySort(sortFieldName: string, sortsDir: string) {
    if (sortFieldName == this.paginationService.sortField) {
      if (sortsDir == 'DESC') {
        this.paginationService.sortDir = 'ASC';
        this.paginationService.sortIcons = false;
      } else {
        this.paginationService.sortDir = 'DESC';
        this.paginationService.sortIcons = true;
      }
    }
    this.paginationService.sortField = sortFieldName;
    this.paginationService.pageSize = this.pageSize;
    this.paginationService.pageNo = this.pageNo;
    this.listInvoices(null);
  }

}


// /invoice/61cd4c70-91b0-11e8-9581-f7aa52fe5e01
