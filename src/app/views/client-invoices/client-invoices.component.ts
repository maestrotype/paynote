import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';

@Component({
  selector: 'app-client-invoices',
  templateUrl: './client-invoices.component.html',
  styleUrls: ['./client-invoices.component.css']
})
export class ClientInvoicesComponent implements OnInit {

  public host: string = environment.host;
  public listInvoices: any = [];
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private route: Router,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
  ) { }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.paginationService.sortField = 'updated_at';
    this.paginationService.searchQuery = ''
  }
  
  getListInvoices(event: any = null) {

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      u_token: this.userService.getToken()
    }
    
    let url = '/customer/check/invoice/list';
    if (this.userService.isClient() || this.userService.isCustomer() ) {
      url = '/client/check/invoice/list';
    }
    
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    
    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          console.log(response);
          if (response.success) {
            this.listInvoices = <any> response.list.data;
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
  

}
