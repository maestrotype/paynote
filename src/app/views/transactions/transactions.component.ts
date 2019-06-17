import {Component, OnInit, Input, SimpleChange} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';
import {UserService} from '../../_services/user.service';
import {DialogService} from '../../_services/dialog.service';
import {ErrorService} from '../../_services/error.service';
import {TransactionService} from '../../_services/transaction.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [PaginationService, ErrorService],
})
export class TransactionsComponent implements OnInit {

  @Input() clientName: string;
  @Input() dateStart: string;
  @Input() dateEnd: string;
  @Input() uToken: string;
  @Input() isBilling = false;

  public lstSendChecks: any = [];
  public sortAndPagination: any = [];
  public checkPopupInfo: any = {
    account_bank: {},
    bank_info: {},
    recipient: {}
  };

  public host: string;
  public sortField: string;
  public sortDir: string;
  public modalRef: NgbModalRef;
  public pageSize: any;
  public pageNo: any;
  public selectAllChecks = false;
  public canVoidCheck = false;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public utility: Utility,
    public paginationService: PaginationService,
    public userService: UserService,
    public errorService: ErrorService,
    public dialogService: DialogService,
    public messages: MessagesService,
    public transService: TransactionService,
  ) {
    this.host = environment.host;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (const propName in changes) {
      switch (propName) {
        case 'clientName':
          if (!changes[propName].currentValue) {
            continue;
          }
          this.paginationService.searchQuery = changes[propName].currentValue;
          this.listSendChecksTransactions(null);
          break;
        case 'dateStart':
          if (!changes[propName].currentValue) {
            continue;
          }
          this.listSendChecksTransactions(null);
          break;
      }
    }
  }

  ngOnInit() {
    this.paginationService.searchQuery = '';
  }

  selectAllCheck() {
    let isMultiple: boolean;
    isMultiple = !this.selectAllChecks;
    this.canVoidCheck = isMultiple;
    const transService = this.transService;
    this.lstSendChecks.forEach(function (check: any) {
      if (transService.canVoidCheck(check.status, check.type)) {
        check.multiple = isMultiple;
      }
    });
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
          status = 'Paid&nbsp;<i class="fa fa-question-circle" title="' + message + '"></i>';
          break;
        case 'pending':
          status = 'In process';
          break;
        case 'cancelled':
          status = 'Void';
          break;
        case 'Void Pending':
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

    return status;
  }

  showCheckInfoPopup(content: any, fs_obj: any) {
    if (fs_obj.status === 'unpaid' || !fs_obj.dwl_fs_token) {
      return;
    } else {
      this.getInfoForDialog(fs_obj);
      this.modalRef = this.modalService.open(content);
    }

  }

  closeModal() {
    this.modalRef.close();
  }

  listSendChecksTransactions(event: any = null) {
    if (this.isBilling && (!this.dateEnd || !this.dateStart)) {
      return;
    }
    this.selectAllChecks = false;
    this.canVoidCheck = false;
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    const objRequest: any = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    if (this.isBilling) {
      objRequest.date_start = this.dateStart;
      objRequest.date_end = this.dateEnd;
      objRequest.u_token = this.uToken;

    }

    let url = '/check/customer/list';
    if (this.userService.isCustomer()) {
      url = '/check/client/list';
    }

    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstSendChecks = response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  getInfoForDialog(bank_obj: any) {
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
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  voidChecks() {
    const deleteCheckArr = <any>[];
    this.lstSendChecks.forEach(function (check: any) {
      if (check.multiple) {
        // deleteCheckArr.push({check_token : check.check_token});
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
      button_confirm_text: 'Confirm & Void',
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
                this.errorService.getMessageSuccess({message: this.messages.get('CHECKS_CANCELLED_SUCESSFULLY')});
                this.listSendChecksTransactions();
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
}
