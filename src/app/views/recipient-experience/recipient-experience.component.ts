import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {Utility} from '../../_helpers/utility';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {DialogService} from '../../_services/dialog.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {JqueryService} from '../../_services/jquery.service';
import {MessagesService} from '../../_services/messages.service';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import * as moment from 'moment';

@Component({
  selector: 'app-recipient-experience',
  templateUrl: './recipient-experience.component.html',
  styleUrls: ['./recipient-experience.component.css']
})
export class RecipientExperienceComponent implements OnInit {

  @Input() u_token: string;

  public host: string = environment.host;
  public isLoading = false;
  public modalRef: NgbModalRef;

  public objRecipientExperienceComp: any = {
    typePreview: <string> '',
    objSettings: <any> {},
    imageChangedEventInvoice: <any> null,
    imageChangedEventCheck: <any> null,
    uploadFileInvoice: <any> null,
    uploadFileCheck: <any> null,
    formInvoice: {
      is_instant_v: <number> 1,
      is_two_auth: <number> 1,
      is_manual_v: <number> 0,
      logo: <string> '',
      button: <string> 'Send Check',
      title: <string> 'Securely send and receive digital checks online.',
    },
    formCheck: {
      is_online_deposit: <number> 1,
      is_print_deposit: <number> 1,
      is_two_auth: <number> 1,
      logo: <string> '',
      buttonDeposit: <string> 'Deposit the Check Online',
      buttonPrint: <string> 'Print and Deposit the Check',
      title: <string> 'Securely send and receive digital checks online.',
    }
  };

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public userService: UserService,
    public jqueryService: JqueryService,
    public messages: MessagesService,
    public utility: Utility,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {
    if (this.userService.isMerchant() ) {
      this.getEmailSettingsInfo();
    }
  }

  checkDepositOnlineSelected( strType: string = '' ) {
    if( strType == 'online_deposit' ) {
      if ( !this.objRecipientExperienceComp.formCheck.is_online_deposit && !this.objRecipientExperienceComp.formCheck.is_print_deposit ) {
        this.objRecipientExperienceComp.formCheck.is_print_deposit = 1;
      }
    }

    if( strType == 'print_deposit' ) {
      if ( !this.objRecipientExperienceComp.formCheck.is_online_deposit && !this.objRecipientExperienceComp.formCheck.is_print_deposit ) {
        this.objRecipientExperienceComp.formCheck.is_online_deposit = 1;
      }
    }
  }

  getEmailSettingsInfo() {
    this.http.get<any>(this.host + '/user/merchant/details', {params:  {
        u_token: this.userService.getToken()}
    }).subscribe(
      response => {
        if (response.success) {
          if ( response.invoice_experience ) {
            this.objRecipientExperienceComp.formInvoice = Object.assign( this.objRecipientExperienceComp.formInvoice, response.invoice_experience );
          }
          if ( response.check_experience ) {
            this.objRecipientExperienceComp.formCheck = Object.assign( this.objRecipientExperienceComp.formCheck, response.check_experience );
          }
          this.objRecipientExperienceComp.objSettings = response;
        }
      },
      errResponse => {
        if (errResponse.error) {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      }
    );
  }

  submitExperience( strType: string = '' ) {
    this.isLoading = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to update Recipient Experience',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_update'),
      checkbox_confirm: false,
    };

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        const objRequest: any = {
          invoice_experience: this.objRecipientExperienceComp.formInvoice,
          check_experience: this.objRecipientExperienceComp.formCheck,
          u_token: this.userService.getToken()
        };
        this.http.post<any>(this.host + '/user/merchant/experience', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.isLoading = false;
                this.clearForm();
                this.topAlertsService.popToast('success', 'Success', 'Recipient Experience successfully updated');
              }
            },
            err => {
              if (err.error) {
                this.isLoading = false;
                this.utility.getMessageError( err.error );
                this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
              }
            }
          );
      } else {
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.objRecipientExperienceComp.imageChangedEventInvoice = null;
    this.objRecipientExperienceComp.imageChangedEventCheck = null;
    this.objRecipientExperienceComp.uploadFileInvoice = null;
    this.objRecipientExperienceComp.uploadFileCheck = null;
  }

  fileChangeEvent(event: any, type: string = ''): void {
    if( type == 'invoice' ) {
      this.objRecipientExperienceComp.imageChangedEventInvoice = event;
    }
    if( type == 'check' ) {
      this.objRecipientExperienceComp.imageChangedEventCheck = event;
    }
  }
  imageCropped(event: ImageCroppedEvent, type: string = '') {
    if( type == 'invoice' ) {
      this.objRecipientExperienceComp.formInvoice.logo = event.base64;
    }
    if( type == 'check' ) {
      this.objRecipientExperienceComp.formCheck.logo = event.base64;
    }
  }
  imageLoaded() {
    console.log( event );
  }
  loadImageFailed() {
    this.topAlertsService.popToast('error', 'File type invalid', 'Upload please .png or .jpg file');
    this.clearForm();
  }

  openDialog(content: any) {
    this.closeModal();
    this.modalRef = this.modalService.open(content, {size: 'lg', windowClass: 'previewInvoiceCheck'});
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  previewExperience( content: any = null, type: string = '' ) {
    this.objRecipientExperienceComp.typePreview = type;
    this.openDialog( content );
  }

  haveLogo() {
    if ( this.objRecipientExperienceComp.typePreview == 'invoice' ) {
      return this.objRecipientExperienceComp.formInvoice.logo && this.objRecipientExperienceComp.formInvoice.logo != '';
    }
    if ( this.objRecipientExperienceComp.typePreview == 'check' ) {
      return this.objRecipientExperienceComp.formCheck.logo && this.objRecipientExperienceComp.formCheck.logo != '';
    }
  }

  getLogo() {
    if ( this.objRecipientExperienceComp.typePreview == 'invoice' ) {
      return this.objRecipientExperienceComp.formInvoice.logo;
    }
    if ( this.objRecipientExperienceComp.typePreview == 'check' ) {
      return this.objRecipientExperienceComp.formCheck.logo;
    }
  }

  getTitle() {
    if ( this.objRecipientExperienceComp.typePreview == 'invoice' ) {
      return this.objRecipientExperienceComp.formInvoice.title != ''
        ? this.objRecipientExperienceComp.formInvoice.title : 'Securely send and receive digital checks online.';
    }
    if ( this.objRecipientExperienceComp.typePreview == 'check' ) {
      return this.objRecipientExperienceComp.formCheck.title != ''
        ? this.objRecipientExperienceComp.formCheck.title : 'Securely send and receive digital checks online.';
    }
  }

  getInvoiceButtonLabel() {
    return this.objRecipientExperienceComp.formInvoice.button != ''
      ? this.objRecipientExperienceComp.formInvoice.button : 'Send Check';
  }

  haveOnlineDeposit() {
    return this.objRecipientExperienceComp.formCheck.is_online_deposit == 1 || this.objRecipientExperienceComp.formCheck.is_online_deposit;
  }
  getLabelOnlineDeposit() {
    return this.objRecipientExperienceComp.formCheck.buttonDeposit != '' ? this.objRecipientExperienceComp.formCheck.buttonDeposit : 'Deposit the Check Online';
  }
  getLabelPrintDeposit() {
    return this.objRecipientExperienceComp.formCheck.buttonPrint != '' ? this.objRecipientExperienceComp.formCheck.buttonPrint : 'Print and Deposit the Check';
  }
  havePrintDeposit() {
    return this.objRecipientExperienceComp.formCheck.is_print_deposit == 1 || this.objRecipientExperienceComp.formCheck.is_print_deposit;
  }

  getPreviewDate() {
    return moment().format('YYYY-MM-DD');
  }
}
