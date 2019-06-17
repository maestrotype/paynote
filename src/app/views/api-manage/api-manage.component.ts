import { Component, Input, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {UserService} from '../../_services/user.service'
import {Utility} from '../../_helpers/utility'
import {TopAlertsService} from '../../_services/top-alerts.service'
import {DialogService} from '../../_services/dialog.service'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {MatDialog} from "@angular/material"
import {JqueryService} from '../../_services/jquery.service'
import {MessagesService} from '../../_services/messages.service'
import {PaginationService} from '../../_services/pagination.service'

@Component({
  selector: 'app-api-manage',
  templateUrl: './api-manage.component.html',
  styleUrls: ['./api-manage.component.css'],
  providers: [PaginationService],
})
export class ApiManageComponent implements OnInit {
  
  @Input() u_token: string;
  @Input() ext_app_id: string;

  public host: string = environment.host
  public loading: boolean
  public modalRef: NgbModalRef

  public objApiManageComp: any = {
    objExternApp: <any> {
      live_endpoint: <string>environment.api.live_endpoint,
      sandbox_endpoint: <string>environment.api.sandbox_endpoint
    },
    lstApiLogs: <any> [],
    objResponseLog: <any> {},
    apiDocumentation: 'https://developers.seamlesschex.com/paynote/docs/',
    checkoutJsDocumentation: 'https://developers.seamlesschex.com/paynote/docs/checkoutjs/',
    objFilter: <any> {
      status: 'error',
      event: 'all'
    },
    objLiveWebhookUrlResponse: <any> null,
    objTestWebhookUrlResponse: <any> null
  }

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public userService: UserService,
    public jqueryService: JqueryService,
    public messages: MessagesService,
    public utility: Utility,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService,
    public paginationService: PaginationService,
  ) { }

  ngOnInit() {
    this.paginationService.searchQuery = ''
    if (this.ext_app_id ) {
      this.getApiInfo()
    }
  }
  
  openDialog(content: any) {
    this.closeModal()
    this.modalRef = this.modalService.open(content, {size: 'lg'})
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close()
    }
  }
  
  getApiInfo() {
    this.http.post<any>(this.host + '/customer/extern/app', {
      u_token: this.u_token
    }).subscribe(
      response => {
        if (response.success) {
          this.ext_app_id = 'true'
          this.objApiManageComp.objExternApp = Object.assign(this.objApiManageComp.objExternApp, response)
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.utility.getMessageError(errResponse.error)
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
        }
      }
    );
  }
  
  updateApiWebHook() {
    this.objApiManageComp.objLiveWebhookUrlResponse = null
    this.objApiManageComp.objTestWebhookUrlResponse = null
    this.http.post<any>(this.host + '/customer/extern/app/update/webhook', {
      u_token: this.u_token,
      live_webhook_url: this.objApiManageComp.objExternApp.live_webhook_url,
      test_webhook_url: this.objApiManageComp.objExternApp.test_webhook_url
    }).subscribe(
      response => {
        if (response.success) {
          this.getListLogs()
          this.topAlertsService.popToast('success', 'Success', 'WebHook Urls Successfully Updated')
          this.objApiManageComp.objLiveWebhookUrlResponse = response.live_webhook_url
          this.objApiManageComp.objTestWebhookUrlResponse = response.test_webhook_url
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.utility.getMessageError(errResponse.error)
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
        }
      }
    );
  }
  
  changeApiStatus() {
    let url = <string> (this.objApiManageComp.objExternApp.is_active ? '/customer/extern/app/enable' : '/customer/extern/app/disable')
    
    this.http.post<any>(this.host + url, {
      u_token: this.u_token
    }).subscribe(
      response => {
        if (response.success) {
          this.topAlertsService.popToast('success', 'Success', 'Api Successfully Updated')
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.utility.getMessageError(errResponse.error)
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
        }
      }
    );
  }
  
  handleApiStatus() {
    if( !this.ext_app_id ) {
      this.getApiInfo()
    } else {
      this.changeApiStatus()
    }
  }
  
  handlerCopy( $event: any ) {
    if ($event.isSuccess ) {
      $event.event.textContent = ' Copied'
    }
  }
  
  regenerateApiKeys( bIsLive : boolean = false ) {
    let objDataDialog = {
      title: 'Please confirm',
      text: 'Update Api Keys',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    }
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
    
        let url = <string> (bIsLive ? '/customer/extern/app/update/live' : '/customer/extern/app/update/test')
        this.http.post<any>(this.host + url, {
          u_token: this.u_token
        }).subscribe(
          response => {
            if (response.success) {
              this.objApiManageComp.objExternApp = Object.assign(this.objApiManageComp.objExternApp, response)
              this.topAlertsService.popToast('success', 'Success', 'Api keys Successfully Updated')
            }
          },
          errResponse => {
            if (errResponse.error) {
              this.utility.getMessageError(errResponse.error)
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
            }
          }
        );
      }
    });
  }
  
  goToSandBoxMode() {
    let objDataDialog = {
      title: 'Confirm mode switch',
      text: this.messages.get('CONFIRM_MODE_SWITCH_TO_SANDBOX'),
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_switch')
    }
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.userService.goToSandBoxMode()
      }
    })
  }
  
  
  getListLogs(  event: any = null ) {
    let objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    objRequest = Object.assign(objRequest, this.objApiManageComp.objFilter)

    this.http.get<any>(this.host + '/webhook/process/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objApiManageComp.lstApiLogs = response.list.data
            this.paginationService.setParamsForResponce(response.list)
          }
        },
        err => {
          if (err.error) {
            this.utility.getMessageError( err.error )
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage)
          }
        }
      )
  }
  
  viewResponse( objLog: any = null, content: any = null ) {
    this.objApiManageComp.objResponseLog = objLog
    this.openDialog( content )
  }

}
