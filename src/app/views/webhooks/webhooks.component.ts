import {Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';
import {DialogService} from '../../_services/dialog.service';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.css'],
  providers: [PaginationService],
})
export class WebhooksComponent implements OnInit {

  public host: string = environment.host;
  public dataWebhooks: any = [];
  public addWebhook: any = {url: ''};
  public listWebhookData: any = [];
  public webhookListID: any = { id: null, url: null };
  public objParam: any;
  public modelEditTemplate: any;
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public messages: MessagesService,
    public dialog: MatDialog,
    public dialogService: DialogService
  ) {}

  ngOnInit() {
    this.errorService.clearAlerts()
    this.retrieveWebhook();
    this.paginationService.visiblePagination = false;
    this.paginationService.searchQuery = ''
  }


  retrieveWebhook() {
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    this.http.get<any>(this.host + '/dwl/webhook/list', {})
      .subscribe(
        response => {
          if (response.success) {
            this.dataWebhooks = <any> response.list;
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  listWebhook(event: any) {
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
      whs: this.webhookListID.id
    }
    this.http.get<any>(this.host + '/dwl/webhook/events', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listWebhookData = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error) {
           this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }


  toggleViewWebhookList(dataWebhookListObj: any) {
    this.webhookListID = dataWebhookListObj;
    this.listWebhook(null);
  }

  openModal(content: any, fs_obj: any) {
    if (fs_obj != null) {
      this.objParam = fs_obj.attempts;
    }
    this.errorService.clearAlerts();
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content, {size: 'lg'});
  }

  openModalAdd(content: any) {
    this.errorService.clearAlerts();
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    this.modalRef.close();
  }

  onToggleWebhook(value: any, idWebhook: string = '') {
    this.errorService.clearAlerts();
    let enebledDisabledStatus;

    if (value.checked) {
      enebledDisabledStatus = 'disabled';
    } else {
      enebledDisabledStatus = 'enabled';
    }
    
    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + enebledDisabledStatus + ' webhook status?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    }
    
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        let status = value.checked ? 'paused' : 'unpaused';
        this.http.post<any>(this.host + '/dwl/webhook/pause', {
          paused: value.checked ? 1 : 0,
          whs: idWebhook
        })
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess(response, 'Webhook successfully ' + status + '');
                this.retrieveWebhook();
              }
            },
            err => {
              if (err.error) {
                this.errorService.getMessageError(err.error);
              }
            }
          );
      }
    });
  }

  deleteWebhookModal(hook_id: string) {
    this.errorService.clearAlerts();
    
    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure want to delete webhook?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    }
    
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/dwl/webhook/delete', { whs: hook_id, })
      .subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess(response, this.messages.get('WEBHOOK_URL_SUCCESSFULLY_DELETE'));
            this.retrieveWebhook();
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
      }
    });
  }

  addNewWebhook() {
    this.http.post<any>(this.host + '/dwl/webhook/create', {
      url: this.addWebhook.url,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.errorService.getMessageSuccess(response, this.messages.get('WEBHOOK_SUCCESSFULLY_ADD'));
            this.retrieveWebhook();
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  saveWebhook() {
    this.http.post<any>(this.host + '/dwl/webhook/create', {
      url: this.dataWebhooks.url,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess(response, this.messages.get('WEBHOOK_SUCCESSFULLY_SAVE'));
            this.retrieveWebhook();
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }
}
