import {Component, OnInit, Input, SimpleChange} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';
import {DialogService} from '../../_services/dialog.service';
import {TransactionService} from '../../_services/transaction.service';
import {MessagesService} from '../../_services/messages.service';
import * as moment from '../send-checks/send-checks.component';

@Component({
  selector: 'app-payment-links',
  templateUrl: './payment-links.component.html',
  styleUrls: ['./payment-links.component.css'],
  providers: [PaginationService, ErrorService],
})
export class PaymentLinksComponent implements OnInit {

  @Input() countNewPayLink: number;

  public host: string;
  public isLoading = false;
  public canVoidIncoice = false;
  public selectAllNotifications = false;
  public paymentLinks: any = [];
  public lstSendChecks: any = [];
  public pageSize: any;
  public pageNo: any;
  public storageFilterName = 'paymentLinks';

  constructor(
    private http: HttpClient,
    public userService: UserService,
    public errorService: ErrorService,
    public jqueryService: JqueryService,
    public utility: Utility,
    public dialog: MatDialog,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    public transactionService: TransactionService,
    public messages: MessagesService,
  ) {
    this.host = environment.host;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (const propName in changes) {
      switch (propName) {
        case 'countNewPayLink':
          const changedProp = changes[propName];
          if (changedProp.currentValue > 0) {
            this.paymentLinkList();
          }

          break;
      }

    }
  }

  ngOnInit() {
    this.errorService.clearAlerts();
    this.paginationService.searchQuery = '';
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
    this.paymentLinkList();
  }

  resendNotification(invoice: any) {
    this.errorService.clearAlerts();
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
                this.errorService.getMessageSuccess(response, this.messages.get('RESENT_NOTIFICATION_EMAIL'));
                this.isLoading = false;
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

  selectAllCheck() {
    const isMultiple = !this.selectAllNotifications;
    this.canVoidIncoice = isMultiple;
    this.paymentLinks.forEach(function (invoice: any) {
      if (!invoice.status) {
        invoice.multiple = isMultiple;
      }

    });
  }

  unCheckedInvoices(event: any) {
    event.stopPropagation();
    this.selectAllNotifications = false;
    let canVoid = false;
    setTimeout(() =>
      this.paymentLinks.forEach(function (invoice: any) {
        if (invoice.multiple) {
          canVoid = true;
        }
      })
      , 200);
    setTimeout(() => this.canVoidIncoice = canVoid, 300);
  }

  voidChecks() {
    console.log(this.paymentLinks);
    const deleteCheckArr = <any>[];
    this.paymentLinks.forEach(function (check: any) {
      if (check.multiple == true) {
        deleteCheckArr.push(check.pl_token);
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
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/dwl/customer/payment-link/void', {
          u_token: this.userService.getToken(),
          tokens: deleteCheckArr
        })
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess({message: this.messages.get('CHECKS_CANCELLED_SUCESSFULLY')});
                this.paymentLinkList();
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

  paymentLinkList(event: any = null) {
    this.selectAllNotifications = false;
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

    this.http.get<any>(this.host + '/dwl/customer/payment-link/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
//            console.log(response);
            this.paymentLinks = response.list.data;
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

}
