import {Component, OnInit, SimpleChange, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {DialogService} from '../../_services/dialog.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {MessagesService} from '../../_services/messages.service';
import {TransactionService} from '../../_services/transaction.service';

@Component({
  selector: 'app-recurring',
  templateUrl: './recurring.component.html',
  styleUrls: ['./recurring.component.css'],
  providers: [ PaginationService ],
})
export class RecurringComponent implements OnInit {

  @Input() clientName: string;
  @Input() type = 'all';

  public host: string = environment.host;
  public listRecurring: any = [];
  public listRecurringDetails: any = [];

  public isLoading = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public pageSize: any;
  public pageNo: any;
  public objCurentRecuring: any = {};

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public paginationService: PaginationService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    public topAlertsService: TopAlertsService,
    public transService: TransactionService,
    public messages: MessagesService
  ) {

  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (const propName in changes) {
      if (propName === 'clientName') {
        const changedProp = changes[propName];
        if (!changedProp.currentValue) {
          continue;
        }
        this.paginationService.searchQuery = changedProp.currentValue;
        this.getListRecurring(null);
      }
    }
  }

  ngOnInit() {
    this.errorService.clearAlerts();
    this.paginationService.sortField = 'created_at';
    this.paginationService.searchQuery = '';
  }

  getBillingCycle(cycle: string = '' ) {
    let cycleFull = '';
    switch ( cycle ) {
      case 'month':
        cycleFull = 'monthly';
        break;
      case 'week':
        cycleFull = 'weekly';
        break;
      case 'day':
        cycleFull = 'daily';
        break;
    }

    return cycleFull;
  }

  getStatus( objRequring: any = null ) {
    if ( !objRequring ) {
      return '';
    }

    if (objRequring.finished && objRequring.finished == 1 ) {
      return '<span class="badge badge-info">Paid-in-Full</span>';
    }

    return objRequring.disabled == 1
      ? '<span class="badge badge-secondary">Canceled</span>'
      : objRequring.disabled == 2
      ? '<span class="badge badge-warning">Delinquent</span>'
      : '<span class="badge badge-primary">Active</span>';
  }

  getRequiringDetails( contentModal: any, objRequring: any ) {
    this.objCurentRecuring = objRequring;
    const objRequest = <any> {
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      rt_token: objRequring.rt_token,
      limit: 1000,
      u_token: this.userService.getToken()
    };

    let url = '/check/customer/list';
    if ( this.userService.isClient() ) {
      url = '/check/client/list';
    }

    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listRecurringDetails = response.list.data;
            this.openLargeModal(contentModal );
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

  getListRecurring(event: any) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    const objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      type: this.type
    };

    setTimeout(() => this.errorService.clearAlerts(), 3000);

    let url = '/dwl/customer/transfer/recurring/list';
    if (this.userService.isClient() ) {
      url = '/dwl/client/transfer/recurring/list';
    }

    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listRecurring = response.list.data;
            this.paginationService.setParamsForResponce(response.list);
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
  openModal(content: any) {
    this.errorService.clearAlerts();
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content);
  }
  openLargeModal(content: any) {
    this.errorService.clearAlerts();
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content, {size: 'lg'});
  }

  closeModal() {
    this.modalRef.close();
  }

  toggleStatusReccuring(objRecurring: any = null) {
    this.errorService.clearAlerts();
    const bCancel = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: 'You’re going to <b>cancel</b> recurring payment. Are you sure?',
      button_cancel_text: 'No',
      button_confirm_text: 'Yes'
    };

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        let url;
        if (bCancel) {
          url = this.userService.isMerchant() ? '/dwl/customer/transfer/recurring/disable' : '/dwl/client/transfer/recurring/disable';
        } else {
          url = this.userService.isMerchant() ? '/dwl/customer/transfer/recurring/enable' : '/dwl/client/transfer/recurring/enable';
        }

        this.http.post<any>(this.host + url, {
          u_token: this.userService.getToken(),
          rt_token: objRecurring.rt_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', this.messages.get('RECURRING_UPDATED_SUCCESSFULLY'));
                this.getListRecurring(null);
              }
            },
            err => {
              if (err.error) {
                this.errorService.getMessageError(err.error);
              }
            }
          );
      }
    });
  }

  getType( objRecurring: any = null ) {
    let strRecurringType = '';
    if (this.userService.getToken() == objRecurring.rec_token ) {
      strRecurringType = 'Receive';
    }
    if (this.userService.getToken() == objRecurring.sndr_token ) {
      strRecurringType = 'Send';
    }

    return strRecurringType;
  }

  getNameFrom(objRecurring: any = null, bWithOutEmail: boolean = false ) {
    let strNameFrom = '';
    if (this.userService.getToken() == objRecurring.rec_token ) {
      strNameFrom = !bWithOutEmail ? objRecurring.sndr_name + '<br>' + objRecurring.sndr_email : objRecurring.sndr_name;
    }
    if (this.userService.getToken() == objRecurring.sndr_token ) {
      strNameFrom = !bWithOutEmail ? objRecurring.rec_name + '<br>' + objRecurring.rec_email : objRecurring.rec_name;
    }

    return strNameFrom;
  }

}
