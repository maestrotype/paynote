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
import {DialogService} from '../../_services/dialog.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {

  public host: string;
  public listBlockedElement: any = [];
  public errorMessage: string;
  public isError: boolean;
  public objUser: any;
  public objParam: any;
  public blockListObj: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public loading: boolean;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public successMessage: string;
  public pageSize: any;
  public pageNo: any;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    public messages: MessagesService,
  ) {
    this.host = environment.host;
    this.isError = false;
    this.loading = false;
    this.blockListObj = {
      type: 'ip',
      blockValue: '',
    };
  }

  ngOnInit() {
    this.errorService.clearAlerts();
    this.paginationService.searchQuery = ''
  }

  openDialog(content: any) {
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    this.modalRef.close();
  }

  getBlockList(event: any) {
    this.errorService.clearAlerts();
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
    this.errorService.clearAlerts();
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    this.http.get<any>(this.host + '/admin/block/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listBlockedElement = <any> response.list.data;
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

  blockType() {
    this.errorService.clearAlerts();
    let objRequest = <any> {};
    objRequest.admin_email = this.userService.getEmail();

    let url = "/admin/block/" + this.blockListObj.type;

    switch (this.blockListObj.type) {
      case 'ip':
        objRequest.ip_block = this.blockListObj.blockValue;
        break;
      case 'email':
        objRequest.email_block = this.blockListObj.blockValue;
        break;
      case 'phone':
        objRequest.phone_block = this.blockListObj.blockValue;
        break;
      case 'edomain':
        objRequest.edomain_block = this.blockListObj.blockValue;
        break;
    }

    this.http.post<any>(this.host + url, objRequest)
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response);
            this.loading = false;
            this.closeModal();
            this.errorService.getMessageSuccess({message: 'Block' + this.blockListObj.type + ' added successfully'});
            scrollTo(0, 20);
            this.getBlockList(null);
          }
        },
        err => {
          if (err.error.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }



  unblockType(unblockObj: any) {
    this.errorService.clearAlerts();
    let objRequest = <any> {};
    let url = '';

    switch (unblockObj.type) {
      case 0:
        url = "/admin/unblock/ip";
        objRequest.ip_block = unblockObj.value;
        break;
      case 1:
        url = "/admin/unblock/email";
        objRequest.email_block = unblockObj.value;
        break;
      case 2:
        url = "/admin/unblock/card";
        objRequest.card_block = unblockObj.value;
        break;
      case 3:
        url = "/admin/unblock/phone";
        objRequest.phone_block = unblockObj.value;
        break;
      case 4:
        url = "/admin/unblock/edomain";
        objRequest.edomain_block = unblockObj.value;
        break;
    }

    let objDataDialog = {
      title: 'Please confirm your unblock',
      text: 'Are you sure you want to unblocked ?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm',
      checkbox_confirm: false,
    }

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + url, objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess({message: this.messages.get('ELEMENT_UNBLOCKED_SUCESSFULLY')});
                this.getBlockList(null);
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
