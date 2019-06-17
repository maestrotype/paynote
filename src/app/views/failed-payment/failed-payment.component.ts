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
  selector: 'app-failed-payment',
  templateUrl: './failed-payment.component.html',
  styleUrls: ['./failed-payment.component.css'],
  providers: [PaginationService],
})

export class FailedPaymentComponent implements OnInit {

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
    status: 'failed',
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
      status: 'failed',
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

  failedInfoPopup(content: any, fs_obj: any) {
    this.failedPopupInfo = fs_obj.failed;
    this.modalRef = this.modalService.open(content);
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
              //console.log(response);
              this.lstSendChecks = response.list.data;
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

  canRecipientEmailLink(transactionOdj: any = null) {
    return transactionOdj.recipient && transactionOdj.recipient.dwl_token &&
      transactionOdj.recipient.u_token && transactionOdj.recipient.role != 'Admin';
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

  callAction(stringAction: string = '') {
    eval(stringAction);
  }



}
