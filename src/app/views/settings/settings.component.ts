import {Component, OnInit, forwardRef} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {MatDialog} from "@angular/material"
import {Utility} from '../../_helpers/utility'
import {PaginationService} from '../../_services/pagination.service'
import {UserService} from '../../_services/user.service'
import {ErrorService} from '../../_services/error.service'
import {MessagesService} from '../../_services/messages.service'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import {TopAlertsService} from '../../_services/top-alerts.service'
import {JqueryService} from '../../_services/jquery.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SettingsComponent),
      multi: true,
    },
  ],
})
export class SettingsComponent implements OnInit {
  public modelSettingsInfo: any
  public modelChangePassword: any
  public sortAndPagination: any = []
  
  public signaturePadOptions = {
    canvasWidth: 450,
    canvasHeight: 150
  }

  public host: string = environment.host
  public isLoading: boolean = false
  public sortField: string
  public sortDir: string
  public modalRef: NgbModalRef

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public errorService: ErrorService,
    public utility: Utility,
    public messages: MessagesService,
    public paginationService: PaginationService,
    public userService: UserService,
    public topAlertsService: TopAlertsService,
    public jqueryService: JqueryService
  ) {
  
    this.modelSettingsInfo = {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      checkNumber: '',
      invoiceNumber: ''
    }
    this.modelChangePassword = {
      currentPassword: '',
      newtPassword: '',
      newtPasswordConfirm: '',
      pinCode: ''
    }
  }


  ngOnInit() {
    this.getUserInfo(this.userService.getToken())
  }

  openModal(content: any) {
    if ( !this.userService.checkAvailableActions('saveAccount') ) {
      return
    }
    this.modalRef = this.modalService.open(content)
  }
  
  public onSaveHandler( test ) {
    this.isLoading = true
    let data = this.jqueryService.getBase64UrlFromCanvas('canvas')
    
    let url = '/dwl/customer/update'
    if (this.userService.isClient()) {
      url = '/dwl/client/update'
    }
    this.http.post<any>(this.host + url, {
      signature: data,
      u_token: this.userService.getToken(),
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal()
            this.isLoading = false
            this.topAlertsService.popToast('success', 'Success', this.messages.get('SIGNATURE_SAVE_SUCCESSFULLY'))
            this.getUserInfo(this.userService.getToken())
            this.userService.updateSignature(data)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false
            this.utility.getMessageError( errResponse.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }

  public onChangePassword(contentModal: any) {
    this.isLoading = true
    this.http.post<any>(this.host + '/user/password/change/initiate', {
      password: this.modelChangePassword.newtPassword,
      cpassword: this.modelChangePassword.newtPasswordConfirm,
      old_password: this.modelChangePassword.currentPassword,
      u_token: this.userService.getToken(),
    })
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'Success', response.message)
            this.closeModal()
            this.openModal(contentModal)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false
            this.utility.getMessageError( errResponse.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage )
          }
        }
      )
  }

  public onVerifyPhone() {
    this.isLoading = true
    this.http.post<any>(this.host + '/user/password/change', {
      password: this.modelChangePassword.newtPassword,
      cpassword: this.modelChangePassword.newtPasswordConfirm,
      old_password: this.modelChangePassword.currentPassword,
      u_token: this.userService.getToken(),
      phone_pin: this.modelChangePassword.pinCode,
      phone: this.userService.getPhone()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal()
            this.isLoading = false
            this.topAlertsService.popToast('success', 'Success', this.messages.get('UPDATE_PASSWORD_SUCCESSFULLY'))
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false
            this.utility.getMessageError( errResponse.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }

  public updateProfileInfo() {
    if ( !this.userService.checkAvailableActions('saveAccount') ) {
      return
    }

    this.isLoading = true
    let settings = <any> {
      check_number: this.modelSettingsInfo.settings.check_number,
      invoice_number: this.modelSettingsInfo.settings.invoice_number,
    }
    settings = !this.userService.isAdmin() ? settings : {}
    
    let url = '/dwl/customer/update'
    if (this.userService.isClient()) {
      url = '/dwl/client/update'
    }

    this.http.post<any>(this.host + url, {
      firstName: this.modelSettingsInfo.first_name,
      lastName: this.modelSettingsInfo.last_name,
      u_token: this.userService.getToken(),
      settings: settings,
      type: this.userService.getAccountTypeOrigin(),
      email: this.userService.getEmail()
    })
      .subscribe(
        response => {
          if (response.success) {
            this.userService.reInitClient()
            this.isLoading = false
            this.topAlertsService.popToast('success', 'Success', this.messages.get('UPDATE_PROFILE_INFO_SUCCESSFULLY'))
            //this.getUserInfo(this.userService.getToken())
            scrollTo(0, 20)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false
            this.utility.getMessageError( errResponse.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }

  public onClearHandler() {

  }
  public profileInfoVerifyEmail(email: any) {
    this.http.post<any>(this.host + '/user/email/verification', {
      email: email
    })
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false
            this.topAlertsService.popToast('success', 'Success', response.message)
            scrollTo(0, 20)
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false
            this.utility.getMessageError( errResponse.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }

  getUserInfo(u_token: string | string[]) {
    if (this.userService.getDwollaCustomer() && this.userService.getSettings() ) {
      this.modelSettingsInfo = Object.assign( this.userService.getDwollaCustomer().dwl_customer, this.userService.getUser() )
      if (!this.userService.getSettings() ) {
        this.modelSettingsInfo.settings = this.userService.getDefaultSettings()
      }
    }
  }

  closeModal() {
    if( !this.modalRef ) {
      return
    }
    this.modalRef.close()
  }
}
