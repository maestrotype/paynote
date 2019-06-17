import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';

@Component({
  selector: 'app-invoice',
  providers: [PaginationService],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

  public host: string = environment.host;
  public listInvoice: any = [];
  public listInvoiceAdmin: any = [];
  public isInvoice: boolean = false;
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public subscriptionInfo: any = {};
  public limits: any;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    public userService: UserService,
    public paginationService: PaginationService,
  ) {}

  ngOnInit() {
    this.paginationService.searchQuery = ''
    this.limits = this.userService.getSettings();
    this.errorService.clearAlerts()
    if (this.userService.isAdmin()) {
      this.getListPlansAdmin(null);
    }
    if (this.userService.isMerchant() || this.userService.isCustomer()) {
      this.getListPlansMerchant();
    }  
  }

  getListInvoice(event: any) {
    this.errorService.clearAlerts();
    let objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    this.http.get<any>(this.host + '/invoice/subscription/list/customer', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listInvoice = <any> response.list.data;
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

  getListPlansMerchant() {
    this.errorService.clearAlerts();
    let objRequest = {
      u_token: this.userService.getToken()
    }
    this.http.get<any>(this.host + '/subscription/list/customer', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            if (!response.list.length) {
              this.subscriptionInfo = {};
              this.isInvoice = false;
            } else {
              this.subscriptionInfo = <any> response.list[0];
              this.isInvoice = true;
            }
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
  
  getListPlansAdmin(event: any) {
    this.errorService.clearAlerts();
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    this.http.get<any>(this.host + '/invoice/subscription/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listInvoiceAdmin = <any> response.list.data;
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
}
