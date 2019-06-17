import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  providers: [ErrorService]
})
export class PlansComponent implements OnInit {

  public host: string = environment.host;
  public listPlans: any = [];
  public modelPlan: any;
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;
  public pageSize: any;
  public pageNo: any;
  public action: string;


  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public messages: MessagesService,
  ) {
    this.modelPlan = {
      name: '',
      type: 'Public',
      status: 'Enabled',
      billing_link: 0,
      note: '',
      num_free: '',
      num: '',
      send_receive: 'Send',
      months: '1',
      amount: '',

      receive: {
        num: '',
        num_free: '',
        over: '0',
        over_pct: '0',
        verify: '0',
        verify_pct: '1',
        limit:{}
      },
      send: {
        num: '',
        num_free: '',
        over: '0',
        over_pct: '0',
        limit:{}
      }
    };
  }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.paginationService.sortField = 'rate';
    this.paginationService.searchQuery = ''
  }

  openModal(content: any, size: any = 'sm') {
    this.closeModal()
    this.modalRef = this.modalService.open(content, {size: size})
  }

  prepareEditPlan(content: any, p_token: string) {
    this.retrievePlan(p_token);
    this.closeModal()
    this.openModal(content, 'lg');
    this.action = 'edit';
  }
  prepareAddPlan(content: any) {
    this.closeModal()
    this.openModal(content, 'lg');
    this.action = 'add';
  }

  retrievePlan(p_token: any) {
    this.errorService.clearAlerts();
    let objRequest = {
      p_token: p_token,
    }
    this.http.get<any>(this.host + '/plan/retrieve', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
//                        console.log(response);
            this.modelPlan = <any> response.plan;
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

  getListPlans(event: any) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    setTimeout(() => this.errorService.clearAlerts(), 3000);

    let objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    this.http.get<any>(this.host + '/plan/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            //                                    console.log(response.list);
            this.listPlans = <any> response.list.data;
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

  updatePlan() {
    this.errorService.clearAlerts();
    this.isLoading = true;

    let url = '/plan/add';
    let successMessage = this.messages.get('PLAN_ADDED_SUCCESSFULLY');
    if (this.action == 'edit') {
      url = '/plan/update';
      successMessage = this.messages.get('PLAN_EDIT_SUCCESSFULLY');
    }
    this.modelPlan.next_day = Number(this.modelPlan.next_day);
    
    this.http.post<any>(this.host + url, this.modelPlan)
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response);
            this.closeModal();
            this.isLoading = false;
            this.errorService.getMessageSuccess(response, successMessage);
            this.getListPlans(null);
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
    if( !this.modalRef ) {
      return
    }
    this.modalRef.close();
  }

}
