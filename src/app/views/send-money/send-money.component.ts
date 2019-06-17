import {Component, OnInit} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {BankRoutingService} from '../../_services/bank-routing.service';
import {MessagesService} from '../../_services/messages.service';
import {DialogService} from '../../_services/dialog.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {Uploader} from '../../_helpers/uploader/uploader';
import {UploadDoc} from '../../_helpers/upload-doc';
import {NgProgress, NgProgressRef} from '@ngx-progressbar/core';

@Component({
  selector: 'app-send-money',
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.css']
})
export class SendMoneyComponent implements OnInit {

  public objSend: any = {
    billing_cycle: 'month',
    recurring: false
  };
  public lstFundSources: any = [];
  public host: string;
  public dateToday = '';
  public isLoading = false;
  public makeRecurringToggle = false;
  public recurringPeriod = false;
  public errorFileType = false;
  public errorFileSize = false;
  public objDirectDeposit: any = {};
  public modalRef: NgbModalRef;
  public objLoadedCustomer: any = {};
  public listCustomers: any = [];
  public arrayCustomers: any = [];
  public isNotHaveFunds = false;
  public textNotHaveFunds = '';
  public subDomen: string = environment.subDomen;
  public countNewPayLink = 0;
  public objSendMoneyComp: any = {
    form: {
      name_placeholder: '',
      name_temp: null
    }
  };

  progressRef: NgProgressRef;

  constructor(
    private http: HttpClient,
    public userService: UserService,
    public jqueryService: JqueryService,
    private _formBuilder: FormBuilder,
    public utility: Utility,
    private modalService: NgbModal,
    public ngProgress: NgProgress,
    private route: Router,
    private bankRoutingService: BankRoutingService,
    public dialog: MatDialog,
    private currencyPipe: CurrencyPipe,
    public messages: MessagesService,
    public dialogService: DialogService,
    public topAlertsService: TopAlertsService,
    public uploaderService: Uploader,
  ) {
    this.host = environment.host;
  }

  ngOnInit() {
    this.progressRef = this.ngProgress.ref('myProgress');
    this.getCustomersList();
    this.getMerchantFundSources();
    this.setDateToday();
  }

  resetForm() {
    this.isLoading = false;

    this.objSend = {
      billing_cycle: 'month',
      recurring: false,
      name: null,
      email: '',
      amount: '',
      description: ''
    };

    this.objSendMoneyComp.form.name_placeholder = '';
    this.objSendMoneyComp.form.name_temp = '';


    this.makeRecurringToggle = false;
    setTimeout(() => {
      this.jqueryService.setValue('#sendMoneyPayeesName input', '');
      this.jqueryService.resetFile('#sendCheckInput');
      this.jqueryService.removeClass('.form-group', 'has-error');
      this.jqueryService.removeClass('.form-group', 'has-danger');
      this.jqueryService.removeClass('ng-select.ng-invalid', 'ng-invalid');
      this.jqueryService.removeSelector('.with-errors.form-control-feedback');
      this.handleResultSelected(null, null);
    }, 10);
  }

  setDateToday() {
    this.dateToday = this.utility.getTodayDate();
  }

  getBankRouting() {
    this.bankRoutingService.getBankInfo(this.objDirectDeposit.routingNumber)
      .subscribe(
        response => {
          if (response.success) {
            this.objDirectDeposit.name = response.bankInfo.name;
          }
        },
        errResponse => {

        }
      );
  }

  validateSendMoneyForm() {
    if (this.objSend.email == this.userService.getEmail()) {
      this.topAlertsService.popToast('error', 'Error', this.messages.get('YOU_CAN_NOT_SEND_MONEY_TO_THE_SAME_ACCOUNT'));
      return false;
    }

    return true;
  }

  checkSourceAccount() {
    this.isLoading = true;
    const fs_token = this.objSend.fs_token;
    if ((fs_token == '' || fs_token == null) || !this.objSend.amount) {
      return;
    }
    const objRequest = {
      fs_token: fs_token
    };
    this.http.get<any>(this.host + '/dwl/customer/funding-source/balance', {params: objRequest})
      .subscribe(
        response => {
          if (response.success && response.balance) {
            const availableAmount = parseFloat(response.balance);
            const requestAmount = parseFloat(this.objSend.amount);
            if (requestAmount > availableAmount) {
              this.isNotHaveFunds = true;
            } else {
              this.isNotHaveFunds = false;
            }
          } else {
            this.isNotHaveFunds = false;
          }
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
          if (err.error) {
            this.isNotHaveFunds = false;
          }
        }
      );
  }

  onImageChangeFromFile(event: any = null) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type == 'application/pdf') {
        this.errorFileType = false;
      } else {
        this.errorFileType = true;
        this.topAlertsService.popToast('error', 'Error', 'The file must be either a .pdf');
      }
      if (file.size < 5242880) {
        this.errorFileSize = false;
      } else {
        this.errorFileSize = true;
        this.topAlertsService.popToast('error', 'Error', 'The file size must be either up to 5MB');
      }
    } else {
      this.errorFileSize = false;
    }
  }

  prepareCreatePayLink() {
    this.isLoading = true;
    const uploadFile = (<HTMLInputElement> window.document.getElementById('sendCheckInput')).files[0] || {};

    if (!this.objSend.name || this.objSend.name.replace(/\s/g, '') == '' ) {
      this.isLoading = false;
      this.topAlertsService.popToast('error', 'Error', 'Please enter Payee\'s name');
      return;
    }
    if (!this.userService.canSendAction()) {
      this.isLoading = false;
      this.topAlertsService.popToast('error', 'Error', this.messages.get('MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED'));
      return;
    }

    if (!this.validateSendMoneyForm()) {
      this.isLoading = false;
      return;
    }
    let message = 'Are you sure you want to send a check of <b>' + this.currencyPipe.transform(this.objSend.amount, '', 'symbol')
      + '</b> to <b>' + this.objSend.name + '</b> at <b>' + this.objSend.email + '</b>?';
    if (this.objSend.recurring) {
      message = 'Are you sure you want to send a ' + this.utility.getFrequencyString(this.objSend.billing_cycle) + ' recurring check of <b>'
        + this.currencyPipe.transform(this.objSend.amount, '', 'symbol')
        + '</b> to <b>' + this.objSend.name + '</b> at <b>' + this.objSend.email + '</b>?';
    }
    const objDataDialog = {
      title: 'Please confirm',
      text: message,
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_send_money'),
      checkbox_confirm: true,
      checkbox_confirm_text: 'Please confirm',
    };

    if ((<HTMLInputElement> window.document.getElementById('sendCheckInput')).files[0]) {

      this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
        if (result) {

          const url = '/dwl/customer/payment-link/create';
          const PayNoteUploadItem = new UploadDoc(uploadFile, this.userService, url);
          const objRequest: any = Object.assign({}, this.objSend);
          objRequest.u_token = this.userService.getToken();
          if (!objRequest.recurring) {
            objRequest.billing_cycle = null;
          }
          PayNoteUploadItem.formData = objRequest;
          this.progressRef.start();
          this.uploaderService.onSuccessUpload = (item, response, status, headers) => {
            this.progressRef.complete();
            this.resetForm();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('MONEY_SUCCESSFULLY_SENT'));
            this.userService.reInitClient();
            this.countNewPayLink += 1;
            if (environment.subDomen != 'paynote') {
              this.jqueryService.setContent('#send_money_url', response.message);
            }
            setTimeout(() => {
              if (this.userService.getCountFreeChecks() == 0 && !this.userService.isHavePlan()) {
                this.userService.redirectJustSimple('/transactions');
              }
            }, 2000);
          };
          this.uploaderService.onErrorUpload = (item, response, status, headers) => {
            this.progressRef.complete();
            this.isLoading = false;
            if (status == 503) {
              this.topAlertsService.popToast('error', 'Error', 'The file must be either a .pdf up to 5MB in size.');
            } else {
              this.utility.getMessageError( response );
              this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage );
            }
          };
          this.uploaderService.onCompleteUpload = (item, response, status, headers) => {
            this.progressRef.complete();
            this.isLoading = false;
            if (status == 413) {
              this.topAlertsService.popToast('error', 'Error', this.messages.get('The file must be either a .pdf up to 5MB in size.'));
            }
          };
          this.uploaderService.upload(PayNoteUploadItem);

        } else {
          this.isLoading = false;
        }
      });

    } else {
      this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
        if (result) {
          const objRequest: any = Object.assign({}, this.objSend);
          objRequest.u_token = this.userService.getToken();
          objRequest.description = this.objSend.description;
          objRequest.metadata = {
            description: this.objSend.description
          };
          if (!objRequest.recurring) {
            objRequest.billing_cycle = null;
          }
          this.progressRef.start();
          this.http.post<any>(this.host + '/dwl/customer/payment-link/create', objRequest)
            .subscribe(
              response => {
                if (response.success) {
                  this.resetForm();
                  this.topAlertsService.popToast('success', 'Success', this.messages.get('MONEY_SUCCESSFULLY_SENT'));
                  this.userService.reInitClient();
                  this.countNewPayLink += 1;
                  this.progressRef.complete();
                  setTimeout(() => {
                    if (this.userService.getCountFreeChecks() == 0 && !this.userService.isHavePlan()) {
                      this.userService.redirectJustSimple('/transactions');
                    }
                  }, 2000);
                  if (environment.subDomen != 'paynote') {
                    this.jqueryService.setContent('#send_money_url', response.message);
                  }

                }
              },
              err => {
                if (err.error) {
                  this.progressRef.complete();
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
  }

  getMerchantFundSources() {
    const objRequest = <any> {
      verified: '1',
      u_token: this.userService.getToken(),
      balance: 0
    };
    this.http.get<any>(this.host + '/dwl/customer/funding-source/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstFundSources = <any> response.list;
            if (this.lstFundSources.length) {
              this.objSend.fs_token = this.lstFundSources[0].id;
              this.selectSourceBankAccount();
              this.textNotHaveFunds = this.messages.get('THERE_ARE_NOT_ENOUGH_FUNDS_ON_THE_ACCOUNT');
            }
          }
        },
        err => {
          if (err.error) {
            this.topAlertsService.popToast('error', 'Error', err.error.message);
          }
        }
      );
  }

  selectSourceBankAccount() {
    let routind_number: string;
    let account_number: string;
    let bank_name: string;
    const fs_token = this.objSend.fs_token;
    if (fs_token == 'add') {
      this.route.navigate(['/account/funding_sources/add']);
    }
    this.lstFundSources.forEach(function (elem) {
      if (elem.id == fs_token) {
        routind_number = elem.account ? elem.account.routing : '000000000';
        account_number = elem.account ? elem.account.number : '*****0000';
        bank_name = elem.bank_info ? elem.bank_info.name : '';
      }
    });
    this.objSend.routing_number = routind_number;
    this.objSend.account_number = account_number;
    this.objSend.bank_name = bank_name;
    this.checkSourceAccount();
  }

  openModal(content: any) {
    this.closeModal();
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  getCustomerByEmail() {
    const objRequest = {email: this.objSend.email, u_token: this.userService.getToken() };
    this.http.get<any>(this.host + '/dwl/customer/client/retrieve/email', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objLoadedCustomer = <any> response;
            if (this.objLoadedCustomer.list.length) {
              this.objDirectDeposit.bankAccount = this.objLoadedCustomer.list[0].id;
              this.getFundSourceByID();
            }
          }
        },
        err => {
          if (err.error.error) {
            this.objLoadedCustomer = {};
          }
        }
      );
  }

  getCustomersList() {
    this.http.get<any>(this.host + '/dwl/customer/owner/customer/list',
      {
        params: {
          u_token: this.userService.getToken(),
          limit: '1000'
        }
      })
      .subscribe(
        response => {
          if (response.success) {
            const tmpArr: any = [];
            this.listCustomers = <any> response.list.data;
            this.listCustomers.forEach(function (elem: any) {
              tmpArr.push(elem.name);
            });
            this.arrayCustomers = tmpArr;
          }
        },
        errResponse => {

        }
      );
  }

  blurSelect() {
    if ( this.objSendMoneyComp.form.name_temp ) {
      this.objSend.name = this.objSendMoneyComp.form.name_temp;
      this.objSendMoneyComp.form.name_placeholder = this.objSendMoneyComp.form.name_temp;
      this.jqueryService.removeClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'hide');
      this.jqueryService.addClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'show');
    }
  }

  searchSelect(search: string ) {
    if ( !search ) {
      return;
    }
    this.objSend.email = '';
    this.objSendMoneyComp.form.name_placeholder = '';
    this.objSendMoneyComp.form.name_temp = search;
    this.objSend.name = '';
  }

  handleResultSelected($event: any, name: any) {
    this.objSendMoneyComp.form.name_temp = '';
    this.objSendMoneyComp.form.name_placeholder = '';
    this.jqueryService.removeClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'show');
    this.jqueryService.addClass('.ng-select.ng-select-single .ng-select-container .ng-placeholder', 'hide');

    setTimeout(() => {
      const curUserName = this.objSend.name;
      const vm = this;
      this.listCustomers.forEach(function (elem: any) {
        if (curUserName == elem.name) {
          vm.objSend.email = elem.email;
        }
      });

    }, 100);
  }

  getFundSourceByID() {
    if (this.objDirectDeposit.bankAccount == '') {
      this.objDirectDeposit.accountNumber = '';
      this.objDirectDeposit.cAccountNumber = '';
      this.objDirectDeposit.routingNumber = '';
      this.objDirectDeposit.name = '';
      this.objDirectDeposit.bankAccountType = 'checking';
      return;
    }
    const objRequest = {fundingsource: this.objDirectDeposit.bankAccount};
    this.http.get<any>(this.host + '/dwl/customer/funding-source/account', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDirectDeposit.accountNumber = '*******' + response.account.number;
            this.objDirectDeposit.cAccountNumber = '*******' + response.account.number;
            this.objDirectDeposit.routingNumber = response.account.routing;
            this.objDirectDeposit.name = response.bank_info.name;
            this.objDirectDeposit.bankAccountType = 'checking';
          }
        },
        err => {
          if (err.error.error) {

          }
        }
      );
  }

  prepareDirectDeposit(content: any) {

    if (!this.userService.canSendAction()) {
      this.topAlertsService.popToast('error', 'Error', this.messages.get('MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED'));
      return;
    }

    if (!this.validateSendMoneyForm()) {
      return;
    }

    this.objDirectDeposit.bankAccountType = 'checking';
    this.openModal(content);
    this.getCustomerByEmail();
  }
  onChangeReccuring(value: any) {
    if (value.checked === true) {
      this.makeRecurringToggle = true;
    } else {
      this.makeRecurringToggle = false;
    }
  }

  test(amount) {
    console.log(amount);
  }

  directDeposit() {
    if (this.objDirectDeposit.accountNumber != this.objDirectDeposit.cAccountNumber) {
      this.topAlertsService.popToast('error', 'Error', this.messages.get('ACCOUNT_NUMBER_DOES_NOT_MATCH_THE_CONFIRM_ACCOUNT_NUMBER'));
      return;
    }
    const arrName = this.objSend.name.split(' ');
    const objRequest = <any> {
      fundingsource: this.objSend.fs_token,
      u_token: this.userService.getToken(),
      amount: this.objSend.amount,
      firstName: arrName[0],
      email: this.objSend.email
    };

    if (this.objSend.recurring == true) {
      objRequest.recurring = this.objSend.recurring;
      objRequest.billing_cycle = this.objSend.billing_cycle;
    }
    if (arrName[1]) {
      objRequest.lastName = arrName[1];
    }

    if (this.objDirectDeposit.bankAccount) {
      objRequest.u_token_to = this.objLoadedCustomer.user.u_token;
      objRequest.fundingsource_to = this.objDirectDeposit.bankAccount;
    } else {
      objRequest.routingNumber = this.objDirectDeposit.routingNumber;
      objRequest.accountNumber = this.objDirectDeposit.accountNumber;
      objRequest.name = this.objDirectDeposit.name;
      objRequest.bankAccountType = this.objDirectDeposit.bankAccountType;
    }
    objRequest.metadata = {
      description: this.objSend.description
    };
    objRequest.description = this.objSend.description;

    //    console.log(objRequest)
    this.isLoading = true;
    this.http.post<any>(this.host + '/dwl/customer/client/transfer/add', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.isLoading = false;
            this.resetForm();
            this.closeModal();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('MONEY_SUCCESSFULLY_SENT'));
          }
        },
        err => {
          if (err.error) {
            this.utility.getMessageError( err.error );
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
            this.isLoading = false;
          }
        }
      );

  }

  checkEmailAddress() {
    this.isLoading = true;
    const objRequest = {
      email: this.objSend.email
    };
    this.http.post<any>(this.host + '/user/email/check', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.prepareCreatePayLink();
          }
        },
        err => {
          if (err.error) {
            const objDataDialog = {
              title: 'Please confirm',
              //              text: this.messages.get('LAST_MAIL_HARD_BOUNCE'),
              text: 'The check sent to <b>' + this.objSend.email + '</b> is undeliverable. Please check the email and try again. If you are sure this email is correct click Resend.',
              button_cancel_text: 'Cancel',
              button_confirm_text: 'Resend'
            };
            this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
              if (result) {
                this.prepareCreatePayLink();
              } else {
                this.isLoading = false;
              }
            });
          }
        }
      );
  }
}
