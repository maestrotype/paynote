import {Component, OnInit} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {ActivatedRoute} from '@angular/router'
import {UserService} from '../../_services/user.service'
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms'
import {MatDialog} from "@angular/material"
import {ErrorService} from '../../_services/error.service'
import {PaginationService} from '../../_services/pagination.service'


@Component({
  selector: 'app-mail-history',
  templateUrl: './mail-history.component.html',
  styleUrls: ['./mail-history.component.css']
})
export class MailHistoryComponent implements OnInit {

  public host: string
  public listMailStogage: any = []
  public descriptionMail: any = []
  public errorMessage: string
  public isError: boolean
  public objUser: any
  public objParam: any
  public modelNewCustomer: any
  public isModalError: boolean
  public errorModalMessage: string
  public isLoading: boolean = false
  public isSuccess: boolean = false
  public modalRef: NgbModalRef
  public sortAndPagination: any = []
  public successMessage: string
  public mailBody: string
  public pageSize: any
  public pageNo: any

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
  ) {
    this.host = environment.host
    this.isError = false
  }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'))
    this.paginationService.searchQuery = ''
//    this.getListMailStorage(null)
  }
  
  openMailStorageModal(content: any, fs_obj: any) {
    this.descriptionMail = fs_obj
    this.modalRef = this.modalService.open(content, {size:"lg"})
    
  }

  getListMailStorage(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000)
    
    this.http.get<any>(this.host + '/mail/storage/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
//            console.log(response)
            this.listMailStogage = <any> response.list.data
            this.sortAndPagination = response.list
            this.paginationService.setParamsForResponce(this.sortAndPagination)
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
  }

  clearMessages() {
    this.isModalError = this.isError = this.isModalError = this.isSuccess = false
    this.successMessage = this.errorMessage = this.errorModalMessage = ''
  }

  closeModal() {
    this.modalRef.close()
  }
  
  getError( mail: any = null ) {
    let messageError = ''
    switch(mail.error) {
      case 'invalid':
        messageError = 'Invalid email address'
        break
      case 'bounce':
      case 'disposable':
        messageError = 'Undeliverable'
        break
    }
    
    return messageError
  }
  
  getStatus( mail: any = null ) {
    let messageStatus = mail.status
    switch(mail.status) {
      case 'Suspended':
        messageStatus = 'Undeliverable'
        break
    }
    
    return messageStatus
  }

}
