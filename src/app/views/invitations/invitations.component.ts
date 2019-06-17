import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {ClipboardService} from 'ngx-clipboard'

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.css']
})
export class InvitationsComponent implements OnInit {

  public host: string;
  public listInvitations: any = [];
  public addNewInvitation: any;
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public pageSize: any;
  public pageNo: any;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public messages: MessagesService,
    public dialog: MatDialog,
    private _clipboardService: ClipboardService
  ) {
    this.host = environment.host;
    this.addNewInvitation = {
      invitation: ''
    };
  }

  ngOnInit() {
    this.paginationService.sortField = 'updated_at';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.searchQuery = ''
    this.errorService.clearAlerts();
  }

  openDialog(content: any, fs_obj: any) {
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
  }

  dialogResendInv(value: any) {
    this.errorService.clearAlerts();
    let objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to resend invitation email to <b>' + value.email + '</b>?',
      button_cancel_text: 'No',
      button_confirm_text: 'Yes',
      confirm: 'confirmInv'
    }
    this.openDialogInv(objDataDialog, value.inv_token);
  }

  openDialogInv(objDataDialog: any, inv_token: any = null): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: objDataDialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        switch (objDataDialog.confirm) {
          case 'confirmInv':
            this.resendInvitations(inv_token);
            break;

        }
      }
    });
  }

  resendInvitations(inv_token: any = null) {
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    this.http.post<any>(this.host + '/admin/invitation/resend', {
      inv_token: inv_token
    })
      .subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess({message: this.messages.get('INVITATIONS_RESEND_SUCCESSFULLY')});
            this.getInvitationsList();
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

  copyLink(text: string) {   
    this.errorService.timeToHide = 4000; 
    this.errorService.getMessageSuccess({message: 'Link copied'});    
    this._clipboardService.copyFromContent(this.host + '/sign-up/'+ text);
  }

  closeModal() {
    this.modalRef.close();
  }

  getInvitationsList(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    this.http.get<any>(this.host + '/admin/invitation/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listInvitations = <any> response.list.data;
            this.sortAndPagination = response.list;
            this.paginationService.setParamsForResponce(this.sortAndPagination);
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

  addInvitation(emails: any) {
    this.errorService.clearAlerts();
    this.http.post<any>(this.host + '/admin/invitation/add', {
      emails: emails.invitation,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.closeModal();
            this.errorService.getMessageSuccess({message: this.messages.get('INVITATIONS_ADDED_SUCCESSFULLY')});
            this.getInvitationsList(null);
            scrollTo(0, 20);
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
