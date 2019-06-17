import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router'
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms'
import {MatDialog} from "@angular/material"
import {Utility} from '../../_helpers/utility'
import {UserService} from '../../_services/user.service'
import {MessagesService} from '../../_services/messages.service'
import {DialogService} from '../../_services/dialog.service'
import {TopAlertsService} from '../../_services/top-alerts.service'
import {PaginationService} from '../../_services/pagination.service'

@Component({
  selector: 'app-multiple-phone',
  templateUrl: './multiple-phone.component.html',
  styleUrls: ['./multiple-phone.component.css']
})
export class MultiplePhoneComponent implements OnInit {

  public host: string;
  public objMultiplePhoneComp: any = {
    lstPhoneNumbers: <any> [],
    objPhoneNumber: <any> {}
  }
  
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public utility: Utility,
    public userService: UserService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService,
    public dialog: MatDialog,
    public paginationService: PaginationService,
  ) {
    this.host = environment.host
  }

  ngOnInit() {
    this.paginationService.sortField = 'phone';
    this.paginationService.searchQuery = ''
    this.getMultiplePhones()
  }
  
  getMultiplePhones(event: any = null) {
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir
    }
    this.http.get<any>(this.host + '/multiphone/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            console.log(response)
            this.objMultiplePhoneComp.lstPhoneNumbers = response.list.data
            this.paginationService.setParamsForResponce(response.list)
          }
          this.isLoading = false
        },
        err => {
          this.isLoading = false
          if (err.error) {
            this.topAlertsService.popToast('error', 'Error', err.error.message)
          }
        }
      )
  }
  
  disableMupliPhone(objPhoneNumber: any = null) {
    this.isLoading = true
    let objRequest = {
      phone: objPhoneNumber.phone,
      enable: objPhoneNumber.enabled ? 0 : 1
    }
    
    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + ( objPhoneNumber.enabled ? 'disable' : 'enable' ) + ' muptiple phone',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability( objPhoneNumber.enabled ? 'confirm_disable_pay_link' : 'confirm_enable_pay_link'),
      checkbox_confirm: false,
    }
    
    
    
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/multiphone/enable', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.isLoading = false
                this.topAlertsService.popToast('success', 'Success', 'Muptiple Phone successfully ' + (objPhoneNumber.enabled ? 'disabled' : 'enabled') + '')
                objPhoneNumber.enabled = !objPhoneNumber.enabled
              }
            },
            err => {
              if (err.error) {
                this.isLoading = false
                this.utility.getMessageError( err.error )
                this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
              }
            }
          )
      } else {
        this.isLoading = false
      }
    })
  }
  
  prepareEdit( objPhone: any = null, content: any = null ) {
    this.objMultiplePhoneComp.objPhoneNumber = objPhone
    this.openModal( content )
  }
  
  prepareAdd( content: any = null) {
    this.objMultiplePhoneComp.objPhoneNumber = {
      limit: 1
    }
    this.openModal( content )
  }
  
  editPhoneNumber() {
    let successMessage = 'Mupliple Phone added successfully'
    let url = '/multiphone/create'
    if ( this.objMultiplePhoneComp.objPhoneNumber.id ) {
      successMessage = 'Mupliple Phone updated successfully'
      url = '/multiphone/update'
    }
    this.http.post<any>(this.host + url, this.objMultiplePhoneComp.objPhoneNumber)
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal()
            this.objMultiplePhoneComp.objPhoneNumber = {}
            this.topAlertsService.popToast('success', 'Success', successMessage)
            this.getMultiplePhones()
          }
          this.isLoading = false
        },
        err => {
          this.isLoading = false
          if (err.error) {
            this.utility.getMessageError( err.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }
  
  openModal(content: any) {
    this.closeModal()
    this.modalRef = this.modalService.open(content, { backdrop: 'static' })
  }
  
  closeModal() {
    if( this.modalRef ) {
      this.modalRef.close()
    }
  }

}
