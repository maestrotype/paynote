import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MessagesService} from '../../_services/messages.service';
import {Utility} from '../../_helpers/utility';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.css']
})
export class AdminsComponent implements OnInit {

  public host: string = environment.host;
  public listAdmins: any = [];
  public listHistory: any = [];
  public isEmptyHistory: boolean = false;
  public descriptionMailEdit: any = [];
  public modelNewCustomer: any;
  public errorMessage: string;
  public adminToken: string;
  public isError: boolean;
  public objUser: any;
  public objParam: any;
  public modelNewAdmin: any = {};
  public modelEditTemplate: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public successMessage: string;
  public pageSize: any;
  public barLabel: string = '';
  public myColors = ['#DD2C00', '#FF6D00', '#FFD600', '#AEEA00', '#00C853'];
  public maskPhone: any = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public pageNo: any;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public messages: MessagesService,
    public utility: Utility,
    public dialog: MatDialog
  ) {
    this.isError = false;
    this.modelNewAdmin = {
      email: '',
      name: '',
      phone: '',
      password: '',
      cpassword: '',
      role: ''
    };
  }

  ngOnInit() {
    this.errorService.clearAlerts();
    this.paginationService.searchQuery = ''
  }

  openModal(content: any, fs_obj: any) {
    this.adminToken = fs_obj.u_token;
    this.modalRef = this.modalService.open(content, {size: "lg"});
    this.viewChangeHistoryAdmin(fs_obj);
  }

  openModalAddAdmin(content: any) {
    this.modalRef = this.modalService.open(content);
  }

  getListAdmins(event: any) {
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

    this.http.get<any>(this.host + '/user/administrators/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            for (let i = 0; i < response.list.data.length; i++) {
              if (response.list.data[i].status == 'Active') {
                response.list.data[i].statusBoolean = true
              } else {
                response.list.data[i].statusBoolean = false
              }              
            }
            this.listAdmins = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  onToggleAdminStatus(value: any, adminsObj: any) {
    //    console.log(adminsObj)
    this.errorService.clearAlerts();
    let lockActiveAdminStatus;

    if (value.checked === true) {
      lockActiveAdminStatus = 'Activate';
    } else {
      lockActiveAdminStatus = 'Locked';
    }

    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + lockActiveAdminStatus + ' admin status?',
      button_cancel_text: 'No',
      button_confirm_text: 'Yes',
      confirm: 'confirmAdminStatus'
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
          case 'confirmAdminStatus':
            this.confirmAdminStatusToggle(lockActiveStatusBoolean, adminsObj);
            break;

        }
      }
    });
  }

  confirmAdminStatusToggle(enebledDisabledStatus: boolean, adminsObj: any) {
    let status = enebledDisabledStatus === true ? 'Active' : 'Locked';
    this.http.post<any>(this.host + '/user/status/update', {
      status: status,
      u_token: adminsObj.u_token,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess(response, 'Admin status successfully ' + status + '');
            this.getListAdmins(null);
          }
        },
        err => {
          if (err.error.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }
  viewChangeHistoryAdmin(event: any) {
    let objRequest = {
      u_token: event.u_token,
      search: this.paginationService.searchQuery,
      orderby: 'created_at',
      direction: this.paginationService.sortDir,
    }
    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/user/status/history/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            console.log(response.list.data.length);
            if (response.list.data.length == '0') {
              this.isEmptyHistory = true;
            }else{
              this.isEmptyHistory = false;
            }
            this.listHistory = <any> response.list.data;
            //            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }
  AddAdministrator() {
    this.errorService.clearAlerts();
    this.isLoading = true;

    this.http.post<any>(this.host + '/user/admin/create', this.modelNewAdmin)
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response);
            this.closeModal();
            this.isLoading = false;
            this.errorService.getMessageSuccess(response, this.messages.get('ADMIN_ADDED_SUCCESSFULLY'));
            this.getListAdmins(null);
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error.error) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  closeModal() {
    this.modalRef.close();
  }

}
