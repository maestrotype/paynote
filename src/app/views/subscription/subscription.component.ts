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

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
  providers: [ PaginationService ],
})
export class SubscriptionComponent implements OnInit {

  public host: string;
  public listSubscription: any = [];
  public descriptionMail: any = [];
  public descriptionMailEdit: any = [];
  public modelNewCustomer: any;
  public errorMessage: string;
  public isError: boolean;
  public objUser: any;
  public objParam: boolean =  true;
  public setSubsc: any;
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
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public paginationService: PaginationService,
  ) {
    this.host = environment.host;
    this.isError = false;
  }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'));
    this.paginationService.sortField = 'id';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.searchQuery = ''
  }

  openMailTemplateViewModal(content: any, fs_obj: any) {
    this.descriptionMail = fs_obj;
    this.modalRef = this.modalService.open(content, {size: "lg"});
  }

  getListSubscription(event: any = null) {   
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
     
    if(this.objParam == false){
      this.setSubsc = 1;
    }else{
      this.setSubsc = 0;
    }
    
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      disabled: this.setSubsc
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/subscription/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
//            console.log(response);
            this.listSubscription = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isError = errResponse.error.error;
            this.errorMessage = errResponse.error.message;
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
