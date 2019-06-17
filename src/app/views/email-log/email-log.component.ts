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
import {MessagesService} from '../../_services/messages.service';
import {DialogService} from '../../_services/dialog.service';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-email-log',
  templateUrl: './email-log.component.html',
  styleUrls: ['./email-log.component.css']
})
export class EmailLogComponent implements OnInit {

  public host: string;
  mailLogList: any = [];
  public errorMessage: string;
  public isError: boolean;
  public lstFundSources: any;
  public objUser: any;
  public objParam: any;
  public transactionPeriod: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public pageSize: any;
  public pageNo: any;

  public successMessage: string;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public messages: MessagesService,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    private currencyPipe: CurrencyPipe,
  ) {
    this.host = environment.host;
    this.isError = false;
    this.transactionPeriod = {
      period: '30',
      status: 'Send',
    };
  }

  ngOnInit() {
    this.paginationService.searchQuery = ''
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'));
  }


  clearMessages() {
    this.isModalError = this.isError = this.isModalError = this.isSuccess = false;
    this.successMessage = this.errorMessage = this.errorModalMessage = '';
  }

  getListMailLog(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    let objRequest = {
      u_token: this.objUser.user.u_token,
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      days_ago: this.transactionPeriod.period,
      status: this.transactionPeriod.status
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000);
    let url = '/mail/storage/list';
    if (this.userService.isMerchant()) {
      url = '/customer/mail/storage/list';
    }
    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            console.log(response);
            this.mailLogList = <any> response.list.data;
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


  closeModal() {
    this.modalRef.close();
  }

}
