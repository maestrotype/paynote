import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';
import {UserService} from '../../_services/user.service';
import {MessagesService} from '../../_services/messages.service';
import {DialogService} from '../../_services/dialog.service';
import {TransactionService} from '../../_services/transaction.service';
import {CurrencyPipe} from '@angular/common';
import {JqueryService} from '../../_services/jquery.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {DomSanitizer} from '@angular/platform-browser';
import * as moment from 'moment';

@Component({
  selector: 'app-send-checks',
  templateUrl: './send-checks.component.html',
  styleUrls: ['./send-checks.component.css'],
  providers: [PaginationService],
})

export class SendChecksComponent implements OnInit {

  @Input() merchantObject: any = {};
  public daterangepickerModel: Date[];

  public objUser: any = {};
  public data: Date;
  public dashboardTrendsInfo: any = {};
  public lstSendChecks: any = [];
  public sortAndPagination: any = [];
  public checkPopupInfo: any = {
    account_bank: {},
    bank_info: {},
    recipient: {},
    sender: {},
    sender_info: {
      bank_info: {}
    }
  };
  public objFilter: any = {
    type: 'All',
    status: 'All',
    recurring: 'All',
    transfer_speed: 'All',
    date_start: '',
    date_end: '',
    period: '',
    interval: 'last_month',
    revenue: 0
  };
  public failedPopupInfo: any = {};
  public host: string;
  public errorMessage: string;
  public isError: boolean;
  public isModalError: boolean;
  public successMessage: string;
  public isSuccess: boolean;
  public errorModalMessage: string;
  public sortField: string;
  public sortDir: string;
  public listTransaction: any = [];
  public pageSize: any;
  public pageNo: any;
  public modalRef: NgbModalRef;
  public selectAllChecks = false;
  public canVoidCheck = false;
  public visibleTrands = false;
  public isLoading = false;
  public _dwl_token: string;
  public _u_token: string;
  public isAdminControl = false;
  public isPayments = false;
  public storageFilterName = 'transactionsList';
  public strDataRangePlaseHolder = 'Last 30 Days';
  public tz = this.userService.getTimeZone();


  //  type = "line, bar, doughnut, radar, pie, polarArea, "
  public graphicsObj: any = [
    {
      barChartLegend: true,
      barChartType: 'line',
      tabTitle: 'Transaction sent',
      labelTitle: 'Transaction sent ($)',
      tabLink: 'tab_transaction_send',
      tabActive: true,
      url: 'trends/customer/transfers/sent',
      key: 'sent',
    },
    {
      barChartLegend: true,
      barChartType: 'line',
      tabTitle: 'Transaction received',
      labelTitle: 'Transaction received ($)',
      tabLink: 'tab_transaction_received',
      tabActive: false,
      url: 'trends/customer/transfers/received',
      key: 'received'
    },
    {
      barChartLegend: true,
      barChartType: 'line',
      tabTitle: 'Customers created',
      labelTitle: 'Customers created',
      tabLink: 'tab_customer_created',
      tabActive: false,
      url: 'trends/customer/clients/new',
      key: 'clients'
    }
  ];

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public utility: Utility,
    public paginationService: PaginationService,
    public userService: UserService,
    public messages: MessagesService,
    public dialogService: DialogService,
    public transService: TransactionService,
    private currencyPipe: CurrencyPipe,
    private router: ActivatedRoute,
    private jqueryService: JqueryService,
    public topAlertsService: TopAlertsService,
    public domSanitizer: DomSanitizer
  ) {
    this.host = environment.host;
  }

  ngOnInit() {
    this.jqueryService.initInterface();
    this._dwl_token = this.router.snapshot.paramMap.get('dwl_token');
    this._u_token = this.router.snapshot.paramMap.get('u_token');
    this._dwl_token && this._u_token ? this.isAdminControl = true : this.isAdminControl = false;

    this.paginationService.sortField = 'created';
    this.paginationService.searchQuery = '';
    this.paginationService.pageSize = 50;

    this.objFilter.date_start = moment().subtract(29, 'days').format('YYYY-MM-DD');
    this.objFilter.date_end = moment().format('YYYY-MM-DD');
    this.initFilter();
  }

  initFilter(): void {
    const objFilter = this.paginationService.getFilterFromLocalStorage(this.storageFilterName);
    if ( objFilter ) {
      this.objFilter = Object.assign( this.objFilter, objFilter.filter );
      this.paginationService = Object.assign( this.paginationService, objFilter.pagination );
    }
  }

  resetFilter(): void {
    this.paginationService.resetFilterInLocalStorage(this.storageFilterName);
    this.objFilter = <any> {
      type: 'All',
      status: 'All',
      recurring: 'All',
      transfer_speed: 'All',
      date_start:  moment().subtract(29, 'days').format('YYYY-MM-DD'),
      date_end: moment().format('YYYY-MM-DD'),
      period: '',
      interval: 'last_month',
      revenue: 0
    };
    this.daterangepickerModel = null;
    this.paginationService.searchQuery = '';
    this.paginationService.sortField = 'created';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.pageNo = 1;
    this.listSendChecksTransactions();
  }

  callFastFilter( strFilter: string = '' ) {
    if ( strFilter ) {
      this.objFilter.interval = strFilter;
    }
    this.objFilter.date_end = '';
    this.objFilter.date_start = '';
    this.listSendChecksTransactions();
  }

  onValueRangeDate(value: Date): void {
    if (value) {
      this.objFilter.interval = '';
      moment(value[0]).format('YYYY-MM-DD') !== 'Invalid date'
        ? this.objFilter.date_start = moment(value[0]).format('YYYY-MM-DD')
        : this.objFilter.date_start = moment().format('YYYY-MM-DD');
      moment(value[1]).format('YYYY-MM-DD') !== 'Invalid date'
        ? this.objFilter.date_end = moment(value[1]).format('YYYY-MM-DD')
        : this.objFilter.date_end = moment().format('YYYY-MM-DD');
      this.listSendChecksTransactions();
    }
  }

  sendCheckInfoPopup(content: any, fs_obj: any) {
    if (this.userService.isMerchant() || this.userService.isClient()) {
      this.checkPopupInfo = fs_obj;
      this.checkPopupInfo.bank_info = {};
      this.checkPopupInfo.account_bank = {};
      if (fs_obj.status === 'unpaid' || !fs_obj.dwl_fs_token) {
        this.getBunkInfoForDialog(fs_obj);
      }
    }
    if (this.userService.isAdmin() || this.userService.isSuperAdmin()) {
      this.checkPopupInfo = fs_obj;
      this.getBunkInfoForReciever(fs_obj);
      this.getBunkInfoForSender(fs_obj);
    }
    this.getSignature(fs_obj);
    this.modalRef = this.modalService.open(content);
  }

  getSignature(objTransaction: any = null) {
    if (!objTransaction.sndr_token) {
      return;
    }
    this.http.get<any>(this.host + '/dwl/customer/user', {params: {u_token: objTransaction.sndr_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.checkPopupInfo.signature = response.signature;
            objTransaction.signature = response.signature;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getRoutingNumber() {
    if ((this.userService.isMerchant() || this.userService.isClient()) && this.checkPopupInfo.account_bank) {
      return this.checkPopupInfo.account_bank.routing;
    }
    if ((this.userService.isAdmin() || this.userService.isSuperAdmin()) && this.checkPopupInfo.sender_info) {
      return this.checkPopupInfo.sender_info.account ? this.checkPopupInfo.sender_info.account.routing : '';
    }
  }

  getAccountNumber() {
    if ((this.userService.isMerchant() || this.userService.isClient()) && this.checkPopupInfo.account_bank) {
      return this.checkPopupInfo.account_bank.number;
    }
    if ((this.userService.isAdmin() || this.userService.isSuperAdmin()) && this.checkPopupInfo.sender_info) {
      return this.checkPopupInfo.sender_info.account ? this.checkPopupInfo.sender_info.account.number : '';
    }
  }

  isReccuring(checkType: string = '') {
    return checkType.indexOf('recurring') >= 0;
  }

  closeModal() {
    if (!this.modalRef) {
      return;
    }
    this.modalRef.close();
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
        case 'expired':
          status = 'Expired';
          break;
        case 'delayed':
          status = 'Delayed';
          break;
      }
    }

    let strLabels = '<br>';
    if ( transaction.labels && transaction.labels.length ) {
      transaction.labels.forEach(function (label: any) {
        strLabels += '<span class="badge badge-warning">' + label + '</span>';
      });
    }

    if (this.userService.isAdmin() || this.userService.isSuperAdmin() ) {
      status += strLabels;
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

  selectAllCheck() {
    const isMultiple = !this.selectAllChecks;
    const transService = this.transService;
    this.canVoidCheck = isMultiple;
    this.lstSendChecks.forEach(function (check: any) {
      if (transService.canVoidCheck(check.status, check.type) && !transService.isSystemPaiment(check)) {
        check.multiple = isMultiple;
      }
    });
  }

  applySort(sortFieldName: string, sortsDir: string) {
    if (sortFieldName === this.paginationService.sortField) {
      if (sortsDir === 'DESC') {
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
    this.listSendChecksTransactions(null);
  }

  unCheckedChecks(event: any) {
    event.stopPropagation();
    this.selectAllChecks = false;

    let canVoid = false;
    setTimeout(() =>
      this.lstSendChecks.forEach(function (check: any) {
        if (check.multiple) {
          canVoid = true;
        }
      })
      , 200);

    setTimeout(() => this.canVoidCheck = canVoid, 300);

  }

  resendNotificationCheck(invoice: any) {
    this.isLoading = true;
    const resendCheckArr = <any>[];
    resendCheckArr.push(invoice.pl_token);
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
        this.http.post<any>(this.host + '/dwl/customer/payment-link/resend', {tokens: resendCheckArr})
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('RESENT_NOTIFICATION_EMAIL'));
                this.isLoading = false;
                scrollTo(0, 20);
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

  resendNotificationInvoice(invoice: any) {
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
          i_token: invoice.ci_token
        };
        this.http.get<any>(this.host + '/customer/check/invoice/resend', {params: objRequest})
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('RESENT_NOTIFICATION_EMAIL'));
                this.isLoading = false;
                scrollTo(0, 20);
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
      } else {
        this.isLoading = false;
      }
    });
  }

  voidTransactionCheck(transactionObj: any = null) {
    let url = '';
    const tokensArr = <any>[];
    let checkAndInvoice;
    let checksAndInvoices;
    let postObj = <any> {};

    if (transactionObj.type === 'check' || transactionObj.type === 'recurring (check)') {
      url = '/dwl/customer/payment-link/void';
      tokensArr.push(transactionObj.pl_token);
      checkAndInvoice = ' check.';
      checksAndInvoices = ' checks.';
      postObj = {
        tokens: tokensArr,
        u_token: transactionObj.u_token
      };
    }
    if (transactionObj.type === 'invoice' || transactionObj.type === 'recurring (invoice)') {
      url = '/customer/check/invoice/void';
      tokensArr.push({i_token: transactionObj.ci_token, c_token: transactionObj.c_token});
      checkAndInvoice = ' invoice.';
      checksAndInvoices = ' invoices.';
      postObj = {
        u_token: transactionObj.u_token,
        id_invoices: tokensArr
      };
    }

    const objDataDialog = {
      title: 'Please confirm your action',
      text: 'Are you sure you want to void ' + tokensArr.length + (tokensArr.length > 1 ? checksAndInvoices : checkAndInvoice),
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm & Void',
      checkbox_confirm: false,
    };

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + url, postObj)
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('CHECKS_CANCELLED_SUCESSFULLY'));
                this.listSendChecksTransactions();
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

  getLinkForTransactionsList() {
    let url;
    if (this.merchantObject.role === 'Merchant' && this.isAdminControl) {
      url = '/check/customer/list';
    }
    if (this.merchantObject.role === 'Client' && this.isAdminControl) {
      url = '/check/client/list';
    }
    if (this.userService.isMerchant()) {
      url = '/check/customer/list';
    }
    if (this.userService.isCustomer()) {
      url = '/check/client/list';
    }
    if (this.userService.isAdmin() && !this.isAdminControl || this.userService.isSuperAdmin() && !this.isAdminControl) {
      url = '/check/all/list';
    }

    return url;
  }

  listSendChecksTransactions(event: any = null, bResetPages: boolean = false, bGetCsvData: boolean = false) {
    this.selectAllChecks = false;
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
    let objRequest = <any> {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      days_ago: this.objFilter.period,
      tz: this.tz
    };

    // delete this.objSendCheck.objListTransactionsRequest.export;
    objRequest.page = bResetPages ? 1 : objRequest.page;

    const url = this.getLinkForTransactionsList();

    if (this.userService.isMerchant()) {
      objRequest.u_token = this.userService.getToken();
    }
    if (this.userService.isCustomer()) {
      objRequest.u_token = this.userService.getToken();
    }

    if (this.isAdminControl) {
      objRequest.u_token = this._u_token;
    }

    objRequest = Object.assign(objRequest, this.objFilter);

    if (bGetCsvData ) {
      objRequest.export = 'csv';
      objRequest.limit = 10000;
      this.http.get<Blob>(this.host + url, {params: objRequest, responseType: 'blob' as 'json'})
        .subscribe(
          response => {
            const dataType = response.type;
            const binaryData = [];
            binaryData.push(response);
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            downloadLink.setAttribute('download', 'transactions.csv');
            document.body.appendChild(downloadLink);
            downloadLink.click();
          },
          errResponse => {
            if (errResponse.error) {
              this.utility.getMessageError(errResponse.error);
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            }
          }
        );
    } else {
      this.http.get<any>(this.host + url, {params: objRequest})
        .subscribe(
          response => {
            if (response.success) {
              this.lstSendChecks = response.list.data;
             // console.log(response);
              this.dashboardTrendsInfo = response.trends;
              if (response.list.data.length) {
                this.paginationService.setParamsForResponce(response.list);
              } else {
                this.paginationService.itemsCount = 0;
              }

              this.paginationService.generateFilterForLocalStorage(this.storageFilterName, this.objFilter );
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
  }

  canSenderEmailLink(transactionOdj: any = null) {
    return transactionOdj.sender && transactionOdj.sender.dwl_token
      && transactionOdj.sender.u_token && transactionOdj.sender.role != 'Admin';
  }
  canRecipientEmailLink(transactionOdj: any = null) {
    return transactionOdj.recipient && transactionOdj.recipient.dwl_token &&
      transactionOdj.recipient.u_token && transactionOdj.recipient.role != 'Admin';
  }
  canAcceptFunds(transactionOdj: any = null) {
    return transactionOdj.status == 'unpaid' && transactionOdj.pl_token &&
      transactionOdj.rec_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase() && this.userService.isHaveBankAccount();
  }
  canAcceptFundsByLink(transactionOdj: any = null) {
    return transactionOdj.status == 'unpaid' && transactionOdj.pl_token &&
      transactionOdj.rec_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase() && !this.userService.isHaveBankAccount();
  }

  getAcceptFundsByLink(transactionOdj: any = null) {
    return environment.hostOriginal + '/check/' + transactionOdj.pl_token;
  }

  canDecline(transactionOdj: any = null) {

    if (this.userService.isAdmin() || this.userService.isSuperAdmin()) {
      return (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)') && transactionOdj.status == 'unpaid';
    } else {
      return !((transactionOdj.rec_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase()
        && (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)'))
        ||
        // Sender
        (transactionOdj.sndr_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase()) && transactionOdj.type == 'check'
        || transactionOdj.status != 'unpaid' || transactionOdj.type == 'internal' );
    }

  }
  canVoid(transactionOdj: any = null) {
    return (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)') &&
      transactionOdj.status == 'unpaid' && transactionOdj.rec_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase();
  }

  canInvoicePay(transactionOdj: any = null) {
    return transactionOdj.status == 'unpaid' && (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)') &&
      transactionOdj.sndr_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase() && this.userService.isHaveVerifyBankAccount();
  }
  canViewCheckInfo(transactionOdj: any = null) {
    return !( (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)') && transactionOdj.status == 'unpaid' );
  }

  canResendNotification(transactionOdj: any = null, transactionType: string = null) {
    if (transactionType == 'internal') {
      return false;
    }
    if ( this.userService.isClient() ) {
      return false;
    }
    if (transactionType == 'check') {
      return transactionOdj.status == 'unpaid'
        && (transactionOdj.type == 'check' || transactionOdj.type == 'recurring (check)')
        && transactionOdj.sndr_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase();
    }
    if ( transactionType == 'invoice' ) {
      return transactionOdj.status == 'unpaid'
        && (transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)')
        && transactionOdj.rec_email.toLocaleLowerCase() == this.userService.getEmail().toLocaleLowerCase();
    }
  }

  canViewFeesOnCheck(transactionOdj: any = null) {
    if ( this.userService.isAdmin() || this.userService.isSuperAdmin() ) {
      return true;
    }
    if ( transactionOdj.type == 'invoice' || transactionOdj.type == 'recurring (invoice)' ) {
      return transactionOdj.sndr_email.toLocaleLowerCase() != this.userService.getEmail().toLocaleLowerCase();
    }
    if ( transactionOdj.type == 'check' || transactionOdj.type == 'recurring (check)' ) {
      return transactionOdj.rec_email.toLocaleLowerCase() != this.userService.getEmail().toLocaleLowerCase();
    }
  }

  acceptTransactionCheck(transactionOdj: any) {
    if (!this.userService.checkAvailableActions('payAcceptTransfer')) {
      return;
    }
    const objDataDialog = {
      title: 'Please confirm your action',
      text: 'Are you sure you want to accept transaction?',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_and_accept'),
      checkbox_confirm: false,
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/dwl/client/payment-link/accept', {
          pl_token: transactionOdj.pl_token,
          u_token: this.userService.getToken()
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('TRANSACTION_ACCEPTED_SUCESSFULLY'));
                this.listSendChecksTransactions();
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

  payInvoiceTransaction(transactionOdj: any = null) {
    if (!this.userService.checkAvailableActions('payAcceptTransfer')) {
      return;
    }

    this.isLoading = true;

    const objDataDialog = {
      title: 'Please confirm your action',
      text: this.messages.get('PAY_INVOICE_TRANSACTION'),
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm & Pay',
      checkbox_confirm: false,
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/client/check/invoice/accept', {
          ci_token: transactionOdj.ci_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.isLoading = false;
                this.topAlertsService.popToast('success', 'Success', this.messages.get('PAY_INVOICE_SUCESSFULLY'));
                this.listSendChecksTransactions();
              }
            },
            errResponse => {
              this.isLoading = false;
              if (errResponse.error) {
                this.utility.getMessageError(errResponse.error);
                this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
              }
            }
          );
      } else {
        this.isLoading = false;
      }
    });
  }

  failedInfoPopup(content: any, fs_obj: any) {
   // console.log(fs_obj.failed);
    this.failedPopupInfo = fs_obj.failed;
    this.modalRef = this.modalService.open(content);

  }

  getBunkInfoForReciever(bank_obj: any) {
    if (!bank_obj.rec_fs_token) {
      return;
    }

    const url = '/dwl/customer/funding-source/account';
    this.http.get<any>(this.host + url, {params: {fundingsource: bank_obj.rec_fs_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.checkPopupInfo.reciever_info = response;
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

  getBunkInfoForSender(bank_obj: any) {
    if (!bank_obj.sndr_fs_token) {
      return;
    }

    const url = '/dwl/customer/funding-source/account';
    this.http.get<any>(this.host + url, {params: {fundingsource: bank_obj.sndr_fs_token}})
      .subscribe(
        response => {
          if (response.success) {
            this.checkPopupInfo.sender_info = response;
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
  getBunkInfoForDialog(bank_obj: any) {
    let url = '/dwl/customer/funding-source/account';
    if (this.userService.isCustomer()) {
      url = '/dwl/client/funding-source/account';
    }
    this.http.get<any>(this.host + url, {params: {fundingsource: bank_obj.dwl_fs_token}})
      .subscribe(
        response => {
          if (response.success) {
            bank_obj.account_bank = response.account;
            bank_obj.bank_info = response.bank_info;
            this.checkPopupInfo = bank_obj;
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

  voidChecks() {
    const deleteCheckArr = <any>[];
    this.lstSendChecks.forEach(function (check: any) {
      if (check.multiple) {
        deleteCheckArr.push({dwl_t_token: check.dwl_t_token, c_token: check.c_token});
      }
    });

    if (!deleteCheckArr.length) {
      return;
    }

    const objDataDialog = {
      title: 'Please confirm your action',
      text: 'Are you sure you want to void ' + deleteCheckArr.length + (deleteCheckArr.length > 1 ? ' checks.' : ' check.'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_void_invoice'),
      checkbox_confirm: false,
    };
    let url = '/dwl/customer/transfers/cancel';
    if (this.userService.isClient()) {
      url = '/dwl/client/transfers/cancel';
    }

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + url, {
          u_token: this.userService.getToken(),
          transfers: deleteCheckArr
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('CHECKS_CANCELLED_SUCESSFULLY'));
                this.listSendChecksTransactions();
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

  voidAdminChecks() {
    const deleteCheckArr = <any>[];
    this.lstSendChecks.forEach(function (check: any) {
      if (check.multiple) {
        deleteCheckArr.push({c_token: check.c_token});
      }
    });

    if (!deleteCheckArr.length) {
      return;
    }

    const objDataDialog = {
      title: 'Please confirm your action',
      text: 'Are you sure you want to void ' + deleteCheckArr.length + (deleteCheckArr.length > 1 ? ' checks.' : ' check.'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_void_invoice'),
      checkbox_confirm: false,
    };
    const url = '/check/transfer/void';

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + url, {
          checks: deleteCheckArr
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('CHECKS_CANCELLED_SUCESSFULLY'));
                this.listSendChecksTransactions();
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

  callAction(stringAction: string = '') {
    eval(stringAction);
  }

  toogleFraud(objTrans: any) {
    if ( this.userService.isMerchant() || this.userService.isClient() ) {
      return false;
    }
    const seccessText = 'Transactions number #' + objTrans.number + ' set as ' + (objTrans.fraud ? ' not fraud' : ' fraud');
    const objDataDialog = {
      title: seccessText,
      text: 'Are you sure?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/check/fraud/update', {
          fraud: !objTrans.fraud,
          c_token: objTrans.c_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', seccessText + ' successfully');
                this.isLoading = false;
                objTrans.fraud = !objTrans.fraud;
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

}
