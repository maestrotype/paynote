import {Component, OnInit, Input, OnChanges, SimpleChange} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {UserService} from '../../_services/user.service'
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {ErrorService} from '../../_services/error.service'
import {PaginationService} from '../../_services/pagination.service'

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  providers: [PaginationService, ErrorService]
})
export class BillingComponent implements OnInit {

  @Input() uToken: string
  
  public host: string = environment.host
  public lstBilling: any = {
    list:{}
  }
  public currentBill: any = {
    report:{}
  }
  public subscriptionBill: any = {
    remaining:{
      receive:{},
      send:{}
    }
  }
  public billingInfoForDialog: any
  public billingInputObj: any = {
    uToken: '',
    iToken: '',
    isBillingTrans: false
  }
  public loading: boolean = false
  public modalRef: NgbModalRef
  public sortAndPagination: any = []
  public lstBillingTrans: any
  public pageSize: any
  public pageNo: any
  public isTransaction: any
  

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public paginationService: PaginationService,
  ) {}
  
  ngOnInit() {
    this.paginationService.searchQuery = ''
    this.errorService.clearAlerts()
    this.getCurrentBill()
  }
  
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      switch (propName) {
        case 'uToken':
          if (!changes[propName].currentValue) {
            continue
          }
          this.getBillingList(null)
          break
      }
    }
  }

  getBillingDataForTransaction(billing:any){  
    this.billingInputObj.uToken = billing.u_token
    this.billingInputObj.iToken = billing.i_token
    this.billingInputObj.isBillingTrans = true
    this.listBillingTransactions()
  }
  
  listBillingTransactions(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo
    
    let objRequest: any = {
      u_token: this.billingInputObj.uToken,
      i_token: this.billingInputObj.iToken,
      limit: 1000,
      page: 1,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    let url = '/check/customer/billing/details/list'

    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
//            console.log(response)
            this.lstBillingTrans = response.list.data
            this.isTransaction = response.list.total
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
  }  

  openDialog(content: any) {
    this.modalRef = this.modalService.open(content, {size: "lg"})
  }

  closeModal() {
    this.modalRef.close()
  }

  showBillingInfoInPopup(content: any, billingObject: any) {
    
    let objRequest = {
       u_token: billingObject.u_token,
      i_token: billingObject.i_token     
    }

    this.http.get<any>(this.host + '/user/merchant/billing/retrieve', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {            
            this.billingInfoForDialog = response
            this.openDialog(content)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
    
    
  }

  getBillingList(event: any = null) {
    if ((this.userService.isAdmin() || this.userService.isSuperAdmin()) && !this.uToken  ) {
      return
    }
    
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo

    let objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    
    if ((this.userService.isAdmin() || this.userService.isSuperAdmin()) && this.uToken  ) {
      objRequest.u_token = this.uToken
    }

    this.http.get<any>(this.host + '/user/merchant/billing/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstBilling = response          
            this.paginationService.setParamsForResponce(response.list)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
  }
  getCurrentBill() {
    let objRequest = {
      u_token: this.userService.getToken()
    }
    
    if ((this.userService.isAdmin() || this.userService.isSuperAdmin()) && this.uToken  ) {
      objRequest.u_token = this.uToken
    }

    this.http.get<any>(this.host + '/user/merchant/billing/current', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.currentBill = response.cbilling || {report:{}}   
            this.subscriptionBill = response.subscription || {remaining:{}}         
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
  }

}
