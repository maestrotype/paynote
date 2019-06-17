import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
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

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.css']
})
export class EmailSettingsComponent implements OnInit {

  @Input() u_token: string;

  public host: string = environment.host;
  public isLoading = false;
  public isInputError = false;
  public modalRef: NgbModalRef;
  public inputValue;

  public objEmailSettingsComp: any = {
    lstEmailSettings: <any> [],
    objEmailTemplate: <any> {
      data: {
        expiration: 90
      }
    },
    imageChangedEvent: <any> null,
    uploadFile: <any> null,
    tempCroppedFile: <any> null,
    canShowEditTemplate: <boolean> false,
    editorConfig: <any> {
      'toolbar': [
          ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'justifyLeft', 'justifyCenter', 'justifyRight',
            'justifyFull', 'undo', 'redo', 'paragraph', 'blockquote', 'removeBlockquote', 'horizontalLine', 'orderedList',
            'unorderedList', 'link']
      ]
    }
  };

  @ViewChild('viewMailMerge33')
  private viewMailMerge33: TemplateRef<any>;

  @ViewChild('viewMailMerge34')
  private viewMailMerge34: TemplateRef<any>;

  @ViewChild('viewMailMerge36')
  private viewMailMerge36: TemplateRef<any>;

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
    if (this.userService.isMerchant() && environment.availableEmailSettings ) {
      this.getEmailSettingsInfo();
    }
  }
  getEmailSettingsInfo() {
    this.http.get<any>(this.host + '/customer/mail/template/list', {params:  {
      u_token: this.u_token}
    }).subscribe(
      response => {
        if (response.success) {
          this.objEmailSettingsComp.lstEmailSettings = response.list.data;
          setTimeout(() => this.jqueryService.addClass('a.element-box.el-tablo:first', 'active'), 500);
          setTimeout(() => this.showEditTemplate(this.objEmailSettingsComp.lstEmailSettings[0]), 500);
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

  getTemplateName( idTemplateRest: number = 0 ) {
    const idTemplate = idTemplateRest > 0 ? idTemplateRest : this.objEmailSettingsComp.objEmailTemplate.template_id;
    let templateName = <string> '';
    switch (idTemplate ) {
      case 33:
        templateName = 'Recipient Receives a Digital Check';
        break;
      case 34:
        templateName = 'Recipient Receives Automatic Deposit';
        break;
      case 36:
        templateName = 'Recipient Receives Invoice';
        break;
    }

    return templateName;
  }

  showEditTemplate( objEmailTemplate: any = null ) {
    this.jqueryService.removeClass('.el-tablo', 'active');
    this.jqueryService.addClass('#el_tablo_' + objEmailTemplate.template_id, 'active');
    this.objEmailSettingsComp.canShowEditTemplate = true;
    this.objEmailSettingsComp.objEmailTemplate = objEmailTemplate;
    if ( !this.objEmailSettingsComp.objEmailTemplate.data ) {
      this.objEmailSettingsComp.objEmailTemplate.data = {
        reply_to: this.userService.getEmail()
      };
    }
    if (this.objEmailSettingsComp.objEmailTemplate.data.expiration && this.objEmailSettingsComp.objEmailTemplate.data.expiration < 1
      || this.objEmailSettingsComp.objEmailTemplate.data == null || this.objEmailSettingsComp.objEmailTemplate.data.expiration == null) {
      this.objEmailSettingsComp.objEmailTemplate.data.expiration = 90;
      this.inputValue = 90;
    } else {
      this.inputValue = this.objEmailSettingsComp.objEmailTemplate.data.expiration;
    }
      // this.objEmailSettingsComp.objEmailTemplate.data.expiration =
      // this.objEmailSettingsComp.objEmailTemplate.data.expiration ? this.objEmailSettingsComp.objEmailTemplate.data.expiration : 90;
    if ( !this.objEmailSettingsComp.objEmailTemplate.reply_to ) {
      this.objEmailSettingsComp.objEmailTemplate.reply_to = this.userService.getEmail();
    }
  }

  saveEmailTemplate() {
    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to uptate email template',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_update')
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
        if (result) {
          if (this.objEmailSettingsComp.objEmailTemplate.data.expiration < 1) {
            this.objEmailSettingsComp.objEmailTemplate.data.expiration = '';
            this.isInputError = true;
            this.topAlertsService.popToast('error', 'Error', 'Days of expiration must not be less than 1');
            return;
          }
          if (this.objEmailSettingsComp.objEmailTemplate.data.expiration > 180) {
            this.objEmailSettingsComp.objEmailTemplate.data.expiration = '';
            this.isInputError = true;
            this.topAlertsService.popToast('error', 'Error', 'Expires in max 180 days ');
            return;
          }
          const objRequest: any = this.objEmailSettingsComp.objEmailTemplate;
          objRequest.u_token = this.userService.getToken();
          objRequest.body = this.jqueryService.getDomElement('#mail_template_' + this.objEmailSettingsComp.objEmailTemplate.template_id)[0].innerHTML;
          this.http.post<any>(this.host + '/customer/mail/template/update', objRequest)
            .subscribe(
              response => {
                if (response.success) {
                  this.topAlertsService.popToast('success', 'Success', this.messages.get('MAIL_TEMPLATE_SUCCESSFULLY_SAVE'));
                  this.clearForm();
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
  onChangeExpInput(event) {
    this.isInputError = false;
    const initalValue = event.srcElement.value;
    event.srcElement.value = initalValue.replace(/[^0-9]*/g, '');
    if ( initalValue !== event.srcElement.value) {
      if (initalValue < 1) {
        event.stopPropagation();
      }
    } else {
      this.inputValue = event.srcElement.value;
    }
  }

  clearForm() {
    this.objEmailSettingsComp.tempCroppedFile = null;
    this.objEmailSettingsComp.imageChangedEvent = null;
    this.objEmailSettingsComp.uploadFile = null;
  }

  fileChangeEvent(event: any): void {
    this.objEmailSettingsComp.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.objEmailSettingsComp.objEmailTemplate.data.logo = event.base64;
      this.objEmailSettingsComp.tempCroppedFile = event.base64;
  }
  imageLoaded() {
      console.log( event );
  }
  loadImageFailed() {
    this.topAlertsService.popToast('error', 'File type invalid', 'Upload please .png or .jpg file');
    this.objEmailSettingsComp.imageChangedEvent = null;
    this.objEmailSettingsComp.uploadFile = null;
  }
  showMailMerge() {
    switch ( this.objEmailSettingsComp.objEmailTemplate.template_id ) {
      case 33:
        this.openDialog(this.viewMailMerge33 );
        break;
      case 34:
        this.openDialog(this.viewMailMerge34 );
        break;
      case 36:
        this.openDialog(this.viewMailMerge36 );
        break;
    }
  }

  openDialog(content: any, contentBack: any = null) {
    this.closeModal();
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

}
