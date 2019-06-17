import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CurrencyPipe} from '@angular/common';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';
import {DialogService} from '../../_services/dialog.service';
import {TransactionService} from '../../_services/transaction.service';
import {MessagesService} from '../../_services/messages.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {Uploader} from '../../_helpers/uploader/uploader';
import {NgProgress} from '@ngx-progressbar/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';

@Component({
  selector: 'app-billing-link',
  templateUrl: './billing-link.component.html',
  styleUrls: ['./billing-link.component.css']
})
export class BillingLinkComponent implements OnInit {

  public host: string = environment.host;
  public subDomen: string = environment.subDomen;
  public isLoading = false;
  public makeRecurringToggle = false;
  public storageFilterName = 'billingLinks';
  public objBillingLinkComp: any = {
    form: {
      amount: <string> '0',
      description: <string> '',
      callback: <string> '',
      is_instant_v: <number> 1,
      is_two_auth: <number> 1,
      is_manual_v: <number> 0,
      logo: <string> '',
      button: <string> 'Send Check',
      title: <string> 'Securely send and receive digital checks online.',
      num_of_payments: <number> null
    },
    createdPaymentLink: <string> '',
    listPaymentLinks: <any> [],
    imageChangedEvent: <any> null,
    uploadFile: <any> null,
    urlHost: <string> ''
  };

  constructor(
    private http: HttpClient,
    public userService: UserService,
    public errorService: ErrorService,
    public jqueryService: JqueryService,
    private _formBuilder: FormBuilder,
    public utility: Utility,
    public dialog: MatDialog,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    public transactionService: TransactionService,
    public messages: MessagesService,
    private currencyPipe: CurrencyPipe,
    public topAlertsService: TopAlertsService,
    public uploaderService: Uploader,
    public ngProgress: NgProgress
  ) { }

  ngOnInit() {
    this.paginationService.searchQuery = '';
    this.objBillingLinkComp.urlHost = environment.hostOriginal;
    this.initFilter();
    // this.getListPaymentLink();
  }

  initFilter(): void {
    const objFilter = this.paginationService.getFilterFromLocalStorage(this.storageFilterName);
    if ( objFilter ) {
      // this.objFilter = Object.assign( this.objFilter, objFilter.filter );
      this.paginationService = Object.assign( this.paginationService, objFilter.pagination );
    }
  }

  resetFilter(): void {
    this.paginationService.resetFilterInLocalStorage(this.storageFilterName);
    this.paginationService.searchQuery = '';
    this.paginationService.sortField = 'created_at';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.pageNo = 1;
    this.getListPaymentLink();
  }

  submitBillLink() {
    this.isLoading = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to create Payment Page',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_create_pay_link'),
      checkbox_confirm: false,
    };

    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        const objRequest: any = Object.assign({u_token: this.userService.getToken()}, this.objBillingLinkComp.form);
        this.http.post<any>(this.host + '/customer/billing-link/create', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.isLoading = false;
                this.resetForm();
                this.topAlertsService.popToast('success', 'Success', 'Payment Page successfully created');
                this.getListPaymentLink();
                this.objBillingLinkComp.createdPaymentLink = this.objBillingLinkComp.urlHost + '/checkout/' + response.link.bl_token;
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

  disablePayLink(objPayLink: any = null) {
    this.isLoading = true;
    const objRequest = {
      bl_token: objPayLink.bl_token,
      u_token: this.userService.getToken(),
      enable: objPayLink.enabled ? 0 : 1
    };

    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + ( objPayLink.enabled ? 'disable' : 'enable' ) + ' Payment Page',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability( objPayLink.enabled ? 'confirm_disable_pay_link' : 'confirm_enable_pay_link'),
      checkbox_confirm: false,
    };



    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/customer/billing-link/enable', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.isLoading = false;
                this.topAlertsService.popToast('success', 'Success', 'Payment Page successfully '
                  + (objPayLink.enabled ? 'disabled' : 'enabled') + '');
                objPayLink.enabled = !objPayLink.enabled;
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

  getListPaymentLink( event: any = null ) {
    const objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };

    this.http.get<any>(this.host + '/customer/billing-link/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objBillingLinkComp.listPaymentLinks = response.list.data;
            this.paginationService.setParamsForResponce(response.list);
            this.paginationService.generateFilterForLocalStorage(this.storageFilterName);
          }
        },
        err => {
          if (err.error) {
            this.utility.getMessageError( err.error );
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  resetForm() {
    this.objBillingLinkComp.form = {
      amount: <string> '0',
      description: <string> '',
      callback: <string> '',
      is_instant_v: <number> 1,
      is_two_auth: <number> 1,
      is_manual_v: <number> 0,
      logo: <string> '',
      button: <string> 'Send Check',
      title: <string> 'Securely send and receive digital checks online.',
    };
    this.makeRecurringToggle = false;
    this.objBillingLinkComp.imageChangedEvent = null;
    this.objBillingLinkComp.uploadFile = null;
  }

  handlerCopy( $event: any ) {
    if ($event.isSuccess ) {
      $event.event.textContent = 'Copied';
      setTimeout(() => $event.event.textContent = 'Copy',  2000);
    }
  }

  getUrl(objPayLink: any = null) {
    return this.objBillingLinkComp.urlHost + '/checkout/' + objPayLink.bl_token;
  }
  getAmount(objPayLink: any = null) {
    return objPayLink.amount > 0 ? this.currencyPipe.transform(objPayLink.amount, '', 'symbol') : 'ANY';
  }

  fileChangeEvent(event: any): void {
    this.objBillingLinkComp.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.objBillingLinkComp.form.logo = event.base64;
  }
  imageLoaded() {
      console.log( event );
  }
  loadImageFailed() {
    this.topAlertsService.popToast('error', 'File type invalid', 'Upload please .png or .jpg file');
    this.objBillingLinkComp.imageChangedEvent = null;
    this.objBillingLinkComp.uploadFile = null;
  }
  onChangeReccuring(value: any) {
    this.makeRecurringToggle = value.checked === true;
  }
  getRecurringWord(billingCycle: string = '') {
    let billing_cycle = <string> 'Recurring ';
    switch (billingCycle) {
      case 'day':
        billing_cycle += 'Daily';
        break;
      case 'week':
        billing_cycle += 'Weekly';
        break;
      case 'month':
        billing_cycle += 'Monthly';
        break;
    }

    return billing_cycle;
  }

}
