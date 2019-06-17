import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {PaginationService} from '../../_services/pagination.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.css']
})
export class MerchantsComponent implements OnInit {

  public host: string;
  public listMerchants: any = [];
  public listMerchantsCount: any;
  public errorMessage: string;
  public isError: boolean;
  public objUser: any;
  public objParam: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public successMessage: string;
  public pageSize: any;
  public pageNo: any;

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private route: Router,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public dialog: MatDialog,
    private jqueryService: JqueryService,
  ) {
    this.host = environment.host;
    this.isError = false;
  }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'));
    this.paginationService.sortField = 'updated_at';
    this.paginationService.searchQuery = ''
    this.jqueryService.isInitMenu = false;
    this.jqueryService.os_init_mobile_link();
  }


  getListMerchants(event: any) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/user/merchant/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listMerchants = <any> response.list.data
            this.paginationService.setParamsForResponce(response.list)
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

  getStatusPlanString(status: any = null) {
    let statusName;
    if (status) {
      switch (status) {
        case 'pending':
          statusName = 'Receive Only';
          break;
        case 'cancelled':
        case 'failed':
          statusName = 'Unpaid';
          break;
        default:
         statusName = status;
          break;

      }
    }
    return statusName;
  }

  onToggleMerchantStatus(value: any, adminsObj: any) {
    //    console.log(adminsObj)
    this.errorService.clearAlerts();
    let lockActiveMerchantStatus;

    if (value.checked === true) {
      lockActiveMerchantStatus = 'Activate';
    } else {
      lockActiveMerchantStatus = 'Locked';
    }

    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + lockActiveMerchantStatus + ' merchant status?',
      button_cancel_text: 'No',
      button_confirm_text: 'Yes',
      confirm: 'confirmMerchantStatus'
    }
    this.openDialog(objDataDialog, value.checked, adminsObj);
  }

  openDialog(objDataDialog: any, lockActiveStatusBoolean: boolean, adminsObj: any): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: objDataDialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        switch (objDataDialog.confirm) {
          case 'confirmMerchantStatus':
            this.confirmMerchantStatusToggle(lockActiveStatusBoolean, adminsObj);
            break;

        }
      }
    });
  }

  confirmMerchantStatusToggle(enebledDisabledStatus: boolean, adminsObj: any) {
    let status = enebledDisabledStatus === true ? 'Active' : 'Locked';
    this.http.post<any>(this.host + '/user/status/update', {
      status: status,
      u_token: adminsObj.u_token,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess(response, 'Merchant status successfully ' + status + '');
            this.getListMerchants(null);
          }
        },
        err => {
          if (err.error.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  clearMessages() {
    this.isModalError = this.isError = this.isModalError = this.isSuccess = false;
    this.successMessage = this.errorMessage = this.errorModalMessage = '';
  }

  closeModal() {
    this.modalRef.close();
  }

}
